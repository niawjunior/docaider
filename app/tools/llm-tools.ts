import { generateText, tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

import { createClient } from "../utils/supabase/server";
import { findRelevantContent } from "../utils/embedding";
import { GenerateContentConfig, GoogleGenAI } from "@google/genai";
import wav from "wav";
import { v4 as uuidv4 } from "uuid";

async function saveToSupabase(
  filename: string,
  pcmData: Buffer
): Promise<string> {
  try {
    const supabase = await createClient();
    const fileExt = filename.split(".").pop();
    const filePath = `${uuidv4()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("podcasts")
      .upload(filePath, pcmData, {
        contentType: "audio/wav",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("podcasts").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error in saveToSupabase:", error);
    throw error;
  }
}

async function saveWaveFile(
  filename: string,
  pcmData: Buffer
): Promise<string> {
  try {
    // 1. Create WAV file in memory
    const wavBuffer = await new Promise<Buffer>((resolve, reject) => {
      const writer = new wav.Writer({
        channels: 1,
        sampleRate: 24000,
        bitDepth: 16,
      });

      const chunks: Buffer[] = [];
      writer.on("data", (chunk) => chunks.push(chunk));
      writer.on("end", () => resolve(Buffer.concat(chunks)));
      writer.on("error", reject);

      writer.write(pcmData);
      writer.end();
    });

    // 2. Upload to Supabase and return the public URL
    return await saveToSupabase(filename, wavBuffer);
  } catch (error) {
    console.error("Error in saveWaveFile:", error);
    throw error;
  }
}

export const generatePieChartTool = tool({
  description: `Use this tool to generate **ECharts-compatible pie chart configurations** from structured or numerical data, turning your text into visual insights.
  ✅ **Required for**:
  - Visualizing data as a pie chart.
  - Any request involving displaying structured or numerical data in a pie chart format.

  🧠 **Behavior**:
  - Supports only "pie" chart types.
  - If the user asks for "default colors" or doesn't specify, a distinct color palette will be generated.
  - **Always confirm the information provided by the user** before generating the chart.
  - **Always suggest the closest supported alternative** if the chart type is unclear.
  - **Do not** generate a pie chart if the tool is disabled; instead, inform the user to enable it.
  `,
  parameters: z.object({
    title: z.string().optional().describe("The pie chart title"),
    seriesData: z
      .array(
        z.object({
          name: z.string().describe("Series name"),
          value: z.number().describe("Series value"),
          color: z
            .string()
            .optional()
            .describe(
              "Series color. Optional - if not provided, will use a distinct color from the default palette."
            ),
        })
      )
      .optional()
      .describe("Series data with optional color"),
    backgroundColor: z
      .string()
      .optional()
      .default("#52525c")
      .describe("Background color of the chart"),
    textColor: z
      .string()
      .optional()
      .default("#fff")
      .describe("Text color of the chart"),
  }),
  execute: async ({ title, seriesData, backgroundColor, textColor }) => {
    try {
      // If no colors are provided in seriesData, generate a distinct color palette
      if (seriesData?.length && !seriesData.some((item) => item.color)) {
        // Generate distinct colors using a simple color palette
        const defaultColors = [
          "#FF6B6B", // Red
          "#4ECDC4", // Teal
          "#45B7D1", // Blue
          "#96CEB4", // Green
          "#FFEEAD", // Yellow
          "#D4A5A5", // Pink
          "#9B59B6", // Purple
          "#3498DB", // Blue
          "#E67E22", // Orange
          "#2ECC71", // Green
        ];

        // Apply colors to series data
        seriesData = seriesData.map((item, index) => ({
          ...item,
          color: defaultColors[index % defaultColors.length],
        }));
      }

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          title: z.string().optional(),
          seriesData: z
            .array(
              z.object({
                name: z.string().describe("Series name"),
                value: z.number().describe("Series value"),
                color: z
                  .string()
                  .optional()
                  .describe(
                    "Series color. Optional - if not provided, will use a distinct color from the default palette."
                  ),
              })
            )
            .optional(),
          backgroundColor: z
            .string()
            .optional()
            .default("#52525c")
            .describe("Background color of the chart"),
          textColor: z
            .string()
            .optional()
            .default("#fff")
            .describe("Text color of the chart"),
        }),
        prompt: `Generate ECharts-compatible option config for a pie chart based on schema and this description:\n\nTitle: ${
          title ?? ""
        }\nSeries data: ${JSON.stringify(
          seriesData ?? [],
          null,
          2
        )}\nBackground color: ${backgroundColor ?? ""}\nText color: ${
          textColor ?? ""
        }`,
      });
      return {
        chartData: object,
      };
    } catch (error) {
      console.log("error", error);
      return error;
    }
  },
});

export const generateBarChartTool = tool({
  description: `Use this tool to generate **ECharts-compatible bar chart configurations** from structured or numerical data, transforming your text into visual insights.

  ✅ **Required for**:
  - Visualizing data as a bar chart.
  - Any request involving displaying structured or numerical data in a bar chart format.

  🧠 **Behavior**:
  - Supports only "bar" chart types.
  - **Always ask for the chart type** if not specified by the user.
  - **Always ask for color preferences**; if no color is provided, use a default color.
  - **Always confirm the information provided by the user** before generating the chart.
  - **Always suggest the closest supported alternative** if the chart type is unclear.
  - **Do not** generate a bar chart if the tool is disabled; instead, inform the user to enable it.
  `,
  parameters: z.object({
    title: z.string().optional().describe("The bar chart title"),
    seriesData: z
      .array(
        z.object({
          name: z.string().describe("Series name"),
          value: z.number().describe("Series value"),
          color: z
            .string()
            .describe(
              "Series color. Always ask for color and if the user doesn't ask for color, use the default color."
            ),
        })
      )
      .optional()
      .describe("Series data with optional color"),
    backgroundColor: z
      .string()
      .optional()
      .default("#52525c")
      .describe("Background color of the chart"),
    textColor: z
      .string()
      .optional()
      .default("#fff")
      .describe("Text color of the chart"),
  }),
  execute: async ({ title, seriesData, backgroundColor, textColor }) => {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          title: z.string().optional(),
          seriesData: z
            .array(
              z.object({
                name: z.string().describe("Series name"),
                value: z.number().describe("Series value"),
                color: z
                  .string()
                  .describe(
                    "Series color. Always ask for color and if the user doesn't ask for color, use the default color."
                  ),
              })
            )
            .optional(),
          backgroundColor: z
            .string()
            .optional()
            .default("#52525c")
            .describe("Background color of the chart"),
          textColor: z
            .string()
            .optional()
            .default("#fff")
            .describe("Text color of the chart"),
        }),
        prompt: `Generate ECharts-compatible option config for a bar chart based on schema and this description:\n\nTitle: ${
          title ?? ""
        }\nSeries data: ${JSON.stringify(
          seriesData ?? [],
          null,
          2
        )}\nBackground color: ${backgroundColor ?? ""}\nText color: ${
          textColor ?? ""
        }`,
      });
      return {
        chartData: object,
      };
    } catch (error) {
      console.log("error", error);
      return error;
    }
  },
});

export const getCryptoPriceTool = tool({
  description: `Use this tool to get the **current real-time price of a cryptocurrency** from the Bitkub API.

  ✅ **Required for**:
  - Retrieving current cryptocurrency price information.
  - Any question asking for the latest price of a specific cryptocurrency.

  🧠 **Behavior**:
  - **Always ask for the cryptocurrency symbol** (e.g., BTC, ETH).
  - Supports only **THB** as the fiat currency.
  - **Always confirm the information provided by the user** before fetching the price.
  - Always return clear insights about the price and suggest actionable next steps.
  - **Do not** fetch crypto prices if the tool is disabled; instead, inform the user to enable it.
  `,
  parameters: z.object({
    currency: z.string().describe("The cryptocurrency symbol, e.g., BTC, ETH"),
    fiat: z
      .string()
      .default("THB")
      .describe("The fiat currency currently supported only THB"),
  }),
  execute: async ({ currency, fiat }) => {
    try {
      const sym = `${fiat.toUpperCase()}_${currency.toUpperCase()}`;
      const url = `https://api.bitkub.com/api/market/ticker?sym=${sym}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json[sym]) {
        return {
          error: `Unable to find price for ${currency}. Please check the symbol.`,
        };
      }

      const item = json[sym];
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          fiat: z
            .string()
            .optional()
            .default("THB")
            .describe("The fiat currency, e.g., THB, USD"),
          name: z
            .string()
            .optional()
            .default("")
            .describe("The cryptocurrency name"),
          price: z.number().optional().describe("The current price"),
          high: z
            .number()
            .optional()
            .describe("The highest price in the last 24 hours"),
          low: z
            .number()
            .optional()
            .describe("The lowest price in the last 24 hours"),
          baseVolume: z
            .number()
            .optional()
            .describe("The base volume in the last 24 hours"),
          quoteVolume: z
            .number()
            .optional()
            .describe("The quote volume in the last 24 hours"),
          percentChange24hr: z
            .number()
            .optional()
            .describe("The percentage change in the last 24 hours"),
          prevClose: z
            .number()
            .optional()
            .describe("The previous closing price"),
          prevOpen: z
            .number()
            .optional()
            .describe("The previous opening price"),
          insights: z
            .string()
            .optional()
            .describe(
              "Insights about the current price. Return insights in same as input language"
            ),
          nextSteps: z
            .string()
            .optional()
            .describe(
              "Recommended next actions. Return next steps in same as input language"
            ),
        }),
        prompt: `Give a short insight and next step for a user looking at this cryptocurrency data.\n\n
        Name: ${currency.toUpperCase()}\n
        Price: ${item.last}\n
        High: ${item.high24hr}\n
        Low: ${item.low24hr}\n
        Base volume: ${item.baseVolume}\n
        Quote volume: ${item.quoteVolume}\n
        Percent change 24hr: ${item.percentChange}\n
        Previous close: ${item.prevClose}\n
        Previous open: ${item.prevOpen}\n
        Fiat: ${fiat}\n
            `,
      });

      return {
        name: currency.toUpperCase(),
        price: item.last,
        high: item.high24hr,
        low: item.low24hr,
        baseVolume: item.baseVolume,
        quoteVolume: item.quoteVolume,
        percentChange24hr: item.percentChange,
        prevClose: item.prevClose,
        prevOpen: item.prevOpen,
        insights: object.insights,
        nextSteps: object.nextSteps,
        fiat: fiat,
        date: new Date().toISOString(),
      };
    } catch (error) {
      console.error("getCryptoPrice error", error);
      return { error: `Failed to fetch price for ${currency}.` };
    }
  },
});

