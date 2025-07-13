"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Send, Edit, Share2, Copy } from "lucide-react";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import { formatDistanceToNow } from "date-fns";
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

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  userId: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: number;
  title: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ViewKnowledgeBasePage({
  params,
}: {
  params: { id: string };
}) {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(
    null
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { session } = useSupabaseSession();
  const router = useRouter();

  const fetchKnowledgeBaseDocuments = useCallback(async () => {
    console.log("fetchKnowledgeBaseDocuments", params.id);
    try {
      const response = await fetch(
        `/api/knowledge-base/${params.id}/documents`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch knowledge base documents");
      }

      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching knowledge base documents:", error);
      toast("Failed to fetch knowledge base documents");
    }
  }, [params.id]);

  const fetchKnowledgeBase = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/knowledge-base/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast("Knowledge base not found");
          router.push("/dashboard");
          return;
        }

        if (response.status === 401) {
          toast("Unauthorized");
          router.push("/dashboard");
          return;
        }

        throw new Error("Failed to fetch knowledge base");
      }

      const data = await response.json();
      setKnowledgeBase(data.knowledgeBase);

      // Fetch documents in the knowledge base
      fetchKnowledgeBaseDocuments();
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      toast("Failed to fetch knowledge base");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router, fetchKnowledgeBaseDocuments]);

  useEffect(() => {
    fetchKnowledgeBase();
    // Generate share URL when component mounts
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/knowledge/${params.id}`);
  }, [params.id, fetchKnowledgeBase]);

  const handleAskQuestion = useCallback(async () => {
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
    setIsAsking(true);

    try {
      const response = await fetch("/api/knowledge-base/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          knowledgeBaseId: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Error asking question:", error);
      toast("Failed to get an answer. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while processing your question. Please try again.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  }, [params.id, question, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!knowledgeBase) {
    return null;
  }

  const canEdit = session && session.user.id === knowledgeBase.userId;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast("Share link copied to clipboard");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Knowledge Base</DialogTitle>
            <DialogDescription>
              Share this link with others to give them access to this knowledge
              base.
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{knowledgeBase.name}</h1>
          {knowledgeBase.isPublic && <Badge className="ml-2">Public</Badge>}
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>About this Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledgeBase.description && (
                  <p className="text-sm">{knowledgeBase.description}</p>
                )}
                <div className="text-sm text-muted-foreground">
                  <p>Contains {knowledgeBase.documentCount} documents</p>
                  <p>
                    Last updated{" "}
                    {formatDistanceToNow(new Date(knowledgeBase.updatedAt))} ago
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Documents</h3>
                  <ul className="space-y-1 text-sm">
                    {documents.map((doc) => (
                      <li key={doc.id} className="truncate">
                        • {doc.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Ask Questions</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow space-y-4 mb-4 overflow-y-auto max-h-[500px] p-2">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Ask a question about this knowledge base to get started.
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary/10 ml-8"
                          : "bg-muted mr-8"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </p>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))
                )}
                {isAsking && (
                  <div className="p-3 rounded-lg bg-muted mr-8 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p>Thinking...</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a question about this knowledge base..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                  className="resize-none"
                  disabled={isAsking}
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isAsking}
                  className="self-end"
                >
                  <Send size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
