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
    const targetField = activeTarget || "";

    if (targetField === "personalInfo.summary.content") {
        alignmentPath = "personalInfo.summary.alignment";
        currentAlignment = getEffectiveAlignment((resumeData.personalInfo as any)?.summary?.alignment);
    } else if (targetField === "personalInfo.headerSummary.content") {
        alignmentPath = "personalInfo.headerSummary.alignment";
        currentAlignment = getEffectiveAlignment((resumeData.personalInfo as any)?.headerSummary?.alignment);
    } else if (targetField.endsWith(".content")) {
        // Generic handler for RichTextField which always stores data in { content, alignment }
        // and whose value path ends in ".content"
        alignmentPath = targetField.replace(/\.content$/, ".alignment");
        
        // Resolve current alignment value from path
        const parts = alignmentPath.split(/[.\[\]]/).filter(Boolean);
        let val: any = resumeData;
        for (const part of parts) {
            if (val === undefined || val === null) {
                val = undefined;
                break;
            }
            const index = parseInt(part);
            if (!isNaN(index)) {
                val = val[index];
            } else {
                val = val[part];
            }
        }
        currentAlignment = getEffectiveAlignment(val as string | null);
    }

    const alignmentDisabled = !alignmentPath;

    return (
        <div className="flex items-center gap-0.5">
            <ToolbarButton
                icon={AlignLeft}
                isActive={currentAlignment === "left" || !currentAlignment}
                onClick={() => alignmentPath && updateField(alignmentPath, "left")}
                disabled={alignmentDisabled}
            />
            <ToolbarButton
                icon={AlignCenter}
                isActive={currentAlignment === "center"}
                onClick={() => alignmentPath && updateField(alignmentPath, "center")}
                disabled={alignmentDisabled}
            />
            <ToolbarButton
                icon={AlignRight}
                isActive={currentAlignment === "right"}
                onClick={() => alignmentPath && updateField(alignmentPath, "right")}
                disabled={alignmentDisabled}
            />
            <ToolbarButton
                icon={AlignJustify}
                isActive={currentAlignment === "justify"}
                onClick={() => alignmentPath && updateField(alignmentPath, "justify")}
                disabled={alignmentDisabled}
            />
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
