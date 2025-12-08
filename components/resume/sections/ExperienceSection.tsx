import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";

interface ExperienceSectionProps {
    data: ResumeData;
    theme: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function ExperienceSection({ data, theme, onUpdate, readOnly }: ExperienceSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    if (!onUpdate && (!data.experience || data.experience.length === 0)) {
        return null;
    }

    const items = data.experience || [];
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
                }, ...data.experience];
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
                  className={cn(
                      theme === "creative" ? "space-y-8 border-l-2 border-slate-100 pl-6 ml-1" : "space-y-6",
                      // Studio theme spacing
                      theme === "studio" && "space-y-8"
                  )}
                  renderItem={(exp, index, updateItem, deleteItem) => (
                      <div className={cn(
                          "group/exp relative",
                          theme !== "creative" && "hover:bg-slate-50 p-2 -mx-2 rounded transition-colors"
                      )}>
                        {/* Creative Theme Dot */}
                        {theme === "creative" && (
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                        )}

                        <div className={cn(
                            "flex justify-between items-start mb-1 gap-4",
                            theme === "minimal" && "flex-col items-center text-center relative"
                        )}>
                            <h3 className={cn(
                                "font-bold",
                                theme === "creative" ? "text-lg" : "text-lg w-full",
                                theme === "studio" ? "text-white text-xl tracking-tight" : "text-slate-900" 
                            )}>
                                <InlineEdit
                                    readOnly={readOnly || !onUpdate}
                                    value={exp.position?.content} 
                                    placeholder="Position"
                                    className={cn(theme === "minimal" && "w-full block")}
                                    onSave={(val) => updateItem({ position: { ...exp.position, content: val } })}
                                    path={`experience[${index}].position.content`}
                                    alignment={exp.position?.alignment || (theme === "minimal" ? "center" : undefined)}
                                />
                            </h3>

                            <div className={cn(
                                "flex items-center gap-2",
                                theme === "minimal" ? "w-full justify-center mt-1" : "shrink-0"
                            )}>
                                {theme !== "creative" && (
                                     <div className={cn(
                                         "text-sm whitespace-nowrap flex gap-1",
                                         theme === "studio" ? "text-neutral-400" : "text-slate-500"
                                     )}>
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
                                        className={cn(
                                            "text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-6 h-6 p-1 transition-opacity",
                                            theme === "minimal" && "absolute right-0 top-0",
                                            theme === "studio" && "text-red-400 hover:bg-white/10 ml-2" // Add margin for studio to prevent overlap
                                        )}
                                        onClick={deleteItem}
                                    />
                                 )}
                            </div>
                        </div>

                        <div className={cn(
                            "text-slate-600",
                            theme === "minimal" ? "text-center text-sm" : ""
                        )}>
                            <div className={cn(
                                "font-medium mb-1",
                                theme === "creative" && "text-slate-500",
                                theme === "studio" ? "text-neutral-500" : "text-slate-700"
                            )}>
                                <InlineEdit
                                    readOnly={readOnly || !onUpdate}
                                    value={exp.company?.content} 
                                    placeholder="Company"
                                    className={cn(theme === "minimal" && "w-full block")}
                                    onSave={(val) => updateItem({ company: { ...exp.company, content: val } })}
                                    path={`experience[${index}].company.content`}
                                    alignment={exp.company?.alignment || (theme === "minimal" ? "center" : undefined)}
                                />
                            </div>
                            
                            {/* Creative Theme Dates (Below Title) */}
                            {theme === "creative" && (
                                <div className="text-xs text-slate-400 mb-2 font-mono">
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

                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                <InlineEdit
                                    readOnly={readOnly || !onUpdate}
                                    value={exp.description?.content} 
                                    placeholder="Description"
                                    multiline
                                    className={cn(theme === "minimal" && "w-full block")}
                                    onSave={(val) => updateItem({ description: { ...exp.description, content: val } })}
                                    path={`experience[${index}].description.content`}
                                    alignment={exp.description?.alignment || (theme === "minimal" ? "center" : undefined)}
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
