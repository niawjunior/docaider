"use client";

import { useResume } from "@/components/resume/state/ResumeContext";
import { SectionRenderer } from "@/components/resume/shared/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeComponentProps } from "./component-map";

export const MinimalTheme = ({ containerRef }: ThemeComponentProps) => {
  const { data, updateField, readOnly } = useResume();
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "education", "projects", "skills"];

  return (
    <div 
      ref={containerRef}
      id="resume-preview" 
      className="w-[250mm] min-h-[297mm] bg-white shadow-xl mx-auto p-12 md:p-16 space-y-8 text-left"
    >
      <SectionRenderer sectionId="contact" theme="minimal" />
      
      {/* Dynamic Order */}
      {order.map(id => {
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
    </div>
  );
};
