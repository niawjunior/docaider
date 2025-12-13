"use client";

import React from "react";
import { useResume } from "@/components/resume/state/ResumeContext";
import { ContactHeader } from "@/components/resume/sections/ContactHeader";
import { SummarySection } from "@/components/resume/sections/SummarySection";
import { ExperienceSection } from "@/components/resume/sections/ExperienceSection";
import { EducationSection } from "@/components/resume/sections/EducationSection";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { ProjectsSection } from "@/components/resume/sections/ProjectsSection";
import { CustomSectionRenderer } from "@/components/resume/shared/CustomSectionRenderer";

interface SectionRendererProps {
    sectionId: string;
    className?: string;
    // Optional overrides if a theme needs to force a specific style for a section
    theme?: string; 
}

export const SectionRenderer = ({ sectionId, className, theme: propTheme }: SectionRendererProps) => {
    const { data, theme: contextTheme } = useResume();
    const activeTheme = propTheme || contextTheme || "modern";

    switch (sectionId) {
        case "contact":
            // Contact usually handled separately, but let's pass id just in case header needs it
            // Though ContactHeader doesn't have ResumeSection wrapper...
            return <ContactHeader theme={activeTheme} />;
        
        case "summary":
            return <SummarySection theme={activeTheme} className={className} id={sectionId} />;
            
        case "experience":
            return <ExperienceSection theme={activeTheme} className={className} id={sectionId} />;
            
        case "education":
            return <EducationSection theme={activeTheme} className={className} id={sectionId} />;
            
        case "skills":
            return <SkillsSection theme={activeTheme} className={className} id={sectionId} />;
            
        case "projects":
            return <ProjectsSection theme={activeTheme} className={className} id={sectionId} />;
            
        default:
            // Handle Custom Sections
            const customSection = data.customSections?.find(c => c.id === sectionId);
            if (customSection) {
                return (
                    <CustomSectionRenderer 
                        section={customSection} 
                        index={data.customSections?.indexOf(customSection) || 0}
                        theme={activeTheme}
                        className={className}
                        // CustomSectionRenderer internally uses ResumeSection? Let's check.
                        // Ideally we pass id here too, but CustomSectionRenderer might use section.id internally.
                        // Let's pass it anyway if it supports it, or it will just be ignored.
                    />
                );
            }
            return null;
    }
};
