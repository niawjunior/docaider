"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
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
import { useKnowledgeBases as useKnowledgeBasesHook } from "@/app/hooks/useKnowledgeBases";

// Using the type from the hook to ensure consistency
type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName?: string;
};

interface KnowledgeBaseListProps {
  userId?: string;
  isPublic: boolean;
  knowledgeBases: KnowledgeBase[];
  onOpenCreateKnowledgeBaseDialog: () => void;
}

export default function KnowledgeBaseList({
  userId,
  isPublic,
  knowledgeBases,
  onOpenCreateKnowledgeBaseDialog,
}: KnowledgeBaseListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const kbHooks = useKnowledgeBasesHook();
  // Use the delete mutation from the hook
  const { mutate: deleteKnowledgeBase, isPending: isDeleting } =
    kbHooks.deleteKnowledgeBase;

  const handleDelete = async (id: string) => {
    deleteKnowledgeBase(id, {
      onSuccess: () => {
        setDeleteId(null);
      },
      onError: () => {
        setDeleteId(null);
      },
    });
  };

  if (knowledgeBases.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          {isPublic
            ? "No public knowledge bases available yet."
            : "You haven't created any knowledge bases yet."}
        </p>
        {!isPublic && (
          <Button
            onClick={() => {
              onOpenCreateKnowledgeBaseDialog();
            }}
            className="mx-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Knowledge Base
          </Button>
        )}
      </Card>
    );
  }

  const handleClick = (id: string) => {
    router.push(`/knowledge/${id}`);
    router.refresh();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id} className="overflow-hidden bg-zinc-900 p-0">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="md:text-lg text-base font-semibold truncate">
                  {kb.name}
                </h3>
                {kb.isPublic && <Badge variant="default">Public</Badge>}
                {!kb.isPublic && <Badge variant="destructive">Private</Badge>}
              </div>
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                {kb.description}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Updated {formatDistanceToNow(new Date(kb.updatedAt))} ago
                </span>
              </div>
              {isPublic && (
                <p className="text-xs mt-2">Created by {kb.userName}</p>
              )}
            </CardContent>
            <CardFooter className="flex  p-6 pt-0">
              <div className="flex gap-2">
                {!isPublic && userId === kb.userId && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/knowledge/${kb.id}/edit`)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(kb.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleClick(kb.id)}
                >
                  <Eye size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this knowledge base and all
              associated documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
