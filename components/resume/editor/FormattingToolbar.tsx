"use client";

import { useEditorContext } from "./EditorContext";
import { Button } from "@/components/ui/button";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeData } from "@/lib/schemas/resume";
import { useLayoutEffect, useRef, useState } from "react";

interface FormattingToolbarProps {
  resumeData: ResumeData;
  onUpdate: (data: ResumeData) => void;
  theme: string;
}

export function FormattingToolbar({ resumeData, onUpdate, theme }: FormattingToolbarProps) {
  const { focusedField, hasSelection } = useEditorContext();
  const { updateField } = useResumeUpdate(resumeData, onUpdate);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const updatePosition = () => {
        if (!focusedField || !hasSelection) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectionRect = range.getBoundingClientRect();
        
        // Sticky Logic:
        // 1. Natural position: Top of container - toolbar height (45)
        // 2. Sticky constraints: 
        //    - Min Top: ~80px (below header)
        //    - Max Bottom: Container bottom - toolbar height (ensure it doesn't float below the container)
        
        let containerRect = selectionRect;
        const anchorNode = selection.anchorNode;
        if (anchorNode) {
             const element = anchorNode.nodeType === Node.TEXT_NODE 
                 ? anchorNode.parentElement 
                 : anchorNode as Element;
             
             if (element) {
                  containerRect = element.getBoundingClientRect();
             }
        }

        if (selectionRect.width === 0 && selectionRect.height === 0) return;
        
        const toolbarHeight = 45;
        const stickyTop = 80; // Offset for header
        const naturalTop = containerRect.top - toolbarHeight;
        
        // Stick to top if scrolled past, but stop if container ends
        // Math.max(naturalTop, stickyTop) -> Standard sticky
        // Math.min(..., containerRect.bottom - toolbarHeight) -> Stop at bottom
        
        const calculatedTop = Math.min(
            Math.max(naturalTop, stickyTop),
            containerRect.bottom - toolbarHeight
        );

        setPosition({
            top: calculatedTop,
            left: containerRect.left + containerRect.width / 2
        });
    };

    // Initial calculation
    updatePosition();

    // Listen to scroll globally (capture phase to catch inner scrolls)
    window.addEventListener("scroll", updatePosition, { capture: true });
    window.addEventListener("resize", updatePosition);

    return () => {
        window.removeEventListener("scroll", updatePosition, { capture: true });
        window.removeEventListener("resize", updatePosition);
    };
  }, [focusedField, hasSelection]);

  if (!focusedField || !hasSelection) return null;

  // Helper to determine effective alignment
  const getEffectiveAlignment = (val?: string | null) => {
      return val || (theme === "minimal" ? "center" : "left");
  };

  // Determine current alignment based on focused field path
  // Structure: "experience[0].description" or "summary" etc.
  
  // We need to find where the "alignment" property lives relative to the focused attribute.
  // 1. If path is "summary", alignment is "personalInfo.summaryAlignment"
  // 2. If path is "experience[0].description", alignment is "experience[0].alignment"
  // 3. If path is "education[0].degree", alignment is "education[0].alignment"
  
  let alignmentPath = "";
  let currentAlignment = "left";

  if (focusedField === "personalInfo.summary") {
      alignmentPath = "personalInfo.summaryAlignment";
      currentAlignment = getEffectiveAlignment((resumeData.personalInfo as any)?.summaryAlignment);
  } else if (focusedField === "personalInfo.headerSummary") {
      alignmentPath = "personalInfo.headerSummaryAlignment";
      currentAlignment = getEffectiveAlignment((resumeData.personalInfo as any)?.headerSummaryAlignment);
  } else if (focusedField.includes("experience")) {
       const match = focusedField.match(/experience\[(\d+)\]/);
       if (match) {
           const index = parseInt(match[1]);
           const item = resumeData.experience?.[index] as any;
           
           if (focusedField.includes("description")) {
               alignmentPath = `experience[${index}].alignment`;
               currentAlignment = getEffectiveAlignment(item?.alignment);
           } else if (focusedField.includes("company")) {
               alignmentPath = `experience[${index}].companyAlignment`;
               currentAlignment = getEffectiveAlignment(item?.companyAlignment);
           } else if (focusedField.includes("position")) {
               alignmentPath = `experience[${index}].positionAlignment`;
               currentAlignment = getEffectiveAlignment(item?.positionAlignment);
           } else if (focusedField.includes("startDate") || focusedField.includes("endDate")) {
               alignmentPath = `experience[${index}].dateAlignment`;
               currentAlignment = getEffectiveAlignment(item?.dateAlignment);
           }
       }
  } else if (focusedField.includes("education")) {
       const match = focusedField.match(/education\[(\d+)\]/);
       if (match) {
           const index = parseInt(match[1]);
           const item = resumeData.education?.[index] as any;

           if (focusedField.includes("description") || focusedField.includes("fieldOfStudy")) {
               alignmentPath = `education[${index}].alignment`;
               currentAlignment = getEffectiveAlignment(item?.alignment);
           } else if (focusedField.includes("institution")) {
               alignmentPath = `education[${index}].institutionAlignment`;
               currentAlignment = getEffectiveAlignment(item?.institutionAlignment);
           } else if (focusedField.includes("degree")) {
               alignmentPath = `education[${index}].degreeAlignment`;
               currentAlignment = getEffectiveAlignment(item?.degreeAlignment);
           } else if (focusedField.includes("startDate") || focusedField.includes("endDate")) {
               alignmentPath = `education[${index}].dateAlignment`;
               currentAlignment = getEffectiveAlignment(item?.dateAlignment);
           }
       }
  } else if (focusedField.includes("projects")) {
        const match = focusedField.match(/projects\[(\d+)\]/);
        if (match) {
            const index = parseInt(match[1]);
            const item = resumeData.projects?.[index] as any;

            if (focusedField.includes("description")) {
                alignmentPath = `projects[${index}].alignment`;
                currentAlignment = getEffectiveAlignment(item?.alignment);
            } else if (focusedField.includes("name")) {
                alignmentPath = `projects[${index}].nameAlignment`;
                currentAlignment = getEffectiveAlignment(item?.nameAlignment);
            }
        }
  } else if (focusedField.includes("customSections")) {
       // customSections[0].items[0].content -> we probably want alignment on the ITEM level
       const match = focusedField.match(/customSections\[(\d+)\]\.items\[(\d+)\]/);
       if (match) {
           const sectionIndex = parseInt(match[1]);
           const itemIndex = parseInt(match[2]);
           alignmentPath = `customSections[${sectionIndex}].items[${itemIndex}].alignment`;
           currentAlignment = getEffectiveAlignment((resumeData.customSections?.[sectionIndex]?.items?.[itemIndex] as any)?.alignment);
       }
  }

  // If we couldn't resolve a valid alignment target (e.g. focusing on a date or title that doesn't support alignment), hide toolbar
  if (!alignmentPath) return null;

  return (
    <div 
        ref={toolbarRef}
        className="fixed z-[9] flex items-center space-x-1 bg-slate-900 text-white rounded-lg p-1 border border-slate-700 shadow-2xl backdrop-blur-md"
        style={{ 
            top: position.top, 
            left: position.left,
            transform: "translateX(-50%)" // Center align relative to left coord
        }}
    >
      <ToolbarButton 
        icon={AlignLeft} 
        isActive={currentAlignment === "left" || !currentAlignment} 
        onClick={() => updateField(alignmentPath, "left")}
      />
      <ToolbarButton 
        icon={AlignCenter} 
        isActive={currentAlignment === "center"} 
        onClick={() => updateField(alignmentPath, "center")}
      />
      <ToolbarButton 
        icon={AlignRight} 
        isActive={currentAlignment === "right"} 
        onClick={() => updateField(alignmentPath, "right")}
      />
      <ToolbarButton 
        icon={AlignJustify} 
        isActive={currentAlignment === "justify"} 
        onClick={() => updateField(alignmentPath, "justify")}
      />
    </div>
  );
}

function ToolbarButton({ icon: Icon, isActive, onClick }: { icon: any, isActive: boolean, onClick: () => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "w-7 h-7 rounded-sm transition-all",
                isActive ? "bg-blue-500 text-white shadow-sm" : "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            )}
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent focus loss on mouse down
            }}
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
        >
            <Icon className="w-4 h-4" />
        </Button>
    )
}
