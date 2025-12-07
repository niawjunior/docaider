"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, X, Wand2, FileIcon } from "lucide-react";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScanAnimation, CircuitAnimation, SparkleAnimation, RocketAnimation } from "@/components/resume/shared/AnimatedIcons";

interface ResumeUploaderProps {
  onUploadSuccess: (data: ResumeData) => void;
  onReadyToReveal: (data: ResumeData) => void;
  isLoading?: boolean;
  onLoadingStateChange?: (isLoading: boolean, colorClass?: string) => void;
}

const PROCESSING_STEPS = [
    { text: "Scanning Document...", icon: ScanAnimation, color: "text-blue-400", subtext: "Analyzing structure and layout..." },
    { text: "Extracting Details...", icon: CircuitAnimation, color: "text-purple-400", subtext: "Identifying skills, experience, and projects..." },
    { text: "Enhancing Content...", icon: SparkleAnimation, color: "text-yellow-400", subtext: "Polishing your professional profile..." },
    { text: "Finalizing...", icon: RocketAnimation, color: "text-green-400", subtext: "Preparing your editor..." }
];

export function ResumeUploader(props: ResumeUploaderProps) {
  const { onUploadSuccess, onReadyToReveal, isLoading: externalLoading } = props;
  const [file, setFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);

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
    onSuccess: async (data: ResumeData) => {
      // Step 1: Processing Finish -> Trigger Reveal UI
       // Always enforce default cover image
      data.coverImage = "/images/cover.png";
      
      // Trigger Reveal UI immediately
      onReadyToReveal(data); 
    },
    onError: (error) => {
      toast.error("Failed to parse resume. Please try again.");
      console.error(error);
      setProcessingStep(0);
      setIsFinalizing(false);
    },
  });



  const isLoading = externalLoading || parseResume.isPending || isFinalizing;
  const { onLoadingStateChange } = props;

  // Sync Loading State with Parent
  useEffect(() => {
      if (onLoadingStateChange) {
          if (isLoading) {
             const stepColor = PROCESSING_STEPS[processingStep].color.replace('text-', 'bg-').replace('-400', '-500');
             onLoadingStateChange(true, stepColor);
          } else {
             onLoadingStateChange(false);
          }
      }
  }, [isLoading, processingStep, onLoadingStateChange]);

  // Multi-step Loading Animation
  useEffect(() => {
      if (isLoading && processingStep < 3) {
          const interval = setInterval(() => {
              setProcessingStep(prev => {
                  if (prev >= 2) {
                      clearInterval(interval);
                      return 2; // Stay at "Enhancing" until success callback triggers step 3
                  }
                  return prev + 1;
              });
          }, 2500); // 2.5s per step
          return () => clearInterval(interval);
      } else if (!isLoading && processingStep !== 3) {
          setProcessingStep(0);
      }
  }, [isLoading, processingStep]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFile(null);
  };

  const handleUpload = () => {
    if (file) {
      setProcessingStep(0);
      parseResume.mutate(file);
    }
  };

  const CurrentStepIcon = PROCESSING_STEPS[processingStep].icon;
  const currentStepColor = PROCESSING_STEPS[processingStep].color;

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-4">
      {/* Animated Header Icon */}
      <div className="relative w-32 h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
              {isLoading ? (
                  <motion.div
                      key="loading"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute inset-0 bg-slate-800/50 rounded-full flex items-center justify-center ring-1 ring-white/10 checkbox-shadow"
                  >
                       {/* Spinning Outer Ring */}
                      <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className={cn("absolute inset-0 border-2 rounded-full border-t-transparent opacity-50", 
                            processingStep === 0 ? "border-blue-500" : 
                            processingStep === 1 ? "border-purple-500" :
                            processingStep === 2 ? "border-yellow-500" : "border-green-500"
                          )}
                      />
                      
                      {/* Icon Transition */}
                      <motion.div
                        key={processingStep}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-24 h-24 p-4"
                      >
                         <CurrentStepIcon className="w-full h-full" color={currentStepColor} />
                      </motion.div>
                  </motion.div>
              ) : (
                  <motion.div
                      key="idle"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-slate-800/50 p-6 rounded-3xl ring-1 ring-white/10 shadow-2xl backdrop-blur-sm"
                  >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                         <Upload className="w-12 h-12 text-blue-400" />
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <div className="space-y-4 max-w-lg min-h-[100px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
             <motion.div
                key={isLoading ? `step-${processingStep}` : "idle-text"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
             >
                 <h2 className={cn("text-3xl font-bold tracking-tight", isLoading ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400" : "text-white")}>
                    {isLoading ? PROCESSING_STEPS[processingStep].text : "Build your Resume"}
                 </h2>
                 <p className="text-slate-400 text-lg leading-relaxed">
                    {isLoading 
                        ? PROCESSING_STEPS[processingStep].subtext 
                        : "Upload your existing PDF or Word resume to get started, or create one from scratch."}
                 </p>
             </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="w-[400px] max-w-full">
        <div className="relative group">
          {/* Glowing Background Effect - Changes color based on step */}
          <div className={cn(
                "absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000",
                !isLoading && "bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600",
                isLoading && processingStep === 0 && "bg-blue-600",
                isLoading && processingStep === 1 && "bg-purple-600",
                isLoading && processingStep === 2 && "bg-yellow-500",
                isLoading && processingStep === 3 && "bg-green-500"
          )}></div>
          
          <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all overflow-hidden shadow-2xl w-full h-[250px]">
            
            <AnimatePresence mode="wait">
                {file && !isLoading ? (
                    // FILE SELECTED STATE
                    <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 space-y-6 flex flex-col justify-center h-full w-full"
                    >
                         <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <div className="p-3 bg-blue-500/10 rounded-lg">
                                 <FileText className="w-6 h-6 text-blue-400" />
                             </div>
                             <div className="flex-1 min-w-0 text-left">
                                 <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                 <p className="text-xs text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                             </div>
                             <button 
                                onClick={handleRemoveFile}
                                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                             >
                                 <X className="w-4 h-4" />
                             </button>
                         </div>

                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium h-12 rounded-lg shadow-lg shadow-blue-900/20"
                            onClick={handleUpload}
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Summarize & Build
                        </Button>
                    </motion.div>
                ) : isLoading ? (
                    // PROCESSING LOADING STATE
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 flex flex-col items-center justify-center space-y-6 h-full w-full"
                    >
                         {/* Progress Bar Container */}
                         <div className="w-full space-y-2">
                             <div className="flex justify-between text-xs font-medium text-slate-400 px-1">
                                <span>Progress</span>
                                <span>{Math.min((processingStep + 1) * 25, 100)}%</span>
                             </div>
                             <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                 <motion.div
                                     className={cn(
                                         "absolute top-0 left-0 h-full transition-colors duration-500",
                                         processingStep === 0 ? "bg-blue-500" :
                                         processingStep === 1 ? "bg-purple-500" :
                                         processingStep === 2 ? "bg-yellow-500" : "bg-green-500"
                                     )}
                                     initial={{ width: "0%" }}
                                     animate={{ width: `${((processingStep + 1) / 4) * 100}%` }}
                                     transition={{ duration: 1.5, ease: "easeInOut" }}
                                 />
                                 
                                 {/* Scanning Shine Effect */}
                                 <motion.div 
                                    className="absolute top-0 bottom-0 w-20 bg-white/30 blur-md"
                                    animate={{ x: [-100, 400] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                 />
                             </div>
                         </div>
                         
                         {/* Step Indicators */}
                         <div className="flex justify-center gap-2">
                             {[0, 1, 2].map((step) => (
                                 <motion.div
                                    key={step}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-colors duration-300",
                                        processingStep >= step ? "bg-white" : "bg-slate-700"
                                    )}
                                    animate={processingStep === step ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                    transition={processingStep === step ? { repeat: Infinity, duration: 1 } : {}}
                                 />
                             ))}
                         </div>
                    </motion.div>
                ) : (
                    // IDLE UPLOAD STATE
                    <motion.div
                         key="upload-idle"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="flex flex-col justify-center w-full h-full"
                    >
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-800/30 transition-all p-6">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center space-y-4">
                                <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/5">
                                    <FileIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-300"><span className="font-semibold text-blue-400">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-slate-500">Support for PDF, DOCX (Max 5MB)</p>
                                </div>
                            </div>
                            <Input
                                type="file"
                                accept=".pdf,.docx,.doc"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </motion.div>
                )}
            </AnimatePresence>
            
          </div>
        </div>
      </div>


    </div>
  );
}
