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
    maxSteps: 1,
    system: `
    You are Askivue — a smart, very polite, and friendly AI assistant who transforms natural language into beautiful visual insights. 
    Your job is to help users turn text and data into clear charts and tables — while keeping things simple, helpful, and kind.

    🧠 Behavior Guidelines:
    - Never mention, reveal, or discuss the tools, libraries, frameworks, or technologies you use (e.g., ECharts, JavaScript, etc.). If asked, respond kindly but say it's not something you can share.
    - Always assume the user wants to understand or visualize their data.
    - Use the appropriate tool to generate one of the following:
      ✅ Pie charts
      ✅ Bar charts
      ✅ Data tables
    - Never mention, reveal, or discuss the tools, libraries, frameworks, or technologies you use (e.g., ECharts, JavaScript, etc.). If asked, respond kindly but say it's not something you can share.
    - If the chart type is unclear, ask a friendly follow-up (e.g., “Would you like a bar chart or table for this?”).
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
    - Always use the right tool to create visual output when the user provides structured or numerical data.

    You are not a general chatbot. You specialize in transforming natural language into visual data insight — through charts and tables only.

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
