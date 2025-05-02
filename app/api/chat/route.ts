import {
  appendResponseMessages,
  streamText,
  tool,
  experimental_generateScript as generateScript,
  experimental_generateImage as generateImage,
  generateObject,
} from "ai";

// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

// const openRouter = createOpenRouter({
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function errorHandle(error: unknown) {
  if (error === null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function POST(req: Request) {
  const { messages, chatId, imageBase64 } = await req.json();
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful assistant.",
    messages,
    tools: {
      openCamera: tool({
        description:
          "Open the camera. Always ask for confirmation before opening the camera.",
        parameters: z.object({
          type: z.string().describe("The type of camera to open"),
        }),
        execute: async ({ type }) => {
          console.log("Opening camera with type:", type);
          return type;
        },
      }),
      generateImage: tool({
        description:
          "Generate an image based on the given prompt. The image will be generated using DALL-E.",
        parameters: z.object({
          prompt: z.string().describe("The prompt to generate the image from"),
        }),
        execute: async ({ prompt }) => {
          try {
            const response = await generateImage({
              model: "dall-e-3",
              prompt,
              size: "1024x1024",
              quality: "standard",
            });

            return response;
          } catch (error) {
            console.log("error", error);
            return errorHandle(error);
          }
        },
      }),
      generateChart: tool({
        description:
          "Generate ECharts-compatible option config for a chart based on the given description.",
        parameters: z.object({
          type: z
            .string()
            .enum(["pie", "bar", "table"])
            .describe("The chart type to render"),
          title: z.string().optional().describe("The chart title"),
          seriesData: z
            .array(
              z.object({
                name: z.string(),
                value: z.number(),
              })
            )
            .optional(),
          tableData: z
            .array(
              z.object({
                name: z.string(),
                value: z.number(),
              })
            )
            .optional(),
          tableHeaders: z
            .array(z.string())
            .optional()
            .describe("Table headers"),
        }),
        execute: async ({ type, title, seriesData, tableData, tableHeaders }) => {
          try {
            const { object } = await generateObject({
              model: openai("gpt-4o-mini"),
              schema: z.object({
                title: z.string().optional(),
                chartData: z.object({
                  title: z.string().optional(),
                  tableData: z
                    .array(
                      z.object({
                        name: z.string(),
                        value: z.number(),
                      })
                    )
                    .optional(),
                  tableHeaders: z.array(z.string()).optional(),
                }),
              }),
              prompt: `Generate ECharts-compatible option config for a ${type} chart based on this description:
${title ?? ""}
Series data: ${JSON.stringify(seriesData ?? [], null, 2)}`,
            });

            return {
              type,
              chartData: object,
              tableData: tableData ?? [],
            };
          } catch (error) {
            console.log("error", error);
            return errorHandle(error);
          }
        },
      }),
    },
  });

  const finalMessages = appendResponseMessages({
    messages,
    responseMessages: result.messages,
  });

  await supabase
    .from("chats")
    .update({ messages: finalMessages })
    .eq("id", chatId);

  return result.toDataStreamResponse();
}