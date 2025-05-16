import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import crypto from "crypto";
import { createClient } from "../utils/supabase/server";
import { findRelevantContent } from "../utils/embedding";

const API_KEY = process.env.BITKUB_API_KEY!;
const API_SECRET = process.env.BITKUB_API_SECRET!;

export const generatePieChartTool = tool({
  description: `Use this tool to generate visual pie chart configurations (ECharts-compatible) whenever the user asks to view data as a pie chart
  
  ✅ Required for:
  - Pie charts
  - Any structured or numerical data the user provides

  🧠 Behavior:
  - Support only: "pie" types.
  - Always ask for the chart type if not specified.
  - Always ask for color and if the user doesn't ask for color, use the default color.
  - Always confirm the information provided by the user before generating the chart.
  - Always suggest the closest supported alternative if the chart type is unclear.
  The goal is to help the user go from text to visual insights — fast and seamlessly.
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
  description: `Use this tool to generate visual bar chart configurations (ECharts-compatible) whenever the user asks to view data as a bar chart
        
        ✅ Required for:
        - Bar charts
        - Any structured or numerical data the user provides

        🧠 Behavior:
        - Support only: "bar" types.
        - Always ask for the chart type if not specified.
        - Always ask for color and if the user doesn't ask for color, use the default color.
        - Always confirm the information provided by the user before generating the chart.
        - Always suggest the closest supported alternative if the chart type is unclear.
        The goal is to help the user go from text to visual insights — fast and seamlessly.
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
  description: `Use this tool to get the current price of a cryptocurrency based on Bitkub API.
  
  ✅ Required for:
  - Cryptocurrency price information
  - Always use this tool to get the current price of a cryptocurrency based on Bitkub API.
  🧠 Behavior:
  - Always ask for the cryptocurrency name.
  - Always confirm the information provided by the user before getting the price.
  - Always return insights about the price.
  - Always suggest the next steps for the user.
  - Always return insights and next steps.
  - Fiat currency currently supported only THB.
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

      console.log("high24hr", item.high24hr);
      console.log("low24hr", item.low24hr);
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

export const getCryptoBalanceTool = tool({
  description: `Use this tool to retrieve the current crypto balances of the authenticated user from Bitkub.
        
        ✅ Required for:
        - Checking wallet balances
        - Showing all available coins in the user’s account
      
        🧠 Behavior:
        - Always inform the user of the coin and available amount
        - Always return a list of balances
        - Always confirm the result is based on real-time data
        `,
  parameters: z.object({}),
  execute: async () => {
    try {
      const path = "/api/v3/market/balances";
      const method = "POST";
      const timestamp = Date.now();
      const body = {};

      const sigPayload = `${timestamp}${method}${path}${JSON.stringify(body)}`;
      const signature = crypto
        .createHmac("sha256", API_SECRET)
        .update(sigPayload)
        .digest("hex");

      console.log("X-BTK-TIMESTAMP:", timestamp);
      console.log("X-BTK-APIKEY:", API_KEY);
      console.log("X-BTK-SIGN:", signature);

      const res = await fetch(`https://api.bitkub.com${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-BTK-APIKEY": API_KEY,
          "X-BTK-TIMESTAMP": timestamp.toString(),
          "X-BTK-SIGN": signature,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      return {
        balances: json.result,
      };
    } catch (error) {
      console.error("getCryptoBalance error:", error);
      return {
        error: "Failed to fetch balances",
      };
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
  description: `You are a helpful assistant. Check your knowledge base before answering any questions.Assume the user has uploaded documents.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know..".`,
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

      console.log(object.answer);
      return object.answer;
    } catch (error: any) {
      console.error("Error in askQuestionTool:", error);
      throw new Error("Failed to process question: " + error.message);
    }
  },
});
