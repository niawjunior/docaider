"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { PortfolioTheme } from "./themes/PortfolioTheme";
import { StudioTheme } from "./themes/StudioTheme";
import { VisualTheme } from "./themes/VisualTheme";
import { ModernTheme } from "./themes/ModernTheme";
import { MinimalTheme } from "./themes/MinimalTheme";
import { CreativeTheme } from "./themes/CreativeTheme";

import { motion } from "framer-motion";

interface ResumePreviewProps {
  data: ResumeData;
  theme?: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
  className?: string;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export function ResumePreview({
  data,
  theme = "modern",
  className,
  onUpdate,
  readOnly,
  containerRef
}: ResumePreviewProps) {
  
  const content = (() => {
    switch (theme) {
      case 'portfolio':
        return <PortfolioTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
      case 'studio':
        return <StudioTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
      case 'visual':
        return <VisualTheme data={data} onUpdate={onUpdate} readOnly={readOnly} containerRef={containerRef} />;
      case 'minimal':
        return <MinimalTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
      case 'creative':
        return <CreativeTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
      case 'modern':
      default:
        return <ModernTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
    }
  })();

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
