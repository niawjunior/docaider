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
  onFinish?: (documentId: string) => void;
  onUpload?: (isUploading: boolean) => void;
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
}

export default function DocumentUpload({
  onClose,
  onFinish,
  onUpload,
  isShowDocumentList,
  isKnowledgeBase,
}: DocumentUploadProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

  // Use the document upload hook
  const { uploadDocument, isUploading } = useDocumentUpload();

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
        onSuccess: (result) => {
          // Reset form
          setTitle("");
          setFile(null);

          // Handle callbacks
          if (onClose) {
            onClose();
          }
          if (onFinish) {
            onFinish(result.documentId);
          }
          if (onUpload) {
            onUpload(false);
          }
        },
        onError: (error: any) => {
          if (onUpload) {
            onUpload(false);
          }
          console.error("Error uploading document:", error);

          // Check if the error is related to duplicate title
          if (error.message?.includes("already exists")) {
            setTitleError(
              "A document with this title already exists. Please use a different title."
            );
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
        `File size exceeds the limit of ${formatBytes(
          MAX_FILE_SIZE
        )}. Current size: ${formatBytes(selectedFile.size)}`
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
              Selected file: {file.name} ({formatBytes(file.size)})
            </div>
          )}
          <div className="space-y-2">
            <Label>Document Title</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // Clear title error when user types
                if (titleError) setTitleError(null);
              }}
              placeholder="Enter document title"
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
              Supported file types: PDF, CSV, DOC, DOCX
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
                Maximum file size: 3MB. Documents will be processed for
                knowledge retrieval.
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
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
        {isShowDocumentList && <DocumentsList />}
      </CardContent>
    </Card>
  );
}
