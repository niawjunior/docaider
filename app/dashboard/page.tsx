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
import GlobalLoader from "../components/GlobalLoader";
import { Badge } from "@/components/ui/badge";
import { useCredit } from "../hooks/useCredit";
import MainLayout from "../components/MainLayout";

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

  // Set user email when session is available
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  if (!session) {
    return null; // Don't render anything while redirecting
  }

  if (
    getKnowledgeBases.isLoading ||
    getPublicKnowledgeBases.isLoading ||
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
        <div className="flex justify-between items-center py-4">
          <h2 className="text-lg font-semibold">My Knowledge Bases</h2>
        </div>

        <KnowledgeBaseList
          knowledgeBases={getKnowledgeBases.data || []}
          userId={session.user.id}
          isPublic={false}
          onOpenCreateKnowledgeBaseDialog={() => setIsCreateDialogOpen(true)}
        />

        <h2 className="text-lg font-semibold py-4">Public Knowledge Bases</h2>

        <KnowledgeBaseList
          knowledgeBases={getPublicKnowledgeBases.data || []}
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
