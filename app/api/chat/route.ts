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
    You are Askivue — a smart and very polite girl, friendly AI assistant that transforms natural language into visual insights. 
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
    - Don't return markdown pls trying to use tool to generate chart or table.
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
      generatePieChart: tool({
        description: `Use this tool to generate visual pie chart configurations (ECharts-compatible) whenever the user asks to view data as a pie chart
        
        ✅ Required for:
        - Pie charts
        - Any structured or numerical data the user provides

        🧠 Behavior:
        - Support only: "pie" types.
        - Always ask for the chart type if not specified.
        - Always ask for color and if the user doesn't ask for color, use the default color.
        - Always confirm the information provided by the user before generating the chart.
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
        }),
        execute: async ({ title, seriesData }) => {
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
              }),
              prompt: `Generate ECharts-compatible option config for a pie chart based on schema and this description:\n\nTitle: ${
                title ?? ""
              }\nSeries data: ${JSON.stringify(seriesData ?? [], null, 2)}`,
            });
            return {
              chartData: object,
            };
          } catch (error) {
            console.log("error", error);
            return error;
          }
        },
      }),

      generateBarChart: tool({
        description: `Use this tool to generate visual bar chart configurations (ECharts-compatible) whenever the user asks to view data as a bar chart
        
        ✅ Required for:
        - Bar charts
        - Any structured or numerical data the user provides

        🧠 Behavior:
        - Support only: "bar" types.
        - Always ask for the chart type if not specified.
        - Always ask for color and if the user doesn't ask for color, use the default color.
        - Always confirm the information provided by the user before generating the chart.
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
        }),
        execute: async ({ title, seriesData }) => {
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
              }),
              prompt: `Generate ECharts-compatible option config for a bar chart based on schema and this description:\n\nTitle: ${
                title ?? ""
              }\nSeries data: ${JSON.stringify(seriesData ?? [], null, 2)}`,
            });
            return {
              chartData: object,
            };
          } catch (error) {
            console.log("error", error);
            return error;
          }
        },
      }),
      generateTable: tool({
        description: `Use this tool to generate data tables (ECharts-compatible) whenever the user asks to view structured information in tabular form.
      
      ✅ Required for:
      - Tables
      - User mentions "ตาราง", "table", "rows and columns", "ข้อมูล"
      
      🧠 Behavior:
      - Support only: "table" types.
      - Always confirm the information provided by the user before generating the table.
      - Support only: 2 columns.
      The goal is to help the user view structured insights in a clean, flexible format.`,
        parameters: z.object({
          title: z.string().optional().describe("The table title"),
          tableHeaders: z
            .array(z.string())
            .describe("Array of column headers in display order"),
          tableData: z
            .array(z.object({ name: z.string(), value: z.number() }))
            .describe("Each row as an object where keys match headers"),
        }),
        execute: async ({ title, tableHeaders, tableData }) => {
          try {
            const { object } = await generateObject({
              model: openai("gpt-4o-mini"),
              schema: z.object({
                title: z.string().optional().describe("The table title"),
                tableHeaders: z
                  .array(z.string())
                  .describe("Column headers in order"),
                tableData: z
                  .any()
                  .describe(
                    "Table data JSON string, where each object has keys matching the headers"
                  ),
              }),
              prompt: `Generate a JSON structure for an ECharts-compatible data table.

              Requirements:
              - Output must be a JSON object.
              - "title" should reflect the dataset.
              - "tableHeaders" should be an array of column names in the correct order.
              - "tableData" must be an array of row objects, where each object has keys matching the headers.
              
              Data Description:
              Title: ${title ?? "Untitled"}
              Headers: ${JSON.stringify(tableHeaders, null, 2)}
              Data: ${JSON.stringify(tableData, null, 2)}`,
            });

            return object;
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
