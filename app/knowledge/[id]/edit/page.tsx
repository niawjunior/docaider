"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import DocumentUpload from "@/app/components/DocumentUpload";
import { useDocuments } from "@/app/hooks/useDocuments";
import GlobalLoader from "@/app/components/GlobalLoader";
import Link from "next/link";
import { useKnowledgeBases } from "@/app/hooks/useKnowledgeBases";
import { useQueryClient } from "@tanstack/react-query";

interface Document {
  title: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  id: string;
  documentId: string;
  documentName: string;
}

export default function EditKnowledgeBasePage() {
  const params = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { deleteDocument } = useDocuments();
  const kbHooks = useKnowledgeBases();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("current");

  // Use the new React Query hooks for fetching knowledge base and its documents
  const {
    data: knowledgeBase,
    isLoading: isLoadingKB,
    error: kbError,
  } = kbHooks.useKnowledgeBaseById(params.id);

  const {
    data: kbDocuments,
    isLoading: isLoadingDocs,
    error: docsError,
  } = kbHooks.useKnowledgeBaseDocuments(params.id);

  useEffect(() => {
    if (knowledgeBase) {
      setName(knowledgeBase.name);
      setDescription(knowledgeBase.description || "");
      setIsPublic(knowledgeBase.isPublic);
    }
  }, [knowledgeBase]);

  useEffect(() => {
    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
      toast("Failed to fetch knowledge base");
      router.push("/dashboard");
    }

    if (docsError) {
      console.error("Error fetching knowledge base documents:", docsError);
      toast("Failed to fetch knowledge base documents");
    }
  }, [kbError, docsError, router]);

  // Update loading state
  useEffect(() => {
    setIsLoading(isLoadingKB || isLoadingDocs);
  }, [isLoadingKB, isLoadingDocs]);

  async function handleSave() {
    if (!name.trim()) {
      toast("Knowledge base name is required");
      return;
    }

    setIsSaving(true);
    try {
      // Use the updateKnowledgeBase mutation from our hook
      await kbHooks.updateKnowledgeBase.mutateAsync({
        id: params.id as string,
        name,
        description,
        isPublic,
      });

      // Note: The toast and query invalidation are handled in the mutation's onSuccess callback
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Error in handleSave:", error);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Update the knowledge base's document IDs
   * @param documentIds The updated array of document IDs
   * @returns Promise that resolves when the update is complete
   */
  const updateKnowledgeBaseDocumentIds = async (documentIds: string[]) => {
    try {
      const response = await fetch(`/api/knowledge-base/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to update knowledge base");
      }

      // Refetch knowledge base data and documents after update
      kbHooks.getKnowledgeBases.refetch();
      kbHooks.getPublicKnowledgeBases.refetch();

      // Invalidate the knowledge base documents query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ["knowledgeBaseDocuments", params.id],
      });

      return response.json();
    } catch (error) {
      console.error("Error updating knowledge base document IDs:", error);
      throw error;
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    // Call the deleteDocument mutation from the useDocuments hook
    deleteDocument.mutate(
      {
        documentId: doc.documentId,
        documentName: doc.documentName,
      },
      {
        onSuccess: async () => {
          try {
            // Filter out the deleted document ID
            const currentDocIds = knowledgeBase?.document_ids || [];
            const updatedDocIds = currentDocIds.filter(
              (id: string) => id !== doc.documentId
            );

            // Update the knowledge base with the filtered documentIds
            await updateKnowledgeBaseDocumentIds(updatedDocIds);
          } catch (error) {
            console.error("Error updating knowledge base documentIds:", error);
            toast("Document was deleted but failed to update knowledge base");
          }
        },
        onError: () => {
          toast("Error deleting document", {
            duration: 5000,
            description: "Failed to delete your document. Please try again.",
          });
        },
      }
    );
  };

  const handleFinishUpload = async (documentId: string) => {
    try {
      // Prepare the updated document_ids array
      const currentDocIds = knowledgeBase?.document_ids || [];
      const updatedDocIds = [...currentDocIds, documentId];

      // Update the knowledge base with the new document_ids
      await updateKnowledgeBaseDocumentIds(updatedDocIds);

      setIsUploading(false);

      // Refetch knowledge base lists in dashboard
      kbHooks.getKnowledgeBases.refetch();
      kbHooks.getPublicKnowledgeBases.refetch();
      // The refetchDocuments() call is already in updateKnowledgeBaseDocumentIds
      toast("Document added to knowledge base successfully");
      setCurrentTab("current");
      console.log("currentTab", currentTab);
    } catch (error) {
      console.error("Error updating knowledge base:", error);
      toast("Failed to update knowledge base");
    }
  };

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mr-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Edit Knowledge Base</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter knowledge base name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this knowledge base is about"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public">Make Public</Label>
                    <p className="text-sm text-muted-foreground">
                      Public knowledge bases can be viewed by anyone
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {!isSaving && <Save size={16} className="mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger
                disabled={deleteDocument.isPending || isUploading}
                value="current"
              >
                Current Documents
              </TabsTrigger>
              <TabsTrigger
                disabled={deleteDocument.isPending || isUploading}
                value="upload"
              >
                Upload New Document
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card>
                <CardContent>
                  {kbDocuments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No documents in this knowledge base yet. Add documents
                      from the &quot;Add Documents&quot; tab.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {kbDocuments.map((doc: Document) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.documentId} • Added on{" "}
                              {new Date(doc.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              target="_blank"
                              href={doc.url}
                              className="cursor-pointer"
                            >
                              <Button variant="ghost" size="icon">
                                <Eye size={16} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDocument(doc)}
                              disabled={deleteDocument.isPending}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
              <DocumentUpload
                onFinish={handleFinishUpload}
                onUpload={(isUploading) => setIsUploading(isUploading)}
                isKnowledgeBase={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
