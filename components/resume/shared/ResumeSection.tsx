import React from "react";
import { cn } from "@/lib/utils";
import { ThemeAddButton } from "../themes/ThemeControls";

interface ResumeSectionProps {
  title: string;
  theme: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
  onAdd?: () => void;
  children: React.ReactNode;
  className?: string; // Wrapper section class
}

export function ResumeSection({ 
    title, 
    theme, 
    onAdd, 
    children, 
    className 
}: ResumeSectionProps) {
  
  // Design Token Map
  // This centralizes the "Header Look" for each theme.
  const headerStyles = {
     wrapper: cn(
        "flex justify-between items-center mb-6 border-b pb-2",
        theme === "modern" && "border-slate-200",
        theme === "minimal" && "border-slate-200",
        theme === "creative" && "border-slate-100",
        theme === "portfolio" && "border-slate-200" // Assuming similar to modern
     ),
     title: cn(
        "font-bold uppercase flex items-center gap-2",
        theme === "modern" && "text-xl",
        theme === "minimal" && "text-sm tracking-widest text-center w-full border-none",
        theme === "creative" && "text-2xl text-slate-900",
        theme === "portfolio" && "text-lg md:text-xl"
     ),
     addButton: cn(
         theme === "creative" ? "border-slate-200" : "w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500"
     )
  };

  // Minimal theme prevents add button in header (usually), or positions it absolutely?
  // In `ExperienceSection`, `theme !== "minimal"` condition was used for Add Button in header.
  // But inside ResumeSectionList item, minimal had absolute delete button.
  // Let's keep the `theme !== "minimal"` logic for the header button for now, or standardize it.
  // Actually, `ExperienceSection` said `{onUpdate && theme !== "minimal" && ...}`.
  
  return (
    <section className={cn(
        theme === "creative" ? "" : "mb-8 text-left",
        className
    )}>
       <div className={headerStyles.wrapper}>
          <h2 className={headerStyles.title}>
              {theme === "creative" && <span className="w-8 h-1 bg-slate-900 block" />}
              {title}
          </h2>
          {onAdd && theme !== "minimal" && (
                <ThemeAddButton 
                    label={theme === "creative" ? "Add" : ""}
                    className={headerStyles.addButton}
                    onClick={onAdd}
                />
            )}
       </div>
       
       {children}
    </section>
  );
}
