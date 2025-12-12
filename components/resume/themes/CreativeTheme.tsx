"use client";

import { useResume } from "@/components/resume/state/ResumeContext";
import { SectionRenderer } from "@/components/resume/shared/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeComponentProps } from "./component-map";
import { useResumeSections } from "../hooks/useResumeSections";
import { PaperLayout } from "../shared/PaperLayout";

export const CreativeTheme = ({ containerRef }: ThemeComponentProps) => {
  const { data, updateField, updateMultipleFields, readOnly } = useResume();
  
  const { mainSections } = useResumeSections({
      data,
      sidebarIds: ['skills', 'contact']
  });

  return (
      <PaperLayout 
        ref={containerRef}
        className="text-slate-900 group/resume text-left p-0 flex"
        sidebarMatchColor="#0f172a"
      >
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8 text-left min-h-full">
           <SectionRenderer sectionId="contact" theme="creative" />
           <SectionRenderer sectionId="skills" theme="creative-sidebar" />
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 space-y-8 bg-white text-left">
           {mainSections.map(id => (
              <div key={id}>
                <SectionRenderer 
                  sectionId={id} 
                  theme="creative" 
                />
              </div>
           ))}
           
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
      </PaperLayout>
  );
};
