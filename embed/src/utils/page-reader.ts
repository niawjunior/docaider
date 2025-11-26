import { Readability } from "@mozilla/readability";

export interface PageContent {
  title: string;
  content: string;
  url: string;
}

export function readCurrentPage(): PageContent | null {
  try {
    // Clone the document to avoid modifying the actual page
    const documentClone = document.cloneNode(true) as Document;
    
    // Use Readability to parse the content
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (!article) {
      return null;
    }

    return {
      title: article.title || document.title,
      content: article.content || "",
      url: window.location.href,
    };
  } catch (error) {
    console.error("Error reading page content:", error);
    return null;
  }
}
