"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
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

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name?: string;
}

interface KnowledgeBaseListProps {
  userId?: string;
  isPublic: boolean;
}

export default function KnowledgeBaseList({
  userId,
  isPublic,
}: KnowledgeBaseListProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchKnowledgeBases();
  }, [userId, isPublic]);

  async function fetchKnowledgeBases() {
    setIsLoading(true);
    try {
      let query = supabase.from("knowledge_bases").select(`
          *,
          profiles:user_id (display_name)
        `);

      if (isPublic) {
        query = query.eq("is_public", true);
      } else if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching knowledge bases:", error);
        return;
      }

      // Transform data to include user_name from the profiles join
      const transformedData = data.map((kb) => ({
        ...kb,
        user_name: kb.profiles?.display_name || "Anonymous",
      }));

      setKnowledgeBases(transformedData);
    } catch (error) {
      console.error("Error fetching knowledge bases:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from("knowledge_bases")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting knowledge base:", error);
        return;
      }

      // Refresh the list
      fetchKnowledgeBases();
    } catch (error) {
      console.error("Error deleting knowledge base:", error);
    } finally {
      setDeleteId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex justify-between p-6 pt-0">
              <Skeleton className="h-9 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (knowledgeBases.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          {isPublic
            ? "No public knowledge bases available yet."
            : "You haven't created any knowledge bases yet."}
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate">{kb.name}</h3>
                {kb.is_public && <Badge>Public</Badge>}
              </div>
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                {kb.description}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Updated {formatDistanceToNow(new Date(kb.updated_at))} ago
                </span>
              </div>
              {isPublic && (
                <p className="text-xs mt-2">Created by {kb.user_name}</p>
              )}
            </CardContent>
            <CardFooter className="flex  p-6 pt-0">
              <div className="flex gap-2">
                {!isPublic && userId === kb.user_id && (
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
                {kb.is_public && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/knowledge/${kb.id}`)}
                  >
                    <Eye size={16} />
                  </Button>
                )}
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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