export const getCryptoMarketSummaryTool = tool({
  description: `Use this tool to get an overview of the cryptocurrency market on Bitkub.

  ✅ Required for:
  - Answering questions like "How many cryptocurrencies are on Bitkub?"
  - Giving a summary of market listings (symbols, counts)

  🧠 Behavior:
  - Count and list unique base crypto symbols (e.g. BTC, ETH)
  - Provide a simple summary and total count
  - Do not repeat trading pairs (e.g. THB_BTC and USDT_BTC are both BTC)
  `,
  parameters: z.object({}), // No params needed

  execute: async () => {
    try {
      const url = `https://api.bitkub.com/api/market/ticker`;
      const res = await fetch(url);
      const json = await res.json();

      // Parse and map each THB_xxx pair to extract base coin and volume
      const coinVolumes: { symbol: string; volume: number }[] = Object.entries(
        json
      )
        .filter(([key]) => key.startsWith("THB_")) // Only THB-based trading pairs
        .map(([key, value]) => ({
          symbol: key.replace("THB_", ""), // Remove THB_ prefix
          volume: (value as any).quoteVolume ?? 0, // Use quoteVolume as trading volume
        }));

      // Sort by volume descending
      const sortedCoins = coinVolumes.sort((a, b) => b.volume - a.volume);

      return {
        total: sortedCoins.length,
        coins: sortedCoins,
      };
    } catch (err) {
      console.error("getCryptoMarketSummary error:", err);
      return {
        error: "Unable to fetch market summary from Bitkub.",
      };
    }
  },
});

