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
      toast.success("Link copied to clipboard!");

      // Reset the copied state after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!newEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email is already shared
    const isAlreadyShared = shares.some(
      (share) =>
        share.sharedWithEmail.toLowerCase() === newEmail.trim().toLowerCase()
    );

    if (isAlreadyShared) {
      toast.error("This email already has access");
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
              Share Knowledge Base
            </DialogTitle>
            <DialogDescription>
              {isPublic
                ? "This knowledge base is public. Anyone with the link can access it."
                : "This knowledge base is private. Only you and invited users can access it."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Share Link Section */}
            <div className="space-y-2">
              <Label htmlFor="share-link">Share Link</Label>
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
                    {linkCopied ? "Copied!" : "Copy link"}
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
                      Team Access
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      {shares.length} {shares.length === 1 ? "user" : "users"}
                    </Badge>
                  </div>

                  {/* Add Email Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter email address..."
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
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
                  <div className="rounded-md border overflow-hidden">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading shared users...
                      </div>
                    ) : shares.length > 0 ? (
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
                                Remove user
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No users have been added yet
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Users with these email addresses can access this knowledge
                    base when they sign in.
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
