"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DocumentsList from "./DocumentList";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    try {
      await onUpload(file, title);
      setTitle("");
      setFile(null);
      toast("Document uploaded successfully", {
        duration: 5000,
        description: "Your document has been uploaded successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast("Error uploading document", {
        duration: 5000,
        description: "Failed to upload document. Please try again.",
      });
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

  return (
    <Card className="mt-4">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label>PDF File</Label>
            <div className="relative w-full">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                required
                disabled={isUploading}
                className="hidden"
                ref={(input) => {
                  if (input) {
                    input.addEventListener("change", () => {
                      if (input.files && input.files[0]) {
                        setFile(input.files[0]);
                      }
                    });
                  }
                }}
              />
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                disabled={isUploading}
                onClick={(e) => {
                  const input = e.currentTarget
                    .previousElementSibling as HTMLInputElement;
                  if (input && !isUploading) {
                    input.click();
                  }
                }}
              >
                {file ? (
                  <span className="text-sm">{file.name}</span>
                ) : (
                  <span className="text-sm">Select PDF file</span>
                )}
              </Button>
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
        <DocumentsList
          documents={documents}
          onDelete={handleDelete}
          onToggleActive={onToggleActive}
        />
      </CardContent>
    </Card>
  );
}
