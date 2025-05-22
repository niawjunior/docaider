import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DocumentUpload from "./DocumentUpload"; // Assuming DocumentUpload is in the same directory

interface PdfManagementModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpload: (file: File, title: string) => void; // This might be handled by DocumentUpload
  onDelete: (doc: any) => void; // Replace 'any' with the actual document type
  onToggleActive: (doc: any) => void; // Replace 'any' with the actual document type
  onClose: () => void; // This should be linked to onOpenChange or a close button
  documents: Array<any>; // Replace 'any' with the actual document type
  fetchDocuments: () => void;
  chatId?: string; // Added chatId as it's used in DocumentUpload
}

const PdfManagementModal: React.FC<PdfManagementModalProps> = ({
  isOpen,
  onOpenChange,
  onUpload,
  onDelete,
  onToggleActive,
  onClose, // onClose can be directly tied to onOpenChange(false)
  documents,
  fetchDocuments,
  chatId,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          onClose(); // Call onClose when the dialog is closed
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Manage PDF Documents</DialogTitle>
        </DialogHeader>
        <DocumentUpload
          chatId={chatId}
          onUpload={onUpload} // Pass through or let DocumentUpload handle its internal state for this
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          documents={documents}
          fetchDocuments={fetchDocuments}
          // DocumentUpload might not need all these props directly if it manages its own state
          // or if some actions are handled via fetchDocuments refresh.
          // Adjust based on DocumentUpload's actual implementation.
        />
      </DialogContent>
    </Dialog>
  );
};

export default PdfManagementModal;
