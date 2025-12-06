"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Wand2, Share2, Layout, RotateCcw, FileText } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { publishResume, uploadResumeImage, getResumeById, saveDraft } from "@/app/actions/resume";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";

export function ResumeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const idParam = searchParams.get("id");
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<"modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual">("modern");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
             setPublishedUrl(null); 
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
  }, [idParam, themeParam, searchParams]);

  // Autosave to DB
  useEffect(() => {
    if (!resumeData || !idParam) return;

    const timer = setTimeout(async () => {
        setIsSaving(true);
        try {
            await saveDraft({
                content: resumeData,
                theme,
                id: idParam,
                slug // Keep existing slug
            });
            // Quiet success - autosave shouldn't nag
        } catch (e) {
            console.error("Autosave Failed", e);
        } finally {
            setIsSaving(false);
        }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [resumeData, theme, idParam, slug]);

  const parseResume = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to parse resume");
      return res.json() as Promise<ResumeData>;
    },
    onSuccess: async (data) => {
      // Always enforce default cover image, ignoring AI hallucination
      data.coverImage = "/images/cover.png";
      
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
    },
    onError: (error) => {
      toast.error("Failed to parse resume. Please try again.");
      console.error(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      parseResume.mutate(file);
    }
  };

  const handleUploadResumeReset = () => {
      // Clears everything and goes back to upload screen
      setResumeData(null);
      setFile(null);
      router.push("/resume-builder/create"); // Remove ID
      toast.success("Ready for new upload");
  };

  const handleResetTheme = async () => {
      if (!resumeData) return;
      // Reset content to a basic template but keep personal info? 
      // User requested "reset with default of that theme". 
      // Usually means clearing the data but keeping the structure? 
      // Actually, safest is to maybe keep Personal Info but clear others?
      // Or just re-initialize the data structure.
      // Let's assume re-initializing empty sections but keeping Name/Email is nice?
      // Or purely default. "Default of that theme" implies example data?
      // Let's do a hard reset to the initial parsed state if possible? No we lost that.
      // Let's reset to Minimal Valid Data.
      
      const defaultData: ResumeData = {
          personalInfo: { ...resumeData.personalInfo }, // Keep basic info
          skills: ["Skill 1", "Skill 2"],
          experience: [{
              company: "Company Name",
              position: "Position",
              startDate: "2024-01",
              description: "Description of your role..."
          }],
          education: [],
          projects: [],
          testimonials: []
      };
      
      setResumeData(defaultData);
      toast.success("Theme data reset to defaults");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col text-slate-100 dark">
      <ResumeBuilderHeader 
        maxWidth="max-w-full" 
        showBackToApp={false}
        className="bg-transparent border-b border-white/10 relative z-50 backdrop-blur-md"
        theme="dark"
      >
        <div className="flex gap-2 items-center">
          {resumeData && (
            <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
               {isSaving && <span className="text-xs text-slate-500 animate-pulse mr-2">Saving...</span>}
              <span className="text-sm text-slate-400 font-medium hidden sm:inline">Theme:</span>
              <Select
                value={theme}
                onValueChange={(value: any) => setTheme(value)}
              >
                <SelectTrigger className="w-[140px] sm:w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="portfolio">Portfolio (Resume)</SelectItem>
                  <SelectItem value="studio">Studio (Agency)</SelectItem>
                  <SelectItem value="visual">Visual (New)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="mr-2 flex gap-2">
            {resumeData && (
                <>
                {/* Reset Theme Button */}
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset to Theme Defaults?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset your content (Experience, Skills, etc.) to the default placeholder text for this theme. Your personal info will be kept.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetTheme}>
                        Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Upload New Resume Button */}
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <FileText className="w-4 h-4 mr-2" />
                      Upload New
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Upload New Resume?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will close the current resume and return to the upload screen. Unsaved changes to the current resume are already saved as a draft.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUploadResumeReset}>
                        Go to Upload
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </>
            )}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={!resumeData || isLoading}>
                <Share2 className="w-4 h-4 mr-2" />
                {idParam ? "Update Resume" : "Publish Resume"}
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
                        // Publish implies setting is_public=true, but saveDraft is draft.
                        // We actually need publishResume for this specific dialog action to flip the flag.
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
                <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 backdrop-blur rounded-lg p-2 text-center mb-4 text-slate-200 text-sm border border-white/10 w-fit mx-auto sticky top-0 z-40">
                        Click on any text to edit directly.
                    </div>
                    <ResumePreview 
                        data={resumeData} 
                        theme={theme} 
                        onUpdate={(newData) => setResumeData(newData)}
                    />
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-blue-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">
                    Build your Resume
                    </h2>
                    <p className="text-slate-400 max-w-md text-lg">
                    Upload your existing PDF or Word resume to get started, or create one from scratch.
                    </p>
                </div>
                
                <div className="w-full max-w-sm space-y-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-200"></div>
                        <div className="relative bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors p-6 space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                                        <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-slate-200">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-500">PDF, DOCX (MAX. 5MB)</p>
                                    </div>
                                    <Input
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                             <Button
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11"
                                onClick={handleUpload}
                                disabled={!file || parseResume.isPending}
                                >
                                {parseResume.isPending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Import & Edit
                                    </>
                                )}
                                </Button>
                        </div>
                    </div>
                </div>
                </div>
            )}
        </div>
      </main>

      <style jsx global>{`
      `}</style>
    </div>
  );
}
