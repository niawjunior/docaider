"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, CheckCircle, AlertCircle } from "lucide-react";
import { generateResumePDF } from "@/app/actions/pdf";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PDFExportDialogProps {
  resumeId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  currentTheme?: string;
}

type ExportState = "idle" | "generating" | "success" | "error";



export function PDFExportDialog({ resumeId, trigger, open, onOpenChange, className, currentTheme }: PDFExportDialogProps) {
  const [status, setStatus] = useState<ExportState>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [internalOpen, setInternalOpen] = useState(false);

  // Handle controlled vs uncontrolled state
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = (val: boolean) => {
    if (status === "generating" && !val) return; // Prevent closing while generating
    if (isControlled && onOpenChange) onOpenChange(val);
    else setInternalOpen(val);
    
    // Delay reset to avoid flashing "idle" state during close animation
    if (!val) {
        setTimeout(() => resetState(), 300);
    }
  };

  const STEPS = [
    { label: "Preparing Print Layout", color: "text-indigo-400" },
    { label: "Initializing Export Engine", color: "text-sky-400" },
    { label: "Rendering High-Quality PDF", color: "text-rose-400" },
    { label: "Finalizing Document", color: "text-emerald-400" },
  ];

  const handleExport = async () => {
    if (!resumeId) return;
    setStatus("generating");
    setCurrentStep(0);
    
    // Progress simulation - auto advance only to step 2 (Rendering)
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => setCurrentStep(1), 1500)); // To Initializing
    timers.push(setTimeout(() => setCurrentStep(2), 3500)); // To Rendering

    try {
      const result = await generateResumePDF(resumeId, currentTheme);

      // Clear any pending timers if it finished super fast (unlikely but safe)
      timers.forEach(clearTimeout);

      if (result.success && result.pdfBase64) {
        // Show Finalizing step explicitly before success
        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStatus("success");
        
        // Create download
        const byteCharacters = atob(result.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume-${resumeId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("PDF exported successfully!");
      } else {
        throw new Error(result.error || "Generation failed");
      }
    } catch (error: any) {
      timers.forEach(clearTimeout);
      setStatus("error");
      toast.error(error.message || "Failed to generate PDF");
    }
  };

  const resetState = () => {
    setStatus("idle");
    setCurrentStep(0);
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent 
        className={cn("sm:max-w-md dark text-foreground", className)} 
        onPointerDownOutside={(e) => {
            if (status === "generating") e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
            if (status === "generating") e.preventDefault();
        }}
        showCloseButton={status !== "generating"}
      >
        <DialogHeader>
          <DialogTitle>Export Professional PDF</DialogTitle>
          <DialogDescription>
            Generate a high-quality A4 PDF optimized for printing and applicant tracking systems.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[320px] flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
                {status === "idle" && (
                     <motion.div 
                        key="idle"
                        layout // Smooth layout reflow
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="text-center space-y-4 absolute inset-0 flex flex-col items-center justify-center" // Absolute center
                     >
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                             <FileDown className="w-10 h-10" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Ready to generate your resume PDF.
                        </p>
                     </motion.div>
                )}

                {status === "generating" && (
                    <motion.div 
                        key="generating"
                        layout // Smooth layout reflow
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="text-center w-full absolute inset-0 flex flex-col items-center justify-center" // Absolute center
                    >
                         <div className="relative w-32 h-32 mx-auto mb-6">
                            <AnimatePresence mode="wait">
                                {currentStep === 0 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0"
                                    >
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <style>{`
                                                .layout-box { fill: #818CF8; opacity: 0.5; }
                                                .layout-border { stroke: #818CF8; stroke-width: 2; fill: none; }
                                                .anim-header { animation: slideDown 2s infinite ease-in-out; }
                                                .anim-sidebar { animation: slideRight 2s infinite ease-in-out 0.2s; }
                                                .anim-content { animation: slideUp 2s infinite ease-in-out 0.4s; }
                                                @keyframes slideDown { 0% { transform: translateY(-10px); opacity: 0; } 20%, 80% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-10px); opacity: 0; } }
                                                @keyframes slideRight { 0% { transform: translateX(-10px); opacity: 0; } 20%, 80% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-10px); opacity: 0; } }
                                                @keyframes slideUp { 0% { transform: translateY(10px); opacity: 0; } 20%, 80% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(10px); opacity: 0; } }
                                            `}</style>
                                            <rect x="20" y="15" width="60" height="70" rx="2" className="layout-border" />
                                            <rect x="25" y="20" width="50" height="10" rx="1" className="layout-box anim-header" />
                                            <rect x="25" y="35" width="15" height="45" rx="1" className="layout-box anim-sidebar" />
                                            <rect x="45" y="35" width="30" height="45" rx="1" className="layout-box anim-content" />
                                        </svg>
                                    </motion.div>
                                )}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0"
                                    >
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <style>{`
                                                .browser-stroke { stroke: #38BDF8; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
                                                .browser-fill { fill: #38BDF8; }
                                                .spinner { transform-origin: 50px 60px; animation: spin 1.5s linear infinite; }
                                                @keyframes spin { 100% { transform: rotate(360deg); } }
                                            `}</style>
                                            <path className="browser-stroke" d="M15 30H85V75C85 78 82 80 80 80H20C18 80 15 78 15 75V30Z" fill="none"/>
                                            <path className="browser-stroke" d="M15 30V25C15 22 18 20 20 20H80C82 20 85 22 85 25V30" />
                                            <circle cx="25" cy="25" r="2" className="browser-fill" />
                                            <circle cx="32" cy="25" r="2" className="browser-fill" opacity="0.6"/>
                                            <circle cx="39" cy="25" r="2" className="browser-fill" opacity="0.3"/>
                                            <g className="spinner">
                                                <path className="browser-stroke" d="M50 50V53" />
                                                <path className="browser-stroke" d="M50 67V70" />
                                                <path className="browser-stroke" d="M60 60H57" />
                                                <path className="browser-stroke" d="M43 60H40" />
                                                <path className="browser-stroke" d="M57.07 52.93L55 55" />
                                                <path className="browser-stroke" d="M45 65L42.93 67.07" />
                                                <path className="browser-stroke" d="M57.07 67.07L55 65" />
                                                <path className="browser-stroke" d="M45 55L42.93 52.93" />
                                            </g>
                                        </svg>
                                    </motion.div>
                                )}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0"
                                    >
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <style>{`
                                                .pdf-doc { stroke: #FB7185; stroke-width: 4; fill: none; stroke-linejoin: round; }
                                                .pdf-line { stroke: #FB7185; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 40; stroke-dashoffset: 40; }
                                                .line-1 { animation: drawLine 2s infinite ease-out; }
                                                .line-2 { animation: drawLine 2s infinite ease-out 0.3s; }
                                                .line-3 { animation: drawLine 2s infinite ease-out 0.6s; }
                                                @keyframes drawLine {
                                                0% { stroke-dashoffset: 40; }
                                                40% { stroke-dashoffset: 0; }
                                                100% { stroke-dashoffset: 0; }
                                                }
                                            `}</style>
                                            <path className="pdf-doc" d="M30 20H55L75 40V80C75 83 72 85 70 85H30C28 85 25 83 25 80V25C25 22 28 20 30 20Z" />
                                            <path className="pdf-doc" d="M55 20V40H75" strokeWidth="3" />
                                            <path className="pdf-line line-1" d="M35 50H65" />
                                            <path className="pdf-line line-2" d="M35 60H65" />
                                            <path className="pdf-line line-3" d="M35 70H55" />
                                        </svg>
                                    </motion.div>
                                )}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0"
                                    >
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <style>{`
                                                .doc-base { stroke: #34D399; stroke-width: 3; fill: none; opacity: 0.5; }
                                                .stamp-circle { stroke: #34D399; stroke-width: 3; fill: none; }
                                                .check-mark { stroke: #34D399; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; fill: none; }
                                                .stamp-anim { animation: stampIn 2s infinite cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: 65px 65px; }
                                                @keyframes stampIn {
                                                0% { transform: scale(3); opacity: 0; }
                                                30% { transform: scale(1); opacity: 1; }
                                                80% { transform: scale(1); opacity: 1; }
                                                100% { transform: scale(1); opacity: 0; }
                                                }
                                            `}</style>
                                            <rect x="25" y="20" width="50" height="60" rx="4" className="doc-base" />
                                            <line x1="35" y1="35" x2="65" y2="35" className="doc-base" strokeWidth="2"/>
                                            <line x1="35" y1="45" x2="65" y2="45" className="doc-base" strokeWidth="2"/>
                                            <line x1="35" y1="55" x2="50" y2="55" className="doc-base" strokeWidth="2"/>
                                            <g className="stamp-anim">
                                                <circle cx="65" cy="65" r="15" className="stamp-circle" fill="#ECFDF5" /> 
                                                <path className="check-mark" d="M58 65L63 70L72 60" />
                                            </g>
                                        </svg>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                         </div>

                        <motion.p 
                            key={currentStep}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("text-lg font-semibold", STEPS[currentStep].color)}
                        >
                            {STEPS[currentStep].label}
                        </motion.p>
                        
                        <div className="flex gap-1 justify-center mt-2">
                             {STEPS.map((_, i) => (
                                 <motion.div 
                                    key={i}
                                    className={cn("h-1 rounded-full bg-slate-200 dark:bg-slate-700", i === currentStep ? STEPS[currentStep].color.replace('text-', 'bg-') : "")}
                                    animate={{ width: i === currentStep ? 24 : 8, opacity: i === currentStep ? 1 : 0.3 }}
                                 />
                             ))}
                        </div>
                    </motion.div>
                )}

                {status === "success" && (
                    <motion.div 
                        key="success"
                        layout
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center space-y-4 absolute inset-0 flex flex-col items-center justify-center"
                    >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                             <CheckCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Export Complete!</h3>
                            <p className="text-sm text-muted-foreground">Your PDF has been downloaded.</p>
                        </div>
                    </motion.div>
                )}

                 {status === "error" && (
                    <motion.div 
                        key="error"
                        layout
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center space-y-4 absolute inset-0 flex flex-col items-center justify-center"
                    >
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                             <AlertCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-red-600">Export Failed</h3>
                            <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
            {status === "idle" ? (
                <>
                     <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
                     <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white">
                        Generate PDF
                     </Button>
                </>
            ) : status === "generating" ? (
                <Button disabled className="w-full">
                    Processing...
                </Button>
            ) : (
                <Button onClick={() => setShow(false)} className="w-full" variant="secondary">
                    Close
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
