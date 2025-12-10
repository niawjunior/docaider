
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { getSectionTheme } from "@/lib/themes/styles";

interface EducationSectionProps {
    data: ResumeData;
    theme: string;
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function EducationSection({ data, theme, onUpdate, readOnly }: EducationSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);
    
    // Get Theme Config
    // Education uses the 'Experience' styles usually (List format), but we map it as 'education' to allow future divergence if needed, 
    // or rely on the fallback in styles.ts which currently maps 'education' usually to experience styles or similar.
    // In styles.ts we mapped 'education' explicitly check inside getSectionTheme?
    // Actually getSectionTheme signature is currently: section: 'experience' | 'projects' | 'education' | 'custom'
    // And implementation returns EXPERIENCE_STYLES for implicit education fallthrough or if I add it explicitly.
    // Let's assume it maps to EXPERIENCE_STYLES as per my previous edit or default.
    const config = getSectionTheme(theme, 'education');
    const { styles, strategy } = config;

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
                    className={styles.container}
                    renderItem={(edu, index, updateItem, deleteItem) => (
                        <div className={styles.item}>
                            {/* Decoration (Creative Dot) */}
                            {strategy.showDecorations && (
                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                            )}

                            <div className={styles.header}>
                                <h3 className={styles.title}>
                                    <InlineEdit
                                        readOnly={readOnly || !onUpdate}
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
                                 <InlineEdit readOnly={readOnly || !onUpdate} 
                                     value={edu.degree?.content} 
                                     placeholder="Degree"
                                     className="bg-transparent"
                                     onSave={(val) => updateItem({ degree: { ...edu.degree, content: val } })}
                                     path={`education[${index}].degree.content`}
                                     alignment={edu.degree?.alignment || undefined}
                                 />
                                 <span>in</span>
                                <InlineEdit readOnly={readOnly || !onUpdate} 
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
