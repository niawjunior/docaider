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
  PlusCircle,
  ChevronDown,
  Code,
} from "lucide-react";
import { toast } from "sonner";
import { useKnowledgeBases } from "@/app/hooks/useKnowledgeBases";
import GlobalLoader from "@/app/components/GlobalLoader";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import ChatForm from "@/app/components/ChatForm";
import KnowledgeSessions from "@/app/components/KnowledgeSessions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createChat } from "@/app/utils/aisdk/chat";
import { createClient } from "@/app/utils/supabase/client";
import { useChats } from "@/app/hooks/useChats";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import MainLayout from "@/app/components/MainLayout";
import ShareKnowledgeBaseDialog from "@/app/components/ShareKnowledgeBaseDialog";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Define connected sources data structure
interface ConnectedSource {
  id: string;
  name: string;
  icon: string;
  count: number;
  countType: "files" | "records";
  status: "connected" | "disconnected";
}

// Type definitions are inferred from React Query hooks

export default function ViewKnowledgeBasePage() {
  const t = useTranslations("knowledgeBase.viewPage");
  const kbT = useTranslations("knowledgeBase");
  const commonT = useTranslations("common");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Connected sources data array
  const connectedSources: ConnectedSource[] = [];
  const { session } = useSupabaseSession();
  const router = useRouter();
  const params = useParams<{ id: string; chatId: string }>();
  const kbHooks = useKnowledgeBases();
  const [chatId, setChatId] = useState<string>("");
  const queryClient = useQueryClient();
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
    data: documentsData,
    isLoading: isLoadingDocs,
    error: docsError,
  } = kbHooks.useKnowledgeBaseDocuments(params.id);

  const {
    data: knowledgeBaseChats,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingChats,
    refetch,
  } = useChats({
    isKnowledgeBase: true,
    knowledgeBaseId: params.id,
  });

  const knowledgeBaseChatsData = useMemo(() => {
    return knowledgeBaseChats?.pages.flatMap((page) => page?.data) ?? [];
  }, [knowledgeBaseChats]);

  // Handle errors and permission checks
  useEffect(() => {
    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
      toast(t("failedToFetchKnowledgeBase"));

      // Check if the error is due to 404 or 401
      if (kbError instanceof Error) {
        if (kbError.message.includes("404")) {
          toast(t("knowledgeBaseNotFound"));
          router.push("/dashboard");
        } else if (kbError.message.includes("401")) {
          toast(t("unauthorized"));
          router.push("/dashboard");
        }
      }
    }
  }, [kbError, router, t]);

  // Permission check - moved from middleware
  useEffect(() => {
    const checkPermissions = async () => {
      if (!knowledgeBase) return;

      // If knowledge base is not public and user is not authenticated, redirect to login
      if (!knowledgeBase.isPublic && !session) {
        toast(t("unauthorized"));
        router.push("/login");
        return;
      }

      // If knowledge base is not public, check if user has access
      if (!knowledgeBase.isPublic && session) {
        // Check if user owns the knowledge base
        const isOwner = knowledgeBase.userId === session.user.id;

        if (!isOwner) {
          // Check if knowledge base is shared with this user's email
          try {
            const supabase = await createClient();
            const { data: sharedAccess, error } = await supabase
              .from("knowledge_base_shares")
              .select("id")
              .eq("knowledge_base_id", params.id)
              .eq("shared_with_email", session.user.email)
              .single();

            // If user doesn't own it and it's not shared with them, redirect to dashboard
            if (error || !sharedAccess) {
              toast(t("unauthorized"));
              router.push("/dashboard");
            }
          } catch (error) {
            console.error("Error checking shared access:", error);
            toast(t("unauthorized"));
            router.push("/dashboard");
          }
        }
      }
    };

    checkPermissions();
  }, [knowledgeBase, session, params.id, router, t]);

  const createNewChat = async () => {
    const id = await createChat();
    setChatId(id);
  };
  useEffect(() => {
    // If chats are loaded (not loading anymore)
    if (!isLoadingChats) {
      // If there are chats, set chatId to the first chat id (if not already set)
      if (knowledgeBaseChatsData.length > 0 && !chatId) {
        console.log("Setting initial chatId to:", knowledgeBaseChatsData[0].id);
        setChatId(knowledgeBaseChatsData[0].id);
      }
      // If there are no chats and we're not already creating one, create a new chat
      else if (knowledgeBaseChatsData.length === 0 && !chatId) {
        console.log("No chats found, creating a new one");
        createNewChat();
      }
    }
  }, [knowledgeBaseChatsData, chatId, isLoadingChats]);

  useEffect(() => {
    if (docsError) {
      console.error("Error fetching knowledge base documents:", docsError);
      toast(t("failedToFetchDocuments"));
    }
  }, [docsError, t]);

  // Generate share URL when component mounts
  useEffect(() => {
    const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}`;
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

  // Check if user can edit the knowledge base
  const canEdit = session && session.user.id === knowledgeBase.userId;

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

  const handleChatFinished = async () => {
    // Store the current chat ID before any operations
    const currentChatId = chatId;
    setChatId(currentChatId);
    refetch();
  };

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
        <div className="flex flex-col gap-2">
          <div className="flex md:flex-row flex-col gap-2 w-full items-center justify-between">
            <div className="md:flex hidden w-full gap-2 flex-col md:flex-row items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="w-full md:w-auto"
              >
                <ArrowLeft size={16} className="mr-2" />
                {t("backToDashboard")}
              </Button>
              <h1 className="md:text-md text-md font-bold">
                {knowledgeBase.name}
              </h1>
            </div>

            {canEdit && (
              <div className="flex md:justify-end justify-between w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="md:hidden "
                >
                  <ArrowLeft size={16} />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/knowledge/${params.id}/deploy`)
                    }
                  >
                    <Code size={16} className="mr-2" />
                    {kbT("deploy")}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/knowledge/${params.id}/edit`)}
                  >
                    <Edit size={16} className="mr-2" />
                    {kbT("edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <Share2 size={16} className="mr-2" />
                    {commonT("share")}
                  </Button>
                </div>
              </div>
            )}
            <h1 className="md:text-md text-md font-bold flex md:hidden">
              {knowledgeBase.name}
            </h1>
          </div>

          <SidebarProvider
            open={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            className=""
          >
            <Sidebar className="h-full mt-[97px] px-4 border-none pr-0">
              <div className="w-full flex flex-col gap-2">
                <Card>
                  <CardHeader className="flex  items-center justify-between">
                    <CardTitle className="text-sm">
                      {t("aboutThisKnowledgeBase")}
                    </CardTitle>
                    {knowledgeBase.isPublic && (
                      <Badge className="ml-2">{kbT("public")}</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {knowledgeBase.description && (
                        <p className="text-sm">{knowledgeBase.description}</p>
                      )}

                      <div className="border-t pt-2  overflow-y-auto scroll-hidden">
                        <h3 className="font-medium mb-2 text-sm">
                          {kbT("documents")}
                        </h3>
                        {documentsData.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            {t("noDocumentsFound")}
                          </p>
                        )}
                        <ul className="space-y-1 text-xs flex gap-1 flex-wrap">
                          {documentsData.map((doc: Document) => (
                            <li key={doc.id} className="truncate text-xs">
                              <Badge variant="outline">
                                <Link
                                  href={doc.url}
                                  target="_blank"
                                  className="flex items-center gap-2"
                                >
                                  {doc.title}
                                </Link>
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Collapsible defaultOpen={true} className="w-full">
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left font-medium mb-2 mt-2 text-sm hover:text-primary transition-colors">
                          <span>{commonT("connectedSources")}</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 ui-open:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 ">
                          <div className="flex flex-col gap-1 overflow-y-auto scroll-hidden">
                            {connectedSources.map((source) => (
                              <TooltipProvider key={source.id}>
                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-md border border-slate-200 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src={source.icon}
                                      alt={source.name.toLowerCase()}
                                      width={20}
                                      height={20}
                                      className="rounded-sm"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-medium">
                                        {source.name}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
                                        {source.count.toLocaleString()}{" "}
                                        {commonT(source.countType)}{" "}
                                        {commonT("synced")}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-600 hover:bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                  >
                                    {commonT(source.status)}
                                  </Badge>
                                </div>
                              </TooltipProvider>
                            ))}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="w-full">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs"
                                  disabled
                                >
                                  <PlusCircle size={14} className="mr-1" />
                                  {t("connectMore")}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{commonT("noPermission")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {t("knowledgeSessions")}
                    </CardTitle>
                    <CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={createNewChat}
                              className="text-[20px] rounded-lg"
                            >
                              <PlusCircle />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("createNewChat")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardContent>
                  <CardContent className="h-[calc(100vh-680px)] min-h-[27px] overflow-y-auto scroll-hidden">
                    <KnowledgeSessions
                      chatId={chatId}
                      chats={knowledgeBaseChatsData}
                      onChatClick={handleChatClick}
                      isLoading={isLoadingChats}
                      isFetchingNextPage={isFetchingNextPage}
                      hasNextPage={hasNextPage}
                      fetchNextPage={fetchNextPage}
                    />
                  </CardContent>
                </Card>
              </div>
            </Sidebar>
            <div className="w-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <SidebarTrigger />
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>
                          {isSidebarOpen
                            ? commonT("closeSidebar")
                            : commonT("openSidebar")}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <CardTitle>{t("askQuestions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChatForm
                    isKnowledgeBase={true}
                    knowledgeBaseId={params.id}
                    chatId={chatId}
                    onFinished={handleChatFinished}
                  />
                </CardContent>
              </Card>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </MainLayout>
  );
}
