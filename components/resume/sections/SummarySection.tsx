"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { cn } from "@/lib/utils";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { getSectionTheme } from "@/lib/themes/styles";

interface SummarySectionProps {
  data: ResumeData;
  theme?: string;
  onUpdate?: (data: ResumeData) => void;
  className?: string;
  readOnly?: boolean;
}

export const SummarySection = ({ data, theme = "modern", onUpdate, className, readOnly }: SummarySectionProps) => {
  const { updateField: handleUpdate } = useResumeUpdate(data, onUpdate);
  
  // Get Theme Config
  const config = getSectionTheme(theme, 'summary');
  const { styles, strategy } = config;

  if (!onUpdate && !data.personalInfo?.summary?.content) return null;

  return (
    <ResumeSection
        title="Professional Summary"
        theme={theme}
        className={className}
        // No explicit Add action for Summary usually
    >
      <div className={styles.container}>
        <InlineEdit
          readOnly={readOnly || !onUpdate}
          value={data.personalInfo?.summary?.content}
          placeholder="Write a professional summary..."
          multiline
          onSave={(val) => handleUpdate('personalInfo.summary.content', val)}
          path="personalInfo.summary.content"
          alignment={data.personalInfo?.summary?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
          className={cn("w-full bg-transparent border-none p-0 focus:ring-0")}
        />
      </div>
    </ResumeSection>
  );
};
