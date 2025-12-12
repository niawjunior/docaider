"use client";

import { useResume } from "@/components/resume/state/ResumeContext";
import { SectionRenderer } from "@/components/resume/shared/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeComponentProps } from "./component-map";

export const CreativeTheme = ({ containerRef }: ThemeComponentProps) => {
  const { data, updateField, readOnly } = useResume();
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "education", "projects", "skills"];

  return (
      <div 
        ref={containerRef}
        className="w-[210mm] min-h-[297mm] text-slate-900 shadow-xl mx-auto print:shadow-none group/resume text-left p-0 flex relative"
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Edge Bleed Fix */}
        <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-[#0f172a] z-0 pointer-events-none" />
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8 text-left min-h-full">
           <SectionRenderer sectionId="contact" theme="creative" />
           <SectionRenderer sectionId="skills" theme="creative-sidebar" />
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 space-y-8 bg-white text-left">
           {order.map(id => {
               // Skills is in sidebar
               if (id === 'skills') return null; 
               // Contact is in sidebar (usually contact isn't in sectionOrder, but just in case)
               if (id === 'contact') return null;

               return (
                 <div key={id}>
                   <SectionRenderer 
                     sectionId={id} 
                     theme="creative" 
                   />
                 </div>
               );
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
