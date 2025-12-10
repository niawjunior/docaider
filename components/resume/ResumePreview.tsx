"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { THEME_COMPONENTS } from "./themes/component-map";
import { motion } from "framer-motion";

interface ResumePreviewProps {
  data: ResumeData;
  theme?: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
  className?: string;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
  containerRef?: React.RefObject<any>;
  isThumbnail?: boolean;
}

export function ResumePreview({
  data,
  theme = "modern",
  className,
  onUpdate,
  readOnly,
  containerRef,
  isThumbnail
}: ResumePreviewProps) {
  
  // Dynamic Theme Rendering
  const ThemeComponent = THEME_COMPONENTS[theme] || THEME_COMPONENTS["modern"];
  
  const content = (
      <ThemeComponent 
          data={data} 
          onUpdate={onUpdate} 
          readOnly={readOnly} 
          containerRef={containerRef}
          isThumbnail={isThumbnail}
      />
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
