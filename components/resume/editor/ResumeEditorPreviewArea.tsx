"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeData } from "@/lib/schemas/resume";
import { RefObject } from "react";
import { isDocumentTheme } from "@/lib/themes/registry";

interface ResumeEditorPreviewAreaProps {
  isViewMode: boolean;
  isLoading: boolean;
  viewport: "desktop" | "tablet" | "mobile";
  theme: string;
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;
  idParam?: string | null;
  scrollContainerRef: RefObject<any>;
}

export function ResumeEditorPreviewArea({
  isViewMode,
  isLoading,
  viewport,
  theme,
  resumeData,
  setResumeData,
  idParam,
  scrollContainerRef
}: ResumeEditorPreviewAreaProps) {
  return (
    <div 
        ref={scrollContainerRef}
        className={cn(
            "w-full bg-slate-950 overflow-y-auto flex items-start justify-center bg-dot-white/[0.2]",
            isViewMode ? "h-screen p-0" : "h-[calc(100vh-100px)]",
            // Add padding only for document-style themes
            !isViewMode && isDocumentTheme(theme) ? "p-8" : "p-0"
    )}>
        {isLoading ? (
            <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        ) : (idParam && resumeData) ? (
            <div className={cn(
                "animate-in fade-in slide-in-from-bottom-4 duration-500 light transition-all ease-in-out mx-auto shadow-2xl",
                // Unified logic: 
                // 1. If Tablet/Mobile, enforce specific widths for ALL themes.
                // 2. If Desktop, distinguish between "Document" (constrained) and "Web" (full width).
                
                viewport === "tablet" && cn(
                    "w-[768px] border-x border-white/10 my-8 rounded-lg overflow-hidden min-h-[800px]",
                    isDocumentTheme(theme) ? "" : "bg-white dark:bg-slate-950" // Document themes handle their own background
                ),
                viewport === "mobile" && cn(
                    "w-[375px] border-x border-white/10 my-8 rounded-2xl overflow-hidden min-h-[667px]",
                    isDocumentTheme(theme) ? "" : "bg-white dark:bg-slate-950"
                ),
                
                viewport === "desktop" && [
                    // Document Themes: Constrained to A4-ish width
                    isDocumentTheme(theme) ? "w-full max-w-5xl" : 
                    // Web Themes: Full width
                    "w-full bg-white dark:bg-slate-950"
                ]
            )}>

                <ResumePreview 
                    data={resumeData} 
                    theme={theme as any} 
                    onUpdate={(newData) => setResumeData(newData)}
                    readOnly={isViewMode} // Pass readOnly state
                    containerRef={scrollContainerRef}
                />
            </div>
        ) : null}
    </div>
  );
}
