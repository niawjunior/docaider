import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";

interface EducationSectionProps {
    data: ResumeData;
    theme: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function EducationSection({ data, theme, onUpdate, readOnly }: EducationSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    if (!onUpdate && (!data.education || data.education.length === 0)) {
        return null;
    }

    const handleUpdate = (newEdu: any[]) => {
        updateSection('education', newEdu);
    };

    if (!data.education && !onUpdate) return null;

    return (
        <ResumeSection
            title="Education"
            theme={theme}
            onAdd={onUpdate && !readOnly ? () => {
                const newEdu = [{
                    id: crypto.randomUUID(),
                    institution: { content: "University" },
                    degree: { content: "Degree" },
                    startDate: { content: "2020" },
                    endDate: { content: "2024" }
                }, ...(data.education || [])];
                handleUpdate(newEdu);
            } : undefined}
        >
            {(!data.education || data.education.length === 0) && onUpdate && !readOnly ? (
                <EmptySectionPlaceholder 
                    className="mt-4"
                    message="Add your education"
                    onClick={() => {
                        const newEdu = [{
                            id: crypto.randomUUID(),
                            institution: { content: "University" },
                            degree: { content: "Degree" },
                            startDate: { content: "2020" },
                            endDate: { content: "2024" }
                        }, ...(data.education || [])];
                        handleUpdate(newEdu);
                    }}
                />
            ) : (
                <ResumeSectionList
                    data={data.education}
                    onUpdate={handleUpdate}
                    readOnly={readOnly}
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
                                    theme !== "creative" && "w-full",
                                    theme === "studio" ? "text-white text-xl tracking-tight" : "text-slate-900"
                                )}>
                                    <InlineEdit
                                        readOnly={readOnly || !onUpdate}
                                        value={edu.institution?.content} 
                                        placeholder="Institution"
                                        className={cn(theme === "minimal" && "w-full block")}
                                        onSave={(val: string) => updateItem({ institution: { ...edu.institution, content: val } })}
                                        path={`education[${index}].institution.content`}
                                        alignment={edu.institution?.alignment || (theme === "minimal" ? "center" : undefined)}
                                    />
                                </h3>
                                
                                <div className={cn(
                                    "flex items-center gap-2",
                                    theme === "minimal" ? "w-full justify-center mt-1" : "shrink-0"
                                )}>
                                    {theme !== "creative" && (
                                        <div className={cn(
                                            "text-sm flex gap-1 whitespace-nowrap",
                                            theme === "studio" ? "text-neutral-400" : "text-slate-500"
                                        )}>
                                            <InlineEdit readOnly={readOnly || !onUpdate} 
                                                value={edu.startDate?.content} 
                                                placeholder="Start"
                                                onSave={(val) => updateItem({ startDate: { ...edu.startDate, content: val } })}
                                                path={`education[${index}].startDate.content`}
                                                alignment={edu.startDate?.alignment || undefined}
                                            />
                                            <span>-</span>
                                            <InlineEdit readOnly={readOnly || !onUpdate} 
                                                value={edu.endDate?.content} 
                                                placeholder="Present"
                                                onSave={(val) => updateItem({ endDate: { ...edu.endDate, content: val } })}
                                                path={`education[${index}].endDate.content`}
                                                alignment={edu.endDate?.alignment || undefined}
                                            />
                                        </div>
                                    )}

                                     {onUpdate && !readOnly && (
                                        <ThemeDeleteButton
                                            className={cn(
                                                "text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-6 h-6 p-1 transition-opacity",
                                                theme === "minimal" && "absolute right-0 top-0",
                                                theme === "studio" && "text-red-400 hover:bg-white/10 ml-2"
                                            )}
                                            onClick={deleteItem}
                                        />
                                     )}
                                </div>
                            </div>
                            
                            <div className={cn(
                                "text-slate-600 flex gap-1",
                                theme === "minimal" && "justify-center",
                                theme === "studio" && "text-neutral-500"
                            )}>
                                 <InlineEdit readOnly={readOnly || !onUpdate} 
                                     value={edu.degree?.content} 
                                     placeholder="Degree"
                                     onSave={(val) => updateItem({ degree: { ...edu.degree, content: val } })}
                                     path={`education[${index}].degree.content`}
                                     alignment={edu.degree?.alignment || undefined}
                                 />
                                 <span>in</span>
                                <InlineEdit readOnly={readOnly || !onUpdate} 
                                     value={edu.fieldOfStudy?.content} 
                                     placeholder="Field of Study"
                                     onSave={(val) => updateItem({ fieldOfStudy: { ...edu.fieldOfStudy, content: val } })}
                                     path={`education[${index}].fieldOfStudy.content`}
                                     alignment={edu.fieldOfStudy?.alignment || undefined}
                                 />
                            </div>
                            
                            {/* Creative Theme Date Location */}
                            {theme === "creative" && (
                                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider flex gap-1">
                                    <InlineEdit readOnly={readOnly || !onUpdate} 
                                        value={edu.startDate?.content} 
                                        placeholder="Start"
                                        onSave={(val) => updateItem({ startDate: { ...edu.startDate, content: val } })}
                                        path={`education[${index}].startDate.content`}
                                        alignment={edu.startDate?.alignment || undefined}
                                    />
                                    <span>-</span>
                                    <InlineEdit readOnly={readOnly || !onUpdate} 
                                        value={edu.endDate?.content} 
                                        placeholder="Present"
                                        onSave={(val) => updateItem({ endDate: { ...edu.endDate, content: val } })}
                                        path={`education[${index}].endDate.content`}
                                        alignment={edu.endDate?.alignment || undefined}
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
