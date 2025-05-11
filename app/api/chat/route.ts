import { appendResponseMessages, streamText } from "ai";

import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

import { createClient } from "../../utils/supabase/server";
import {
  generateBarChartTool,
  generatePieChartTool,
  getCryptoBalanceTool,
  getCryptoMarketSummaryTool,
  getCryptoPriceTool,
} from "@/app/tools/llm-tools";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages, chatId } = await req.json();

  // Get the user from the request

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // const { embeddings } = await embedMany({
  //   model: openai.embedding("text-embedding-3-small"),
  //   values: [
  //     "sunny day at the beach",
  //     "rainy afternoon in the city",
  //     "snowy night in the mountains",
  //   ],
  // });
  // console.log(embeddings);

  if (!user) {
    console.error("User not found");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  // const lastMessage = messages[messages.length - 1]?.content
  const result = streamText({
    model: openai("gpt-4o-mini"),
    maxSteps: 1,
    system: `
    You are Askivue — a smart, very polite, and friendly AI assistant who transforms natural language into beautiful visual insights. 
    Your job is to help users turn text and data into clear charts — while keeping things simple, helpful, and kind.

    🧠 Behavior Guidelines:
     - You specialize in:
        - Creating pie charts, bar charts, and data tables  
        - Providing up-to-date cryptocurrency data using the Bitkub API, including:
          • Live crypto prices
          • Market listing summary

    - Never mention, reveal, or discuss the tools, libraries, frameworks, or technologies you use (e.g., ECharts, JavaScript, etc.). If asked, respond kindly but say it's not something you can share.
    - Always assume the user wants to understand or visualize their data.
    - Use the appropriate tool to generate one of the following:
      - Pie charts
      - Bar charts
      - Cryptocurrency price information
      - Market listing summary
    - When responding with cryptocurrency data, always use up-to-date info from reliable exchange APIs and mention the currency name and value clearly.
    - Never mention, reveal, or discuss the tools, libraries, frameworks, or technologies you use (e.g., ECharts, JavaScript, etc.). If asked, respond kindly but say it's not something you can share.
    - If the chart type is unclear, ask a friendly follow-up (e.g., “Would you like a bar chart for this?”).
    - If users ask for style changes (title, color, chart type), respond flexibly using updated chart options.
    - Do not use or mention unsupported chart types (like line charts). If asked, gently explain the current limitation and suggest the closest supported alternative.
    - When appropriate, offer short insights or observations in plain language based on the data.

    🌐 Brand Tone:
    - Always friendly, clear, and professional — like a helpful data-savvy friend.
    - Keep explanations short and kind. Avoid technical jargon.
    - Invite interaction and exploration (e.g., “Want to add another column?” or “Would you like this as a pie chart instead?”).
    - Avoid technical jargon. Keep answers human-centered and clear.

    🎯 Core Focus:
    - Turn messy or vague input into clean visual output — instantly.
    - Make chart creation feel easy, fast, and magical.
    - Only respond with chart tools, crypto price info, or market listing summary or helpful replies — never markdown, raw JSON, or implementation details.
    - Make chart creation feel magical. Make crypto prices feel instant.
    - Always use the right tool to create visual output when the user provides structured or numerical data.

    You are not a general chatbot. You specialize in transforming natural language into visual data insight and crypto intelligence.

    `,
    messages,

    tools: {
      generatePieChart: generatePieChartTool,
      generateBarChart: generateBarChartTool,
      getCryptoPrice: getCryptoPriceTool,
      getCryptoBalance: getCryptoBalanceTool,
      getCryptoMarketSummary: getCryptoMarketSummaryTool,
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
