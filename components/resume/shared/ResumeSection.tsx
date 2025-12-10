
import React from "react";
import { cn } from "@/lib/utils";
import { ThemeAddButton } from "../themes/ThemeControls";
import { getSectionStyles } from "@/lib/themes/styles";

interface ResumeSectionProps {
  title: React.ReactNode;
  theme: string;
  onAdd?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string; // Wrapper section class override
}

export function ResumeSection({ 
    title, 
    theme, 
    onAdd, 
    actions,
    children, 
    className 
}: ResumeSectionProps) {
  
  // Decoupled Style Retrieval
  const styles = getSectionStyles(theme);

  return (
    <section className={cn(styles.wrapper, className)}>
       <div className={styles.header}>
          <h2 className={styles.title}>
              {(styles as any).decoration === true && (
                  <span className="w-8 h-1 bg-slate-900 block" />
              )}
              {title}
          </h2>
          <div className="flex items-center gap-2">
            {onAdd && (
                    <ThemeAddButton 
                        label={(styles as any).decoration === true ? "Add" : ""} 
                        className={styles.addButton}
                        onClick={onAdd}
                    />
                )}
            {actions}
          </div>
       </div>
       
       {children}
    </section>
  );
}
