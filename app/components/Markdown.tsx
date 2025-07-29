"use client";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { FaCopy } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { toast } from "sonner";

function extractTextFromChildren(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (typeof children === "object" && children?.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}
interface MarkdownProps {
  isUser: boolean;
  text: string;
}
const Markdown = ({ isUser, text }: MarkdownProps) => {
  const messageT = useTranslations("chat");
  return (
    <>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="px-4 py-2 text-xl font-bold text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="px-4 py-2 text-lg font-semibold text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="px-4 py-2 text-base font-medium text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={clsx(
                "px-4 py-2 leading-relaxed whitespace-pre-wrap rounded-2xl text-sm text-foreground",
                isUser ? "bg-primary text-primary-foreground inline-block" : ""
              )}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-8 py-2 text-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-8 py-2 text-foreground">{children}</ol>
          ),
          li: ({ children }) => <li className="py-2 text-foreground">{children}</li>,

          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          // ✅ Inline code
          code({ className, children, ...props }) {
            const language = className?.replace("language-", "") ?? "";
            const codeString = extractTextFromChildren(children);

            const handleCopy = () => {
              navigator.clipboard.writeText(codeString);
              toast(messageT("linkCopied"), {
                duration: 1500,
              });
            };

            return (
              <div className="relative group my-4">
                <Button
                  variant="ghost"
                  onClick={handleCopy}
                  size="icon"
                  className="absolute top-2 right-2 text-xs px-2 py-1 rounded hover:bg-accent"
                >
                  <FaCopy />
                </Button>
                <pre className="rounded-lg p-4 overflow-x-auto bg-muted text-sm">
                  <code className={`language-${language}`} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </>
  );
};

export default Markdown;
