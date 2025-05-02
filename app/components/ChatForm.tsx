"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { createChat } from "../tools/chat-store";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Echart from "./Echart";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
interface ChatFormProps {
  chatId?: string;
  onChatUpdate?: () => void;
}

export default function ChatForm({ chatId, onChatUpdate }: ChatFormProps) {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    status,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: chatId,
    initialMessages: currentMessages,
    sendExtraMessageFields: true,
    body: {
      chatId,
      imageBase64,
    },
    async onToolCall({ toolCall }) {
      console.log("toolCall", toolCall);
      if (toolCall.toolName === "openCamera") {
      }

      if (toolCall.toolName === "closeCamera") {
        videoRef.current!.srcObject = null;
        setIsCameraOpen(false);
      }
      if (toolCall.toolName === "uploadImage") {
        console.log("uploadImage", toolCall);
      }
      if (toolCall.toolName === "visualizeData") {
        console.log("visualizeData", toolCall);
      }
    },
    onFinish: async () => {
      if (!chatId) {
        console.log(messages);
        // const id = await createChat(); // create a new chat
        // router.push(`/chat/${id}`);
      } else {
        setCurrentMessages(messages);
        onChatUpdate?.();
      }

      console.log("onFinish", messages);
    },
    onError: (error) => {
      console.log("onError", error);
    },
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isCameraOpen && videoRef.current) {
      intervalId = setInterval(() => {
        const video = videoRef.current!;
        if (video.videoWidth && video.videoHeight) {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL("image/jpeg");
          const base64 = dataUrl.split(",")[1];
          setImageBase64(base64);
        }
      }, 1000); // every 1000 ms
    }

    return () => clearInterval(intervalId);
  }, [isCameraOpen, videoRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      setIsLoading(true);
      fetch(`/api/chats/${chatId}`)
        .then((res) => res.json())
        .then((data) => {
          // The useChat hook doesn't provide a way to set initial messages directly,
          // so we'll need to trigger a new message with the existing history
          if (Array.isArray(data)) {
            setCurrentMessages(data);
            setMessages(data);
            setIsLoading(false);
          }
        })
        .catch((error) => console.error("Error loading chat history:", error))
        .finally(() => setIsLoading(false));
    } else {
      createChat().then((id) => {
        router.push(`/chat/${id}`);
        setIsLoading(false);
      });
    }
  }, [chatId, setMessages, router]);

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div>
          <div
            className={clsx(
              "overflow-y-auto space-y-2 px-6",
              messages.length > 0 && "h-[calc(100vh-250px)]"
            )}
          >
            {/* <Echart /> */}
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={` text-left px-4 py-2 rounded-2xl text-sm ${
                      isUser ? "bg-blue-600 text-white" : " text-white"
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <p
                            key={index}
                            className="leading-relaxed whitespace-pre-wrap"
                          >
                            {part.text}
                          </p>
                        );
                      } else {
                        if (part.type === "tool-invocation") {
                          if (
                            part.toolInvocation.toolName === "openCamera" ||
                            part.toolInvocation.toolName ===
                              "askForConfirmationToOpenCamera"
                          ) {
                            return (
                              <div key={index} className="space-y-2">
                                <p className="text-sm font-semibold">
                                  🟠 Tool: {part.toolInvocation.toolName}
                                </p>
                                <button
                                  onClick={async () => {
                                    const stream =
                                      await navigator.mediaDevices.getUserMedia(
                                        {
                                          video: true,
                                        }
                                      );
                                    if (videoRef.current) {
                                      videoRef.current.srcObject = stream;
                                      videoRef.current.play();
                                      setIsCameraOpen(true);
                                    }
                                  }}
                                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                >
                                  📷 Open Camera
                                </button>
                                <video
                                  ref={videoRef}
                                  id="webcam"
                                  width={300}
                                  height={200}
                                  className="rounded-lg mt-2"
                                  autoPlay
                                  muted
                                />
                              </div>
                            );
                          }
                          if (part.toolInvocation.toolName === "closeCamera") {
                            return (
                              <div key={index} className="space-y-2">
                                <p className="text-sm font-semibold">
                                  🟠 Tool: {part.toolInvocation.toolName} ✅
                                </p>
                              </div>
                            );
                          }

                          if (part.toolInvocation.toolName === "uploadImage") {
                            const publicUrl = `${
                              process.env.NEXT_PUBLIC_SUPABASE_URL
                            }/storage/v1/object/public/${
                              (
                                part.toolInvocation as unknown as {
                                  result: {
                                    data: {
                                      fullPath: string;
                                    };
                                  };
                                }
                              ).result?.data?.fullPath
                            }`;
                            return (
                              <div key={index} className="space-y-2">
                                <p className="text-sm font-semibold">
                                  🟠 Tool: {part.toolInvocation.toolName} ✅
                                </p>
                                <Image
                                  src={publicUrl}
                                  alt="Uploaded Image"
                                  width={300}
                                  height={200}
                                  className="rounded-lg"
                                />
                                <p className="text-xs w-[300px] text-ellipsis overflow-hidden">
                                  {`${
                                    process.env.NEXT_PUBLIC_SUPABASE_URL
                                  }/storage/v1/object/public/${
                                    (
                                      part.toolInvocation as unknown as {
                                        result: {
                                          data: {
                                            fullPath: string;
                                          };
                                        };
                                      }
                                    ).result?.data?.fullPath
                                  }`}
                                </p>
                              </div>
                            );
                          }

                          if (
                            part.toolInvocation.toolName === "generateSpeech"
                          ) {
                            const uint8Obj = (
                              part.toolInvocation as unknown as {
                                result: {
                                  audio: {
                                    audio: {
                                      uint8ArrayData: Record<string, number>;
                                    };
                                  };
                                };
                              }
                            ).result?.audio.audio.uint8ArrayData;
                            if (uint8Obj) {
                              // Convert object to Uint8Array
                              const byteArray = new Uint8Array(
                                Object.keys(uint8Obj).map(
                                  (key) => uint8Obj[key]
                                )
                              );

                              // Create a Blob from it
                              const blob = new Blob([byteArray], {
                                type: "audio/mp3",
                              });

                              // Create object URL
                              const audioUrl = URL.createObjectURL(blob);

                              return (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm font-semibold">
                                    🟠 Tool: {part.toolInvocation.toolName} ✅
                                  </p>
                                  <p className="text-xs">
                                    {`"${
                                      (
                                        part.toolInvocation as unknown as {
                                          result: {
                                            text: string;
                                          };
                                        }
                                      ).result.text
                                    }"`}
                                  </p>
                                  <audio controls src={audioUrl} />
                                </div>
                              );
                            } else if (status === "streaming") {
                              return (
                                <div
                                  key={index}
                                  className="text-sm text-green-500"
                                >
                                  🔊 Generating speech...
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  key={index}
                                  className="text-sm text-red-500"
                                >
                                  ⚠️ No audio buffer found
                                </div>
                              );
                            }
                          }

                          if (
                            part.toolInvocation.toolName === "generateImage"
                          ) {
                            return (
                              <div key={index} className="space-y-2">
                                <p className="text-sm font-semibold">
                                  🟠 Tool: {part.toolInvocation.toolName} ✅
                                </p>
                                <p className="text-xs w-[300px] text-ellipsis overflow-hidden">
                                  {part.toolInvocation.args?.prompt}
                                </p>
                                {(
                                  part.toolInvocation as unknown as {
                                    result: {
                                      images: {
                                        base64Data: string;
                                      }[];
                                    };
                                  }
                                ).result?.images?.[0]?.base64Data && (
                                  <Image
                                    src={`data:image/png;base64,${
                                      (
                                        part.toolInvocation as unknown as {
                                          result: {
                                            images: {
                                              base64Data: string;
                                            }[];
                                          };
                                        }
                                      ).result?.images?.[0]?.base64Data
                                    }`}
                                    alt="Generated Image"
                                    width={300}
                                    height={200}
                                    className="rounded-lg"
                                  />
                                )}
                                {status === "streaming" &&
                                  !(
                                    part.toolInvocation as unknown as {
                                      result: {
                                        images: {
                                          base64Data: string;
                                        }[];
                                      };
                                    }
                                  ).result?.images?.[0]?.base64Data && (
                                    <div className="text-sm text-green-500">
                                      📸 Generating image...{" "}
                                      <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            );
                          }
                          if (part.toolInvocation.toolName === "generateHtml") {
                            const rawHtml = (
                              part.toolInvocation as unknown as {
                                result: {
                                  code: string;
                                };
                              }
                            ).result?.code;
                            const status = (
                              part.toolInvocation as unknown as {
                                status: string;
                              }
                            ).status;
                            console.log(status);
                            return (
                              <div key={index} className="space-y-2">
                                <p className="text-sm font-semibold">
                                  🟠 Tool: generateHtml ✅
                                </p>

                                {!rawHtml ? (
                                  <div className="text-sm text-green-500">
                                    📚 Generating HTML...
                                    <div className="flex items-center justify-center py-4">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                  </div>
                                ) : (
                                  rawHtml && (
                                    <iframe
                                      className="w-full h-[400px] border rounded-md"
                                      sandbox="allow-scripts"
                                      srcDoc={rawHtml}
                                    />
                                  )
                                )}
                              </div>
                            );
                          }

                          if (
                            part.toolInvocation.toolName === "visualizeData"
                          ) {
                            return (
                              <div key={index} className="space-y-2">
                                <p className="text-sm font-semibold">
                                  🟠 Tool: visualizeData ✅
                                </p>
                                {(
                                  part.toolInvocation as unknown as {
                                    result: {
                                      type: string;
                                      chartData: unknown;
                                    };
                                  }
                                ).result?.type &&
                                  (
                                    part.toolInvocation as unknown as {
                                      result: {
                                        type: string;
                                        chartData: unknown;
                                      };
                                    }
                                  ).result?.type !== "table" && (
                                    <Echart
                                      type={
                                        (
                                          part.toolInvocation as unknown as {
                                            result: {
                                              type: "bar" | "pie" | "table";
                                              chartData: unknown;
                                            };
                                          }
                                        ).result?.type
                                      }
                                      option={
                                        (
                                          part.toolInvocation as unknown as {
                                            result: {
                                              chartData: unknown;
                                            };
                                          }
                                        ).result?.chartData
                                      }
                                    />
                                  )}

                                {(
                                  part.toolInvocation as unknown as {
                                    result: {
                                      type: string;
                                      chartData: {
                                        xAxisLabels: string[];
                                        seriesData: {
                                          name: string;
                                          value: number;
                                        }[];
                                      };
                                    };
                                  }
                                ).result?.type === "table" && (
                                  <div className="overflow-x-auto w-[600px]  shadow border bg-zinc-600 text-white text-sm">
                                    <table className="min-w-full text-left table-auto">
                                      <thead className="bg-zinc-700">
                                        <tr>
                                          {(
                                            (
                                              part.toolInvocation as unknown as {
                                                result: {
                                                  chartData: {
                                                    xAxisLabels: string[];
                                                    seriesData: {
                                                      name: string;
                                                      value: number;
                                                    }[];
                                                  };
                                                };
                                              }
                                            ).result?.chartData
                                              ?.xAxisLabels ?? ["Name", "Value"]
                                          ).map(
                                            (header: string, idx: number) => (
                                              <th
                                                key={idx}
                                                className="px-4 py-2 font-semibold text-zinc-200 whitespace-nowrap"
                                              >
                                                {header}
                                              </th>
                                            )
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(
                                          part.toolInvocation as unknown as {
                                            result: {
                                              chartData: {
                                                xAxisLabels: string[];
                                                seriesData: {
                                                  name: string;
                                                  value: number;
                                                }[];
                                              };
                                            };
                                          }
                                        ).result?.chartData?.seriesData?.map(
                                          (
                                            row: {
                                              name: string;
                                              value: number;
                                            },
                                            i: number
                                          ) => (
                                            <tr key={i} className="border-t">
                                              <td className="px-4 py-2">
                                                {row.name}
                                              </td>
                                              <td className="px-4 py-2">
                                                {new Intl.NumberFormat(
                                                  "en-US",
                                                  {
                                                    notation: "standard",
                                                    compactDisplay: "short",
                                                  }
                                                ).format(row.value)}
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        }
                      }
                    })}
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
          <form
            onSubmit={handleSubmit}
            className="sticky bottom-0 w-full px-4 py-2 flex items-center gap-3"
          >
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder={
                status !== "ready" ? "Thinking..." : "Ask anything..."
              }
              disabled={status !== "ready"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              className="flex-1 bg-zinc-900 text-white px-4 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status !== "ready"}
              className="bg-orange-600 hover:bg-orange-700 w-12 h-12 text-white rounded-full disabled:opacity-50"
            >
              ⬆
            </button>
          </form>
        </div>
      )}
      {/* Chat input */}
    </div>
  );
}
