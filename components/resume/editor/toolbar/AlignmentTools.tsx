import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/lib/schemas/resume";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

interface AlignmentToolsProps {
    resumeData: ResumeData;
    onUpdate: (data: ResumeData) => void;
    activeTarget: string | null;
    theme: string;
    updateField: (path: string, value: any) => void;
}

export function AlignmentTools({ resumeData, activeTarget, theme, updateField }: AlignmentToolsProps) {
    // Helper to determine effective alignment
    const getEffectiveAlignment = (val?: string | null) => {
        return val || (theme === "minimal" ? "center" : "left");
    };

    let alignmentPath = "";
    let currentAlignment = "left";
    let pathExists = true;
    const targetField = activeTarget || "";

    if (targetField === "personalInfo.summary.content") {
        alignmentPath = "personalInfo.summary.alignment";
        currentAlignment = getEffectiveAlignment(resumeData.personalInfo?.summary?.alignment);
    } else if (targetField === "personalInfo.headerSummary.content") {
        alignmentPath = "personalInfo.headerSummary.alignment";
        currentAlignment = getEffectiveAlignment(resumeData.personalInfo?.headerSummary?.alignment);
    } else if (targetField.endsWith(".content")) {
        // Restriction: For structured sections, only allow alignment on 'description' fields.
        // Titles, dates, company names etc. should be strictly controlled by the theme.
        const isStructuredSection = targetField.startsWith("experience") || 
                                    targetField.startsWith("education") || 
                                    targetField.startsWith("projects") ||
                                    targetField.startsWith("customSections");
        
        if (isStructuredSection && !targetField.includes("description") && !targetField.includes("content.content")) {
             // Note: Custom sections use 'content.content' for the description field.
             // Standard sections use 'description.content'.
             // We allow both.
            return null;
        }

        // Generic handler for RichTextField which always stores data in { content, alignment }
        // and whose value path ends in ".content"
        alignmentPath = targetField.replace(/\.content$/, ".alignment");
        
        // Resolve current alignment value from path
        const parts = alignmentPath.split(/[.\[\]]/).filter(Boolean);
        let val: any = resumeData;
        
        for (const part of parts) {
            if (val === undefined || val === null) {
                val = undefined;
                // If we hit undefined while traversing, the field likely doesn't exist
                // But for optional fields this is tricky.
                // However, for toolbar visibility, if the field isn't there, we probably shouldn't show it?
                // Actually, if it's "undefined", getEffectiveAlignment returns default.
                // The issue is distinguishing "supports alignment but unset" vs "doesn't support".
                // If the schema structure doesn't match { content, alignment }, then 'alignment' prop won't exist.
                break;
            }
            const index = parseInt(part);
            if (!isNaN(index)) {
                val = val[index];
            } else {
                // If we are looking for the 'alignment' key (last part usually)
                // and the parent object does not have it (e.g. parent is just a string, not an object),
                // then accessing .alignment on a string returns undefined.
                // BUT accessing a property on a string in JS wraps it.
                // We should check if the parent is an object likely.
                if (part === "alignment" && typeof val !== 'object') {
                    pathExists = false; 
                }
                val = val[part];
            }
        }
        currentAlignment = getEffectiveAlignment(val as string | null);
    }

    if (!alignmentPath || !pathExists) return null;

    return (
        <div className="flex items-center gap-0.5">
            <ToolbarButton
                icon={AlignLeft}
                isActive={currentAlignment === "left" || !currentAlignment}
                onClick={() => alignmentPath && updateField(alignmentPath, "left")}
            />
            <ToolbarButton
                icon={AlignCenter}
                isActive={currentAlignment === "center"}
                onClick={() => alignmentPath && updateField(alignmentPath, "center")}
            />
            <ToolbarButton
                icon={AlignRight}
                isActive={currentAlignment === "right"}
                onClick={() => alignmentPath && updateField(alignmentPath, "right")}
            />
            <ToolbarButton
                icon={AlignJustify}
                isActive={currentAlignment === "justify"}
                onClick={() => alignmentPath && updateField(alignmentPath, "justify")}
            />
            {/* Separator for when AI assistant follows */}
            <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        </div>
    );
}

function ToolbarButton({ icon: Icon, isActive, onClick, className, disabled }: { icon: any, isActive: boolean, onClick: () => void, className?: string, disabled?: boolean }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className={cn(
                "w-7 h-7 rounded-sm transition-all",
                isActive ? "bg-blue-500 text-white shadow-sm" : "hover:bg-slate-700 text-slate-400 hover:text-slate-200",
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent text-slate-600",
                className
            )}
            onMouseDown={(e) => {
                e.preventDefault(); 
            }}
            onClick={(e) => {
                e.preventDefault();
                if (!disabled) onClick();
            }}
        >
            <Icon className="w-4 h-4" />
        </Button>
    )
}
