"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Image from "next/image";
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
  images?: string[];
  banner?: string;
}
const Markdown = ({ isUser, text, images, banner }: MarkdownProps) => {
  console.log(images);
  return (
    <>
      {banner && (
        <Image
          src={banner}
          width={500}
          height={500}
          alt="banner"
          className="w-full h-48 object-cover"
        />
      )}
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="px-4 py-2 text-xl font-bold text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="px-4 py-2 text-lg font-semibold text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="px-4 py-2 text-base font-medium text-white">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={clsx(
                "px-4 py-2 leading-relaxed whitespace-pre-wrap  rounded-2xl text-sm text-white",
                isUser ? "bg-blue-600 text-white inline-block" : " text-white"
              )}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-8  py-2 text-white">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-8  py-2 text-white">{children}</ol>
          ),
          li: ({ children }) => <li className="py-2 text-white">{children}</li>,

          strong: ({ children }) => (
            <strong className="font-bold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-white">{children}</em>
          ),
          // ✅ Inline code
          code({ node, className, children, ...props }) {
            const language = className?.replace("language-", "") ?? "";
            const codeString = extractTextFromChildren(children);

            const handleCopy = () => {
              navigator.clipboard.writeText(codeString);
              toast("Copied to clipboard", {
                duration: 1500,
              });
            };

            return (
              <div className="relative group my-4">
                <Button
                  variant="ghost"
                  onClick={handleCopy}
                  size="icon"
                  className="absolute top-2  right-2 text-xs px-2 py-1 rounded hover:bg-zinc-700"
                >
                  <FaCopy />
                </Button>
                <pre className="rounded-lg p-4 overflow-x-auto bg-zinc-900 text-sm">
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
      {images && images.length > 0 && (
        <>
          <h2 className="px-4 py-2 text-lg font-semibold text-white">
            {" "}
            Images{" "}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {images?.map((image, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
              >
                <Image
                  width={100}
                  height={100}
                  src={image}
                  className="w-full h-full object-cover"
                  alt={`Image ${index}`}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default Markdown;
