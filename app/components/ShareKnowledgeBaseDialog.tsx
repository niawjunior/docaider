"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Mail, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useKnowledgeBaseShares } from "@/app/hooks/useKnowledgeBaseShares";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ShareKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBaseId: string;
  shareUrl: string;
  isPublic: boolean;
}

export default function ShareKnowledgeBaseDialog({
  open,
  onOpenChange,
  knowledgeBaseId,
  shareUrl,
  isPublic,
}: ShareKnowledgeBaseDialogProps) {
  const t = useTranslations("knowledgeBase.shareDialog");
  const [newEmail, setNewEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const {
    shares,
    isLoading,
    addShare,
    removeShare,
    isAddingShare,
    isRemovingShare,
  } = useKnowledgeBaseShares(knowledgeBaseId);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success(t("copied"));

      // Reset the copied state after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error(t("failedToCopy", { ns: "common" }));
    }
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      toast.error(t("enterEmail"));
      return;
    }

    if (!newEmail.includes("@")) {
      toast.error(t("enterEmail"));
      return;
    }

    // Check if email is already shared
    const isAlreadyShared = shares.some(
      (share) =>
        share.sharedWithEmail.toLowerCase() === newEmail.trim().toLowerCase()
    );

    if (isAlreadyShared) {
      toast.error(t("alreadyShared"));
      return;
    }

    addShare(newEmail.trim());
    setNewEmail("");
  };

  const handleRemoveShare = (shareId: string) => {
    setPendingRemoval(shareId);
    removeShare(shareId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddEmail();
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("title")}
            </DialogTitle>
            <DialogDescription>
              {isPublic ? t("publicDescription") : t("privateDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Share Link Section */}
            <div className="space-y-2">
              <Label htmlFor="share-link">{t("shareLink")}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                  onClick={(e) => {
                    (e.target as HTMLInputElement).select();
                  }}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={handleCopyShareLink}
                      className={cn(
                        linkCopied &&
                          "bg-green-50 text-green-600 border-green-200"
                      )}
                    >
                      {linkCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {linkCopied ? t("copied") : t("copy")}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Team Sharing Section - Only show for private knowledge bases */}
            {!isPublic && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {t("inviteByEmail")}
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      {shares.length}
                    </Badge>
                  </div>

                  {/* Add Email Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder={t("enterEmail")}
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1"
                      disabled={isAddingShare}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleAddEmail}
                      disabled={isAddingShare || !newEmail.trim()}
                    >
                      {isAddingShare ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Shared Users List */}
                  <div className="text-xs text-muted-foreground">
                    {t("sharedWith")}
                  </div>
                  <div className="rounded-md border overflow-hidden">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t("loading")}
                      </div>
                    ) : shares.length > 0 ? (
                      <>
                        <div className="max-h-48 overflow-y-auto">
                          {shares.map((share) => (
                            <div
                              key={share.id}
                              className={cn(
                                "flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50",
                                pendingRemoval === share.id &&
                                  "opacity-50 bg-muted/50"
                              )}
                            >
                              <span className="text-sm truncate flex-1">
                                {share.sharedWithEmail}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRemoveShare(share.id)}
                                    disabled={
                                      isRemovingShare ||
                                      pendingRemoval === share.id
                                    }
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  >
                                    {pendingRemoval === share.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  {t("remove")}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        {t("noShares")}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
