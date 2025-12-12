"use client";

import { motion } from "framer-motion";
import { 
  Mail, 
  Globe, 
  Linkedin, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { useResume } from "@/components/resume/state/ResumeContext";
import { SectionRenderer } from "@/components/resume/shared/SectionRenderer";
import { ContactManager } from "@/components/resume/shared/ContactManager";
import { ThemeComponentProps } from "./component-map";

export const PortfolioTheme = ({ containerRef }: ThemeComponentProps) => {
  const { data, updateField: handleUpdate, readOnly } = useResume();
  const personalInfo = (data.personalInfo || {}) as any; // Fix TS access

  // Determine order (fallback if empty)
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "projects", "education", "skills"];

  return (
    <div 
        ref={containerRef}
        className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100"
    >
      {/* Hero Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-slate-200 sticky top-0 z-50 bg-opacity-90 backdrop-blur-sm"
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tight flex items-center gap-1">
             <InlineEdit readOnly={readOnly} 
                value={(personalInfo.fullName ?? '').split(' ')[0]}
                onSave={(val) => {
                     // Read-only for nav logo derived from main name
                }}
                path="personalInfo.fullName" // Added dummy path to satisfy TS if needed, logic is readOnly
                className="pointer-events-none" 
             />
            <span className="text-blue-600">.</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            {order.map(sectionId => {
                const isCustom = data.customSections?.find(c => c.id === sectionId);
                const isStandard = ['summary', 'experience', 'projects', 'education', 'skills', 'about', 'contact'].includes(sectionId);
                
                if (!isCustom && !isStandard) return null;

                const label = isCustom 
                    ? isCustom.title 
                    : sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                
                return (
                    <a key={sectionId} href={`#${sectionId}`} className="hover:text-blue-600 transition-colors">
                        {label}
                    </a>
                );
            })}
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </nav>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        {/* About / Hero */}
        <motion.section 
          id="about"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 flex flex-wrap md:flex-nowrap gap-x-3 gap-y-1 items-baseline">
              <span className="shrink-0">Hi, I&apos;m</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 min-w-0 flex-1">
                 <InlineEdit readOnly={readOnly} 
                    value={personalInfo.fullName} 
                    onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                    path="personalInfo.fullName"
                    placeholder="Your Name"
                    className="w-full bg-transparent border-none p-0 focus:ring-0"
                 />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
               <InlineEdit readOnly={readOnly} 
                    value={personalInfo.headerSummary?.content} 
                    onSave={(val) => handleUpdate('personalInfo.headerSummary.content', val)} 
                    placeholder="Brief bio or summary..."
                    multiline
                    path="personalInfo.headerSummary.content"
                    alignment={personalInfo.headerSummary?.alignment || undefined}
                 />
            </p>
          </div>
        </motion.section>

        {/* Dynamic Sections */}
        {order.map(id => (
            <motion.div
                key={id}
                id={id} // Add ID for anchor scrolling
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-24" // Offset for sticky header
            >
                <SectionRenderer sectionId={id} theme="portfolio" />
            </motion.div>
        ))}


        {!readOnly && (
           <div className="mt-8 border-t border-slate-200 pt-8 flex justify-center print:hidden">
               <Button variant="outline" className="text-slate-900 border-slate-200 hover:bg-slate-100" onClick={() => {
                   const newSection = {
                       id: crypto.randomUUID(),
                       title: "New Section",
                       type: "list" as const,
                       items: []
                   };
                   const newSections = [...(data.customSections || []), newSection];
                   handleUpdate('customSections', newSections);
               }}>
                   <Plus className="w-4 h-4 mr-2" />
                   Add Custom Section
               </Button>
           </div>
       )}

        {/* Contact Footer */}
        <section id="contact" className="py-24 border-t border-slate-200 mt-24">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-8">Get in Touch</h2>
                <div className="flex flex-col gap-6 items-center text-lg text-slate-600">
                     <p className="max-w-xl mx-auto leading-relaxed">
                        I&apos;m always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                     </p>
                     
                     <div className="flex flex-wrap justify-center gap-4 scroll-mt-24">
                        <ContactManager 
                           layout="row" 
                           align="center"
                           itemClassName="border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-100 transition-colors bg-white h-auto [&_span]:whitespace-nowrap items-center"
                        />
                     </div>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};
