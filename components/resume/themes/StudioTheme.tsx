"use client";

import { motion } from "framer-motion";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { Button } from "@/components/ui/button";
import { ContactManager } from "../shared/ContactManager";
import { Plus } from "lucide-react";
import { useResume } from "@/components/resume/state/ResumeContext";
import { ThemeComponentProps } from "./component-map";
import { useResumeSections } from "../hooks/useResumeSections";
import { SectionRenderer } from "../shared/SectionRenderer";

export const StudioTheme = ({ containerRef }: ThemeComponentProps) => {
  const { data, updateField: handleUpdate, updateMultipleFields, readOnly } = useResume();
  const personalInfo = (data.personalInfo || {}) as any;

  const { mainSections } = useResumeSections({
      data,
      sidebarIds: ['contact'],
      defaultOrder: ["summary", "experience", "education", "projects", "skills"]
  });

  const marqueeVariants = {
    animate: {
      x: [0, -1035],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop" as const,
          duration: 20,
          ease: "linear" as const,
        },
      },
    },
  };

  return (
    <div 
        ref={containerRef}
        className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden relative"
    >
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 mix-blend-difference px-6 py-6 flex justify-between items-center bg-black/0 backdrop-blur-sm print:hidden">
        <div className="text-xl font-bold tracking-tighter uppercase">
          {(personalInfo.fullName ?? '').split(' ')[0]}
        </div>
  <div className="flex gap-6 text-sm font-medium uppercase tracking-widest hidden sm:flex">
    {mainSections.map(sectionId => {
      // Standardize label logic
      let label = sectionId;
      const isStandard = ['summary','experience','education','skills','projects','contact'].includes(sectionId);
      
      if (isStandard) {
           if (sectionId === 'summary') label = 'About';
           if (sectionId === 'projects') label = 'Work';
      } else {
           // Custom Section
           const customSection = data.customSections?.find(c => c.id === sectionId);
           if (customSection) {
               label = customSection.title || "Untitled";
           } else {
               // If not found in custom sections and not standard, might be a stale ID or 'custom' placeholder
               // If we want to strictly support Modern standards, we ignore 'custom' placeholder logic now.
               // But if render is attempted, we should ideally not link to nothing.
               return null;
           }
      }

      // Skip Contact in nav if it's strictly handled by footer? 
      // Studio theme has explicitly specific contact handling.
      // But if it's in mainSections (filtered out by sidebarIds typically), it implies it's in the body?
      // Wait, we put 'contact' in sidebarIds in previous step to HIDE it from body.
      // So it won't be in mainSections.
      // So this loop won't see 'contact'.
      // The explicit Contact link is at the end of nav manually: <a href="#contact" ...>
      
      return (
        <a key={sectionId} href={`#${sectionId}`} className="hover:underline decoration-2 underline-offset-4 capitalize">
          {label}
        </a>
      );
    })}
    <a href="#contact" className="hover:underline decoration-2 underline-offset-4 capitalize">Contact</a>
  </div>
</nav>

      {/* Hero Marquee */}
      <div className="pt-12 pb-12 border-b border-neutral-800 overflow-hidden whitespace-nowrap">
        <motion.div
          className="inline-flex gap-8"
          variants={marqueeVariants}
          animate="animate"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="text-[10cqw] font-black leading-none uppercase tracking-tighter text-white">
                 {personalInfo.jobTitle || "Creative Developer"}
              </span>
              <span className="text-[10cqw] font-black leading-none text-transparent stroke-text">
                —
              </span>
            </div>
          ))}
        </motion.div>


        {!readOnly && (
          <div className="px-6 mt-4 text-center print:hidden">
              <div className="text-sm text-neutral-500 mb-1">MARQUEE TEXT (Edit here):</div>
              <InlineEdit readOnly={readOnly}
                  value={personalInfo.jobTitle}
                  placeholder="CREATIVE DEVELOPER"
                  onSave={(val) => handleUpdate('personalInfo.jobTitle', val?.toUpperCase())}
                  path="personalInfo.jobTitle"
                  className="text-2xl font-bold uppercase tracking-tighter bg-neutral-900 border-none text-center"
              />
          </div>
        )}
      </div>

      <main className="px-6">
        {/* Dynamic Section Rendering */}
        {mainSections.map(id => (
            <SectionRenderer key={id} sectionId={id} theme="studio" />
        ))}

        {!readOnly && (
            <div className="flex justify-center py-24 border-t border-neutral-800 print:hidden">
               <Button variant="outline" onClick={() => {
                   const newSection = {
                       id: crypto.randomUUID(),
                       title: "New Section",
                       type: "list" as const,
                       items: []
                   };
                   const newSections = [...(data.customSections || []), newSection];
                   
                   // Use explicit default order if sectionOrder is empty, ensuring summary/projects/etc exist
                   const currentOrder = (data.sectionOrder && data.sectionOrder.length > 0) 
                        ? data.sectionOrder 
                        : ["summary", "experience", "education", "projects", "skills"];
                        
                   const newOrder = [...currentOrder, newSection.id];
                   
                   updateMultipleFields({
                       'customSections': newSections,
                       'sectionOrder': newOrder
                   });
               }} className="bg-transparent border-neutral-800 text-white hover:bg-neutral-800 hover:text-white">
                   <Plus className="w-4 h-4 mr-2" />
                   Add Section
               </Button>
            </div>
        )}

        {/* Contact Footer */}
        <section id="contact" className="py-24 border-t border-neutral-800 mb-20 break-inside-avoid">
          <div className="max-w-4xl">
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-12">
              Let's Talk
            </h2>
            <div className="text-xl">
               <ContactManager />
            </div>

            <div className="mt-20 pt-8 border-t border-neutral-900 text-neutral-600 text-sm flex justify-between items-center">
                 <div>
                    <InlineEdit readOnly={readOnly} 
                        value={personalInfo.fullName} 
                        placeholder="Your Name"
                        onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                        path="personalInfo.fullName"
                        className="bg-transparent font-bold"
                     />
                    <span> © {new Date().getFullYear()}</span>
                 </div>
                 <div>
                     <InlineEdit readOnly={readOnly} 
                        value={personalInfo.location} 
                        placeholder="Location"
                        onSave={(val) => handleUpdate('personalInfo.location', val)} 
                        path="personalInfo.location"
                        className="bg-transparent text-right"
                     />
                 </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};
