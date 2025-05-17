"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import DocumentsList from "./DocumentList";
import { formatBytes } from "../utils/formatBytes";
import { useCredit } from "../context/CreditContext";

interface DocumentUploadProps {
  onUpload: (file: File, title: string) => Promise<void>;
  onDelete: (doc: {
    title: string;
    url: string;
    id: string;
    document_id: string;
    document_name: string;
  }) => Promise<void>;
  onClose: () => void;
  documents?: {
    title: string;
    created_at: string;
    url: string;
    id: string;
    active: boolean;
    document_id: string;
    document_name: string;
  }[];
  onToggleActive?: (doc: { id: string; active: boolean }) => Promise<void>;
}

export default function DocumentUpload({
  onUpload,
  onDelete,
  onClose,
  documents,
  onToggleActive,
}: DocumentUploadProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
  const { credit } = useCredit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    try {
      await onUpload(file, title);
      setTitle("");
      setFile(null);

      onClose();
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: {
    title: string;
    url: string;
    id: string;
    document_id: string;
    document_name: string;
  }) => {
    if (!onDelete) return;

    try {
      await onDelete(doc);
    } catch (error) {
      console.error("Error deleting document:", error);
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
    <Card className="mt-4">
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            <div className="relative w-full">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              !file ||
              !title ||
              isUploading ||
              !credit?.balance ||
              credit?.balance < 1
            }
            className="w-full"
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Upload Document"}
            <span className="text-xs text-gray-500">1 credit</span>
          </Button>
        </form>
        <DocumentsList
          documents={documents}
          onDelete={handleDelete}
          onToggleActive={onToggleActive}
        />
      </CardContent>
    </Card>
  );
}
