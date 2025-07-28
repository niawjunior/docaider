"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShareUrl } from "../../hooks/useShareUrl";

interface ShareDialogProps {
  chatId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({
  chatId,
  isOpen,
  onOpenChange,
}: ShareDialogProps) {
  const t = useTranslations("chat");
  const [isCreateShareLoading, setIsCreateShareLoading] = useState(false);
  const { shareData, error: shareError } = useShareUrl(chatId);
  const queryClient = useQueryClient();

  const handleShare = async () => {
    try {
      setIsCreateShareLoading(true);
      const response = await fetch(`/api/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(t("shareLinkCreated"));
      // Invalidate and refetch the share URL query
      queryClient.invalidateQueries({ queryKey: ["shareUrl", chatId] });
    } catch (error) {
      console.error("Error sharing chat:", error);
      toast.error(t("failedToCreateShareLink"));
    } finally {
      setIsCreateShareLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("shareDialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex flex-col items-center">
          {shareData?.shareUrl ? (
            <>
              <p className="text-sm self-start text-muted-foreground">
                {dayjs(shareData.createdAt).format("DD/MM/YYYY HH:mm:ss")}
              </p>
              <div className="flex items-center gap-2 justify-between w-full">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareData.shareUrl);
                    toast.success(t("linkCopied"));
                  }}
                >
                  {t("copyLink")}
                </Button>
              </div>
              <Button
                disabled={isCreateShareLoading}
                className="w-full"
                onClick={handleShare}
              >
                {isCreateShareLoading ? t("updating") : t("updateShareLink")}
                {isCreateShareLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
              </Button>
              <p className="text-sm text-gray-400">{t("shareDescription")}</p>
            </>
          ) : (
            <Button
              disabled={isCreateShareLoading}
              className="w-full"
              onClick={handleShare}
            >
              {isCreateShareLoading ? t("generating") : t("generateShareLink")}
              {isCreateShareLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          )}
          {shareError && (
            <p className="text-sm text-red-400 mt-2">{shareError.message}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
