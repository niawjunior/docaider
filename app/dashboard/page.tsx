"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Mail, Star } from "lucide-react";
import useSupabaseSession from "../hooks/useSupabaseSession";
import KnowledgeBaseList from "../components/KnowledgeBaseList";
import CreateKnowledgeBaseDialog from "../components/CreateKnowledgeBaseDialog";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GoHomeFill } from "react-icons/go";
import { useKnowledgeBases } from "@/app/hooks/useKnowledgeBases";
import { useSharedKnowledgeBases } from "@/app/hooks/useSharedKnowledgeBases";
import { useSearchAndFilter } from "@/app/hooks/useSearchAndFilter";
import { useUserPins } from "@/app/hooks/useUserPins";
import SharedKnowledgeBaseList from "../components/SharedKnowledgeBaseList";
import { Badge } from "@/components/ui/badge";
import MainLayout from "../components/MainLayout";
import SearchAndFilter from "../components/SearchAndFilter";
import GlobalLoader from "../components/GlobalLoader";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const { session } = useSupabaseSession();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const t = useTranslations("dashboard");
  const chat = useTranslations("chat");

  const kbHooks = useKnowledgeBases();
  const knowledgeBases = kbHooks.getKnowledgeBases.data || [];
  const isLoadingKnowledgeBases = kbHooks.getKnowledgeBases.isLoading;
  const publicKnowledgeBasesData = kbHooks.getPublicKnowledgeBases.data || [];
  const isLoadingPublic = kbHooks.getPublicKnowledgeBases.isLoading;
  const { data: sharedKnowledgeBasesData, isLoading: isLoadingShared } =
    useSharedKnowledgeBases(userEmail);
  const sharedKnowledgeBases =
    sharedKnowledgeBasesData?.sharedKnowledgeBases || [];
  const { data: pinnedKnowledgeBases = [], isLoading: isLoadingPinned } =
    useUserPins();

  // Set user email when session is available
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  // Use public knowledge bases from the hook
  const publicKnowledgeBases = publicKnowledgeBasesData || [];

  // Search and filter functionality
  const searchAndFilter = useSearchAndFilter({
    knowledgeBases: knowledgeBases || [],
    sharedKnowledgeBases: sharedKnowledgeBases || [],
    publicKnowledgeBases: publicKnowledgeBases || [],
  });

  console.log("Pinned knowledge bases:", pinnedKnowledgeBases);

  if (!session) {
    return null; // Don't render anything while redirecting
  }

  const isLoading =
    isLoadingKnowledgeBases ||
    isLoadingShared ||
    isLoadingPinned ||
    isLoadingPublic;

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <MainLayout>
      <div className="px-6">
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              <div className="hidden md:flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="rounded-lg"
                      >
                        <GoHomeFill />
                        {t("goToHome")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("goToHome")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="md:hidden flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        onClick={() => router.push("/")}
                        className="text-[20px] rounded-lg"
                      >
                        <GoHomeFill />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("goToHome")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        onClick={() => router.push("/chat")}
                        className="text-[20px] rounded-lg"
                      >
                        <MessageCircle />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("goToChat")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="text-[20px] rounded-lg"
                      >
                        <Plus />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("create")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div></div>
          </div>

          {/* User info and credits section - visible only on desktop */}
          <div className="hidden md:flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="default"
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="rounded-lg"
                  >
                    <Plus />
                    {t("createKnowledgeBase")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("createKnowledgeBase")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/chat")}
                    className="rounded-lg"
                  >
                    <MessageCircle />
                    {chat("title")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("goToChat")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span className="text-sm">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="py-2">
          <SearchAndFilter
            searchQuery={searchAndFilter.searchQuery}
            onSearchChange={searchAndFilter.setSearchQuery}
            sortBy={searchAndFilter.sortBy}
            onSortChange={searchAndFilter.setSortBy}
            filterBy={searchAndFilter.filterBy}
            onFilterChange={searchAndFilter.setFilterBy}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        {/* Results Summary */}
        {searchAndFilter.hasActiveFilters && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Found{" "}
              <span className="font-medium">
                {searchAndFilter.totalResults}
              </span>{" "}
              knowledge bases
              {searchAndFilter.searchQuery && (
                <span>
                  {" "}
                  matching &ldquo;{searchAndFilter.searchQuery}&rdquo;
                </span>
              )}
            </p>
          </div>
        )}

        {/* Pinned Knowledge Bases Section */}
        {pinnedKnowledgeBases.length > 0 && (
          <>
            <div className="flex justify-between items-center py-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                {t("pinnedKnowledgeBases")}
              </h2>
              <Badge variant="outline" className="text-xs">
                {pinnedKnowledgeBases.length}
              </Badge>
            </div>
            <KnowledgeBaseList
              knowledgeBases={pinnedKnowledgeBases}
              userId={session.user.id}
              isPublic={false}
              onOpenCreateKnowledgeBaseDialog={() =>
                setIsCreateDialogOpen(true)
              }
            />
          </>
        )}

        <div className="flex justify-between items-center py-4">
          <h2 className="text-lg font-semibold">{t("myKnowledgeBases")}</h2>
          <Badge variant="outline" className="text-xs">
            {searchAndFilter.filteredMyKnowledgeBases.length} of{" "}
            {knowledgeBases.length || 0}
          </Badge>
        </div>

        <KnowledgeBaseList
          knowledgeBases={searchAndFilter.filteredMyKnowledgeBases}
          userId={session.user.id}
          isPublic={false}
          onOpenCreateKnowledgeBaseDialog={() => setIsCreateDialogOpen(true)}
        />

        {/* Shared With You Section */}
        <div className="flex justify-between items-center py-4">
          <h2 className="text-lg font-semibold">{t("sharedWithYou")}</h2>
          <Badge variant="outline" className="text-xs">
            {searchAndFilter.filteredSharedKnowledgeBases.length} of{" "}
            {sharedKnowledgeBases.length || 0}
          </Badge>
        </div>

        <SharedKnowledgeBaseList
          sharedKnowledgeBases={searchAndFilter.filteredSharedKnowledgeBases}
          isLoading={isLoadingShared}
        />

        <div className="flex justify-between items-center py-4">
          <h2 className="text-lg font-semibold">{t("publicKnowledgeBases")}</h2>
          <Badge variant="outline" className="text-xs">
            {searchAndFilter.filteredPublicKnowledgeBases.length} of{" "}
            {publicKnowledgeBases.length || 0}
          </Badge>
        </div>

        <KnowledgeBaseList
          knowledgeBases={searchAndFilter.filteredPublicKnowledgeBases}
          userId={session.user.id}
          isPublic={true}
          onOpenCreateKnowledgeBaseDialog={() => setIsCreateDialogOpen(true)}
        />

        <CreateKnowledgeBaseDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          userId={session.user.id}
        />
      </div>
    </MainLayout>
  );
}
