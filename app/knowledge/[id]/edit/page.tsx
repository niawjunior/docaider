"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Save,
  ArrowLeft,
  Trash2,
  Eye,
  Share2,
  FileText,
} from "lucide-react";

import { toast } from "sonner";
import DocumentUpload from "@/app/components/DocumentUpload";
import { useDocuments } from "@/app/hooks/useDocuments";
import GlobalLoader from "@/app/components/GlobalLoader";
import Link from "next/link";
import { useKnowledgeBases } from "@/app/hooks/useKnowledgeBases";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MainLayout from "@/app/components/MainLayout";

import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import ShareKnowledgeBaseDialog from "@/app/components/ShareKnowledgeBaseDialog";
import { useTranslations } from "next-intl";

// Define the Zod schema for form validation
const getFormSchema = (
  t: ReturnType<typeof useTranslations>,
  commonT: ReturnType<typeof useTranslations>
) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t("name") + " " + commonT("isRequired") }),
    description: z.string().optional(),
    isPublic: z.boolean(),
  });

// Define the form values type
type FormValues = {
  name: string;
  description?: string;
  isPublic: boolean;
};

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
  const t = useTranslations("knowledgeBase");
  const messagesT = useTranslations("messages");
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { deleteDocument } = useDocuments();
  const kbHooks = useKnowledgeBases();
  const [currentTab, setCurrentTab] = useState("current");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { session } = useSupabaseSession();
  const [documentId, setDocumentId] = useState<string | null>(null);

  // Initialize react-hook-form with Zod validation
  const commonT = useTranslations("common");
  const FormSchema = getFormSchema(t, commonT);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  // Use the delete mutation from the hook
  const { mutate: deleteKnowledgeBase, isPending: isDeleting } =
    kbHooks.deleteKnowledgeBase;

  // Use the new React Query hooks for fetching knowledge base and its documents
  const {
    data: knowledgeBase,
    isLoading: isLoadingKB,
    error: kbError,
    refetch: refetchKB,
  } = kbHooks.useKnowledgeBaseById(params.id);

  const {
    data: kbDocuments,
    isLoading: isLoadingDocs,
    error: docsError,
    refetch: refetchDocs,
  } = kbHooks.useKnowledgeBaseDocuments(params.id);
  // Generate share URL when component mounts
  useEffect(() => {
    const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}`;
    setShareUrl(`${baseUrl}/knowledge/${params.id}`);
  }, [params.id]);

  useEffect(() => {
    const checkEditPermission = async () => {
      if (knowledgeBase && session?.user?.id) {
        // 🔒 AUTHORIZATION CHECK: Only allow owner to access edit page
        if (session?.user?.id !== knowledgeBase.userId) {
          console.error("Unauthorized access attempt to edit knowledge base");
          toast.error(t("unauthorizedEdit"));
          router.push("/dashboard");
          return;
        }

        form.reset({
          name: knowledgeBase.name,
          description: knowledgeBase.description || "",
          isPublic: knowledgeBase.isPublic,
        });
      } else if (knowledgeBase && !session) {
        // If no session, redirect to login
        toast.error(t("unauthorizedEdit"));
        router.push("/login");
        return;
      }
    };

    checkEditPermission();
  }, [knowledgeBase, form, session, router, t]);

  useEffect(() => {
    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
      toast(t("fetchError"));
      router.push("/dashboard");
    }

    if (docsError) {
      console.error("Error fetching knowledge base documents:", docsError);
      toast(t("documentsFetchError"));
    }
  }, [kbError, docsError, router]);

  // Update loading state
  useEffect(() => {
    setIsLoading(isLoadingKB || isLoadingDocs);
  }, [isLoadingKB, isLoadingDocs]);

  async function onSubmit(values: FormValues) {
    setIsSaving(true);
    try {
      // Use the updateKnowledgeBase mutation from our hook
      await kbHooks.updateKnowledgeBase.mutateAsync({
        id: params.id as string,
        name: values.name,
        description: values.description || "",
        isPublic: values.isPublic,
      });

      // Note: The toast and query invalidation are handled in the mutation's onSuccess callback
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Error in handleSave:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const handleDeleteDocument = async (doc: Document) => {
    // Call the deleteDocument mutation from the useDocuments hook
    setDocumentId(doc.id);
    refetchKB();
    deleteDocument.mutate(
      {
        documentId: doc.documentId,
        documentName: doc.documentName,
      },
      {
        onSuccess: async () => {
          refetchKB();
          try {
            const response = await fetch(`/api/knowledge-base/${params.id}`);
            if (!response.ok) {
              throw new Error("Failed to fetch current knowledge base data");
            }

            const knowledgeBase = await response.json();

            const currentDocIds = knowledgeBase?.documentIds || [];
            const updatedDocIds = currentDocIds.filter(
              (id: string) => id !== doc.documentId
            );

            // Update the knowledge base with the filtered documentIds

            kbHooks.patchKnowledgeBaseDocumentIds.mutate(
              {
                knowledgeBaseId: params.id,
                documentIds: updatedDocIds,
              },
              {
                onSuccess: () => {
                  refetchDocs();
                },
              }
            );
            // // Refetch knowledge base data and documents after update
          } catch (error) {
            console.error("Error updating knowledge base documentIds:", error);
            toast(t("documentDeletedButUpdateFailed"));
          }
        },
        onError: () => {
          toast(t("documents:errorDeletingDocument"), {
            duration: 5000,
            description: t("documents:failedToDeleteDocument"),
          });
        },
      }
    );
  };

  const handleDelete = async (id: string) => {
    deleteKnowledgeBase(id, {
      onSuccess: () => {
        toast(messagesT("knowledgeBaseDeleted"));
        router.push("/dashboard");
      },
      onError: () => {
        toast(messagesT("knowledgeBaseDeleteError"));
      },
    });
  };

  const handleUploadSuccess = () => {
    setCurrentTab("current");
    refetchKB();
    setTimeout(() => {
      refetchDocs();
    }, 1000);
  };
  const handleClick = (id: string) => {
    router.push(`/knowledge/${id}`);
    router.refresh();
  };
  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <MainLayout>
      <ShareKnowledgeBaseDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        knowledgeBaseId={params.id}
        shareUrl={shareUrl}
        isPublic={knowledgeBase?.isPublic || false}
      />
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col md:flex-row items-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t("backToDashboard")}
            </Button>
            <h1 className="md:text-lg text-md font-bold">
              {knowledgeBase.name}
            </h1>
          </div>
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClick(params.id)}
            >
              <Eye size={16} className="mr-2" />
              {t("view")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 size={16} className="mr-2" />
              {t("share")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("details")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("name")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("namePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("description")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("descriptionPlaceholder")}
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>{t("makePublic")}</FormLabel>
                            <FormDescription>
                              {t("publicDescription")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSaving}
                    >
                      {isSaving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {!isSaving && <Save size={16} className="mr-2" />}
                      {t("saveChanges")}
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteId(params.id);
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {!isDeleting && <Trash2 size={16} className="mr-2" />}
                      {t("deleteKnowledgeBase")}
                    </Button>
                  </form>
                </Form>
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
                  {t("currentDocuments")}
                </TabsTrigger>
                <TabsTrigger
                  disabled={deleteDocument.isPending || isUploading}
                  value="upload"
                >
                  {t("uploadNewDocument")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                <Card>
                  <CardContent>
                    {kbDocuments?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {t("noDocuments")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {kbDocuments?.map((doc: Document) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentId} •{" "}
                                {t("addedOn", {
                                  date: new Date(
                                    doc.updatedAt
                                  ).toLocaleDateString(),
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                target="_blank"
                                href={doc.url}
                                className="cursor-pointer"
                              >
                                <Button variant="ghost" size="icon">
                                  <FileText size={16} />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDocument(doc)}
                                disabled={deleteDocument.isPending}
                              >
                                {deleteDocument.isPending &&
                                documentId === doc.id ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
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
                  knowledgeBaseId={params.id}
                  onUpload={(isUploading) => setIsUploading(isUploading)}
                  onFileUploaded={handleUploadSuccess}
                  isKnowledgeBase={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
