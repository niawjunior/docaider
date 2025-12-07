"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { Briefcase, Code2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typewriter } from "./Typewriter";
import { ResumeData } from "@/lib/schemas/resume";

interface GashaponRevealProps {
  onComplete: () => void;
  // onRevealStart is optional but not used in new design really, can keep for compat
  onRevealStart?: () => void; 
  data: ResumeData;
}

export function GashaponReveal({ onComplete, data }: GashaponRevealProps) {
  // Extract personalization
  const fullName = data.personalInfo?.fullName || "User";
  const firstName = fullName.split(' ')[0];
  const jobTitle = data.personalInfo?.jobTitle || "Professional";
  const company = data.experience?.[0]?.company || "your current role";
  const topSkills = data.skills?.slice(0, 3).join(", ") || "key technologies";
  
  // Sequencing state
  const [sequenceStep, setSequenceStep] = useState(0);

  const nextStep = useCallback(() => {
    setSequenceStep(prev => prev + 1);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
      <AnimatePresence>
        <motion.div
           key="main-card"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           exit="exit"
           className="bg-white dark:bg-slate-900 w-full max-w-5xl min-h-[500px] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row"
        >
            {/* Illustration Section */}
            <div className="w-full md:w-5/12 bg-slate-50 dark:bg-slate-800/50 p-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                
                {/* Abstract Composition */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative z-10 w-full max-w-xs aspect-square"
                >
                     <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                     
                     {/* Floating Icons Configuration */}
                     <div className="relative z-10 h-full w-full">
                        <motion.div 
                            initial={{ x: -20, y: 20, opacity: 0 }}
                            animate={{ 
                                x: 0, 
                                y: [0, -10, 0],
                                opacity: 1 
                            }}
                            transition={{ 
                                delay: 0.5,
                                y: {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="absolute top-0 right-0 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 w-24 h-24 cursor-pointer"
                        >
                            <Briefcase className="w-8 h-8 text-blue-500" />
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Work</span>
                        </motion.div>

                        <motion.div 
                             initial={{ x: 20, y: 20, opacity: 0 }}
                             animate={{ 
                                 x: 0, 
                                 y: [0, 10, 0],
                                 opacity: 1 
                             }}
                             transition={{ 
                                 delay: 0.6,
                                 y: {
                                     duration: 5,
                                     repeat: Infinity,
                                     ease: "easeInOut",
                                     delay: 1 // offset
                                 }
                             }}
                             whileHover={{ scale: 1.1, rotate: -5 }}
                             className="absolute bottom-8 left-0 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 w-24 h-24 cursor-pointer"
                        >
                            <Code2 className="w-8 h-8 text-purple-500" />
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Skills</span>
                        </motion.div>

                        <motion.div 
                             initial={{ y: -20, opacity: 0 }}
                             animate={{ 
                                 y: [0, -8, 0],
                                 opacity: 1 
                             }}
                             transition={{ 
                                 delay: 0.7,
                                 y: {
                                     duration: 3.5,
                                     repeat: Infinity,
                                     ease: "easeInOut",
                                     delay: 0.5
                                 }
                             }}
                             whileHover={{ scale: 1.1, rotate: 10 }}
                             className="absolute bottom-0 right-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 w-20 h-20 cursor-pointer"
                        >
                            <GraduationCap className="w-6 h-6 text-emerald-500" />
                        </motion.div>
                     </div>
                </motion.div>
            </div>

            {/* Assessment Section */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
                <div className="space-y-8 max-w-lg mx-auto md:mx-0 min-h-[300px]">
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} onAnimationComplete={() => { if(sequenceStep === 0) nextStep(); }}>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                            Hi, {firstName}! <br/>Let's get started.
                        </h1>
                        <div className="h-1.5 w-24 bg-indigo-500 rounded-full" />
                    </motion.div>

                    <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
                        {sequenceStep >= 1 && (
                            <Typewriter 
                                segments={[
                                    { text: "You are currently a " },
                                    { text: jobTitle, className: "text-slate-900 dark:text-white font-semibold" },
                                    { text: " at " },
                                    { text: company, className: "text-slate-900 dark:text-white font-semibold" },
                                    { text: ", where you design impactful solutions and drive technical excellence." }
                                ]}
                                speed={15}
                                onComplete={nextStep}
                            />
                        )}
                        
                        {sequenceStep >= 2 && (
                             <Typewriter 
                                segments={[
                                    { text: "Your strong skills in " },
                                    { text: topSkills, className: "text-slate-900 dark:text-white font-semibold" },
                                    { text: " demonstrate your ability to enhance user experience and business impact." }
                                ]}
                                speed={15}
                                onComplete={nextStep}
                            />
                        )}

                        {sequenceStep >= 3 && (
                             <Typewriter 
                                segments={[
                                    { text: "We have tailored your resume-building experience to emphasize your background in " },
                                    { text: jobTitle, className: "text-slate-900 dark:text-white font-semibold" },
                                    { text: "." }
                                ]}
                                speed={15}
                                onComplete={nextStep}
                            />
                        )}
                    </div>

                    {sequenceStep >= 4 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-4"
                        >
                            <Button 
                                onClick={onComplete}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 py-6 text-lg font-bold shadow-xl shadow-indigo-900/10 hover:shadow-indigo-600/20 transition-all hover:scale-105"
                            >
                                Continue
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
