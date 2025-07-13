import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { FaEye } from "react-icons/fa";

interface Document {
  title: string;
  url: string;
  id: string;
  documentId: string;
  documentName: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsListProps {
  documents: Document[];
  onDelete: (doc: {
    title: string;
    url: string;
    id: string;
    documentId: string;
    documentName: string;
    createdAt: string;
    updatedAt: string;
  }) => Promise<void>;
  isDeleteLoading?: boolean;
  onSelectDocuments?: (selectedDocs: Document[]) => void;
  selectedDocuments?: Document[];
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
    documentId: string;
    documentName: string;
    createdAt: string;
    updatedAt: string;
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
          documents?.map((doc) => {
            return (
              <div
                key={doc.documentName}
                className={`flex items-center justify-between p-2 rounded-md`}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(doc.url, "_blank");
                    }}
                    disabled={loading || isDeleteLoading}
                  >
                    <FaEye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc);
                    }}
                    disabled={loading || isDeleteLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