export const askQuestionTool = tool({
  description: `Use this tool to **answer questions based on the user's uploaded documents**, acting as your intelligent knowledge base.

  ✅ **Required for**:
  - Any question related to the content of uploaded documents.
  - Retrieving specific information from your knowledge base.

  🧠 **Behavior**:
  - **You MUST call this tool** if the user asks a document-related question, this tool is enabled, and documents are uploaded.
  - Only respond to questions using information directly from tool calls.
  - If no relevant information is found, respond with "No relevant documents found for this question."
  - **Do not** answer document-based questions if the tool is disabled, no documents are uploaded, or there is insufficient credit; instead, inform the user of the specific reason.
  - Responses will be formatted using markdown, including headings, bullet points, and chronological order for date/time questions.
  `,
  parameters: z.object({
    question: z.string().describe("Question to ask about the documents"),
  }),
  execute: async ({ question }) => {
    try {
      const supabase = await createClient();
      const { data: user } = await supabase.auth.getUser();

      if (!user?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get relevant chunks using our utility function
      const relevantChunks = await findRelevantContent(user.user.id, question);

      if (!relevantChunks || relevantChunks.length === 0) {
        return "No relevant documents found for this question.";
      }

      // Combine relevant chunks into a single context
      const context = relevantChunks.map((chunk) => chunk.chunk).join("\n\n");

      // Create a prompt with the context
      const prompt = `Answer the following question based on the provided context:
      Question: ${question}

      Context:
      ${context}

      Answer:`;

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          answer: z
            .string()
            .describe(
              "Answer to the question. Use markdown formatting with clear headings and bullet points. For date/time questions, provide accurate dates and maintain chronological order."
            ),
        }),
        prompt,
        system: `You are a helpful assistant that can answer questions based on uploaded documents. Format your responses clearly and professionally:
      # Formatting Guidelines
      - Use clear, descriptive headings (## Heading)
      - Use bullet points (•) for lists
      - Use numbered lists (1., 2., etc.) for steps
      - Use backticks (\`) for code snippets
      - Use **bold** for important terms
      - Use *italic* for emphasis

      # Date/Time Handling
      - When answering date-related questions:
        • Today is ${new Date().toISOString()}
        • Always provide accurate dates from the document
        • Maintain chronological order
        • Compare dates relative to current date
        • Format dates consistently (YYYY-MM-DD or full date format)
        • For "next" or "upcoming" questions:
          - Sort dates chronologically
          - Return the first date that's in the future
          - Include days until the event

      # Response Structure
      ## Summary
      - Start with a clear, concise summary
      - Use **bold** for key points

      ## Steps
      1. Numbered steps for procedures
      2. Clear, actionable instructions

      ## Options
      • Bullet points for alternatives
      • Clear separation of ideas

      ## Code
      \`\`\`javascript
      // Example code block
      \`\`\`

      # Tools
      - Use the askQuestion tool to retrieve information
      - Format responses for ReactMarkdown compatibility

      # Examples
      ## Issue Summary
      • Key symptoms
      • Impact on users

      ## Solution Steps
      1. First step
      2. Second step
      3. Verification

      ## Alternative Approaches
      • Option A
      • Option B
      • Considerations for each


      # Date/Time Examples
      ## Upcoming Events
      • Next holiday: January 1, 2025 (New Year's Day)
        - 15 days from today
      • Next public holiday: January 27, 2025 (Makha Bucha Day)
        - 41 days from today
      `,
      });

      return object.answer;
    } catch (error: any) {
      console.error("Error in askQuestionTool:", error);
      throw new Error("Failed to process question: " + error.message);
    }
  },
});

