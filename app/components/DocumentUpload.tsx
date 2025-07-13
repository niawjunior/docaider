"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import DocumentsList from "./DocumentList";
import { formatBytes } from "../utils/formatBytes";
import { toast } from "sonner";

export interface DocumentUploadProps {
  onDelete: (doc: {
    title: string;
    url: string;
    id: string;
    documentId: string;
    documentName: string;
    createdAt: string;
    updatedAt: string;
  }) => Promise<void>;
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

  documents: {
    title: string;
    url: string;
    id: string;
    documentId: string;
    documentName: string;
    createdAt: string;
    updatedAt: string;
  }[];
  isDeleteLoading?: boolean;
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
  onDelete,
  onClose,
  documents,
  isDeleteLoading,
  onFinish,
  isShowDocumentList,
  isKnowledgeBase,
}: DocumentUploadProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    // Clear any previous errors
    setTitleError(null);
    setIsUploading(true);

    try {
      await handleDocumentUpload(file, title);
    } catch (error: any) {
      console.error("Error uploading document:", error);

      // Check if the error is related to duplicate title
      if (
        error.message?.includes("already exists") ||
        (error.response && error.response.status === 409)
      ) {
        setTitleError(
          "A document with this title already exists. Please use a different title."
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: {
    title: string;
    url: string;
    id: string;
    documentId: string;
    documentName: string;
    createdAt: string;
    updatedAt: string;
  }) => {
    if (!onDelete) return;

    try {
      await onDelete(doc);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDocumentUpload = async (file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("isKnowledgeBase", isKnowledgeBase ? "true" : "false");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("result", result);
      if (!response.ok) {
        if (response.status === 409) {
          setTitleError(
            "A document with this title already exists. Please use a different title."
          );
        }
        toast("Error uploading document", {
          duration: 5000,
          description: "Failed to upload document. Please try again.",
        });
      } else {
        if (onClose) {
          onClose();
        }
        if (onFinish) {
          onFinish(result.documentId);
        }
        toast("Document uploaded successfully");
      }
    } catch (error) {
      console.log(error);
      toast("Error uploading document", {
        duration: 5000,
        description: "Failed to upload document. Please try again.",
      });
    } finally {
      setTitle("");
      setFile(null);
    }
  };

  useEffect(() => {
    // Clear the file input when file is set to null
    if (!file) {
      const input = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;
      if (input) {
        input.value = "";
      }
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileSizeError(
        `File size exceeds 1MB limit. Your file is ${formatBytes(
          selectedFile.size
        )}.`
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
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
        {isShowDocumentList && (
          <DocumentsList
            documents={documents}
            onDelete={handleDelete}
            isDeleteLoading={isDeleteLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}
