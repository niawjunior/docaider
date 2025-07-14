"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Share2, Copy } from "lucide-react";
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
// Type definitions are inferred from React Query hooks

export default function ViewKnowledgeBasePage() {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { session } = useSupabaseSession();
  const router = useRouter();
  const params = useParams<{ id: string; chatId: string }>();
  const kbHooks = useKnowledgeBases();
  console.log(params.id, params.chatId);

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
    if (docsError) {
      console.error("Error fetching knowledge base documents:", docsError);
      toast("Failed to fetch knowledge base documents");
    }
  }, [docsError]);

  // Generate share URL when component mounts
  useEffect(() => {
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/knowledge/${params.id}`);
  }, [params.id]);

  // Determine if we're still loading
  const isLoading = isLoadingKB || isLoadingDocs;

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
        <div className="lg:col-span-1 flex flex-col gap-2">
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
                    {documents.map((doc: Document) => (
                      <li key={doc.id} className="truncate">
                        • {doc.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <CardTitle>Knowledge Sessions</CardTitle>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Ask Questions</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col ">
              <div className="flex items-end gap-2 min-h-[calc(100vh-220px)]">
                <ChatForm
                  isKnowledgeBase={true}
                  suggestedPrompts={suggestedPrompts}
                  chatId="111"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
