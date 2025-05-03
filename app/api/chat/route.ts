import { appendResponseMessages, streamText, tool, generateObject } from "ai";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// export function errorHandler(error: unknown) {
//   if (error == null) {
//     return "unknown error";
//   }

//   if (typeof error === "string") {
//     return error;
//   }

//   if (error instanceof Error) {
//     return error.message;
//   }

//   return JSON.stringify(error);
// }
export async function POST(req: Request) {
  const { messages, chatId } = await req.json();
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `
    You are Askivue — a smart, friendly AI assistant that transforms natural language into visual insights. 
    Your role is to help users describe their data, generate charts, explain patterns, and offer suggestions — all in a clear, conversational, and empowering tone.
    
    🧠 Behavior Guidelines:
    - Always assume the user wants to visualize or understand data.
    - When unclear, ask concise follow-up questions to clarify their intent.
    - If the data looks suitable for a pie, bar, or table chart, suggest the most relevant type.
    - If the user asks for changes (color, type, title), respond flexibly with updated chart options.
    - Avoid jargon. Prioritize clarity and simplicity.
    - Be proactive — offer insights, summaries, or suggestions based on the data.
    - When appropriate, describe what the chart shows in human-friendly language.
    - ❗ At this time, do not support line charts or other chart types outside pie, bar, and table. Politely explain the limitation and offer the closest supported option.
    
    🌐 Brand Tone:
    - Friendly, professional, and concise.
    - Like a data-savvy teammate — never robotic, never pushy.
    - Encourage exploration with supportive phrasing (e.g., “Want to adjust this further?” or “Here’s what this tells us…”).
    
    🎯 Core Focus:
    - Help users go from “text” to “visual” in seconds.
    - Make the experience feel effortless and intelligent.
    - Always return chart-ready responses when data is complete.
    
    You are not a general chatbot. You specialize in transforming user prompts into visual data insight.
    `,
    messages,

    tools: {
      visualizeData: tool({
        description: `
        Use this tool to generate visual chart configurations (ECharts-compatible) whenever the user asks to view data as a chart or table.
      ✅ Required for:
      - Pie charts
      - Bar charts
      - Data tables
      - Any request involving "chart", "graph", "visualize", "ตาราง", "แผนภูมิ", or similar terms
      - Any structured or numerical data the user provides

      🧠 Behavior:
      - Always ask for the chart type if not specified.
      - If the user mentions table or ตาราง, use type "table".
      - Never return raw markdown tables or plain lists — always respond visually through this tool.
      - Support only: "pie", "bar", and "table" types.

      The goal is to help the user go from text to visual insights — fast and seamlessly.
        `,
        parameters: z.object({
          type: z
            .enum(["pie", "bar", "table"])
            .describe("The chart type to render"),
          title: z.string().optional().describe("The chart title"),
          seriesData: z
            .array(
              z.object({
                name: z.string().describe("Series name"),
                value: z.number().describe("Series value"),
                color: z
                  .string()
                  .describe(
                    "Color for the chart series. If the user provides a color, use it. If not, use the previous color if available; otherwise, fall back to the default color."
                  ),
              })
            )
            .optional()
            .describe("Series data with optional color"),
          tableData: z
            .array(
              z.object({
                name: z.string().describe("Table name"),
                value: z.number().describe("Table value"),
              })
            )
            .optional()
            .describe("Table data"),
          tableHeaders: z
            .array(z.string())
            .optional()
            .describe("Table headers"),
          prompt: z
            .string()
            .describe("Describe the dataset and labels for the chart."),
        }),
        execute: async ({
          type,
          title,
          seriesData,
          tableData,
          tableHeaders,
          prompt,
        }) => {
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
                tableData: z
                  .array(
                    z.object({
                      name: z.string().describe("Table name"),
                      value: z.number().describe("Table value"),
                    })
                  )
                  .optional(),
                tableHeaders: z
                  .array(z.string())
                  .optional()
                  .describe("Table headers"),
              }),
              prompt: `Generate ECharts-compatible option config for a ${type} chart based on this description:\n${prompt}\n\nTitle: ${
                title ?? ""
              }\nSeries data: ${JSON.stringify(
                seriesData ?? [],
                null,
                2
              )}\nTable data: ${JSON.stringify(
                tableData ?? [],
                null,
                2
              )}\nTable headers: ${JSON.stringify(
                tableHeaders ?? [],
                null,
                2
              )}`,
            });

            return {
              type,
              chartData: object,
            };
          } catch (error) {
            console.log("error", error);
            return error;
          }
        },
      }),
    },
    async onFinish({ response }) {
      const finalMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });
      await supabase
        .from("chats")
        .upsert({
          id: chatId,
          messages: finalMessages,
        })
        .eq("id", chatId);
    },
  });

  return result.toDataStreamResponse();
}
