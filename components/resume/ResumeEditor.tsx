"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, EyeOff } from "lucide-react";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getResumeById, saveDraft } from "@/app/actions/resume";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";
import { AnimatePresence, motion } from "framer-motion";
import { ResumeEditorControls } from "./editor/ResumeEditorControls";
import { ResumeEditorPreviewArea } from "./editor/ResumeEditorPreviewArea";
import { EditorProvider } from "./editor/EditorContext";
import { FormattingToolbar } from "./editor/FormattingToolbar";

export function ResumeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  // Prioritize ID from path (edit route), then searchParams (legacy/create redirect)
  const idParam = (params?.id as string) || searchParams.get("id");
  const themeParam = searchParams.get("theme");
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [theme, setTheme] = useState<"modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual">("modern");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewMode, setIsViewMode] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const lastSavedData = useRef<string>("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Redirect to Create if no ID
  useEffect(() => {
    if (!idParam) {
       router.replace("/resume-builder/create");
    }
  }, [idParam, router]);

  // Ensure default theme in URL
  useEffect(() => {
    if (!idParam && !themeParam) {
       const newParams = new URLSearchParams(searchParams.toString());
       newParams.set("theme", "modern");
       router.replace(`?${newParams.toString()}`);
    }
  }, [idParam, themeParam, router, searchParams]);

  // Initialize Data
  useEffect(() => {
    const loadData = async () => {
      if (idParam) {
         try {
           const data = await getResumeById(idParam);
           if (data) {
             setResumeData(data.content);
             setTheme(data.theme as any);
             setSlug(data.slug);
             setVisibility(data.is_public ? "public" : "private");

             // setPublishedUrl(null); // Keep existing publishedUrl if any (e.g. from just publishing)
             lastSavedData.current = JSON.stringify({ content: data.content, theme: data.theme });
           }
         } catch (e) {
           console.error("Failed to load resume", e);
           toast.error("Failed to load resume");
       } finally {
           setIsLoading(false);
          }
      }
    };
    if (idParam) {
        loadData();
    }
  }, [idParam]);

  // Track unsaved changes (content OR theme)
  const isDirty = JSON.stringify({ content: resumeData, theme }) !== lastSavedData.current;

  const handleSave = async () => {
      if (!resumeData || !idParam) return;
      setIsSaving(true);
      try {
          await saveDraft({
              content: resumeData,
              theme,
              id: idParam,
              slug 
          });
          lastSavedData.current = JSON.stringify({ content: resumeData, theme });
          toast.success("Saved successfully");
      } catch (e) {
          console.error("Save Failed", e);
          toast.error("Failed to save");
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <EditorProvider>
    <div className="min-h-screen bg-slate-950 text-white flex flex-col text-slate-100 dark">
      {resumeData && (
           <FormattingToolbar resumeData={resumeData} onUpdate={setResumeData} theme={theme} />
      )}
      {!isViewMode && (
      <ResumeBuilderHeader 
        maxWidth="max-w-full" 
        showBackToApp={false}
        className="bg-transparent border-b border-white/10 relative z-50 backdrop-blur-md"
        theme="dark"
      >
        <div className="flex items-center justify-between w-full">
            <ResumeEditorControls 
                resumeData={resumeData}
                setResumeData={setResumeData}
                isDirty={isDirty}
                isSaving={isSaving}
                onSave={handleSave}
                viewport={viewport}
                setViewport={setViewport}
                theme={theme}
                setTheme={setTheme}
                isPublishing={isPublishing}
                setIsPublishing={setIsPublishing}
                publishedUrl={publishedUrl}
                setPublishedUrl={setPublishedUrl}
                visibility={visibility}
                setVisibility={setVisibility}
                slug={slug}
                setSlug={setSlug}
                idParam={idParam}
                setIsViewMode={setIsViewMode}
            />
        </div>
      </ResumeBuilderHeader>
      )}

      {/* View Mode Exit Button (Floating) */}
      {isViewMode && (
          <div className="fixed top-4 right-6 z-[99]">
              <Button 
                onClick={() => setIsViewMode(false)}
                className="bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10"
              >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Exit View Mode
              </Button>
          </div>
      )}

      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence>
            {/* Transition Loader */}
            {isLoading && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-center"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                        <Loader2 className="w-16 h-16 animate-spin text-white relative z-10" />
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 text-center space-y-2"
                    >
                        <h3 className="text-xl font-bold text-white tracking-tight">Initializing Workspace</h3>
                        <p className="text-slate-400 text-sm">Preparing your career tools...</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        
        <ResumeEditorPreviewArea 
            isViewMode={isViewMode}
            isLoading={isLoading}
            viewport={viewport}
            theme={theme}
            resumeData={resumeData}
            setResumeData={setResumeData}
            idParam={idParam}
            scrollContainerRef={scrollContainerRef}
        />
      </main>
    </div>
    </EditorProvider>
  );
}
