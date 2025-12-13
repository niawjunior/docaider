"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { cn } from "@/lib/utils";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { getSectionTheme } from "@/lib/themes/styles";
import { useResume } from "@/components/resume/state/ResumeContext";

interface SummarySectionProps {
  theme?: string;
  className?: string;
  id?: string;
}

export const SummarySection = ({ theme = "modern", className, id }: SummarySectionProps) => {
  const { data, updateField, readOnly } = useResume();

  // Get Theme Config
  const config = getSectionTheme(theme, 'summary');
  const { styles, strategy } = config;

  if (!updateField && !data.personalInfo?.summary?.content) return null;

  return (
    <ResumeSection
        id={id}
        title="Professional Summary"
        theme={theme}
        className={className}
        // No explicit Add action for Summary usually
    >
      <div className={styles.container}>
        <InlineEdit
          readOnly={readOnly}
          value={data.personalInfo?.summary?.content}
          placeholder="Write a professional summary..."
          multiline
          onSave={(val) => updateField('personalInfo.summary.content', val)}
          path="personalInfo.summary.content"
          alignment={data.personalInfo?.summary?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
          className={cn("w-full bg-transparent")}
        />
      </div>
    </ResumeSection>
  );
};
