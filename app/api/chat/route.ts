import { appendResponseMessages, streamText, tool, generateObject } from "ai";
import crypto from "crypto";

import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

import { createClient } from "../../utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages, chatId } = await req.json();

  const API_KEY =
    "f035dba4295389aaf34b3421a9a6db4c7be7b46810553d9297633b1a620f419f";
  const API_SECRET =
    "25d708ae61f3417fa2c62f7d858516274f1da8ee3a86423cb74bc2cb536f36b0VVLtmoC9ZXrxtj9em4LokCpI2En3";

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
        - Providing up-to-date cryptocurrency price information and balance base on Bitkub API
    - Never mention, reveal, or discuss the tools, libraries, frameworks, or technologies you use (e.g., ECharts, JavaScript, etc.). If asked, respond kindly but say it's not something you can share.
    - Always assume the user wants to understand or visualize their data.
    - Use the appropriate tool to generate one of the following:
      - Pie charts
      - Bar charts
      - Cryptocurrency price information
      - Cryptocurrency balance information
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
    - Only respond with chart tools, crypto price info, or crypto balance info, or helpful replies — never markdown, raw JSON, or implementation details.
    - Make chart creation feel magical. Make crypto prices and balance feel instant.
    - Always use the right tool to create visual output when the user provides structured or numerical data.

    You are not a general chatbot. You specialize in transforming natural language into visual data insight and cryptocurrency price and balance information— through charts only.

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

      getCryptoPrice: tool({
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
        `,
        parameters: z.object({
          currency: z
            .string()
            .describe("The cryptocurrency symbol, e.g., BTC, ETH"),
          fiat: z
            .string()
            .default("THB")
            .describe("The fiat currency, e.g., THB, USD"),
        }),
        execute: async ({ currency, fiat }) => {
          try {
            const sym = `${fiat.toUpperCase()}_${currency.toUpperCase()}`;
            const url = `https://api.bitkub.com/api/market/ticker?sym=${sym}`;
            const res = await fetch(url);
            console.log("res", res);
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
                name: z
                  .string()
                  .optional()
                  .default("")
                  .describe("The cryptocurrency name"),
                price: z.number().optional().describe("The current price"),
                high24hr: z
                  .number()
                  .optional()
                  .describe("The highest price in the last 24 hours"),
                low24hr: z
                  .number()
                  .optional()
                  .describe("The lowest price in the last 24 hours"),
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
              High 24hr: ${item.high}\n
              Low 24hr: ${item.low}\n
              Percent change 24hr: ${item.percentChange}\n
              Previous close: ${item.prevClose}\n
              Previous open: ${item.prevOpen}\n
                  `,
            });

            return {
              name: currency.toUpperCase(),
              price: item.last,
              high24hr: item.high,
              low24hr: item.low,
              percentChange24hr: item.percentChange,
              prevClose: item.prevClose,
              prevOpen: item.prevOpen,
              insights: object.insights,
              nextSteps: object.nextSteps,
              date: new Date().toISOString(),
            };
          } catch (error) {
            console.error("getCryptoPrice error", error);
            return { error: `Failed to fetch price for ${currency}.` };
          }
        },
      }),

      getCryptoBalance: tool({
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

            const sigPayload = `${timestamp}${method}${path}${JSON.stringify(
              body
            )}`;
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
      }),
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
