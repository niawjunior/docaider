import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import {  Mail, MapPin, Globe, Linkedin, ImageIcon } from "lucide-react";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "./ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { CustomSectionRenderer } from "@/components/resume/shared/CustomSectionRenderer";
import { SectionRenderer } from "@/components/resume/shared/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CoverImagePicker } from "@/components/resume/shared/CoverImagePicker";
import { ContactManager } from "@/components/resume/shared/ContactManager";

import { ThemeComponentProps } from "./component-map";
import { useResume } from "@/components/resume/state/ResumeContext";

export const VisualTheme = ({ containerRef, isThumbnail }: ThemeComponentProps) => {
  const { data, updateField: handleUpdate, readOnly } = useResume();
  const personalInfo = data.personalInfo;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Only use containerRef if mounted and ref exists to avoid "not hydrated" error
  const { scrollYProgress } = useScroll({
    container: (isMounted && !isThumbnail && containerRef?.current) ? containerRef : undefined
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  return (
    <div className={cn(
      "bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black",
      isThumbnail ? "h-full w-full overflow-hidden" : "min-h-screen"
    )}>
      {/* Navigation - Hide in thumbnail */}
      {!isThumbnail && (
        <nav className="sticky top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference">
          <span className="text-xl font-bold tracking-tighter uppercase">
               {/* Read-only name for nav */}
              {(personalInfo.fullName ?? '').split(' ')[0]}
          </span>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-widest bg-black/50 backdrop-blur rounded px-4 py-2">
             {(data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : ["summary", "projects", "experience", "skills", "education"]).map(sectionId => {
                 const isCustom = data.customSections?.find(c => c.id === sectionId);
                 const isStandard = ['summary', 'experience', 'projects', 'education', 'skills', 'about', 'contact'].includes(sectionId);
                 
                 if (!isCustom && !isStandard) return null;

                 let label = isCustom ? isCustom.title : sectionId;
                 let href = `#${sectionId}`;

                 if (sectionId === 'summary') {
                     label = 'About';
                     href = '#about';
                 }
                 if (sectionId === 'projects') {
                     label = 'Work';
                     href = '#work';
                 }

                 return (
                     <a key={sectionId} href={href} className="hover:opacity-50 transition-opacity">
                         {label}
                     </a>
                 );
             })}
             <a href="#contact" className="hover:opacity-50 transition-opacity">Contact</a>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <header className={cn(
        "relative w-full flex flex-col justify-end overflow-hidden",
        isThumbnail ? "h-full p-8" : "h-screen p-6 md:p-12"
      )}>
        <div className="absolute inset-0 z-0">
          {data.coverImage ? (
            <div className="absolute inset-0">
                <img 
                    src={data.coverImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover opacity-60"
                />
            </div>
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          
          {!readOnly && (
             <div className="absolute top-24 right-6 z-20">
                 <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-black/50 hover:bg-black/80 text-white border-white/20 backdrop-blur-sm"
                    onClick={() => setIsCoverPickerOpen(true)}
                 >
                     <ImageIcon className="w-4 h-4 mr-2" />
                     Change Cover
                 </Button>
             </div>
          )}
        </div>
        
        <CoverImagePicker 
            open={isCoverPickerOpen} 
            onOpenChange={setIsCoverPickerOpen}
            onSelect={(url) => handleUpdate('coverImage', url)}
            currentCover={data.coverImage}
        />

        <div className="relative z-10 max-w-7xl w-full mx-auto">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
             {/* Edit full name here */}
             <div className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.85] font-black uppercase tracking-tighter break-words">
                 <InlineEdit readOnly={readOnly} 
                    value={personalInfo.fullName} 
                    onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                    path="personalInfo.fullName"
                    className="bg-transparent border-none w-full"
                    placeholder="YOUR NAME"
                 />
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/20 pt-8"
          >
            <div className="text-xl md:text-2xl font-light uppercase tracking-wide max-w-md mb-8 md:mb-0">
               <InlineEdit readOnly={readOnly} 
                    value={personalInfo.jobTitle} 
                    onSave={(val) => handleUpdate('personalInfo.jobTitle', val)} 
                    path="personalInfo.jobTitle"
                    placeholder="Job Title"
                    className="bg-transparent border-none"
                 />
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-24" id="work">
        {/* Dynamic Section Rendering */}
        {(data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : ["summary", "projects", "experience", "skills", "education"]).map(id => {
             // For Visual Theme, specific animations per section type
             if (id === 'summary') {
                 return (
                     <motion.section
                         key="summary"
                         id="about"
                         className="scroll-mt-24" // Layout handled by styles + className prop
                         initial={{ opacity: 0, y: 30 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.8 }}
                     >
                         <SectionRenderer 
                            sectionId="summary" 
                            theme="visual" 
                            className="py-12 md:py-24 max-w-4xl mx-auto" 
                         />
                     </motion.section>
                 );
             }
             
             return (
                 <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                 >
                    <SectionRenderer sectionId={id} theme="visual" />
                 </motion.div>
             );
        })}
        
        {/* Add Section Button (Visual Theme Style) */}
        {!readOnly && (
             <div className="flex justify-center mt-24">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent" onClick={() => {
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
                      Add Section
                  </Button>
             </div>
        )}


        {/* Contact Footer */}
        <section id="contact" className="py-48 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8">
            Get in Touch
          </h2>
           <div className="flex flex-col gap-4 text-xl md:text-2xl text-neutral-400 items-center">
              <ContactManager 
                layout="column" 
                align="center" 
                className="items-center" 
                itemClassName="[&_span]:whitespace-nowrap"
              />
           </div>
        </section>


      </main>
    </div>
  );
};
