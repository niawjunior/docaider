import { PDFExportDialog } from "@/components/resume/PDFExportDialog";
import { Loader2, Share2, Layout, Monitor, Tablet, Smartphone, Eye, ChevronDown, Calendar, Lock, Globe, Download, AlertCircle } from "lucide-react";
import { ResumeData } from "@/lib/schemas/resume";
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { publishResume, saveDraft } from "@/app/actions/resume";
import { SectionManager } from "@/components/resume/shared/SectionManager";
import { AVAILABLE_THEMES } from "@/lib/themes/registry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeSelector } from "./ThemeSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResumeEditorControlsProps {
    resumeData: ResumeData | null;
    setResumeData: (data: ResumeData) => void;
    isDirty: boolean;
    isSaving: boolean;
    onSave: () => void;
    viewport: "desktop" | "tablet" | "mobile";
    setViewport: (v: "desktop" | "tablet" | "mobile") => void;
    theme: string;
    setTheme: (t: any) => void;
    isPublishing: boolean;
    setIsPublishing: (v: boolean) => void;
    publishedUrl: string | null;
    setPublishedUrl: (v: string | null) => void;
    visibility: "public" | "private";
    setVisibility: (v: "public" | "private") => void;
    slug: string;
    setSlug: (v: string) => void;
    idParam?: string | null;
    setIsViewMode: (v: boolean) => void;
}

export function ResumeEditorControls({
    resumeData,
    setResumeData,
    isDirty,
    isSaving,
    onSave,
    viewport,
    setViewport,
    theme,
    setTheme,
    isPublishing,
    setIsPublishing,
    publishedUrl,
    setPublishedUrl,
    visibility,
    setVisibility,
    slug,
    setSlug,
    idParam,
    setIsViewMode
}: ResumeEditorControlsProps) {
    const [showPdfExport, setShowPdfExport] = useState(false);
    
    // Check if current theme is a web theme
    const activeThemeConfig = AVAILABLE_THEMES.find(t => t.id === theme);
    const isWebTheme = activeThemeConfig?.type === 'web';

    return (
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
                        onClick={onSave}
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

                    {/* Viewport Toggles - Available for ALL themes */}
                    <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/5 mr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("w-8 h-8 rounded-md transition-all", viewport === "desktop" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5")}
                            onClick={() => setViewport("desktop")}
                            title="Desktop View"
                        >
                            <Monitor className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost" 
                            size="icon"
                            className={cn("w-8 h-8 rounded-md transition-all", viewport === "tablet" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5")}
                            onClick={() => setViewport("tablet")}
                            title="Tablet View"
                        >
                            <Tablet className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon" 
                            className={cn("w-8 h-8 rounded-md transition-all", viewport === "mobile" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5")}
                            onClick={() => setViewport("mobile")}
                            title="Mobile View"
                        >
                            <Smartphone className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

                    {/* Theme Selector */}
                    <div className="hidden sm:block">
                        <ThemeSelector 
                            currentTheme={theme} 
                            onThemeChange={setTheme} 
                        />
                    </div>

                    {resumeData && (
                        <SectionManager data={resumeData} onUpdate={setResumeData} />
                    )}

                    {/* Main Actions Dropdown */}
                    <Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20 ml-2 gap-2 w-[120px] flex">
                                    Finish
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onClick={() => setPublishedUrl(null)} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white gap-2">
                                        <Share2 className="w-4 h-4" />
                                        Publish to Web
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                  {idParam && (
                                    <>
                                        <DropdownMenuSeparator className="bg-slate-800" />
                                        
                                        {isWebTheme ? (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div className="outline-none">
                                                            <DropdownMenuItem disabled className="cursor-not-allowed opacity-50 gap-2">
                                                                <Download className="w-4 h-4" />
                                                                Download PDF
                                                            </DropdownMenuItem>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left" className="bg-slate-800 text-slate-200 border-slate-700 max-w-[200px]">
                                                        <p className="flex items-start gap-2">
                                                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                            <span>PDF export is not available for purely digital web themes. Switch to a Document theme to export.</span>
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <DropdownMenuItem onSelect={() => setShowPdfExport(true)} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white gap-2">
                                                <Download className="w-4 h-4" />
                                                Download PDF
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem onClick={() => setIsViewMode(true)} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white gap-2">
                                    <Eye className="w-4 h-4" />
                                    View Live Mode
                                </DropdownMenuItem>
                              
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DialogContent className="dark text-foreground">
                        <DialogHeader>
                            <DialogTitle>{idParam ? "Update your Resume" : "Publish your Resume"}</DialogTitle>
                            <DialogDescription>
                            {idParam ? "Save changes to your existing resume." : "Choose a unique URL for your resume."}
                            </DialogDescription>
                        </DialogHeader>
                        
                        {!publishedUrl ? (
                            <div className="space-y-6 py-4">
                                <div className="space-y-4">
                                    <Label>Visibility</Label>
                                    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", visibility === "public" ? "bg-green-500/20 text-green-400" : "bg-slate-700/50 text-slate-400")}>
                                                {visibility === "public" ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="font-medium text-sm text-white">
                                                    {visibility === "public" ? "Public Profile" : "Private Link"}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {visibility === "public" ? "Visible in gallery & search engines" : "Only accessible via direct link"}
                                                </div>
                                            </div>
                                        </div>
                                        <Switch 
                                            checked={visibility === "public"}
                                            onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                <Label>Public URL</Label>
                                <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm">docaider.com/p/</span>
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
                                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                    <Share2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{idParam ? "Resume Updated!" : "Resume Published!"}</h3>
                                    <p className="text-slate-500">Your resume is now live at:</p>
                                </div>
                                <div className="p-3 bg-slate-800 rounded-lg text-sm font-mono break-all">
                                    <Link href={publishedUrl} target="_blank" className="text-blue-400 hover:underline">
                                    {window.location.origin}{publishedUrl}
                                    </Link>
                                </div>

                                <div className="pt-4">
                                     <Button variant="secondary" asChild className="w-full h-11 text-base font-medium">
                                        <Link href={publishedUrl} target="_blank">View Live Resume</Link>
                                    </Button>
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
                                    // Save first to ensure latest content is on backend
                                    await saveDraft({
                                        content: resumeData,
                                        theme,
                                        slug,
                                        id: idParam || undefined,
                                    });
                                    const pubResult = await publishResume({
                                        content: resumeData,
                                        theme,
                                        slug,
                                        id: idParam || undefined,
                                        isPublic: visibility === "public"
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
                                {idParam ? "Update Settings" : "Publish Now"}
                            </Button>
                            ) : (
                            <Button variant="outline" onClick={() => setPublishedUrl(null)}>
                                Close
                            </Button>
                            )}
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
             )}
             
            {/* PDF Export Dialog - Controlled */}
            <PDFExportDialog 
                open={showPdfExport} 
                onOpenChange={setShowPdfExport} 
                resumeId={idParam || ""} 
                currentTheme={theme}
            />
        </div>
    );
}
