"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import DocumentsList from "./DocumentList";
import { formatBytes } from "../utils/formatBytes";
import { useDocumentUpload } from "../hooks/useDocumentUpload";
import { useKnowledgeBases } from "../hooks/useKnowledgeBases";
import { useTranslations } from "next-intl";

export interface DocumentUploadProps {
  onClose?: () => void;
  onSelectDocuments?: (
    selectedDocs: {
      title: string;
      url: string;
      id: string;
      documentId: string;
      documentName: string;
      createdAt: string;
      updatedAt: string;
    }[]
  ) => void;
  onUpload?: (isUploading: boolean) => void;
  onFileUploaded?: () => void;
  selectedDocuments?: {
    title: string;
    url: string;
    id: string;
    documentId: string;
    documentName: string;
    createdAt: string;
    updatedAt: string;
  }[];
  isShowDocumentList?: boolean;
  isKnowledgeBase?: boolean;
  knowledgeBaseId?: string;
}

export default function DocumentUpload({
  onClose,
  onUpload,
  onFileUploaded,
  isShowDocumentList,
  isKnowledgeBase,
  knowledgeBaseId,
}: DocumentUploadProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  const t = useTranslations('documents');

  // Use the document upload hook
  const { uploadDocument, isUploading } = useDocumentUpload();

  const kbHooks = useKnowledgeBases();
  const { refetch } = kbHooks.useKnowledgeBaseById(knowledgeBaseId!);

  // Clear the file input when file is set to null
  useEffect(() => {
    if (!file) {
      const input = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;
      if (input) {
        input.value = "";
      }
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    // Clear any previous errors
    setTitleError(null);

    if (onUpload) {
      onUpload(true);
    }

    // Use the mutation from the hook
    uploadDocument.mutate(
      {
        file,
        title,
        isKnowledgeBase: isKnowledgeBase || false,
      },
      {
        onSuccess: async (result) => {
          // get current document_ids
          if (knowledgeBaseId) {
            const { data: refreshedKB } = await refetch();
            if (refreshedKB) {
              // Get current document IDs
              const currentDocIds = refreshedKB.documentIds || [];

              // Add the new document ID if it doesn't already exist
              if (!currentDocIds.includes(result.documentId)) {
                const updatedDocIds = [...currentDocIds, result.documentId];

                // Update the knowledge base with the new document IDs
                kbHooks.patchKnowledgeBaseDocumentIds.mutate({
                  knowledgeBaseId: knowledgeBaseId,
                  documentIds: updatedDocIds,
                });

                // // Reset form
                setTitle("");
                setFile(null);

                // Handle callbacks
                if (onClose) {
                  onClose();
                }
                if (onUpload) {
                  onUpload(false);
                }
                if (onFileUploaded) {
                  onFileUploaded();
                }
              }
            }
          }
        },
        onError: (error: any) => {
          if (onUpload) {
            onUpload(false);
          }
          console.error("Error uploading document:", error);

          // Check if the error is related to duplicate title
          if (error.message?.includes("already exists")) {
            setTitleError(t('duplicateTitleError'));
          }
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileSizeError(
        t('fileSizeExceeded', {
          limit: formatBytes(MAX_FILE_SIZE),
          size: formatBytes(selectedFile.size)
        })
      );
      setFile(null);
      return;
    }

    setFileSizeError(null);
    setFile(selectedFile);
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fileSizeError && (
            <div className="text-red-500 text-sm mb-2">{fileSizeError}</div>
          )}
          {file && (
            <div className="text-sm text-gray-500 mb-2">
              {t('selectedFile', { name: file.name, size: formatBytes(file.size) })}
            </div>
          )}
          <div className="space-y-2">
            <Label>{t('documentTitle')}</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // Clear title error when user types
                if (titleError) setTitleError(null);
              }}
              placeholder={t('enterDocumentTitle')}
              required
              disabled={isUploading}
              className={titleError ? "border-red-500" : ""}
            />
            {titleError && (
              <div className="text-red-500 text-sm mt-1">{titleError}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">
              {t('supportedFileTypes')}
            </Label>
            <div className="relative w-full">
              <Input
                id="file"
                type="file"
                accept=".pdf,.csv,.doc,.docx"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500">
                {t('maximumFileSize')}
              </p>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!file || !title || isUploading}
            className="w-full"
          >
            {isUploading && <Loader2 size={16} className="mr-2 animate-spin" />}
            {!isUploading && <Upload size={16} className="mr-2" />}
            {isUploading ? t('uploading') : t('uploadDocument')}
          </Button>
        </form>
        {isShowDocumentList && <DocumentsList />}
      </CardContent>
    </Card>
  );
}
