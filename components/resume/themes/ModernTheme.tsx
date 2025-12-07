"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { ContactHeader } from "@/components/resume/sections/ContactHeader";
import { ExperienceSection } from "@/components/resume/sections/ExperienceSection";
import { EducationSection } from "@/components/resume/sections/EducationSection";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { ProjectsSection } from "@/components/resume/sections/ProjectsSection";
import { SummarySection } from "@/components/resume/sections/SummarySection";
import { CustomSectionRenderer } from "@/components/resume/shared/CustomSectionRenderer";

interface ModernThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean; // Added readOnly prop
}

export const ModernTheme = ({ data, onUpdate, readOnly }: ModernThemeProps) => { // Destructure readOnly
  // Determine order (fallback if empty)
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "education", "projects", "skills"];

  // Helper to render a section by ID
  const renderSection = (id: string) => {
    switch (id) {
        case 'summary': return <SummarySection key={id} data={data} theme="modern" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'experience': return <ExperienceSection key={id} data={data} theme="modern" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'education': return <EducationSection key={id} data={data} theme="modern" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'projects': return <ProjectsSection key={id} data={data} theme="modern" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'skills':
            // In Modern theme, Skills are typically in the sidebar.
            // If the user drags 'skills' into the main list, we technically "skip" it here
            // because it is hardcoded in the sidebar.
            // Alternatively, we could ONLY render it here if we want to allow moving it out of sidebar.
            // For now, consistent with previous logic: Render explicit sidebar, skip here.
            return null;
            
        default:
            // Custom Section
            const custom = data.customSections?.find(c => c.id === id);
            if (custom) {
                return (
                    <CustomSectionRenderer 
                        key={id} 
                        section={custom} 
                        index={data.customSections?.indexOf(custom) || 0}
                        data={data} 
                        onUpdate={onUpdate} 
                        theme="modern"
                        readOnly={readOnly} // Pass readOnly to CustomSectionRenderer
                    />
                );
            }
            return null;
    }
  };

  return (
    <div id="resume-preview" className="w-[250mm] min-h-[297mm] bg-white shadow-xl flex mx-auto">
      {/* Sidebar */}
      <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8 flex-shrink-0">
        <div className="space-y-4">
             <div className="text-center">
                  {/* Avatar & Name area if needed in sidebar, but currently using ContactHeader which handles name */}
             </div>
        </div>
        
        <ContactHeader data={data} theme="modern" onUpdate={onUpdate} readOnly={readOnly} /> {/* Pass readOnly */}
        
        {/* Fixed Sidebar Sections */}
        <SkillsSection data={data} theme="modern" onUpdate={onUpdate} readOnly={readOnly} /> {/* Pass readOnly */}
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8 space-y-8 bg-white text-left">
         {/* Render ordered sections (filtering out Skills which is sidebar) */}
         {order.map(id => {
             if (id === 'skills') return null; // In sidebar
             return renderSection(id);
         })}
      </div>
    </div>
  );
};
