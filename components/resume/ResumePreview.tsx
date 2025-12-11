"use client";

import { ResumeProvider } from "@/components/resume/state/ResumeContext";

import { ResumeData } from "@/lib/schemas/resume";
import { THEME_COMPONENTS } from "@/components/resume/themes/component-map";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { setNestedValue } from "@/lib/utils";

interface ResumePreviewProps {
    data: ResumeData;
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
    isThumbnail?: boolean;
    theme?: string;
    className?: string; // Passed to motion.div
    containerRef?: React.RefObject<HTMLDivElement>;
}

export const ResumePreview = ({ data, onUpdate, readOnly, isThumbnail, theme = "modern", className, containerRef }: ResumePreviewProps) => {
  const ThemeComponent = THEME_COMPONENTS[theme as keyof typeof THEME_COMPONENTS] || THEME_COMPONENTS.modern;

  const handleUpdateField = (path: string, value: any) => {
    if (!onUpdate) return;
    const newData = setNestedValue(data, path, value);
    onUpdate(newData);
  };

  const content = (
      <ResumeProvider 
          data={data} 
          updateField={handleUpdateField} 
          readOnly={readOnly} 
          isThumbnail={isThumbnail}
          theme={theme}
      >
          <ThemeComponent 
              containerRef={containerRef}
              isThumbnail={isThumbnail}
          />
      </ResumeProvider>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {content}
    </motion.div>
  );
}
