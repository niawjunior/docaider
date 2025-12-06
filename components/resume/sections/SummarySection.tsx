"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { InlineEdit } from "@/components/ui/inline-edit";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { cn } from "@/lib/utils";

interface SummarySectionProps {
  data: ResumeData;
  theme?: string;
  onUpdate?: (data: ResumeData) => void;
  className?: string;
}

export const SummarySection = ({ data, theme, onUpdate, className }: SummarySectionProps) => {
  const { updateField: handleUpdate } = useResumeUpdate(data, onUpdate);

  if (!onUpdate && !data.personalInfo.summary) return null;

  return (
    <section className={cn("mb-6", className)}>
      <h3 className={cn(
        "font-bold uppercase tracking-widest mb-3",
        theme === "modern" ? "text-slate-900 border-b-2 border-slate-900 pb-1" : 
        theme === "minimal" ? "text-black text-lg border-b border-black pb-2" : 
        "text-slate-800"
      )}>
        Professional Summary
      </h3>
      <div className="text-sm leading-relaxed text-slate-700">
        <InlineEdit
          readOnly={!onUpdate}
          value={data.personalInfo.summary}
          placeholder="Write a professional summary..."
          multiline
          onSave={(val) => handleUpdate('personalInfo.summary', val)}
          className="w-full bg-transparent border-none p-0 focus:ring-0"
        />
      </div>
    </section>
  );
};
