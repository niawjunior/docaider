"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, CreditCard, Mail } from "lucide-react";
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
import { useKnowledgeBases } from "../hooks/useKnowledgeBases";
import { useSharedKnowledgeBases } from "../hooks/useSharedKnowledgeBases";
import GlobalLoader from "../components/GlobalLoader";
import SharedKnowledgeBaseList from "../components/SharedKnowledgeBaseList";
import { Badge } from "@/components/ui/badge";
import { useCredit } from "../hooks/useCredit";
import MainLayout from "../components/MainLayout";
import SearchAndFilter from "../components/SearchAndFilter";
import { useSearchAndFilter } from "../hooks/useSearchAndFilter";

export default function DashboardPage() {
  const { session } = useSupabaseSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");

  const kbHooks = useKnowledgeBases();

  // Get user credit information
  const { credit, isLoading: creditLoading } = useCredit(
    session?.user.id || ""
  );
  const getKnowledgeBases = kbHooks.getKnowledgeBases;
  const getPublicKnowledgeBases = kbHooks.getPublicKnowledgeBases;

  // Get shared knowledge bases
  const {
    data: sharedKnowledgeBasesData,
    isLoading: sharedKnowledgeBasesLoading,
  } = useSharedKnowledgeBases(userEmail);

  // Set user email when session is available
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  // Search and filter functionality
  const searchAndFilter = useSearchAndFilter({
    knowledgeBases: getKnowledgeBases.data || [],
    sharedKnowledgeBases: sharedKnowledgeBasesData?.sharedKnowledgeBases || [],
    publicKnowledgeBases: getPublicKnowledgeBases.data || [],
  });

  if (!session) {
    return null; // Don't render anything while redirecting
  }

  if (
    getKnowledgeBases.isLoading ||
    getPublicKnowledgeBases.isLoading ||
    sharedKnowledgeBasesLoading ||
    creditLoading
  ) {
    return <GlobalLoader />;
  }

  return (
    <MainLayout>
      <div className="px-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
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
                  <p>Go to home</p>
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
                  <p>Go to chat</p>
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
                  <p>Create knowledge base</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* User info and credits section - visible only on desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{userEmail}</span>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-2 px-3 py-1"
            >
              <CreditCard size={16} />
              <span>{credit?.balance || 0} credits</span>
            </Badge>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="py-4">
          <SearchAndFilter
            searchQuery={searchAndFilter.searchQuery}
            onSearchChange={searchAndFilter.setSearchQuery}
            sortBy={searchAndFilter.sortBy}
            onSortChange={searchAndFilter.setSortBy}
            filterBy={searchAndFilter.filterBy}
            onFilterChange={searchAndFilter.setFilterBy}
            placeholder="Search all knowledge bases..."
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

        <div className="flex justify-between items-center py-4">
          <h2 className="text-lg font-semibold">My Knowledge Bases</h2>
          <Badge variant="outline" className="text-xs">
            {searchAndFilter.filteredMyKnowledgeBases.length} of{" "}
            {getKnowledgeBases.data?.length || 0}
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
          <h2 className="text-lg font-semibold">Shared With You</h2>
          <Badge variant="outline" className="text-xs">
            {searchAndFilter.filteredSharedKnowledgeBases.length} of{" "}
            {sharedKnowledgeBasesData?.sharedKnowledgeBases?.length || 0}
          </Badge>
        </div>

        <SharedKnowledgeBaseList
          sharedKnowledgeBases={searchAndFilter.filteredSharedKnowledgeBases}
          isLoading={sharedKnowledgeBasesLoading}
        />

        <div className="flex justify-between items-center py-4">
          <h2 className="text-lg font-semibold">Public Knowledge Bases</h2>
          <Badge variant="outline" className="text-xs">
            {searchAndFilter.filteredPublicKnowledgeBases.length} of{" "}
            {getPublicKnowledgeBases.data?.length || 0}
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
