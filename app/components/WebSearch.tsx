"use client";
import React, { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface WebSearchResult {
  query: string;
  text: string;
  sources: {
    id: string;
    url: string;
    title: string;
    sourceType: string;
  }[];
  providerMetadata: {
    google: {
      groundingMetadata: {
        groundingChunks: {
          web: {
            uri: string;
            title: string;
          };
        }[];
      };
    };
  };
}

interface WebSearchComponentProps {
  searchResults: WebSearchResult; // Change this to 'any' for now to handle the incoming structure
  query: string;
}

const WebSearchComponent: FC<WebSearchComponentProps> = ({
  searchResults,
  query,
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto my-4 border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-blue-500">Web Search Results</span>
            {query && (
              <span className="text-sm font-normal text-muted-foreground">
                for &quot;{query}&quot;
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mb-4 text-white">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mb-3 text-white">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-medium mb-2 text-white">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-white">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 text-white">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 text-white">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="mb-2 text-white">{children}</li>
              ),

              strong: ({ children }) => (
                <strong className="font-bold text-white">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-white">{children}</em>
              ),
            }}
          >
            {searchResults?.text}
          </ReactMarkdown>
          {searchResults?.sources?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Sources:</h4>
              <div className="flex flex-wrap gap-2">
                {searchResults?.sources?.map((source: any, index: any) => (
                  <a
                    key={source.id || index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {source.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebSearchComponent;
