"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "../utils/supabase/client";

interface DocumentUploadProps {
  onUpload: (file: File, title: string) => Promise<void>;
  onClose: () => void;
}

const DocumentsList = () => {
  const [documents, setDocuments] = useState<
    { name: string; created_at: string; url: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const supabase = await createClient();
        const { data: user } = await supabase.auth.getUser();

        if (!user?.user?.id) return;

        // Get all files in the user's directory
        const { data: files, error } = await supabase.storage
          .from("documents")
          .list(`user_${user.user.id}`);

        if (error) throw error;

        // Get public URLs for each file
        const documentsWithUrls = await Promise.all(
          files.map(async (file) => {
            const { data: publicUrl } = await supabase.storage
              .from("documents")
              .getPublicUrl(`user_${user.user.id}/${file.name}`);

            return {
              name: file.name,
              created_at: file.created_at || new Date().toISOString(),
              url: publicUrl.publicUrl,
            };
          })
        );

        setDocuments(documentsWithUrls);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast("Error fetching documents", {
          duration: 5000,
          description: "Failed to fetch your documents. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Your Documents</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[200px]">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function DocumentUpload({
  onUpload,
  onClose,
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
        <DocumentsList />
      </CardContent>
    </Card>
  );
}
