/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  appendResponseMessages,
  streamText,
  tool,
  experimental_generateSpeech as generateSpeech,
  experimental_generateImage as generateImage,
  generateText,
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
      describeImage: tool({
        description:
          "When the user asks to describe an image from the url, describe the image. Always ask for image url.",
        parameters: z.object({
          imageUrl: z.string().describe("The image url"),
        }),
        execute: async ({ imageUrl }: { imageUrl: string }) => {
          const result: any = await streamText({
            model: openai("gpt-4o-mini"),
            system: "You are a helpful assistant.",
            messages: [
              {
                role: "user",
                content: `Write a description of the image: ${imageUrl}`,
              },
            ],
          });
          return result.response.messages[0].content[0].text;
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
      webSearch: tool({
        description:
          "Search the web to get information. Always ask for search query.",
        parameters: z.object({
          query: z.string().describe("The search query"),
        }),
        execute: async ({ query }: { query: string }) => {
          const result = await generateText({
            model: openai.responses("gpt-4o-mini"),
            prompt: query,
            tools: {
              web_search_preview: openai.tools.webSearchPreview({
                userLocation: {
                  type: "approximate",
                  city: "Bangkok",
                  region: "Thailand",
                },
              }),
            },
          });
          return { text: result.text, sources: result.sources };
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
