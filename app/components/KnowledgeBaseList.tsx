"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Trash2, Eye, Plus, Star, StarOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useKnowledgeBases } from "@/app/hooks/useKnowledgeBases";
import { useTogglePin, useIsPinned } from "@/app/hooks/useUserPins";
import { useTranslations } from "next-intl";



// Pin indicator component
function PinIndicator({ knowledgeBaseId }: { knowledgeBaseId: string }) {
  const isPinned = useIsPinned(knowledgeBaseId);
  
  if (!isPinned) return null;
  
  return <Star className="h-4 w-4 text-blue-300 fill-blue-300" />;
}

// Pin button component
function PinButton({ knowledgeBaseId, disabled }: { knowledgeBaseId: string; disabled: boolean }) {
  const isPinned = useIsPinned(knowledgeBaseId);
  const { togglePin } = useTogglePin();
  const t = useTranslations('knowledgeBase');
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => togglePin(knowledgeBaseId, isPinned)}
      disabled={disabled}
      title={isPinned ? t('unpin') : t('pin')}
    >
      {isPinned ? (
        <StarOff size={16} />
      ) : (
        <Star size={16} />
      )}
    </Button>
  );
}

interface KnowledgeBaseListProps {
  userId?: string;
  isPublic: boolean;
  knowledgeBases: any[]; // Use any to avoid type conflicts between different KnowledgeBase definitions
  onOpenCreateKnowledgeBaseDialog: () => void;
}

export default function KnowledgeBaseList({
  userId,
  isPublic,
  knowledgeBases,
  onOpenCreateKnowledgeBaseDialog,
}: KnowledgeBaseListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { deleteKnowledgeBase } = useKnowledgeBases();
  const { isPending: isDeleting } = deleteKnowledgeBase;
  const { isPending: isTogglingPin } = useTogglePin();
  const t = useTranslations('knowledgeBase');
  const tDashboard = useTranslations('dashboard');

  const handleDelete = async (id: string) => {
    deleteKnowledgeBase.mutate(id, {
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
            ? tDashboard('noPublicKnowledgeBases')
            : tDashboard('noKnowledgeBases')}
        </p>
        {!isPublic && (
          <Button
            onClick={() => {
              onOpenCreateKnowledgeBaseDialog();
            }}
            className="mx-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {tDashboard('createKnowledgeBase')}
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
                <div className="flex items-center gap-2">
                  <h3 className="md:text-lg text-base font-semibold truncate">
                    {kb.name}
                  </h3>
                  <PinIndicator knowledgeBaseId={kb.id} />
                </div>
                <div className="flex gap-1">
                  {kb.isPublic && <Badge variant="default">{t('public')}</Badge>}
                  {!kb.isPublic && <Badge variant="destructive">{t('private')}</Badge>}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                {kb.description}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {t('updatedAgo', { time: formatDistanceToNow(new Date(kb.updatedAt)) })}
                </span>
              </div>
              {isPublic && (
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs">{t('createdBy')} {kb.userName}</p>
              
                </div>
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
                    <PinButton knowledgeBaseId={kb.id} disabled={isTogglingPin} />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
            >
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
