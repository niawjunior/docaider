"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Upload, Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { publishResume, getResumeById, saveDraft } from "@/app/actions/resume";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";
import { SectionManager } from "./shared/SectionManager";

import { getThemeById, THEME_DEMOS } from "@/lib/themes";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { GashaponReveal } from "./shared/GashaponReveal";

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useSpring(useTransform(y, [-300, 300], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-10, 10]), { stiffness: 150, damping: 20 });
  
  // Holographic glare effect
  const glareX = useTransform(x, [-300, 300], [0, 100]);
  const glareY = useTransform(y, [-300, 300], [0, 100]);

  return (
    <motion.div
      style={{ perspective: 1000 }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="w-full h-full transform-style-3d relative transition-all duration-200"
      >
        {children}
        
        {/* Holographic Overlay */}
        <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-xl z-50 mix-blend-overlay"
            style={{ 
                backgroundPosition: `${glareX}% ${glareY}%`,
                opacity: useTransform(x, [-300, 0, 300], [0, 0.5, 0]) 
            }}
        />
      </motion.div>
    </motion.div>
  );
}

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
  const [isRevealing, setIsRevealing] = useState(false);
  const [pendingData, setPendingData] = useState<ResumeData | null>(null);
  const [scannerState, setScannerState] = useState<{ active: boolean; color: string }>({ active: false, color: '' });
  // Removed internal import state, now handled via redirection
  const lastSavedData = useRef<string>("");

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
                        // Redirect to the new dedicated edit route
                        router.replace(`/resume-builder/${result.id}/edit`);
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
    // Stage data for reveal
    setPendingData(data);
    setIsRevealing(true);
  };

  const handleRevealComplete = async () => {
    if (!pendingData) return;
    
    // 1. Don't turn off isRevealing yet. We want to hide the transition.
    // setIsRevealing(false); // <--- REMOVED
    
    setIsLoading(true); // Show global loader overlay if Gashapon unmounts (backup)

    try {
        // 2. Save the pending data as a draft
        const result = await saveDraft({
            content: pendingData,
            theme: theme,
            slug: slug || `${pendingData.personalInfo.fullName?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        });
        
        if (result.success && result.id) {
            setResumeData(pendingData);
            // 3. Force hard redirect to the new Edit URL
            // Prefetch to make it faster
            router.prefetch(`/resume-builder/${result.id}/edit`);
            router.push(`/resume-builder/${result.id}/edit`);
            
            // NOTE: We do NOT set isRevealing(false) here. 
            // We let the page navigation unmount this component entirely.
            // This prevents the "flash" of the Create User Interface.
        } else {
            toast.error("Failed to save resume");
            setIsRevealing(false); // Only close if error
            setIsLoading(false);
        }
    } catch (error) {
        console.error("Failed to create resume from reveal", error);
        toast.error("Something went wrong");
        setIsRevealing(false); // Only close if error
        setIsLoading(false);
    }
  };

  const cycleTheme = (direction: 'next' | 'prev') => {
      const currentId = themeParam || THEME_DEMOS[0].id;
      const currentIndex = THEME_DEMOS.findIndex(t => t.id === currentId);
      
      let newIndex;
      if (direction === 'next') {
          newIndex = (currentIndex + 1) % THEME_DEMOS.length;
      } else {
          newIndex = (currentIndex - 1 + THEME_DEMOS.length) % THEME_DEMOS.length;
      }
      
      const newThemeId = THEME_DEMOS[newIndex].id;
      setTheme(newThemeId as any);
      router.replace(`/resume-builder/create?theme=${newThemeId}`, { scroll: false });
  };
  
  // Ensure we have a default theme for preview if none selected
  const activePreviewTheme = themeParam ? getThemeById(themeParam) : getThemeById("modern");

  const handleScannerStateChange = useCallback((active: boolean, color?: string) => {
    setScannerState(prev => {
        // Prevent unnecessary state updates
        if (prev.active === active && prev.color === (color || '')) return prev;
        return { active, color: color || '' };
    });
  }, []);

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
            {isRevealing && pendingData && (
                <GashaponReveal onComplete={handleRevealComplete} data={pendingData} />
            )}
            
            {/* Transition Loader: Shows when we are redirecting after reveal */}
            {isLoading && isRevealing && (
                <motion.div 
                    initial={{ opacity: 0 }}
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
            ) : resumeData ? (
                <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 light">

                    <ResumePreview 
                        data={resumeData} 
                        theme={theme} 
                        onUpdate={(newData) => setResumeData(newData)}
                        readOnly={isViewMode} // Pass readOnly state
                    />
                </div>
            ) : (
                <div className="w-full h-full flex flex-col md:flex-row items-center justify-center p-6 gap-12 relative overflow-hidden">
                    {/* Ambient Background */}
                    {/* Ambient Background */}
                    <div className="absolute inset-0 opacity-10 blur-3xl scale-110 pointer-events-none transition-all duration-1000">
                         {activePreviewTheme && (
                            <div className="scale-[0.5] origin-center opacity-50">
                                <ResumePreview data={activePreviewTheme.data as any} theme={activePreviewTheme.id as any} />
                            </div>
                         )}
                    </div>

                    {/* 3D Preview Card (Desktop) */}
                    <div className="hidden lg:block relative z-10 perspective-1000">
                        {/* Navigation Buttons (Static) */}
                        <div className="absolute top-1/2 -left-16 -translate-y-1/2 z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => cycleTheme('prev')}
                                className="rounded-full bg-white/5 hover:bg-white/20 text-white border border-white/10 hover:scale-110 transition-all hover:border-blue-500/50"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="absolute top-1/2 -right-16 -translate-y-1/2 z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => cycleTheme('next')}
                                className="rounded-full bg-white/5 hover:bg-white/20 text-white border border-white/10 hover:scale-110 transition-all hover:border-blue-500/50"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Animated Card */}
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activePreviewTheme?.id}
                                initial={{ opacity: 0, x: -100, rotateY: -20 }}
                                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                exit={{ opacity: 0, x: 100, rotateY: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-[350px] aspect-[1/1.4]"
                            >
                                <TiltCard className="w-full h-full">
                                <div className={cn(
                                    "w-full h-full bg-slate-900 rounded-xl overflow-hidden border shadow-2xl relative group ring-1 ring-white/10 transition-all duration-500",
                                    scannerState.active 
                                        ? `border-${scannerState.color.split('-')[1]}-500 shadow-[0_0_50px_-10px_rgba(var(--${scannerState.color.split('-')[1]}-500),0.5)]` 
                                        : "border-white/10"
                                )}>
                                     {/* Scanning Laser Effect */ }
                                     {scannerState.active && (
                                        <div className="absolute inset-0 z-40 pointer-events-none">
                                            <motion.div 
                                                className={cn("absolute top-0 left-0 right-0 h-[2px] shadow-[0_0_20px_2px_currentColor] z-50", scannerState.color.replace('bg-', 'text-').replace('-500', '-400'))}
                                                animate={{ top: ["0%", "100%"] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />
                                            <motion.div 
                                                className={cn("absolute top-0 left-0 right-0 bg-gradient-to-b from-transparent to-current opacity-20", scannerState.color.replace('bg-', 'text-').replace('-500', '-500'))}
                                                style={{ height: "20%" }}
                                                animate={{ top: ["-20%", "100%"] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />
                                            {/* Grid overlay that reveals */}
                                            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 mix-blend-overlay" />
                                        </div>
                                     )}

                                     {/* Card High-Res Preview */}
                                     {activePreviewTheme && (
                                         <div className={cn(
                                             "absolute inset-0 w-[200%] h-[200%] scale-[0.5] origin-top-left pointer-events-none bg-slate-950 transition-all duration-500",
                                             scannerState.active ? "opacity-50 grayscale brightness-150 contrast-125" : "opacity-100"
                                         )}>
                                              <ResumePreview 
                                                data={activePreviewTheme.data as any} 
                                                theme={activePreviewTheme.id as any} 
                                              />
                                         </div>
                                     )}
                                     
                                     {/* Card Info Overlay */}
                                     <div className="absolute bottom-6 left-6 right-6 z-30">
                                        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl">
                                            <h3 className="text-white font-bold text-lg mb-1">{activePreviewTheme?.name}</h3>
                                            <p className="text-slate-400 text-sm leading-snug">{activePreviewTheme?.description}</p>
                                        </div>
                                     </div>
                                </div>
                            </TiltCard>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Uploader Section */}
                    <div className="relative z-20 w-full max-w-xl bg-slate-950/80 ml-[40px] backdrop-blur-sm p-8 rounded-3xl border border-white/5 shadow-2xl">
                        <ResumeUploader 
                            onUploadSuccess={handleUploadSuccess} 
                            onLoadingStateChange={handleScannerStateChange}
                        />
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
