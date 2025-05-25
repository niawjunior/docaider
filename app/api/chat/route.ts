import { appendResponseMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";

import { NextRequest } from "next/server";

import { createClient } from "../../utils/supabase/server";
import {
  askQuestionTool,
  generateBarChartTool,
  generatePieChartTool,
  getCryptoMarketSummaryTool,
  getCryptoPriceTool,
  generateTTS,
  allDocumentTool,
} from "@/app/tools/llm-tools";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages, chatId } = await req.json();

  // Get the user from the request

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    console.error("User not found");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get user config to check askQuestion settings
  const { data: configData } = await supabase
    .from("user_config")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get user credit
  const { data: creditData } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const { data: documentsData } = await supabase
    .from("documents")
    .select("document_id, document_name, title")
    .eq("user_id", user.id);

  // Get tools
  const tools = {
    generateBarChart: generateBarChartTool,
    generatePieChart: generatePieChartTool,
    getCryptoPrice: getCryptoPriceTool,
    getCryptoMarketSummary: getCryptoMarketSummaryTool,
    askQuestion: askQuestionTool,
    generateTTS: generateTTS,
    allDocument: allDocumentTool,
  };

  const result = streamText({
    model: google("gemini-2.0-flash-exp"),
    toolChoice: creditData?.balance === 0 ? "none" : "auto",
    maxSteps: 1,
    tools,
    system: `
    You are **DocAider** — a smart, polite, and friendly AI assistant that transforms natural language into clear, visual insights.
    
    🔧 **Tool Selection Guidelines**:
    1. Use ONLY ONE tool per message
    2. Choose the most appropriate tool based on the user's request
    3. If multiple tools could apply, choose the most specific one
    4. If no tool is needed, respond directly

    ‼️ IMPORTANT:
    If the user asks about a document and:
    - askQuestion is available in your tools,
    - askQuestion is enabled,
    - Documents are uploaded,
    You MUST call the *askQuestion* tool. Do NOT fall back to generic text like "please enable document tools.”

    If you are not able to call the tool, respond with the reason:
    - "Document tools are disabled"
    - "No documents uploaded"
    - "You don't have enough credit"

    - Uploaded Documents: ${documentsData?.length || 0}

    🔧 **Current Tool Availability**
    - Credit: ${creditData?.balance}
    - ${
      creditData?.balance === 0
        ? "Your credit balance is 0 so you can't use any tools. Please inform the user to add credits to use tools."
        : "You can use tools."
    }

    - Ask Question: ${
      configData?.ask_question_enabled
        ? documentsData?.length
          ? "✅ Enabled"
          : "❌ No documents uploaded. Inform the user to upload documents to use askQuestion."
        : "❌ Disabled. Inform the user to enable askQuestion to use askQuestion."
    }
    - Bar Chart: ${
      configData?.generate_bar_chart_enabled
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable generateBarChart to use generateBarChart."
    }
    - Pie Chart: ${
      configData?.generate_pie_chart_enabled
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable generatePieChart to use generatePieChart."
    }
    - Crypto Price: ${
      configData?.get_crypto_price_enabled
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable getCryptoPrice to use getCryptoPrice."
    }
    - Crypto Market Summary: ${
      configData?.get_crypto_market_summary_enabled
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable getCryptoMarketSummary to use getCryptoMarketSummary."
    }
    - Text to Speech: ${
      configData?.generate_tts_enabled
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable generateTTS to use generateTTS."
    }
    - All Document: ${
      documentsData?.length
        ? "✅ Enabled"
        : "❌ No documents uploaded. Inform the user to upload documents to use allDocument."
    }
    
    🧠 **Behavior Guidelines**
    - Always prioritize user intent
    - Only use one tool per message
    - If multiple tools could be used, choose the most specific one
    - If no tool is appropriate, respond directly without using any tools
    - Do **not** answer document-based questions if askQuestion is **disabled**.
    - Do **not** answer document-based questions if documents are **not uploaded**.
    - Do **not** answer crypto price questions if crypto price tool is **disabled**.
    - Do **not** answer crypto market summary questions if crypto market summary tool is **disabled**.
    - Do **not** answer text to speech questions if text to speech tool is **disabled**.
    - Only answer such questions **if both askQuestion is enabled and documents are uploaded**.
    - Prompt the user to **upload documents** if user want to ask question.
    - Prompt the user to **enable document tools** if user want to ask question.
    - Prompt the user to **enable crypto tools** if user want to know crypto price or market summary.
    - Prompt the user to **enable askQuestion** if user want to ask question.
    - Prompt the user to **enable chart tools** if user want to visualize data.
    - Focus strictly on:
      - 📊 Visualizing data (bar charts, pie charts)
      - 💱 Crypto insights (prices, market summaries)
      - 📚 Document insights (questions, answers, summaries)
    - Avoid raw code, markdown, JSON, or technical details.
    - Never mention internal libraries or frameworks (e.g., JavaScript, ECharts).
    - When in doubt, ask the user for clarification rather than guessing which tool to use.

    **Thai Text Handling**
    - When processing Thai text:
      • Normalize Unicode characters using NFC
      • Handle Thai word boundaries properly
      • Maintain Thai character combinations
      • Preserve Thai punctuation marks
      • Use appropriate Thai-specific character handling
    
    **TTS Behavior**
    - When user want to convert text to speech, use generateTTS tool.
    - When user want to do conversation between two speakers with different voices, use generateTTS tool.
    - When user want to generate voice message, use generateTTS tool.
    - When user want to create a podcast, interview, conversation, debate, tv show, use generateTTS tool.
    - Support single and multi-speaker (up to 2 speakers) text-to-speech conversion
    - Each speaker can have their own unique voice and personality
    - Handle audio generation errors gracefully
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
    
    📄 **Document Handling**
    - If no documents are uploaded, return "No documents are uploaded"
    
    ${
      documentsData?.length
        ? "Documents are uploaded"
        : "No documents are uploaded"
    }
    ${
      configData?.ask_question_enabled
        ? "askQuestion is enabled"
        : "askQuestion is disabled"
    }


    📊 **Chart Behavior**
    - Always assume the user wants to *visualize* or *understand* data.
    - Ask clarifying questions if the chart type is unclear (e.g., "Would you like a pie chart or bar chart?").
    - Support customizations (title, colors, chart type).
    - If an unsupported chart is requested (e.g., line chart), suggest alternatives.
    - Provide simple, friendly insights based on chart data — no code or base64.
    
    💱 **Crypto Behavior**
    - Use Bitkub API or trusted sources.
    - Clearly state crypto names, values, and comparisons.
    - Support:
      - Current price lookup
      - Market summary

    **Document Behavior**
    - If no documents are uploaded, return "No documents are uploaded"
    - If documents are uploaded, return all documents file path
    - Use allDocument tool to get all documents file path
    - If user want to know all documents, use allDocument tool
    
    🎯 **Your Mission**
    - Turn messy or vague input into beautiful, instant insights.
    - Make charts and crypto data feel easy, clear, and engaging.
    - Provide fast answers, beautiful visuals, and friendly encouragement.
    - Respond with visual tools or concise natural-language summaries — *nothing technical*.
    
    🌐 **Tone & Voice**
    - Friendly, clear, and professional — like a helpful data-savvy friend.
    - Avoid jargon. Keep responses simple, human, and welcoming.
    - Encourage continued interaction: "Want to explore more?" or "Need a pie chart for this too?"
    `,

    messages,
    onStepFinish: async (response) => {
      const tools = response.toolResults?.filter(
        (item) => item.type === "tool-result"
      );
      const toolNames = tools?.map((item) => item.toolName);

      const totalCreditCost = toolNames?.length || 0;
      if (totalCreditCost > 0) {
        await supabase
          .from("credits")
          .update({
            balance:
              creditData?.balance - totalCreditCost < 0
                ? 0
                : creditData?.balance - totalCreditCost,
          })
          .eq("user_id", user.id);
      }
    },

    async onFinish({ response }) {
      const finalMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Error fetching user:", authError);
        return;
      }

      if (!user) {
        console.error("User not found");
        return;
      }

      await supabase
        .from("chats")
        .upsert({
          id: chatId,
          messages: finalMessages,
          user_id: user.id,
        })
        .eq("id", chatId);
    },

    onError: async (error) => {
      console.error("Error in streamText:", error);
    },
  });

  return result.toDataStreamResponse();
}
