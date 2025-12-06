"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Share2, Layout } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { publishResume, getResumeById, saveDraft } from "@/app/actions/resume";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";
import { SectionManager } from "./shared/SectionManager";

export function ResumeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const idParam = searchParams.get("id");
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [theme, setTheme] = useState<"modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual">("modern");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastSavedData = useRef<string>("");

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
             setTheme(data.theme as any);
             setSlug(data.slug);
             // setPublishedUrl(null); // Keep existing publishedUrl if any (e.g. from just publishing)
             lastSavedData.current = JSON.stringify(data.content);
           }
         } catch (e) {
           console.error("Failed to load resume", e);
           toast.error("Failed to load resume");
       } finally {
           setIsLoading(false);
         }
      } else {
        const autoCreate = searchParams.get("auto") === "true";
        
        if (themeParam && autoCreate && !resumeData) {
            // Auto-creation flow: Keep loading explicit
            setTheme(themeParam as any);
            const { getThemeById } = await import("@/lib/themes");
            const demoTheme = getThemeById(themeParam);
            
            if (demoTheme) {
                try {
                    const result = await saveDraft({
                        content: demoTheme.data as any,
                        theme: themeParam,
                    });
                    if (result.success && result.id) {
                        toast.success("Template initialized!");
                        // Update URL to include ID without reloading
                        router.replace(`/resume-builder/create?id=${result.id}`);
                        setResumeData(demoTheme.data as any);
                        setSlug(result.slug || "");
                        lastSavedData.current = JSON.stringify(demoTheme.data);
                    }
                } catch(e) {
                     console.error("Auto-create failed", e);
                } finally {
                     setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        } else {
            // Standard fresh start
            setIsLoading(false);
            if (themeParam) {
                setTheme(themeParam as any);
            }
        }
      }
    };
    loadData();
  }, [idParam, themeParam]); // Removed searchParams to prevent re-renders on unrelated changes

  // Track unsaved changes
  const isDirty = JSON.stringify(resumeData) !== lastSavedData.current;

  const handleUploadSuccess = async (data: ResumeData) => {
       // Auto-create draft immediately
       try {
        const result = await saveDraft({
            content: data,
            theme,
        });
        
        if (result.success && result.id) {
          setResumeData(data);
          toast.success("Resume created! Drafting started.");
          router.push(`/resume-builder/create?id=${result.id}`);
        }
    } catch (e) {
        toast.error("Failed to create draft.");
        console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col text-slate-100 dark">
      <ResumeBuilderHeader 
        maxWidth="max-w-full" 
        showBackToApp={false}
        className="bg-transparent border-b border-white/10 relative z-50 backdrop-blur-md"
        theme="dark"
      >
        <div className="flex items-center gap-3">
             {resumeData && (
                <>
                    {/* Unsaved Changes Indicator */}
                    {isDirty && (
                        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider animate-pulse mr-2">
                            Unsaved
                        </span>
                    )}

                    {/* Manual Save Button */}
                    <Button 
                        variant={isDirty ? "default" : "secondary"}
                        size="sm"
                        className={isDirty ? "bg-amber-500 hover:bg-amber-600 text-black border-none" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"}
                        onClick={async () => {
                            if (!resumeData || !idParam) return;
                            setIsSaving(true);
                            try {
                                await saveDraft({
                                    content: resumeData,
                                    theme,
                                    id: idParam,
                                    slug 
                                });
                                lastSavedData.current = JSON.stringify(resumeData);
                                toast.success("Saved successfully");
                            } catch (e) {
                                console.error("Save Failed", e);
                                toast.error("Failed to save");
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        disabled={isSaving || !idParam}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Layout className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                    
                    <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

                    {/* Theme Selector */}
                    <div className="flex items-center space-x-2 hidden sm:flex">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Theme</span>
                        <Select
                        value={theme}
                        onValueChange={(val: any) => setTheme(val)}
                        >
                        <SelectTrigger className="w-[130px] h-8 bg-white/5 border-white/10 text-slate-200 text-xs">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="portfolio">Portfolio</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="visual">Visual</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    {resumeData && (
                        <SectionManager data={resumeData} onUpdate={setResumeData} />
                    )}

                    {/* Publish Dialog Trigger */}
                    <Dialog>
                        <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setPublishedUrl(null)} className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20 ml-2">
                            <Share2 className="w-4 h-4 mr-2" />
                            Publish
                        </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{idParam ? "Update your Resume" : "Publish your Resume"}</DialogTitle>
                            <DialogDescription>
                            {idParam ? "Save changes to your existing resume." : "Choose a unique URL for your resume."}
                            </DialogDescription>
                        </DialogHeader>
                        
                        {!publishedUrl ? (
                            <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Public URL</Label>
                                <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm">docaider.com/p/</span>
                                <Input 
                                    placeholder="your-name" 
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                />
                                </div>
                            </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{idParam ? "Resume Updated!" : "Resume Published!"}</h3>
                                <p className="text-slate-500">Your resume is now live at:</p>
                            </div>
                            <div className="p-3 bg-slate-100 rounded-lg text-sm font-mono break-all">
                                <Link href={publishedUrl} target="_blank" className="text-blue-600 hover:underline">
                                {window.location.origin}{publishedUrl}
                                </Link>
                            </div>
                            </div>
                        )}

                        <DialogFooter>
                            {!publishedUrl ? (
                            <Button 
                                onClick={async () => {
                                if (!resumeData || !slug) return;
                                setIsPublishing(true);
                                try {
                                    const result = await saveDraft({
                                    content: resumeData,
                                    theme,
                                    slug,
                                    id: idParam || undefined,
                                    });
                                    const pubResult = await publishResume({
                                        content: resumeData,
                                        theme,
                                        slug,
                                        id: idParam || undefined
                                    });
                                    
                                    setPublishedUrl(pubResult.url);
                                    toast.success(idParam ? "Updated successfully!" : "Published successfully!");
                                } catch (err) {
                                    toast.error("Failed to publish. Slug might be taken.");
                                } finally {
                                    setIsPublishing(false);
                                }
                                }}
                                disabled={isPublishing || !slug}
                            >
                                {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {idParam ? "Update Now" : "Publish Now"}
                            </Button>
                            ) : (
                            <Button variant="outline" asChild>
                                <Link href={publishedUrl} target="_blank">View Live Resume</Link>
                            </Button>
                            )}
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
             )}
        </div>
      </ResumeBuilderHeader>

      <main className="flex-1 flex overflow-hidden">
        {/* Full Screen Preview with Inline Edit */}
        <div className="w-full h-[calc(100vh-100px)] bg-slate-950 overflow-y-auto flex items-start justify-center p-8 bg-dot-white/[0.2]">
            {isLoading ? (
                <div className="h-full flex items-center justify-center">
                     <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : resumeData ? (
                <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 light">

                    <ResumePreview 
                        data={resumeData} 
                        theme={theme} 
                        onUpdate={(newData) => setResumeData(newData)}
                    />
                </div>
            ) : (
                <ResumeUploader onUploadSuccess={handleUploadSuccess} />
            )}
        </div>
      </main>
    </div>
  );
}
