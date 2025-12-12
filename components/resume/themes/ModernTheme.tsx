"use client";

import { useResume } from "@/components/resume/state/ResumeContext";
import { ContactHeader } from "@/components/resume/sections/ContactHeader";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { SectionRenderer } from "@/components/resume/shared/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { ThemeComponentProps } from "./component-map";

export const ModernTheme = ({ containerRef }: ThemeComponentProps) => {
  const { data, updateField, readOnly } = useResume();

  // Determine order (fallback if empty)
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "education", "projects", "skills"];

  return (
    <div 
        ref={containerRef}
        id="resume-preview" 
        className="w-[230mm] min-h-[297mm] bg-white text-slate-900 shadow-xl mx-auto flex"
    >
      {/* Sidebar */}
      <div className="w-1/3 bg-slate-900 text-white p-6 space-y-8 flex-shrink-0">
        <div className="space-y-4">
             <div className="text-center">
                  {/* Avatar & Name area handled by ContactHeader */}
             </div>
        </div>
        
        <ContactHeader theme="modern" />
        
        {/* Fixed Sidebar Sections */}
        {/* Note: In Modern theme, Skills are typically in the sidebar. */}
        <SkillsSection theme="modern-sidebar" />
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8 space-y-8 bg-white text-left">
         {/* Render ordered sections (filtering out Skills which is sidebar) */}
         {order.map(id => {
             if (id === 'skills') return null; // In sidebar
             return <SectionRenderer key={id} sectionId={id} theme="modern" />;
         })}

         {!readOnly && (
            <div className="mt-8 border-t border-slate-200 pt-8 flex justify-center">
                <Button variant="outline" className="text-slate-900 border-slate-200 hover:bg-slate-100" onClick={() => {
                    const newSection = {
                        id: crypto.randomUUID(),
                        title: "New Section",
                        type: "list" as const,
                        items: []
                    };
                    const newSections = [...(data.customSections || []), newSection];
                    updateField('customSections', newSections);
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

