import {
  appendResponseMessages,
  streamText,
  tool,
  experimental_generateSpeech as generateSpeech,
  experimental_generateImage as generateImage,
  generateObject,
} from "ai";

// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

// const openRouter = createOpenRouter({
//   apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_TOKEN,
// });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function errorHandler(error: unknown) {
  if (error == null) {
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
          type: z.string().describe("The type of camera"),
        }),
        execute: async ({ type }: { type: string }) => {
          console.log("camera", type);
          return type;
        },
      }),
      askForConfirmationToOpenCamera: tool({
        description: "Ask the user for confirmation.",
        parameters: z.object({
          message: z.string().describe("The message to ask for confirmation."),
        }),
        execute: async ({ message }: { message: string }) => {
          console.log("confirmation", message);
          return message;
        },
      }),
      closeCamera: tool({
        description: "Close the camera",
        parameters: z.object({
          type: z.string().describe("The type of camera"),
        }),
        execute: async ({ type }: { type: string }) => {
          console.log("camera", type);
          return type;
        },
      }),
      uploadImage: tool({
        description:
          "When the user asks to upload an image, or save an image to supabase",
        parameters: z.object({
          type: z.string().describe("Upload type"),
        }),
        execute: async ({ type }: { type: string }) => {
          const filename = `webcam-${Date.now()}.jpg`;
          const buffer = Buffer.from(imageBase64, "base64");

          const { data, error } = await supabase.storage
            .from("damage-images") // your bucket name
            .upload(filename, buffer, {
              contentType: "image/jpeg",
            });
          return { type, data, error };
        },
      }),
      generateSpeech: tool({
        description: "Generate speech",
        parameters: z.object({
          text: z.string().describe("The text to generate speech"),
          type: z.string().describe("Speech type"),
        }),
        execute: async ({ text, type }: { text: string; type: string }) => {
          const audio = await generateSpeech({
            model: openai.speech("tts-1"),
            text,
            voice: "alloy",
          });
          return { text, type, audio };
        },
      }),
      generateImage: tool({
        description: "Generate an image. Always ask for image prompt.",
        parameters: z.object({
          type: z.string().describe("Image type"),
          prompt: z.string().describe("Image prompt"),
        }),
        execute: async ({ type, prompt }: { type: string; prompt: string }) => {
          const { images } = await generateImage({
            model: openai.image("dall-e-2"),
            prompt,
            n: 1,
          });
          return { type, images };
        },
      }),
      generateHtml: tool({
        description:
          "When the user asks to generate html, create a html. Always ask for html prompt.",
        parameters: z.object({
          type: z.string().describe("Html type"),
          prompt: z.string().describe("Html prompt"),
        }),
        execute: async ({ type, prompt }: { type: string; prompt: string }) => {
          const { object } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: z.object({
              code: z.string(),
            }),
            prompt,
          });
          return { type, code: object.code };
        },
      }),
      visualizeData: tool({
        description:
          "When the user asks to visualize data, generate a chart configuration for ECharts. Always ask for the data and chart type.",
        parameters: z.object({
          type: z
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
            .optional()
            .describe("Series data with optional color"),

          prompt: z
            .string()
            .describe("Describe the dataset and labels for the chart."),
        }),
        execute: async ({ type, title, seriesData, prompt }) => {
          try {
            const { object } = await generateObject({
              model: openai("gpt-4o-mini"),
              schema: z.object({
                title: z.string().optional(),
                seriesData: z
                  .array(
                    z.object({
                      name: z.string(),
                      value: z.number(),
                      color: z.string().optional(),
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
              prompt: `Generate ECharts-compatible option config for a ${type} chart based on this description:\n${prompt}\n\nTitle: ${
                title ?? ""
              }\nSeries data: ${JSON.stringify(seriesData ?? [], null, 2)}`,
            });

            return {
              type,
              chartData: object,
            };
          } catch (error) {
            console.log("error", error);
            return errorHandler(error);
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
