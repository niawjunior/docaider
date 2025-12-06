"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { PortfolioTheme } from "./themes/PortfolioTheme";
import { StudioTheme } from "./themes/StudioTheme";
import { VisualTheme } from "./themes/VisualTheme";
import { ContactHeader } from "./sections/ContactHeader";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ProjectsSection } from "./sections/ProjectsSection";

interface ResumePreviewProps {
  data: ResumeData;
  theme?: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
  className?: string;
  onUpdate?: (data: ResumeData) => void;
}

export function ResumePreview({
  data,
  theme = "modern",
  className,
  onUpdate
}: ResumePreviewProps) {
  
  if (theme === "portfolio") {
    return <PortfolioTheme data={data} onUpdate={onUpdate} />;
  }

  if (theme === "studio") {
    return <StudioTheme data={data} onUpdate={onUpdate} />;
  }

  if (theme === "visual") {
    return <VisualTheme data={data} onUpdate={onUpdate} />;
  }

  const containerClasses = cn(
    "w-full max-w-full min-h-[1100px] bg-white text-slate-900 shadow-xl mx-auto print:shadow-none group/resume text-left",
    theme === "modern" && "p-8",
    theme === "minimal" && "p-12 font-serif",
    theme === "creative" && "p-0 flex",
    className
  );

  // Creative theme is separate layout
  if (theme === "creative") {
    return (
      <div className={containerClasses}>
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8 text-left">
           <ContactHeader data={data} theme={theme} onUpdate={onUpdate} />
           <SkillsSection data={data} theme={theme} onUpdate={onUpdate} />
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 space-y-8 bg-white text-left">
           <ExperienceSection data={data} theme={theme} onUpdate={onUpdate} />
           <EducationSection data={data} theme={theme} onUpdate={onUpdate} />
           <ProjectsSection data={data} theme={theme} onUpdate={onUpdate} />
        </div>
      </div>
    );
  }

  // Modern & Minimal Standard Layout
  return (
    <div className={containerClasses}>
      <ContactHeader data={data} theme={theme} onUpdate={onUpdate} />
      
      <ExperienceSection data={data} theme={theme} onUpdate={onUpdate} />
      
      <EducationSection data={data} theme={theme} onUpdate={onUpdate} />
      
      <SkillsSection data={data} theme={theme} onUpdate={onUpdate} />
      
      <ProjectsSection data={data} theme={theme} onUpdate={onUpdate} />
    </div>
  );
}
