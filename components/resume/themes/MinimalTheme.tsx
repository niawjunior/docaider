"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { ContactHeader } from "@/components/resume/sections/ContactHeader";
import { ExperienceSection } from "@/components/resume/sections/ExperienceSection";
import { EducationSection } from "@/components/resume/sections/EducationSection";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { ProjectsSection } from "@/components/resume/sections/ProjectsSection";
import { SummarySection } from "@/components/resume/sections/SummarySection";
import { CustomSectionRenderer } from "@/components/resume/shared/CustomSectionRenderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MinimalThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
}

export const MinimalTheme = ({ data, onUpdate, readOnly }: MinimalThemeProps) => {
  // Determine order
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "education", "projects", "skills"];

  const renderSection = (id: string) => {
    switch (id) {
        case 'summary': return <SummarySection key={id} data={data} theme="minimal" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'experience': return <ExperienceSection key={id} data={data} theme="minimal" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'education': return <EducationSection key={id} data={data} theme="minimal" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'projects': return <ProjectsSection key={id} data={data} theme="minimal" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'skills': return <SkillsSection key={id} data={data} theme="minimal" onUpdate={onUpdate} readOnly={readOnly} />;
        default:
            const custom = data.customSections?.find(c => c.id === id);
            if (custom) {
                return (
                    <CustomSectionRenderer 
                        key={id} 
                        section={custom} 
                        index={data.customSections?.indexOf(custom) || 0}
                        data={data} 
                        onUpdate={onUpdate} 
                        theme="minimal"
                        readOnly={readOnly}
                    />
                );
            }
            return null;
    }
  };

  return (
    <div id="resume-preview" className="w-[210mm] min-h-[297mm] bg-white shadow-xl mx-auto p-12 md:p-16 space-y-8 text-left">
      <ContactHeader data={data} theme="minimal" onUpdate={onUpdate} readOnly={readOnly} />
      
      {/* Dynamic Order */}
      {order.map(id => renderSection(id))}

       {onUpdate && !readOnly && (
           <div className="mt-8 border-t border-slate-200 pt-8 flex justify-center print:hidden">
               <Button variant="outline" className="text-slate-900 border-slate-200 hover:bg-slate-100" onClick={() => {
                   const newSection = {
                       id: crypto.randomUUID(),
                       title: "New Section",
                       type: "list" as const,
                       items: []
                   };
                   const newSections = [...(data.customSections || []), newSection];
                   onUpdate({ ...data, customSections: newSections });
               }}>
                   <Plus className="w-4 h-4 mr-2" />
                   Add Custom Section
               </Button>
           </div>
       )}
    </div>
  );
};
