"use client";

import { useResume } from "@/components/resume/state/ResumeContext";
import { SectionRenderer } from "@/components/resume/shared/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeComponentProps } from "./component-map";

import { PaperLayout } from "../shared/PaperLayout";
import { useResumeSections } from "../hooks/useResumeSections";

export const MinimalTheme = ({ containerRef }: ThemeComponentProps) => {
  const { data, updateField, updateMultipleFields, readOnly } = useResume();

  const { mainSections } = useResumeSections({
      data,
      sidebarIds: [] // Minimal theme is single column
  });

  return (
    <PaperLayout 
        ref={containerRef}
        className="bg-white text-slate-900 p-12 space-y-8"
        // No sidebar color needed
    >
      <SectionRenderer sectionId="contact" theme="minimal" />
      
      {/* Dynamic Order */}
      {mainSections.map(id => {
         // contact is already rendered
         if (id === 'contact') return null;
         return (
            <div key={id}>
                <SectionRenderer sectionId={id} theme="minimal" />
            </div>
         );
      })}

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
                   updateField('customSections', newSections);
               }}>
                   <Plus className="w-4 h-4 mr-2" />
                   Add Custom Section
               </Button>
           </div>
       )}
    </PaperLayout>
  );
};
