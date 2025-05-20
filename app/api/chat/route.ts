import { appendResponseMessages, streamText } from "ai";

import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

import { createClient } from "../../utils/supabase/server";
import {
  askQuestionTool,
  generateBarChartTool,
  generatePieChartTool,
  getCryptoMarketSummaryTool,
  getCryptoPriceTool,
} from "@/app/tools/llm-tools";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages, chatId } = await req.json();

  const toolsConfig = {
    generateBarChart: {
      creditCost: 1,
    },
    generatePieChart: {
      creditCost: 1,
    },
    getCryptoPrice: {
      creditCost: 1,
    },
    getCryptoMarketSummary: {
      creditCost: 1,
    },
    askQuestion: {
      creditCost: 2,
    },
  };

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

  // Get user config to check RAG settings
  const { data: configData } = await supabase
    .from("user_config")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: documentsData } = await supabase
    .from("documents")
    .select("document_id, document_name")
    .eq("user_id", user.id);

  const isRagEnabled = configData?.ask_question_enabled ?? false;
  // Get user credit
  const { data: creditData } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  // Get tools
  const tools =
    creditData?.balance === 0
      ? {}
      : {
          ...(configData?.generate_bar_chart_enabled && {
            generateBarChart: generateBarChartTool,
          }),
          ...(configData?.generate_pie_chart_enabled && {
            generatePieChart: generatePieChartTool,
          }),
          ...(configData?.get_crypto_price_enabled && {
            getCryptoPrice: getCryptoPriceTool,
          }),
          ...(configData?.get_crypto_market_summary_enabled && {
            getCryptoMarketSummary: getCryptoMarketSummaryTool,
          }),
          ...(isRagEnabled && { askQuestion: askQuestionTool }),
        };
  console.log("creditData?.balance", creditData?.balance);
  const result = streamText({
    model: openai("gpt-4o-mini"),
    toolChoice: "auto",
    maxSteps: 1,
    tools,
    system: `
    You are **DocAider** — a smart, polite, and friendly AI assistant that transforms natural language into clear, visual insights.
    
    🔧 **Current Tool Availability**
    - Credit: ${creditData?.balance}
    - ${
      creditData?.balance === 0
        ? "Your credit balance is 0 so you can't use any tools. Please inform the user to add credits to use tools."
        : "You can use tools."
    }
    - RAG: ${isRagEnabled ? "✅ Enabled" : "❌ Disabled"}
    - Uploaded Documents: ${documentsData?.length || 0}
    - Bar Chart: ${
      configData?.generate_bar_chart_enabled ? "✅ Enabled" : "❌ Disabled"
    }
    - Pie Chart: ${
      configData?.generate_pie_chart_enabled ? "✅ Enabled" : "❌ Disabled"
    }
    - Crypto Price: ${
      configData?.get_crypto_price_enabled ? "✅ Enabled" : "❌ Disabled"
    }
    - Crypto Market Summary: ${
      configData?.get_crypto_market_summary_enabled
        ? "✅ Enabled"
        : "❌ Disabled"
    }
    
    🧠 **Behavior Guidelines**
    - Do **not** answer document-based questions if RAG is **disabled**.
    - Do **not** answer document-based questions if documents are **not uploaded**.
    - Do **not** answer crypto price questions if crypto price tool is **disabled**.
    - Do **not** answer crypto market summary questions if crypto market summary tool is **disabled**.
    - Only answer such questions **if both RAG is enabled and documents are uploaded**.
    - Prompt the user to **upload documents** if user want to ask question.
    - Prompt the user to **enable document tools** if user want to ask question.
    - Prompt the user to **enable crypto tools** if user want to know crypto price or market summary.
    - Prompt the user to **enable RAG** if user want to ask question.
    - Prompt the user to **enable chart tools** if user want to visualize data.
    - Focus strictly on:
      - 📊 Visualizing data (bar charts, pie charts)
      - 💱 Crypto insights (prices, market summaries)
      - 📚 Document insights (questions, answers, summaries)
    - Avoid raw code, markdown, JSON, or technical details.
    - Never mention internal libraries or frameworks (e.g., JavaScript, ECharts).
    
    📄 **RAG Handling**
    ${
      documentsData?.length
        ? isRagEnabled
          ? `- Documents available: ${documentsData
              .map((doc) => doc.document_name)
              .join(
                ", "
              )}. Use the *askQuestion* tool to answer related queries.`
          : `- Documents are uploaded (${documentsData
              .map((doc) => doc.document_name)
              .join(
                ", "
              )}), but RAG is disabled. Inform the user to enable RAG to proceed.`
        : isRagEnabled
        ? "- RAG is enabled, but no documents are uploaded. Ask the user to upload documents first."
        : "- RAG is disabled and no documents are uploaded. Ask the user to upload documents and enable RAG to use document Q&A."
    }

    Thai Text Handling:
    - When processing Thai text:
      • Normalize Unicode characters using NFC
      • Handle Thai word boundaries properly
      • Maintain Thai character combinations
      • Preserve Thai punctuation marks
      • Use appropriate Thai-specific character handling
    
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

      const totalCreditCost = toolNames?.reduce((total, toolName) => {
        return (
          total +
          (toolsConfig[toolName as keyof typeof toolsConfig]?.creditCost || 0)
        );
      }, 0);

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
  });

  return result.toDataStreamResponse();
}
