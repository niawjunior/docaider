"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Share2, Layout } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { publishResume, getResumeById, saveDraft } from "@/app/actions/resume";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";
import { SectionManager } from "./shared/SectionManager";


import { AnimatePresence, motion } from "framer-motion";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewMode, setIsViewMode] = useState(false);

  // Removed internal import state, now handled via redirection
  const lastSavedData = useRef<string>("");

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

             // setPublishedUrl(null); // Keep existing publishedUrl if any (e.g. from just publishing)
             lastSavedData.current = JSON.stringify(data.content);
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

  // Track unsaved changes
  const isDirty = JSON.stringify(resumeData) !== lastSavedData.current;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col text-slate-100 dark">
      {!isViewMode && (
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
                        <span className="text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider">Theme</span>
                        <Select
                        value={theme}
                        onValueChange={(val: any) => setTheme(val)}
                        >
                        <SelectTrigger className="w-[130px] h-8 text-slate-300 hover:text-white hover:bg-white/10 bg-white/5 border-white/10 text-xs">
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

                    {/* Main Actions Dropdown */}
                    <Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20 ml-2 gap-2">
                                    Finish
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-200">
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onClick={() => setPublishedUrl(null)} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white gap-2">
                                        <Share2 className="w-4 h-4" />
                                        Publish
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem onClick={() => setIsViewMode(true)} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white gap-2">
                                    <Eye className="w-4 h-4" />
                                    View Mode
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

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
      )}

      {/* View Mode Exit Button (Floating) */}
      {isViewMode && (
          <div className="fixed top-4 right-4 z-50">
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

            
            {/* Transition Loader: Shows when we are redirecting after reveal */}
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
        
        {/* Full Screen Preview with Inline Edit */}
        <div className={cn(
             "w-full bg-slate-950 overflow-y-auto flex items-start justify-center bg-dot-white/[0.2]",
             isViewMode ? "h-screen p-0" : "h-[calc(100vh-100px)] p-8"
        )}>
            {isLoading ? (
                <div className="h-full flex items-center justify-center">
                     <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : (idParam && resumeData) ? (
                <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 light">

                    <ResumePreview 
                        data={resumeData} 
                        theme={theme} 
                        onUpdate={(newData) => setResumeData(newData)}
                        readOnly={isViewMode} // Pass readOnly state
                    />
                </div>
            ) : null}
        </div>

      </main>
    </div>
  );
}
