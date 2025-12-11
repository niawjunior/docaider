
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { getSectionTheme } from "@/lib/themes/styles";
import { useResume } from "@/components/resume/state/ResumeContext";

interface ExperienceSectionProps {
    theme: string;
    className?: string;
}

export function ExperienceSection({ theme, className }: ExperienceSectionProps) {
    const { data, updateField, readOnly } = useResume();
    
    // Get Theme Config
    const config = getSectionTheme(theme, 'experience');
    const { styles, strategy } = config;

    const handleUpdate = (newExp: any[]) => {
        updateField('experience', newExp);
    };

    if (!updateField && (!data.experience || data.experience.length === 0)) {
        return null;
    }

    return (
        <ResumeSection
            title="Experience"
            theme={theme}
            className={className}
            onAdd={!readOnly ? () => {
                const newExp = [{
                    id: crypto.randomUUID(),
                    company: { content: "Company Name" },
                    position: { content: "Position" },
                    startDate: { content: "2024" },
                    description: { content: "Job description goes here..." }
                }, ...(data.experience || [])];
                handleUpdate(newExp);
            } : undefined}
        >
            {(!data.experience || data.experience.length === 0) && !readOnly ? (
                <EmptySectionPlaceholder
                    className="mt-4"
                    message="Add your first experience"
                    onClick={() => {
                        const newExp = [{
                            id: crypto.randomUUID(),
                            company: { content: "Company Name" },
                            position: { content: "Position" },
                            startDate: { content: "2024" },
                            description: { content: "Job description goes here..." }
                        }, ...(data.experience || [])];
                        handleUpdate(newExp);
                    }}
                />
            ) : (
                <ResumeSectionList
                  data={data.experience}
                  readOnly={readOnly}
                  onUpdate={handleUpdate}
                  className={styles.container}
                  renderItem={(exp, index, updateItem, deleteItem) => (
                      <div className={styles.item}>
                        {/* Decorative Element e.g. Dot for Creative Theme */}
                        {strategy.showDecorations && (
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                        )}

                        <div className={styles.header}>
                            {/* Position / Title */}
                            <h3 className={styles.title}>
                                <InlineEdit
                                    readOnly={readOnly}
                                    value={exp.position?.content} 
                                    placeholder="Position"
                                    className="bg-transparent" // Layout handled by wrapper
                                    onSave={(val) => updateItem({ position: { ...exp.position, content: val } })}
                                    path={`experience[${index}].position.content`}
                                    // Use strategy alignment
                                    alignment={exp.position?.alignment || (strategy.alignment === 'center' ? 'center' : undefined)}
                                />
                            </h3>

                            {/* Meta Group: Date & Delete */}
                            <div className={cn("flex items-center gap-2", theme === "minimal" && "w-full justify-center")}>
                                {/* Standard Inline Dates */}
                                {strategy.datesPosition === 'inline' && (
                                     <div className={styles.metadata}>
                                        <InlineEdit readOnly={readOnly} 
                                            value={exp.startDate?.content} 
                                            placeholder="Start"
                                            onSave={(val) => updateItem({ startDate: { ...exp.startDate, content: val } })}
                                            path={`experience[${index}].startDate.content`}
                                            alignment={exp.startDate?.alignment || undefined}
                                        />
                                        <span>-</span>
                                        <InlineEdit readOnly={readOnly} 
                                            value={exp.endDate?.content} 
                                            placeholder="Present"
                                            onSave={(val) => updateItem({ endDate: { ...exp.endDate, content: val } })}
                                            path={`experience[${index}].endDate.content`}
                                            alignment={exp.endDate?.alignment || undefined}
                                        />
                                    </div>
                                )}

                                {!readOnly && (
                                    <ThemeDeleteButton
                                        className={styles.deleteButton || "text-red-500 hover:bg-red-50 rounded p-1 w-6 h-6"}
                                        onClick={deleteItem}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Body content */}
                        <div>
                             {/* Company Name / Subtitle */}
                            <div className={styles.subtitle}>
                                <InlineEdit
                                    readOnly={readOnly}
                                    value={exp.company?.content} 
                                    placeholder="Company"
                                    className="bg-transparent"
                                    onSave={(val) => updateItem({ company: { ...exp.company, content: val } })}
                                    path={`experience[${index}].company.content`}
                                    alignment={exp.company?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                                />
                            </div>
                            
                            {/* Secondary Date Location (e.g. Creative Theme) */}
                            {strategy.datesPosition === 'below-title' && (
                                <div className={styles.metadata}>
                                    <InlineEdit readOnly={readOnly} 
                                        value={exp.startDate?.content} 
                                        placeholder="Start"
                                        onSave={(val) => updateItem({ startDate: { ...exp.startDate, content: val } })}
                                        path={`experience[${index}].startDate.content`}
                                        alignment={exp.startDate?.alignment || undefined}
                                    />
                                    <span> - </span>
                                    <InlineEdit readOnly={readOnly} 
                                        value={exp.endDate?.content} 
                                        placeholder="Present"
                                        onSave={(val) => updateItem({ endDate: { ...exp.endDate, content: val } })}
                                        path={`experience[${index}].endDate.content`}
                                        alignment={exp.endDate?.alignment || undefined}
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div className={styles.description}>
                                <InlineEdit
                                    readOnly={readOnly}
                                    value={exp.description?.content} 
                                    placeholder="Description"
                                    multiline
                                    onSave={(val) => updateItem({ description: { ...exp.description, content: val } })}
                                    path={`experience[${index}].description.content`}
                                    alignment={exp.description?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                                />
                            </div>
                        </div>
                      </div>
                  )}
              />
            )}
        </ResumeSection>
    );
}
