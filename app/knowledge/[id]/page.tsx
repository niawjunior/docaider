"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Share2,
  Copy,
  PlusCircle,
  MessageSquarePlus,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useKnowledgeBases } from "@/app/hooks/useKnowledgeBases";
import GlobalLoader from "@/app/components/GlobalLoader";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import { formatDistanceToNow } from "date-fns";
import ChatForm from "@/app/components/ChatForm";
import KnowledgeSessions from "@/app/components/KnowledgeSessions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createChat } from "@/app/utils/aisdk/chat";
import { useChats } from "@/app/hooks/useChats";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import MainLayout from "@/app/components/MainLayout";
// Type definitions are inferred from React Query hooks

export default function ViewKnowledgeBasePage() {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { session } = useSupabaseSession();
  const router = useRouter();
  const params = useParams<{ id: string; chatId: string }>();
  const kbHooks = useKnowledgeBases();
  const [chatId, setChatId] = useState<string>("");
  const queryClient = useQueryClient();
  const suggestedPrompts = [
    {
      title: "Tell me about the document",
    },
    {
      title: "What is the author of the document?",
    },
    {
      title: "What is the title of the document?",
    },
    {
      title: "Summarize the document",
    },
  ];

  interface Document {
    id: number;
    title: string;
    fileType: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    status: string;
    url: string;
  }
  // Use React Query hooks for fetching knowledge base and its documents
  const {
    data: knowledgeBase,
    isLoading: isLoadingKB,
    error: kbError,
  } = kbHooks.useKnowledgeBaseById(params.id);

  const {
    data: documents,
    isLoading: isLoadingDocs,
    error: docsError,
  } = kbHooks.useKnowledgeBaseDocuments(params.id);

  const { data: knowledgeBaseChats, isLoading: isLoadingChats } = useChats({
    isKnowledgeBase: true,
    knowledgeBaseId: params.id,
  });

  const knowledgeBaseChatsData = useMemo(() => {
    return knowledgeBaseChats?.pages.flatMap((page) => page.data) ?? [];
  }, [knowledgeBaseChats]);

  // Handle errors
  useEffect(() => {
    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
      toast("Failed to fetch knowledge base");

      // Check if the error is due to 404 or 401
      if (kbError instanceof Error) {
        if (kbError.message.includes("404")) {
          toast("Knowledge base not found");
          router.push("/dashboard");
        } else if (kbError.message.includes("401")) {
          toast("Unauthorized");
          router.push("/dashboard");
        }
      }
    }
  }, [kbError, router]);

  useEffect(() => {
    // set chatId to the first chat id
    if (knowledgeBaseChatsData.length > 0) {
      setChatId(knowledgeBaseChatsData[0].id);
    }
  }, [knowledgeBaseChatsData]);

  useEffect(() => {
    if (docsError) {
      console.error("Error fetching knowledge base documents:", docsError);
      toast("Failed to fetch knowledge base documents");
    }
  }, [docsError]);

  // Generate share URL when component mounts
  useEffect(() => {
    const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}`;
    setShareUrl(`${baseUrl}/knowledge/${params.id}`);
  }, [params.id]);

  // Determine if we're still loading
  const isLoading = isLoadingKB || isLoadingDocs || isLoadingChats;

  if (isLoading) {
    return <GlobalLoader />;
  }

  if (!knowledgeBase) {
    return null;
  }

  const canEdit = session && session.user.id === knowledgeBase.userId;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast("Share link copied to clipboard");
  };

  const handleChatClick = (newChatId: string) => {
    // reset the query cache
    queryClient.resetQueries({
      queryKey: ["chat", chatId],
    });
    // refetch the query
    queryClient.refetchQueries({
      queryKey: ["chat", chatId],
    });
    setChatId(newChatId);
  };

  const createNewChat = async () => {
    const id = await createChat();
    setChatId(id);
  };

  return (
    <MainLayout>
      <div className="px-4">
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Knowledge Base</DialogTitle>
              <DialogDescription>
                Share this link with others to give them access to this
                knowledge base.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="share-link">Share Link</Label>
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                size="icon"
                className="mt-6"
                onClick={handleCopyShareLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col md:flex-row items-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="md:text-xl text-lg font-bold">
              {knowledgeBase.name}
            </h1>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/knowledge/${params.id}/edit`)}
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            )}
            {knowledgeBase.isPublic && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>About this Knowledge Base</CardTitle>
                {knowledgeBase.isPublic && (
                  <Badge className="ml-2">Public</Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeBase.description && (
                    <p className="text-sm">{knowledgeBase.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Last updated{" "}
                      {formatDistanceToNow(new Date(knowledgeBase.updatedAt))}{" "}
                      ago
                    </p>
                  </div>
                  <div className="border-t pt-4 max-h-[120px] overflow-y-auto">
                    <h3 className="font-medium mb-2">Documents</h3>
                    {documents.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No documents found
                      </p>
                    )}
                    <ul className="space-y-1 text-sm flex gap-2 flex-wrap">
                      {documents.map((doc: Document) => (
                        <li key={doc.id} className="truncate">
                          <Badge variant="outline">
                            <Link
                              href={doc.url}
                              target="_blank"
                              className="flex items-center gap-2 p-1"
                            >
                              {doc.title}
                              <Eye size={16} />
                            </Link>
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between">
                <CardTitle>Knowledge Sessions</CardTitle>
                <CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={createNewChat}
                          className="text-[20px] rounded-lg"
                        >
                          <PlusCircle />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create new chat</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardContent>
              <CardContent className="max-h-[110px] overflow-y-auto">
                <KnowledgeSessions
                  chatId={chatId}
                  knowledgeBaseId={params.id}
                  onChatClick={handleChatClick}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Ask Questions</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col ">
                {knowledgeBaseChatsData.length === 0 && !chatId ? (
                  <div className="flex flex-col items-center justify-center gap-4 ">
                    <div className="text-center">
                      <h3 className="text-xl font-medium mb-2">
                        No chat sessions yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Start a new chat to ask questions about this knowledge
                        base
                      </p>
                    </div>
                    <Button
                      onClick={createNewChat}
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      <MessageSquarePlus className="h-5 w-5" />
                      Start New Chat
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <ChatForm
                      isKnowledgeBase={true}
                      knowledgeBaseId={params.id}
                      suggestedPrompts={suggestedPrompts}
                      chatId={chatId}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