export const generateTTS = tool({
  description: `Use this tool to convert text to speech using Gemini's TTS service.
  - Important: 
  - Confirm the information provided by the user before generating the audio
  - Confirm the topic, style, speakers and script before generating the audio

  ✅ Required for:
  - Converting any text content to speech
  - Creating multi-speaker conversations
  - Support single and multi speakers
  - Creating a podcast, interview, conversation, debate

  🧠 Behavior:
  - Supports single and multi-speaker (up to 2 speakers) configurations
  - Each speaker can have their own unique voice
  - Returns audio in WAV format
  - Always ensure the text is appropriate for voice conversion
  - Always ask for the speaker name and voice
  - Always suggest the closest supported alternative if the voice is unclear
  - Always confirm the information provided by the user before generating the audio
  - Maximum length of audio is 2 minutes
  - **Do not** generate text-to-speech if the tool is disabled; instead, inform the user to enable it.

  Example usage:
  - "Convert this summary to speech using a natural voice"
  - "Create a conversation between two speakers with different voices"
  - "Create a podcast, interview, conversation, debate"

  Podcast Examples:
  - "Create a podcast-style conversation between Joe (Voice: Kore) and Jane (Voice: Puck) discussing the latest tech trends"
  - "Generate a podcast episode with two hosts: Alex (Voice: Alnilam) and Sarah (Voice: Aoede) interviewing a guest about AI ethics"
  - "Create a podcast-style debate between two experts: Mike (Voice: Rasalgethi) and Lisa (Voice: Laomedeia) discussing climate change solutions"
  - "Generate a podcast intro with host (Voice: Gacrux) and co-host (Voice: Achird) welcoming listeners to the show"

  Interview Examples:
  - "Interview a guest about AI ethics with two hosts: Alex (Voice: Alnilam) and Sarah (Voice: Aoede)"

  Conversation Examples:
  - "Create a conversation between two speakers with different voices"

  Debate Examples:
  - "Create a debate between two experts: Mike (Voice: Rasalgethi) and Lisa (Voice: Laomedeia) discussing climate change solutions"
  

  Voice options (Name – Gender – Tone):
  - Zephyr  – Female   – Bright  
  - Puck    – Male – Upbeat  
  - Charon  – Male   – Informative  
  - Kore    – Female – Firm  
  - Fenrir  – Male   – Excitable  
  - Leda    – Female – Youthful  
  - Orus    – Male   – Firm  
  - Aoede   – Female – Breezy  
  - Callirhoe – Female – Easy-going  
  - Autonoe – Female – Bright  
  - Enceladus – Male   – Breathy  
  - Iapetus – Male   – Clear  
  - Umbriel – Male – Easy-going  
  - Algieba – Male   – Smooth  
  - Despina – Female – Smooth  
  - Erinome – Female – Clear  
  - Algenib – Male   – Gravelly  
  - Rasalgethi – Male – Informative  
  - Laomedeia – Female – Upbeat  
  - Achernar – Female   – Soft  
  - Alnilam – Male   – Firm  
  - Schedar – Male – Even  
  - Gacrux  – Female   – Mature  
  - Pulcherrima – Female – Forward  
  - Achird  – Male   – Friendly  
  - Zubenelgenubi – Male – Casual  
  - Vindemiatrix – Female – Gentle  
  - Sadachbia – Male – Lively  
  - Sadaltager – Male   – Knowledgeable  
  `,
  parameters: z.object({
    topic: z
      .string()
      .describe(
        "The main title or subject of the podcast, interview, conversation, debate or tv-show"
      )
      .default("Episode Topic"),

    style: z
      .enum(["conversational", "interview", "debate", "tv-show"])
      .describe(
        "Podcast format style, conversational, interview, debate or tv-show"
      )
      .default("interview"),

    speakers: z.array(
      z.object({
        name: z.string().optional().describe("Speaker display name"),
        gender: z
          .enum(["male", "female"])
          .default("male")
          .describe(
            "Speaker gender, for choosing Thai suffix (“kráp” vs. “khâ”)"
          ),
        voice: z
          .enum([
            "Zephyr",
            "Puck",
            "Charon",
            "Kore",
            "Fenrir",
            "Leda",
            "Orus",
            "Aoede",
            "Callirhoe",
            "Autonoe",
            "Enceladus",
            "Iapetus",
            "Umbriel",
            "Algieba",
            "Despina",
            "Erinome",
            "Algenib",
            "Rasalgethi",
            "Laomedeia",
            "Achernar",
            "Alnilam",
            "Schedar",
            "Gacrux",
            "Pulcherrima",
            "Achird",
            "Zubenelgenubi",
            "Vindemiatrix",
            "Sadachbia",
            "Sadaltager",
          ])
          .default("Puck")
          .describe("Prebuilt voice for the speaker"),
      })
    ),
    script: z.string().describe(
      `
          Full conversation transcript, with each turn prefixed by speaker name.
          This tool will automatically append “kráp” or “khâ” based on gender.
          If you need the softer “ká” particle, include it explicitly in the text.
          Always confirm the information provided by the user before generating the audio.
        `
    ),
  }),
  execute: async ({ topic, style, speakers, script }) => {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      const prompt = `TTS the following conversation:
      Topic: ${topic}
      Style: ${style}
      Speakers: ${speakers
        .map((speaker) => `${speaker.name} (${speaker.voice})`)
        .join(", ")}
      Script: ${script}`;

      let config: GenerateContentConfig = {
        responseModalities: ["AUDIO"],
      };
      if (speakers.length > 1) {
        config = {
          ...config,
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: speakers.map((speaker) => ({
                speaker: speaker.name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker.voice },
                },
              })),
            },
          },
        };
      } else {
        config = {
          ...config,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: speakers[0].voice },
            },
          },
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config,
      });

      const data =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) {
        return { error: "Failed to generate audio" };
      }
      const audioBuffer = Buffer.from(data, "base64");
      const filename = `podcast-${uuidv4()}.wav`;
      return await saveWaveFile(filename, audioBuffer);
    } catch (error) {
      console.error("Error in TTS:", error);
      return { error: "Failed to process request" };
    }
  },
});

