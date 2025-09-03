"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import DocumentUpload from "../DocumentUpload";

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentUploadDialog({
  isOpen,
  onOpenChange,
}: DocumentUploadDialogProps) {
  const t = useTranslations("chat");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-3">
        <DialogHeader>
          <DialogTitle>{t("manageKnowledgeBase")}</DialogTitle>
        </DialogHeader>
        <DocumentUpload
          onClose={() => {
            onOpenChange(false);
          }}
          isShowDocumentList={true}
        />
      </DialogContent>
    </Dialog>
  );
}
