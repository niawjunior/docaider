
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { getSectionTheme } from "@/lib/themes/styles";
import { useResume } from "@/components/resume/state/ResumeContext";

interface EducationSectionProps {
    theme: string;
    className?: string;
}

export function EducationSection({ theme, className }: EducationSectionProps) {
    const { data, updateField, readOnly } = useResume();
    
    const config = getSectionTheme(theme, 'education');
    const { styles, strategy } = config;

    const handleUpdate = (newEdu: any[]) => {
        updateField('education', newEdu);
    };

    if (!updateField && (!data.education || data.education.length === 0)) {
        return null;
    }

    return (
        <ResumeSection
            title="Education"
            theme={theme}
            className={className}
            onAdd={!readOnly ? () => {
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
            {(!data.education || data.education.length === 0) && !readOnly ? (
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
                    className={styles.container}
                    renderItem={(edu, index, updateItem, deleteItem) => (
                        <div className={styles.item}>
                            {/* Decoration (Creative Dot) */}
                            {strategy.showDecorations && (
                                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                            )}

                            <div className={styles.header}>
                                <h3 className={styles.title}>
                                    <InlineEdit
                                        readOnly={readOnly}
                                        value={edu.institution?.content} 
                                        placeholder="Institution"
                                        className="bg-transparent"
                                        onSave={(val: string) => updateItem({ institution: { ...edu.institution, content: val } })}
                                        path={`education[${index}].institution.content`}
                                        alignment={edu.institution?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                                    />
                                </h3>
                                
                                <div className={cn("flex items-center gap-2", theme === "minimal" && "w-full justify-center")}>
                                     {strategy.datesPosition === 'inline' && (
                                        <div className={styles.metadata}>
                                            <InlineEdit readOnly={readOnly} 
                                                value={edu.startDate?.content} 
                                                placeholder="Start"
                                                onSave={(val) => updateItem({ startDate: { ...edu.startDate, content: val } })}
                                                path={`education[${index}].startDate.content`}
                                                alignment={edu.startDate?.alignment || undefined}
                                            />
                                            <span>-</span>
                                            <InlineEdit readOnly={readOnly} 
                                                value={edu.endDate?.content} 
                                                placeholder="Present"
                                                onSave={(val) => updateItem({ endDate: { ...edu.endDate, content: val } })}
                                                path={`education[${index}].endDate.content`}
                                                alignment={edu.endDate?.alignment || undefined}
                                            />
                                        </div>
                                    )}

                                     {!readOnly && (
                                        <ThemeDeleteButton
                                            className={styles.deleteButton || "text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-6 h-6 p-1"}
                                            onClick={deleteItem}
                                        />
                                     )}
                                </div>
                            </div>
                            
                            {/* Subtitle / Degree Wrapper */}
                            <div className={cn(
                                styles.subtitle,
                                "flex flex-wrap gap-1", // Ensure degree parts flow together
                                strategy.alignment === 'center' ? "justify-center" : ""
                            )}>
                                 <InlineEdit readOnly={readOnly} 
                                     value={edu.degree?.content} 
                                     placeholder="Degree"
                                     className="bg-transparent"
                                     onSave={(val) => updateItem({ degree: { ...edu.degree, content: val } })}
                                     path={`education[${index}].degree.content`}
                                     alignment={edu.degree?.alignment || undefined}
                                 />
                                 <span>in</span>
                                <InlineEdit readOnly={readOnly} 
                                     value={edu.fieldOfStudy?.content} 
                                     placeholder="Field of Study"
                                     className="bg-transparent"
                                     onSave={(val) => updateItem({ fieldOfStudy: { ...edu.fieldOfStudy, content: val } })}
                                     path={`education[${index}].fieldOfStudy.content`}
                                     alignment={edu.fieldOfStudy?.alignment || undefined}
                                 />
                            </div>
                            
                            {/* Creative Theme Date Location */}
                            {strategy.datesPosition === 'below-title' && (
                                <div className={styles.metadata}>
                                    <InlineEdit readOnly={readOnly} 
                                        value={edu.startDate?.content} 
                                        placeholder="Start"
                                        onSave={(val) => updateItem({ startDate: { ...edu.startDate, content: val } })}
                                        path={`education[${index}].startDate.content`}
                                        alignment={edu.startDate?.alignment || undefined}
                                    />
                                    <span>-</span>
                                    <InlineEdit readOnly={readOnly} 
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
