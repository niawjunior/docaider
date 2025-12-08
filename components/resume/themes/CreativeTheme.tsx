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

interface CreativeThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
}

export const CreativeTheme = ({ data, onUpdate, readOnly }: CreativeThemeProps) => {
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "education", "projects", "skills"];

  const renderSection = (id: string) => {
    switch (id) {
        case 'summary': return <SummarySection key={id} data={data} theme="creative" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'experience': return <ExperienceSection key={id} data={data} theme="creative" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'education': return <EducationSection key={id} data={data} theme="creative" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'projects': return <ProjectsSection key={id} data={data} theme="creative" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'skills':
             // Skills in sidebar for Creative
             return null;
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
                        theme="creative"
                        readOnly={readOnly}
                    />
                );
            }
            return null;
    }
  };

  return (
      <div className="w-full max-w-5xl min-h-[1100px] bg-white text-slate-900 shadow-xl mx-auto print:shadow-none group/resume text-left p-0 flex">
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8 text-left">
           <ContactHeader data={data} theme="creative" onUpdate={onUpdate} readOnly={readOnly} />
           <SkillsSection data={data} theme="creative" onUpdate={onUpdate} readOnly={readOnly} />
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 space-y-8 bg-white text-left">
           {order.map(id => {
               if (id === 'skills') return null; 
               return renderSection(id);
           })}
           
           {onUpdate && !readOnly && (
               <div className="mt-8 border-t border-slate-200 pt-8 flex justify-center">
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
      </div>
  );
};
