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
import { createErrorResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages, chatId } = await req.json();

  // Get the user from the request

  const { data: userData } = await supabase.auth.getUser(); // Renamed to userData
  const user = userData.user;

  if (!user) {
    console.error("User not found");
    // For non-streaming initial errors, we can use createErrorResponse.
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  // Get user config to check askQuestion settings
  const { data: configData, error: configError } = await supabase // Added error handling
    .from("user_config")
    .select("*")
    .eq("id", user.id) // Assuming 'id' in user_config is user.id
    .single();

  if (configError && configError.code !== "PGRST116") {
    // PGRST116: No rows found (ok, use defaults)
    console.error("Error fetching user config:", configError);
    return createErrorResponse(
      "Failed to fetch user configuration.",
      500,
      "CONFIG_FETCH_ERROR",
    );
  }

  // Get user credit
  const { data: creditData, error: creditFetchError } = await supabase // Added error handling
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (creditFetchError) {
    console.error("Error fetching user credits:", creditFetchError);
    return createErrorResponse(
      "Failed to fetch user credits.",
      500,
      "CREDIT_FETCH_ERROR",
    );
  }

  if (!creditData || creditData.balance <= 0) {
    // This check is simplified. The system prompt already handles credit balance messages.
    // However, if a tool call *requires* credits and this is a pre-check, it's relevant.
    // For now, let the LLM handle informing about zero credit based on system prompt.
    // If strict pre-emptive blocking is needed:
    // return createErrorResponse("Insufficient credits to perform this action.", 402, "INSUFFICIENT_CREDITS");
  }

  const { data: documentsData, error: documentsError } = await supabase // Added error handling
    .from("documents")
    .select("document_id, document_name, title")
    .eq("user_id", user.id);

  if (documentsError) {
    console.error("Error fetching documents data:", documentsError);
    return createErrorResponse(
      "Failed to fetch user documents.",
      500,
      "DOCUMENTS_FETCH_ERROR",
    );
  }

  // Get tools
  const tools = {
    generateBarChart: generateBarChartTool,
    generatePieChart: generatePieChartTool,
    getCryptoPrice: getCryptoPriceTool,
    getCryptoMarketSummary: getCryptoMarketSummaryTool,
    askQuestion: askQuestionTool,
  };

  try {
    const result = streamText({
      model: openai("gpt-4o-mini"),
      toolChoice: "auto",
      maxSteps: 1,
      tools,
      system: `
    You are **DocAider** — a smart, polite, and friendly AI assistant that transforms natural language into clear, visual insights.
    
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
    - Credit: ${creditData?.balance ?? 0} 
    - ${
      (creditData?.balance ?? 0) === 0
        ? "Your credit balance is 0 so you can't use any tools. Please inform the user to add credits to use tools."
        : "You can use tools."
    }

    ‼️ Do not fallback to "please enable document tools." Instead, use the *askQuestion* tool if it's available.

 - Ask Question: ${
   (configData?.ask_question_enabled ?? false) // Default to false if configData is null
     ? (documentsData?.length ?? 0) > 0
       ? "✅ Enabled"
       : "❌ No documents uploaded. Inform the user to upload documents to use askQuestion."
     : "❌ Disabled. Inform the user to enable askQuestion to use askQuestion."
 }
    - Bar Chart: ${
      (configData?.generate_bar_chart_enabled ?? false)
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable generateBarChart to use generateBarChart."
    }
    - Pie Chart: ${
      (configData?.generate_pie_chart_enabled ?? false)
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable generatePieChart to use generatePieChart."
    }
    - Crypto Price: ${
      (configData?.get_crypto_price_enabled ?? false)
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable getCryptoPrice to use getCryptoPrice."
    }
    - Crypto Market Summary: ${
      (configData?.get_crypto_market_summary_enabled ?? false)
        ? "✅ Enabled"
        : "❌ Disabled. Inform the user to enable getCryptoMarketSummary to use getCryptoMarketSummary."
    }
    
    
    🧠 **Behavior Guidelines**
    - Do **not** answer document-based questions if askQuestion is **disabled**.
    - Do **not** answer document-based questions if documents are **not uploaded**.
    - Do **not** answer crypto price questions if crypto price tool is **disabled**.
    - Do **not** answer crypto market summary questions if crypto market summary tool is **disabled**.
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
    

    **Thai Text Handling**
    - When processing Thai text:
      • Normalize Unicode characters using NFC
      • Handle Thai word boundaries properly
      • Maintain Thai character combinations
      • Preserve Thai punctuation marks
      • Use appropriate Thai-specific character handling
    
    📄 **Document Handling**
    - Information about uploaded documents: ${JSON.stringify(documentsData || [])}
    - ${
      (documentsData?.length ?? 0) > 0
        ? "Documents are uploaded"
        : "No documents are uploaded"
    }
    ${
      (configData?.ask_question_enabled ?? false)
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
        const toolsInvoked = response.toolResults?.filter(
          (item) => item.type === "tool-result",
        );
        const toolNames = toolsInvoked?.map((item) => item.toolName);

        const totalCreditCost = toolNames?.length || 0;
        // console.log("totalCreditCost onStepFinish:", totalCreditCost); // Removed debugging log
        if (totalCreditCost > 0 && creditData) {
          // Ensure creditData is available
          await supabase
            .from("credits")
            .update({
              balance:
                creditData.balance - totalCreditCost < 0 // Use creditData.balance
                  ? 0
                  : creditData.balance - totalCreditCost,
            })
            .eq("user_id", user.id);
        }
      },

      async onFinish({ response }) {
        const finalMessages = appendResponseMessages({
          messages,
          responseMessages: response.messages,
        });

        // Re-fetch user within onFinish to ensure session is still valid before DB write
        const { data: finishUserData, error: finishAuthError } =
          await supabase.auth.getUser();

        if (finishAuthError || !finishUserData.user) {
          console.error(
            "Error fetching user in onFinish or user not found:",
            finishAuthError,
          );
          // Cannot use createErrorResponse here as headers might have been sent for streaming
          // Log and skip DB write if user is not valid
          return;
        }

        await supabase
          .from("chats")
          .upsert({
            id: chatId, // chatId can be null for new chats, Supabase handles this by inserting if PK is null/default
            messages: finalMessages,
            user_id: finishUserData.user.id, // Use user from this scope
          })
          .eq("id", chatId); // This eq is only relevant for updates, upsert handles insert/update logic
      },
    });
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error(
      "Error in streamText setup or during initial processing:",
      error,
    );
    // This error is before the stream is returned to the client.
    return createErrorResponse(
      error.message || "Failed to process chat request",
      500,
      "STREAM_PROCESSING_ERROR",
    );
  }
}
