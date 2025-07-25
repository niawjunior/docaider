import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { FaEye } from "react-icons/fa";
import { useDocuments } from "../hooks/useDocuments";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const DocumentsList = () => {
  const { useGetDocuments } = useDocuments();
  const { data: documents = [] } = useGetDocuments({ isKnowledgeBase: false });
  const { deleteDocument } = useDocuments();
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');
  const handleDelete = async (doc: {
    title: string;
    url: string;
    id: string;
    document_id: string;
    document_name: string;
    created_at: string;
    updated_at: string;
  }) => {
    try {
      deleteDocument.mutate(
        {
          documentId: doc.document_id,
          documentName: doc.document_name,
        },
        {
          onSuccess: () => {
            toast(t('documentDeletedSuccess'), {
              duration: 3000,
            });
          },
          onError: (error) => {
            console.error("Error deleting document:", error);
            toast(t('errorDeletingDocument'), {
              duration: 5000,
              description: t('failedToDeleteDocument'),
            });
          },
        }
      );
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">{t('yourKnowledgeBase')}</h3>
      <div className="space-y-2 overflow-y-auto max-h-[200px]">
        {documents?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('emptyKnowledgeBase')}
          </p>
        ) : (
          documents?.map((doc) => {
            return (
              <div
                key={doc.document_name}
                className={`flex items-center justify-between p-2 rounded-md`}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('added')}: {new Date(doc.created_at).toLocaleDateString()}
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
                    disabled={deleteDocument.isPending}
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
                    disabled={deleteDocument.isPending}
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
