import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/ui/inline-edit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";

interface EducationSectionProps {
    data: ResumeData;
    theme: "modern" | "minimal" | "creative";
    onUpdate?: (data: ResumeData) => void;
}

export function EducationSection({ data, theme, onUpdate }: EducationSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    const handleUpdate = (newEdu: any[]) => {
        updateSection('education', newEdu);
    };

    if (!data.education && !onUpdate) return null;

    return (
        <ResumeSection
            title="Education"
            theme={theme}
            onAdd={onUpdate ? () => {
                const newEdu = [{
                    id: crypto.randomUUID(),
                    institution: "University",
                    degree: "Degree",
                    startDate: "2020",
                    endDate: "2024"
                }, ...(data.education || [])];
                handleUpdate(newEdu);
            } : undefined}
        >
            {(!data.education || data.education.length === 0) && onUpdate ? (
                <EmptySectionPlaceholder 
                    className="mt-4"
                    message="Add your education"
                    onClick={() => {
                        const newEdu = [{
                            id: crypto.randomUUID(),
                            institution: "University",
                            degree: "Degree",
                            startDate: "2020",
                            endDate: "2024"
                        }, ...(data.education || [])];
                        handleUpdate(newEdu);
                    }}
                />
            ) : (
                <ResumeSectionList
                    data={data.education}
                    onUpdate={handleUpdate}
                    className="space-y-4"
                    renderItem={(edu, index, updateItem, deleteItem) => (
                        <div className={cn(
                            "group/edu relative",
                            theme !== "creative" && "hover:bg-slate-50 p-2 -mx-2 rounded transition-colors",
                            theme === "minimal" && "text-center"
                        )}>
                            <div className={cn(
                                "flex justify-between items-start mb-1 gap-4",
                                theme === "minimal" && "flex-col items-center text-center relative"
                            )}>
                                <h3 className={cn(
                                    "font-bold",
                                    theme !== "creative" && "w-full"
                                )}>
                                    <InlineEdit readOnly={!onUpdate} 
                                        value={edu.institution} 
                                        placeholder="Institution"
                                        className={theme === "minimal" ? "text-center w-full block" : ""}
                                        onSave={(val) => updateItem({ institution: val })}
                                    />
                                </h3>
                                
                                <div className={cn(
                                    "flex items-center gap-2",
                                    theme === "minimal" ? "w-full justify-center mt-1" : "shrink-0"
                                )}>
                                    {theme !== "creative" && (
                                        <div className="text-sm text-slate-500 flex gap-1 whitespace-nowrap">
                                            <InlineEdit readOnly={!onUpdate} 
                                                value={edu.startDate} 
                                                placeholder="Start"
                                                onSave={(val) => updateItem({ startDate: val })}
                                            />
                                            <span>-</span>
                                            <InlineEdit readOnly={!onUpdate} 
                                                value={edu.endDate} 
                                                placeholder="Present"
                                                onSave={(val) => updateItem({ endDate: val })}
                                            />
                                        </div>
                                    )}

                                     {onUpdate && (
                                        <ThemeDeleteButton
                                            className={cn(
                                                "text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-6 h-6 p-1 transition-opacity",
                                                theme === "minimal" ? "absolute right-0 top-0" : ""
                                            )}
                                            onClick={deleteItem}
                                        />
                                    )}
                                </div>
                            </div>
                            
                            <div className={cn(
                                "text-slate-600 flex gap-1",
                                theme === "minimal" && "justify-center"
                            )}>
                                 <InlineEdit readOnly={!onUpdate} 
                                     value={edu.degree} 
                                     placeholder="Degree"
                                     onSave={(val) => updateItem({ degree: val })}
                                 />
                                 <span>in</span>
                                <InlineEdit readOnly={!onUpdate} 
                                     value={edu.fieldOfStudy} 
                                     placeholder="Field of Study"
                                     onSave={(val) => updateItem({ fieldOfStudy: val })}
                                 />
                            </div>
                            
                            {/* Creative Theme Date Location */}
                            {theme === "creative" && (
                                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider flex gap-1">
                                    <InlineEdit readOnly={!onUpdate} 
                                        value={edu.startDate} 
                                        placeholder="Start"
                                        onSave={(val) => updateItem({ startDate: val })}
                                    />
                                    <span>-</span>
                                    <InlineEdit readOnly={!onUpdate} 
                                        value={edu.endDate} 
                                        placeholder="Present"
                                        onSave={(val) => updateItem({ endDate: val })}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                />
            )}
        </ResumeSection>
    );
}
