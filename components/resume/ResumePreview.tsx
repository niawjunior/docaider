"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { PortfolioTheme } from "./themes/PortfolioTheme";
import { StudioTheme } from "./themes/StudioTheme";
import { VisualTheme } from "./themes/VisualTheme";
import { ModernTheme } from "./themes/ModernTheme";
import { MinimalTheme } from "./themes/MinimalTheme";
import { CreativeTheme } from "./themes/CreativeTheme";

interface ResumePreviewProps {
  data: ResumeData;
  theme?: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
  className?: string;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
}

export function ResumePreview({
  data,
  theme = "modern",
  className,
  onUpdate,
  readOnly
}: ResumePreviewProps) {
  
  switch (theme) {
    case 'portfolio':
      return <PortfolioTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
    case 'studio':
      return <StudioTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
    case 'visual':
      return <VisualTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
    case 'minimal':
      return <MinimalTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
    case 'creative':
      return <CreativeTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
    case 'modern':
    default:
      return <ModernTheme data={data} onUpdate={onUpdate} readOnly={readOnly} />;
  }
}
