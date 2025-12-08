import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";

interface ProjectsSectionProps {
    data: ResumeData;
    theme: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function ProjectsSection({ data, theme, onUpdate, readOnly }: ProjectsSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    if (!onUpdate && (!data.projects || data.projects.length === 0)) {
        return null;
    }

    const items = data.projects || [];
    const handleUpdate = (newProjs: any[]) => {
        updateSection('projects', newProjs);
    };

    if (!data.projects || (data.projects.length === 0 && !onUpdate)) return null;

    return (
        <ResumeSection
            title="Projects"
            theme={theme}
            onAdd={onUpdate && !readOnly ? () => {
                const newProj = [{
                    id: crypto.randomUUID(),
                    name: { content: "Project Name" },
                    description: { content: "Description" },
                    technologies: []
                }, ...(data.projects || [])];
                handleUpdate(newProj);
            } : undefined}
        >
            {(!data.projects || data.projects.length === 0) && onUpdate && !readOnly ? (
                <EmptySectionPlaceholder 
                    className="mt-4"
                    message="Add your first project"
                    onClick={() => {
                        const newProj = [{
                            id: crypto.randomUUID(),
                            name: { content: "Project Name" },
                            description: { content: "Description" },
                            technologies: []
                        }, ...(data.projects || [])];
                        handleUpdate(newProj);
                    }}
                />
            ) : (
                <ResumeSectionList
                    data={data.projects}
                    onUpdate={handleUpdate}
                    readOnly={readOnly}
                    className={cn(
                        "grid gap-4",
                        theme === "modern" && "grid-cols-1",
                        theme === "portfolio" && "grid-cols-1 md:grid-cols-2",
                        theme === "creative" && "space-y-8 border-l-2 border-slate-100 pl-6 ml-1 block"
                    )}
                    strategy={theme === "portfolio" ? "rect" : "vertical"}
                    renderItem={(project, i, updateItem, deleteItem) => (
                        <div className={cn(
                            "break-inside-avoid space-y-2 group/item relative",
                            theme === "modern" && "p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-all",
                            theme === "portfolio" && "p-0",
                            theme === "minimal" && "text-center mb-6"
                        )} key={project.id || i}>
                           {/* Creative Theme Dot */}
                            {theme === "creative" && (
                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                            )}
    
                            <div className={cn(
                                "flex justify-between items-start gap-3",
                                theme === "minimal" && "flex-col items-center relative"
                            )}>
                                 <h3 className={cn(
                                    "font-bold text-slate-900",
                                    theme === "modern" && "text-base",
                                    theme === "portfolio" && "text-lg",
                                    theme === "portfolio" && "text-lg",
                                    theme === "creative" && "text-lg",
                                    theme === "studio" && "text-xl tracking-tight text-white",
                                 )}>
                                        <InlineEdit readOnly={readOnly || !onUpdate} 
                                        value={project.name?.content} 
                                        placeholder="Project Name"
                                        className={cn(
                                            "bg-transparent",
                                            theme === "minimal" && "w-full block"
                                        )}
                                        onSave={(val) => updateItem({ name: { ...project.name, content: val } })}
                                        path={`projects[${i}].name.content`}
                                        alignment={project.name?.alignment || (theme === "minimal" ? "center" : undefined)}
                                    />
                                 </h3>
                                 
                                 <div className={cn(
                                     "flex items-center gap-2",
                                     theme === "minimal" ? "w-full justify-center mt-1" : "shrink-0"
                                 )}>
                                    {project.url && (
                                       <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm truncate max-w-[150px]">
                                             <InlineEdit readOnly={readOnly || !onUpdate} 
                                            value={project.url} 
                                            placeholder="URL"
                                            onSave={(val) => updateItem({ url: val })}
                                         />
                                       </a>
                                    )}
                                    
                                     {onUpdate && !readOnly && (
                                         <ThemeDeleteButton
                                            className={cn(
                                              "bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-500 p-1 w-6 h-6 border-none transition-opacity",
                                              theme === "minimal" && "absolute right-0 top-0",
                                              theme === "studio" && "text-red-400 hover:bg-white/10 ml-2 relative top-0 right-0"
                                            )}
                                            onClick={deleteItem}
                                         />
                                     )}
                                 </div>
                            </div>
    
                            <div className={cn(
                                "text-slate-600 text-sm leading-relaxed",
                                theme === "minimal" && "text-center",
                                theme === "studio" && "text-neutral-400"
                            )}>
                                 <InlineEdit readOnly={readOnly || !onUpdate} 
                                    value={project.description?.content} 
                                    placeholder="Project description" 
                                    multiline
                                    onSave={(val) => updateItem({ description: { ...project.description, content: val } })}
                                    path={`projects[${i}].description.content`}
                                    alignment={project.description?.alignment || (theme === "minimal" ? "center" : undefined)}
                                />
                            </div>
                            
                             <div className={cn(
                                 "flex flex-wrap gap-1 mt-2",
                                 theme === "minimal" && "justify-center"
                             )}>
                                {(project.technologies || []).map((tech, tIndex) => (
                                    <span key={tIndex} className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <InlineEdit readOnly={readOnly || !onUpdate}
                                           value={tech}
                                           onSave={(val) => {
                                               const newTech = [...(project.technologies || [])];
                                               newTech[tIndex] = val;
                                               updateItem({ technologies: newTech });
                                           }}
                                           className="bg-transparent"
                                        />
                                          {onUpdate && !readOnly && (
                                            <button 
                                                onClick={() => {
                                                    const newTech = [...(project.technologies || [])];
                                                    newTech.splice(tIndex, 1);
                                                    updateItem({ technologies: newTech });
                                                }}
                                                className="hover:text-red-500 ml-1"
                                            >×</button>
                                         )}
                                    </span>
                                ))}
                                   {onUpdate && !readOnly && (
                                     <button 
                                         onClick={() => {
                                            const newTech = [...(project.technologies || []), "New Tech"];
                                            updateItem({ technologies: newTech });
                                         }}
                                         className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full transition-colors"
                                     >+ Add</button>
                                   )}
                             </div>
                        </div>
                    )}
                />
            )}
        </ResumeSection>
    );
}
