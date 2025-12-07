"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { saveDraft } from "@/app/actions/resume";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";
import { getThemeById, THEME_DEMOS } from "@/lib/themes";
import { GashaponReveal } from "@/components/resume/shared/GashaponReveal";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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

export function ResumeCreationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const themeParam = searchParams.get("theme");
  const [theme, setTheme] = useState<any>(themeParam || "modern");
  const [isLoading, setIsLoading] = useState(false);
  const [scannerState, setScannerState] = useState<{ active: boolean; color: string }>({ active: false, color: '' });
  const [revealData, setRevealData] = useState<ResumeData | null>(null);

  // Ensure URL defaults to modern theme
  useEffect(() => {
    if (!themeParam) {
      router.replace("/resume-builder/create?theme=modern");
    }
  }, [themeParam, router]);

  // Auto-creation handle
  useEffect(() => {
     const autoCreate = searchParams.get("auto") === "true";
     
     if (autoCreate && themeParam) {
        const initAuto = async () => {
            setIsLoading(true);
            const { getThemeById } = await import("@/lib/themes");
            const demoTheme = getThemeById(themeParam);
            
            if (demoTheme) {
                try {
                    const result = await saveDraft({
                        content: demoTheme.data as any,
                        theme: themeParam,
                        slug: `${demoTheme.data.personalInfo.fullName?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
                    });
                    if (result.success && result.id) {
                        toast.success("Template initialized!");
                        router.replace(`/resume-builder/${result.id}/edit`);
                    }
                } catch(e) {
                     console.error("Auto-create failed", e);
                     toast.error("Failed to create template");
                     setIsLoading(false);
                }
            }
        };
        initAuto();
     }
  }, [searchParams, themeParam, router]);

  const handleUploadSuccess = async (data: ResumeData) => {
    // Generate slug
    const slug = `${data.personalInfo.fullName?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    setIsLoading(true);

    try {
        // Save initial draft
        const result = await saveDraft({
            content: data,
            theme: theme,
            slug: slug
        });
        
        if (result.success && result.id) {
             // Redirect to Edit Page
            router.prefetch(`/resume-builder/${result.id}/edit`);
            router.push(`/resume-builder/${result.id}/edit`);
        } else {
            toast.error("Failed to save resume");
            setIsLoading(false);
        }
    } catch (error) {
        console.error("Failed to create resume", error);
        toast.error("Something went wrong");
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
      setTheme(newThemeId);
      router.replace(`/resume-builder/create?theme=${newThemeId}`, { scroll: false });
  };
  
  const activePreviewTheme = themeParam ? getThemeById(themeParam) : getThemeById("modern");

  const handleScannerStateChange = useCallback((active: boolean, color?: string) => {
    setScannerState(prev => {
        if (prev.active === active && prev.color === (color || '')) return prev;
        return { active, color: color || '' };
    });
  }, []);

  const handleCreateFromTemplate = async () => {
    if (!activePreviewTheme) return;
    
    setIsLoading(true);
    try {
        const result = await saveDraft({
            content: activePreviewTheme.data as any,
            theme: (themeParam || "modern") as any,
            slug: `${activePreviewTheme.data.personalInfo.fullName?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        });
        
        if (result.success && result.id) {
            toast.success("Template initialized!");
            router.prefetch(`/resume-builder/${result.id}/edit`);
            router.push(`/resume-builder/${result.id}/edit`);
        }
    } catch(e) {
         console.error("Template creation failed", e);
         toast.error("Failed to create template");
         setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col text-slate-100 dark">
      <ResumeBuilderHeader 
        maxWidth="max-w-full" 
        showBackToApp={true}
        className="bg-transparent border-b border-white/10 relative z-50 backdrop-blur-md"
        theme="dark"
      />

       {/* Transition Loader */}
       <AnimatePresence>
            {isLoading && (
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

      <main className="flex-1 flex overflow-hidden relative">
        <div className="w-full h-[calc(100vh-70px)] flex flex-col md:flex-row items-center justify-center p-6 gap-12 relative overflow-hidden">
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
                        className="w-[400px] aspect-[1/1.4]"
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
                    onReadyToReveal={setRevealData}
                    onLoadingStateChange={handleScannerStateChange}
                    onCreateFromTemplate={handleCreateFromTemplate}
                    templateName={activePreviewTheme?.name}
                />
            </div>
        </div>
      </main>
      
      {revealData && (
        <GashaponReveal 
            data={revealData} 
            onComplete={() => handleUploadSuccess(revealData)} 
        />
      )}
    </div>
  );
}
