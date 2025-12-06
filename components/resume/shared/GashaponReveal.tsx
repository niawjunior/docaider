"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Star, Zap, Trophy, Disc, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface ResumeData {
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
  };
  // Add other properties of ResumeData if known, or keep it minimal
}

interface GashaponRevealProps {
  onComplete: () => void;
  data: ResumeData;
}

export function GashaponReveal({ onComplete, data }: GashaponRevealProps) {
  const [phase, setPhase] = useState<"capsule" | "opening" | "revealed">("capsule");
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract personalization
  const firstName = data.personalInfo.fullName?.split(' ')[0] || "there";
  const role = data.personalInfo.jobTitle || "Professional";

  useEffect(() => {
    if (phase === 'revealed') {
      // Confetti burst when revealed
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#60A5FA', '#C084FC', '#F472B6']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#60A5FA', '#C084FC', '#F472B6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [phase]);

  const handleOpen = () => {
    setPhase("opening");
    
    setTimeout(() => {
      setPhase("revealed");
    }, 1500); // Wait for open animation
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: CAPSULE */}
        {phase === "capsule" && (
          <motion.div
            key="capsule"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="relative group cursor-pointer" onClick={handleOpen}>
                {/* Glow Ring */}
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-10 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-2xl group-hover:opacity-60 transition-opacity"
                />
                
                {/* The Capsule */}
                <motion.div
                    animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 0.2, repeat: Infinity, repeatDelay: 3 } // Shake effect
                    }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-48 h-48 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border border-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden ring-4 ring-white/10"
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    <Fingerprint className="w-24 h-24 text-white/40 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Shimmer */}
                    <motion.div
                        className="absolute inset-0 bg-white/20 -skew-x-12"
                        animate={{ x: [-200, 200] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                </motion.div>

                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="text-white/60 text-xs tracking-[0.2em] font-medium">RESUME ENCRYPTED</div>
                        <div className="text-white font-bold text-xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                            TAP TO UNLOCK
                        </div>
                    </motion.div>
                </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: OPENING (Explosion) */}
        {phase === "opening" && (
             <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <motion.div 
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 20, opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="w-full aspect-square bg-white rounded-full"
                 />
             </motion.div>
        )}

        {/* PHASE 3: REVEALED */}
        {phase === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="text-center relative z-10 p-8"
          >
             {/* Rarity Rays */}
             <div className="absolute inset-0 flex items-center justify-center -z-10">
                 <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-[800px] h-[800px] bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent rounded-full" 
                    style={{ maskImage: "conic-gradient(from 0deg, transparent 0deg, black 20deg, transparent 40deg)" }}
                 />
             </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center space-y-6 max-w-lg px-6"
                    >
                         <div className="inline-block px-4 py-1 bg-yellow-500/10 border border-yellow-500/50 rounded-full text-yellow-500 text-xs font-bold tracking-wider mb-4">
                             Successfully Analyzed
                         </div>
                        
                        <h2 className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                            Resume Unlocked!
                        </h2>
                        
                        <div className="space-y-2">
                             <p className="text-slate-300 text-lg leading-relaxed">
                                Hi <span className="text-white font-bold">{firstName}</span>! We've extracted your profile as a <span className="text-blue-400 font-bold">{role}</span>.
                             </p>
                             <p className="text-slate-400 text-sm">
                                Your high-level stats and experience details are ready for review.
                             </p>
                        </div>

                        <motion.button
                            onClick={onComplete}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Zap className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
                                Launch Workspace
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </motion.button>
                    </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