export const allDocumentTool = tool({
  description: `Use this tool to **retrieve metadata for all uploaded documents** for the authenticated user, including their IDs, names, titles, and public URLs.

  ✅ **Required for**:
  - Listing all documents available to the user.
  - Providing an overview of the user's uploaded files.

  🧠 **Behavior**:
  - Returns a list containing the document ID, name, title, and a generated public URL for each uploaded document.
  - Accessible only to authenticated users.
  - **Do not** return document information if no documents are uploaded; instead, inform the user to upload documents.
  `,
  parameters: z.object({
    title: z.string().describe("Title of the document"),
  }),
  execute: async ({ title }) => {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user?.id) {
      throw new Error("User not authenticated");
    }
    const { data } = await supabase
      .from("documents")
      .select("document_id, document_name, title")
      .eq("user_id", user.user.id);
    if (!data) {
      throw new Error("Failed to fetch documents");
    }
    return {
      title,
      rows: data.map((doc) => {
        return {
          document_id: doc.document_id,
          document_name: doc.document_name,
          title: doc.title,
          url: `user_${user.user.id}/${doc.document_name}`,
        };
      }),
    };
  },
});

export const webSearchTool = tool({
  description: `Use this tool to perform a **web search** and retrieve current, external information from the internet. This is suitable for general knowledge, news, or any information not found in your uploaded documents.
  
  ✅ **Required for**:
  - Answering general knowledge questions that require up-to-date information.
  - Getting current events, news, or facts from external sources.
  - Researching topics that are not covered by the user's uploaded documents.

  🧠 **Behavior**:
  - Always extract the most specific and relevant keywords/phrases from the user's request for the search query.
  - Return concise, summarized snippets from the top search results.
  - If no relevant information is found, explicitly state "No relevant information found on the web for your query."
  - **Do not** use this tool for questions that can be answered by uploaded documents (use \`askQuestionTool\` instead).
  - **Do not** use this tool for generating charts or getting crypto-specific data if dedicated tools are available.
  - **Do not** perform a web search if the tool is disabled; instead, inform the user to enable it.
  `,
  parameters: z.object({
    query: z
      .string()
      .describe(
        "The concise search query to execute (e.g., 'latest AI breakthroughs', 'weather in New York')."
      ),
  }),
  execute: async ({ query }) => {
    try {
      const { text, sources } = await generateText({
        model: google("gemini-1.5-flash", {
          useSearchGrounding: true,
        }),
        prompt: query,
      });

      return {
        text,
        sources,
      };
    } catch (error: any) {
      console.error("Web search tool error:", error);
      return { error: `Failed to perform web search: ${error.message}` };
    }
  },
});
