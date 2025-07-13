"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";
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

export default function DashboardPage() {
  const { session } = useSupabaseSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useRouter();

  if (!session) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto py-8 px-4">
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
      <div className="flex justify-between items-center py-4">
        <h2 className="text-xl font-semibold">My Knowledge Bases</h2>
      </div>

      <KnowledgeBaseList userId={session.user.id} isPublic={false} />

      <h2 className="text-xl font-semibold py-4">Public Knowledge Bases</h2>

      <KnowledgeBaseList userId={session.user.id} isPublic={true} />

      <CreateKnowledgeBaseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        userId={session.user.id}
      />
    </div>
  );
}
