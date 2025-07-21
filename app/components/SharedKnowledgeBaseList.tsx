"use client";

import { SharedKnowledgeBase } from "@/app/hooks/useSharedKnowledgeBases";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface SharedKnowledgeBaseListProps {
  sharedKnowledgeBases: SharedKnowledgeBase[];
  isLoading?: boolean;
}

export default function SharedKnowledgeBaseList({
  sharedKnowledgeBases,
  isLoading = false,
}: SharedKnowledgeBaseListProps) {
  const router = useRouter();

  const handleViewKnowledgeBase = (id: string) => {
    router.push(`/knowledge/${id}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sharedKnowledgeBases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <User className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No shared knowledge bases</h3>
            <p className="text-muted-foreground">
              Knowledge bases shared with you will appear here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sharedKnowledgeBases.map((kb) => (
        <Card key={kb.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{kb.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {kb.description || "No description available"}
                </CardDescription>
              </div>
              {kb.isPublic && (
                <Badge variant="default" className="ml-2 shrink-0">
                  Public
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Shared by info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Shared by {kb.sharedByEmail}</span>
              </div>

              {/* Shared date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Shared{" "}
                  {formatDistanceToNow(new Date(kb.sharedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleViewKnowledgeBase(kb.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
