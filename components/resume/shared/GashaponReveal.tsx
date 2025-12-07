"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeData {
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
  };
}

interface GashaponRevealProps {
  onComplete: () => void;
  onRevealStart?: () => void;
  data: ResumeData;
}

type RevealStatus = 'ready' | 'finalizing' | 'exiting';

export function GashaponReveal({ onComplete, onRevealStart, data }: GashaponRevealProps) {
  const [status, setStatus] = useState<RevealStatus>('ready');

  // Extract personalization
  const firstName = data.personalInfo.fullName?.split(' ')[0] || "User";

  const handleReveal = () => {
    setStatus('finalizing');
    if (onRevealStart) onRevealStart();
    
    // Simulate final polish/loading
    setTimeout(() => {
        // Trigger parent loading state immediately (Transition to Workspace)
        onComplete();
    }, 1500);
  };

  const showLoading = status === 'finalizing' || status === 'exiting';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
      <AnimatePresence>
        {status !== 'exiting' && (
          <motion.div
             key="reveal-overlay"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             className="absolute inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center p-6"
          >
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative max-w-sm w-full bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden"
              >
                 {/* Decorative Gradient Blob */}
                 <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                 <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                 <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-inner relative">
                        {showLoading ? (
                             <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                            </motion.div>
                        ) : (
                             <motion.div
                                key="ready"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Sparkles className="w-8 h-8 text-white/80" />
                            </motion.div>
                        )}
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium tracking-wide uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            {showLoading ? "Finalizing..." : "Optimization Complete"}
                        </div>
                        <h2 className="text-2xl font-semibold text-white tracking-tight">
                            {showLoading ? "Polishing details..." : `Ready for you, ${firstName}`}
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed min-h-[40px]">
                            {showLoading 
                                ? "Applying final formatting touches and verifying data integrity."
                                : "Your professional profile has been synthesized and optimized for this workspace."
                            }
                        </p>
                    </div>

                    {/* Action */}
                    <Button 
                        onClick={handleReveal}
                        disabled={showLoading}
                        className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-80 disabled:cursor-wait"
                    >
                        {showLoading ? (
                            <span className="flex items-center gap-2">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                                />
                                Finalizing...
                            </span>
                        ) : (
                            <>
                                Reveal Resume
                                <ArrowRight className="w-4 h-4 ml-2 opacity-60" />
                            </>
                        )}
                    </Button>
                 </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
