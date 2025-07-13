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
import { Loader2, Save, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DocumentUpload from "@/app/components/DocumentUpload";
import { useDocuments } from "@/app/hooks/useDocuments";

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
  const params = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { deleteDocument } = useDocuments();

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  async function fetchKnowledgeBase() {
    console.log("fetchKnowledgeBase", params.id);
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
      // console.log("response", data);
      setName(data.knowledgeBase.name);
      setDescription(data.knowledgeBase.description || "");
      setIsPublic(data.knowledgeBase.isPublic);

      // Fetch documents in the knowledge base
      fetchKnowledgeBaseDocuments();
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      toast("Failed to fetch knowledge base");
    }
  }

  async function fetchKnowledgeBaseDocuments() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/knowledge-base/${params.id}/documents`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch knowledge base documents");
      }

      const data = await response.json();
      console.log("Knowledge base documents:", data);
      setDocuments(data?.documents || []);
    } catch (error) {
      console.error("Error fetching knowledge base documents:", error);
      toast("Failed to fetch knowledge base documents");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast("Knowledge base name is required");
      return;
    }
    setIsLoading(true);
    setIsSaving(true);
    try {
      const response = await fetch(`/api/knowledge-base/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update knowledge base");
      }

      toast("Knowledge base updated successfully");
    } catch (error) {
      console.error("Error updating knowledge base:", error);
      toast("Failed to update knowledge base");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  }

  /**
   * Updates the knowledge base with the provided documentIds array
   * @param documentIds The updated array of document IDs
   * @returns Promise that resolves when the update is complete
   */
  const updateKnowledgeBaseDocumentIds = async (
    documentIds: string[]
  ): Promise<void> => {
    const updateResponse = await fetch(`/api/knowledge-base/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentIds: documentIds,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("Failed to update knowledge base documentIds");
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    // Call the deleteDocument mutation from the useDocuments hook
    setIsDeleteLoading(true);
    console.log("doc", doc);
    deleteDocument.mutate(
      {
        documentId: doc.documentId,
        documentName: doc.documentName,
      },
      {
        onSuccess: async () => {
          try {
            // Update local state after successful deletion
            setDocuments((prev) =>
              prev.filter((d) => d.documentId !== doc.documentId)
            );

            // Update the knowledge base's documentIds array
            // First, fetch the current knowledge base to get existing documentIds
            const getResponse = await fetch(`/api/knowledge-base/${params.id}`);
            if (!getResponse.ok) {
              throw new Error("Failed to fetch knowledge base");
            }

            const knowledgeBaseData = await getResponse.json();
            // Filter out the deleted document ID
            const currentDocIds = knowledgeBaseData.documentIds || [];
            const updatedDocIds = currentDocIds.filter(
              (id: string) => id !== doc.documentId
            );

            // Update the knowledge base with the filtered documentIds
            await updateKnowledgeBaseDocumentIds(updatedDocIds);
            setIsDeleteLoading(false);
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
      // First, fetch the current knowledge base to get existing document_ids
      const getResponse = await fetch(`/api/knowledge-base/${params.id}`);
      if (!getResponse.ok) {
        throw new Error("Failed to fetch knowledge base");
      }

      const knowledgeBaseData = await getResponse.json();
      console.log("knowledgeBaseData", knowledgeBaseData);
      // Prepare the updated document_ids array
      const currentDocIds = knowledgeBaseData.knowledgeBase.documentIds || [];
      const updatedDocIds = [...currentDocIds, documentId];

      // Update the knowledge base with the new document_ids
      await updateKnowledgeBaseDocumentIds(updatedDocIds);

      toast("Document added to knowledge base successfully");

      // Refresh the documents list
      fetchKnowledgeBaseDocuments();
    } catch (error) {
      console.error("Error updating knowledge base:", error);
      toast("Failed to update knowledge base");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
                  <Save size={16} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="current">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="current">Current Documents</TabsTrigger>
              <TabsTrigger value="upload">Upload New Document</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No documents in this knowledge base yet. Add documents
                      from the &quot;Add Documents&quot; tab.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDocument(doc)}
                          >
                            {isDeleteLoading && (
                              <Loader2 size={16} className="animate-spin" />
                            )}
                            {!isDeleteLoading && <Trash2 size={16} />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
              <DocumentUpload
                onDelete={handleDeleteDocument}
                onFinish={handleFinishUpload}
                documents={documents}
                isDeleteLoading={isDeleteLoading}
                isKnowledgeBase={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
