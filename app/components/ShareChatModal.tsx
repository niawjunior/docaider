import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

interface ShareChatModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shareData?: { shareUrl: string; createdAt: string } | null;
  isLoading: boolean;
  onShare: () => void;
  shareError?: { message: string } | null;
  chatId?: string;
}

const ShareChatModal: React.FC<ShareChatModalProps> = ({
  isOpen,
  onOpenChange,
  shareData,
  isLoading,
  onShare,
  shareError,
  chatId,
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    if (shareData?.shareUrl) {
      navigator.clipboard.writeText(shareData.shareUrl);
      setHasCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
        </DialogHeader>
        {shareError && (
          <div className="text-red-500 text-sm p-2 bg-red-100 border border-red-400 rounded-md">
            Error: {shareError.message}
          </div>
        )}
        {shareData?.shareUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your chat is ready to be shared. Anyone with this link can view
              the conversation.
            </p>
            <div className="flex items-center space-x-2">
              <Input value={shareData.shareUrl} readOnly />
              <Button onClick={handleCopy} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Link created on:{" "}
              {new Date(shareData.createdAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Generate a shareable link for this chat.
          </p>
        )}
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onShare} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {shareData ? "Create New Link" : "Generate Share Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareChatModal;
