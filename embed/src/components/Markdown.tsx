"use client";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

interface MarkdownProps {
  isUser: boolean;
  text: string;
}
const Markdown = ({ isUser, text }: MarkdownProps) => {
  return (
    <>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="px-4 py-1 text-[14px] font-bold text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="px-4 py-1 text-[14px] font-semibold text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="px-4 py-1 text-[14px] font-medium text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={clsx(
                "px-4 py-1 leading-relaxed whitespace-pre-wrap rounded-2xl text-[14px] text-foreground",
                isUser ? "bg-primary text-primary-foreground inline-block" : ""
              )}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-8 py-1 text-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-8 py-1 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="py-1 text-foreground">{children}</li>
          ),

          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          br: () => <br className="hidden" />,
          // ✅ Inline code
          code({ className, children, ...props }) {
            const language = className?.replace("language-", "") ?? "";
            return (
              <pre className="rounded-lg p-4 overflow-x-auto bg-muted text-[14px]">
                <code className={`language-${language}`} {...props}>
                  {children}
                </code>
              </pre>
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
