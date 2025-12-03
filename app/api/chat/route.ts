import { convertToModelMessages, stepCountIs, streamText, UIMessage, tool } from "ai";
import { openai } from "@ai-sdk/openai";

import { NextRequest } from "next/server";

import { createClient, createServiceClient } from "../../utils/supabase/server";
import { askQuestionTool, createAskQuestionTool, finishTool } from "@/app/tools/llm-tools";
import { createReadCurrentPageTool, createContextTool } from "@/app/tools/embed-tools";
import { db } from "../../../db/config";
import {
  credits,
  documents,
  chats,
  knowledgeBases,
  userConfig,
} from "../../../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getSystemPrompt } from "./system-prompts";

// const openai = createOpenAI({
//   baseURL: `https://gateway.ai.cloudflare.com/v1/a599ab03a24f46fa6aecd03babd1bb50/docaider/openai`,
// });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    messages,
    id,
    chatId, // Support both id and chatId
    isKnowledgeBase,
    knowledgeBaseId,
    isEmbed = false,
    alwaysUseDocument = false,
    pageContent,
    activeTool,
    context,
    disableTools,
  } = (await req.json()) as {
    messages: any[];
    id?: string;
    chatId?: string;
    isKnowledgeBase: boolean;
    knowledgeBaseId: string;
    isEmbed?: boolean;
    alwaysUseDocument?: boolean;
    pageContent?: {
      title: string;
      content: string;
      url: string;
    };
    activeTool?: "knowledge-base" | "current-page" | "auto" | "context";
    context?: {
      prompt: string;
      content: string;
    };
    disableTools?: boolean;
  };

  const finalChatId = chatId || id;

  if (!finalChatId) {
    return new Response(JSON.stringify({ error: "Chat ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Authentication Check ---
  let user = null;
  let balance = 0;
  let userConfigData = null;

  if (!isEmbed) {
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (!user) {
      console.error("User not found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all user config using Drizzle ORM
    const configResult = await db
      .select({
        useDocument: userConfig.useDocument,
      })
      .from(userConfig)
      .where(eq(userConfig.id, user.id))
      .limit(1);
    userConfigData = configResult;

    // Get user credit using Drizzle ORM
    const creditResult = await db
      .select({ balance: credits.balance })
      .from(credits)
      .where(eq(credits.userId, user.id))
      .limit(1);
    balance = creditResult[0]?.balance || 0;
  }

  // --- Knowledge Base & Document Fetching ---
  let knowledgeBaseDocumentIds: string[] = [];
  let isPublicKnowledgeBase = false;
  let hasSharedAccess = false;
  let allowEmbedding = false;
  let kbInstruction = "";
  const serviceSupabase = createServiceClient();

  try {
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases?.id, knowledgeBaseId));

    // If knowledge base exists, get its details
    if (knowledgeBase) {
      knowledgeBaseDocumentIds = knowledgeBase.documentIds || [];
      isPublicKnowledgeBase = knowledgeBase.isPublic || false;
      allowEmbedding = knowledgeBase.allowEmbedding || false;
      kbInstruction = knowledgeBase.instruction || "";

      // Access Control Logic
      if (isEmbed) {
        // For embed, check if embedding is allowed
        if (!isPublicKnowledgeBase && !allowEmbedding) {
          return new Response(
            JSON.stringify({
              error: "Embedding not allowed for this knowledge base",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        // For authenticated user, check ownership or shared access
        if (
          !isPublicKnowledgeBase &&
          knowledgeBase.userId !== user?.id &&
          user?.email
        ) {
          const { data: sharedAccess } = await serviceSupabase
            .from("knowledge_base_shares")
            .select("id")
            .eq("knowledge_base_id", knowledgeBaseId)
            .eq("shared_with_email", user.email)
            .single();

          if (sharedAccess) {
            hasSharedAccess = true;
          }
        }
      }
    } else {
      console.warn(`Knowledge base with ID ${knowledgeBaseId} not found`);
      if (isKnowledgeBase || isEmbed) {
        return new Response(
          JSON.stringify({ message: "Knowledge base not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  } catch (error) {
    console.error("Error fetching knowledge base:", error);
    if (isKnowledgeBase || isEmbed) {
      return new Response(
        JSON.stringify({ message: "Error fetching knowledge base" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Get documents using Drizzle ORM
  const allDocuments = await db
    .select({
      id: documents.id,
      documentId: documents.documentId,
      documentName: documents.documentName,
      title: documents.title,
    })
    .from(documents)
    .where(
      (isKnowledgeBase || isEmbed) && knowledgeBaseId
        ? // If it's a knowledge base request (embed or app)
          and(
            eq(documents.active, true),
            eq(documents.isKnowledgeBase, true),
            // Access control logic:
            // 1. Embed: No user ID check (public/embedded KB)
            // 2. App Public/Shared: No user ID check
            // 3. App Private: Check user ID
            isEmbed ||
              (isPublicKnowledgeBase !== true && hasSharedAccess !== true)
              ? isEmbed
                ? undefined // No user check for embed
                : eq(documents.userId, user!.id) // User check for private app access
              : undefined,
            knowledgeBaseDocumentIds.length > 0
              ? inArray(documents.documentId, knowledgeBaseDocumentIds)
              : eq(documents.id, -1)
          )
        : // Standard app chat (not KB specific)
          and(
            eq(documents.userId, user!.id),
            eq(documents.active, true),
            eq(documents.isKnowledgeBase, isKnowledgeBase)
          )
    )
    .orderBy(documents.updatedAt);

  // --- Tool Selection ---
  let tools: any = isEmbed
    ? {
        askQuestion: createAskQuestionTool({
          knowledgeBaseId,
          isEmbed: true,
        }),
        finish: finishTool,
      }
    : { askQuestion: askQuestionTool, finish: finishTool };
  if (isEmbed && (activeTool === "current-page" || activeTool === "auto" || activeTool === "context")) {
    if (activeTool === "auto") {
      // If auto, allow both tools
      tools = {
        askQuestion: createAskQuestionTool({
          knowledgeBaseId,
          isEmbed: true,
        }),
        readCurrentPage: pageContent ? createReadCurrentPageTool(pageContent) : undefined,
        finish: finishTool,
      };
      // Remove undefined tools
      Object.keys(tools).forEach(key => tools[key] === undefined && delete tools[key]);
    } else if (activeTool === "current-page" && pageContent) {
      // If specifically current-page, only allow that
      tools = {
        readCurrentPage: createReadCurrentPageTool(pageContent),
        finish: finishTool,
      };
    } else if (activeTool === "context" && context) {
      // If specifically context, only allow that
      tools = {
        context: createContextTool(context),
        finish: finishTool,
      };
    }
  }

  // --- System Prompt Selection ---
  const systemPrompt = getSystemPrompt({
    isEmbed,
    activeTool,
    kbInstruction,
    context,
    knowledgeBaseId,
    allDocuments,
  });

  // --- Tool Choice Logic ---
  let toolChoice: "auto" | "none" | "required" = "auto";
  if (isEmbed) {
    console.log("Embed Mode Debug:", { activeTool, pageContent: !!pageContent, allDocsLen: allDocuments.length, disableTools });
    
    // If tools are explicitly disabled (e.g. when context is provided in auto mode), force toolChoice to "none"
    if (disableTools) {
      toolChoice = "none";
    } else if (activeTool === "auto") {
      toolChoice = "auto";
    } else if (activeTool === "current-page" && pageContent) {
      // Use auto to prevent forced loops in multi-step generation
      toolChoice = "auto";
    } else if (activeTool === "knowledge-base" && allDocuments.length > 0) {
      // Use auto to prevent forced loops in multi-step generation
      toolChoice = "auto";
    } else if (activeTool === "context" && context) {
      toolChoice = "auto";
    } else {
      toolChoice =
        allDocuments.length === 0
          ? "none"
          : alwaysUseDocument
          ? "auto" // Changed from required to auto
          : "auto";
    }
  } else {
    toolChoice =
      balance <= 0 || allDocuments.length === 0
        ? "none"
        : userConfigData?.[0]?.useDocument
        ? "required"
        : "auto";
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    stopWhen: stepCountIs(5),
    prepareStep: async ({ stepNumber }) => {
      if (activeTool === "context" && context && stepNumber === 0) {
        return {
          toolChoice: { type: "tool", toolName: "context" } as const,
        };
      }
      return undefined;
    },
    toolChoice,
    tools,
    activeTools:
      !isEmbed && userConfigData?.[0]?.useDocument
        ? ["askQuestion", "finish"]
        : undefined,
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    onStepFinish: async (response) => {
      // Only update credits for non-embed users
      if (!isEmbed) {
        const tools = response.toolResults;
        const totalCreditCost = tools?.length || 0;
        if (totalCreditCost > 0 && balance > 0) {
          const newBalance = Math.max(0, balance - totalCreditCost);
          await db
            .update(credits)
            .set({
              balance: newBalance,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(credits.userId, user!.id));
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages }) => {
      const finalMessages = messages as UIMessage[];

      if (isEmbed) {
        // Embed persistence logic
        await db
          .insert(chats)
          .values({
            id: finalChatId,
            messages: finalMessages,
            isKnowledgeBase: true,
            knowledgeBaseId,
            createdAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: chats.id,
            set: {
              messages: finalMessages,
            },
          });

        // Log embed activity
        await serviceSupabase.from("embed_message_logs").insert({
          knowledge_base_id: knowledgeBaseId,
          chat_id: finalChatId,
          message: messages[messages.length - 1].parts[0].text,
          timestamp: new Date().toISOString(),
        });
      } else {
        // App persistence logic
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Error fetching user for persistence:", authError);
          return;
        }

        await db
          .insert(chats)
          .values({
            id: finalChatId,
            messages: finalMessages,
            userId: user.id,
            isKnowledgeBase,
            knowledgeBaseId,
            createdAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: chats.id,
            set: {
              messages: finalMessages,
            },
          });
      }
    },
  });
}
