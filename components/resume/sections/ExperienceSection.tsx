
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { getSectionTheme } from "@/lib/themes/styles";

interface ExperienceSectionProps {
    data: ResumeData;
    theme: string;
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function ExperienceSection({ data, theme, onUpdate, readOnly }: ExperienceSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    // Get Theme Config
    // This removes tight coupling to specific theme names
    const config = getSectionTheme(theme, 'experience');
    const { styles, strategy } = config;

    if (!onUpdate && (!data.experience || data.experience.length === 0)) {
        return null;
    }

    const handleUpdate = (newExp: any[]) => {
        updateSection('experience', newExp);
    };

    return (
        <ResumeSection
            title="Experience"
            theme={theme}
            onAdd={onUpdate && !readOnly ? () => {
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
            {(!data.experience || data.experience.length === 0) && onUpdate && !readOnly ? (
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
                                    readOnly={readOnly || !onUpdate}
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
                                        <InlineEdit readOnly={readOnly || !onUpdate} 
                                            value={exp.startDate?.content} 
                                            placeholder="Start"
                                            onSave={(val) => updateItem({ startDate: { ...exp.startDate, content: val } })}
                                            path={`experience[${index}].startDate.content`}
                                            alignment={exp.startDate?.alignment || undefined}
                                        />
                                        <span>-</span>
                                        <InlineEdit readOnly={readOnly || !onUpdate} 
                                            value={exp.endDate?.content} 
                                            placeholder="Present"
                                            onSave={(val) => updateItem({ endDate: { ...exp.endDate, content: val } })}
                                            path={`experience[${index}].endDate.content`}
                                            alignment={exp.endDate?.alignment || undefined}
                                        />
                                    </div>
                                )}

                                {onUpdate && !readOnly && (
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
                                    readOnly={readOnly || !onUpdate}
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
                                    <InlineEdit readOnly={readOnly || !onUpdate} 
                                        value={exp.startDate?.content} 
                                        placeholder="Start"
                                        onSave={(val) => updateItem({ startDate: { ...exp.startDate, content: val } })}
                                        path={`experience[${index}].startDate.content`}
                                        alignment={exp.startDate?.alignment || undefined}
                                    />
                                    <span> - </span>
                                    <InlineEdit readOnly={readOnly || !onUpdate} 
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
                                    readOnly={readOnly || !onUpdate}
                                    value={exp.description?.content} 
                                    placeholder="Description"
                                    multiline
                                    // No need for w-full block anymore? InlineEdit component now has max-w-full and works better.
                                    // But minimal theme used 'w-full block' to fill width.
                                    // styles.description includes 'w-full block' for minimal.
                                    // So we don't need manual prop if we trust the wrapper?
                                    // Wait, InlineEdit needs a className to become block if it's default inline-block.
                                    // styles.description applies to the WRAPPER div usually.
                                    // Let's check: "description" in minimal styles is: "text-slate-600 ... w-full block".
                                    // But I apply `styles.description` to the WRAPPER div above?
                                    // In the original, wrapper had classNames.
                                    // Here: <div className={styles.description}> <InlineEdit ... /> </div>
                                    // If wrapper is w-full block, InlineEdit inside needs to be w-full?
                                    // InlineEdit default is inline-block min-w.
                                    // If wrapper is block, InlineEdit is just an inline element inside.
                                    // For minimal, we want InlineEdit to BE block.
                                    // So I should pass the class to InlineEdit or put it on wrapper?
                                    // If I put "w-full block" on wrapper, InlineEdit takes width only if width is 100%.
                                    // Actually, let's keep it safe.
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
