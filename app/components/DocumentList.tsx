import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";

interface DocumentsListProps {
  documents?: {
    created_at: string;
    url: string;
    id: string;
    document_id: string;
    document_name: string;
    title: string;
  }[];
  onDelete?: (doc: {
    url: string;
    id: string;
    document_id: string;
    document_name: string;
    title: string;
  }) => Promise<void>;
  isDeleteLoading?: boolean;
}

const DocumentsList = ({
  documents,
  onDelete,
  isDeleteLoading,
}: DocumentsListProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (doc: {
    title: string;
    url: string;
    id: string;
    document_id: string;
    document_name: string;
  }) => {
    if (!onDelete) return;

    try {
      setLoading(true);
      await onDelete(doc);
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Your Knowledge Base</h3>
      <div className="space-y-2 overflow-y-auto max-h-[200px]">
        {documents?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your knowledge base is empty. Upload documents to start building
            your knowledge repository.
          </p>
        ) : (
          documents?.map((doc) => (
            <div
              key={doc.document_name}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div>
                <p className="text-sm font-medium">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  Added to knowledge base:{" "}
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={loading}
                  onClick={() => window.open(doc.url, "_blank")}
                >
                  <FaFilePdf className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(doc)}
                  disabled={loading || isDeleteLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
