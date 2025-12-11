
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { getSectionTheme } from "@/lib/themes/styles";
import { useResume } from "@/components/resume/state/ResumeContext";

interface ProjectsSectionProps {
    theme: string;
    className?: string; // Add className prop
}

export function ProjectsSection({ theme, className }: ProjectsSectionProps) {
    const { data, updateField, readOnly } = useResume();

    // Get Theme Config
    const config = getSectionTheme(theme, 'projects');
    const { styles, strategy } = config;

    const handleUpdate = (newProjs: any[]) => {
        updateField('projects', newProjs);
    };

    if (!updateField && (!data.projects || data.projects.length === 0)) {
        return null;
    }

    if (!data.projects || (data.projects.length === 0 && !updateField)) return null;

    return (
        <ResumeSection
            title="Selected Works"
            theme={theme}
            className={className} // Still passed for fallback or specialized hook usage inside ResumeSection
            onAdd={!readOnly ? () => {
                const newProj = [{
                    id: crypto.randomUUID(),
                    name: { content: "Project Name" },
                    description: { content: "Description" },
                    technologies: []
                }, ...(data.projects || [])];
                handleUpdate(newProj);
            } : undefined}
        >
            {(!data.projects || data.projects.length === 0) && !readOnly ? (
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
                    className={styles.container}
                    strategy={strategy.layout === 'grid' ? 'rect' : 'vertical'}
                    renderItem={(project, i, updateItem, deleteItem) => (
                        <div className={cn("min-w-0", styles.item)} key={project.id || i}>
                           {/* Creative Theme Dot */}
                           {strategy.showDecorations && (
                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                            )}
    
                            <div className={styles.header}>
                                 <h3 className={styles.title}>
                                        <InlineEdit readOnly={readOnly} 
                                        value={project.name?.content} 
                                        placeholder="Project Name"
                                        className="bg-transparent"
                                        onSave={(val) => updateItem({ name: { ...project.name, content: val } })}
                                        path={`projects[${i}].name.content`}
                                        alignment={project.name?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                                    />
                                 </h3>
                                 
                                 <div className={cn("flex items-center gap-2", theme === "minimal" && "w-full justify-center")}>
                                    {project.url && (
                                       readOnly ? (
                                           <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.metadata}>
                                                <InlineEdit readOnly={readOnly} 
                                                    value={project.url} 
                                                    placeholder="URL"
                                                    onSave={(val) => updateItem({ url: val })}
                                                />
                                           </a>
                                       ) : (
                                            <span className={styles.metadata}>
                                                 <InlineEdit readOnly={readOnly} 
                                                    value={project.url} 
                                                    placeholder="URL"
                                                    onSave={(val) => updateItem({ url: val })}
                                                 />
                                            </span>
                                       )
                                    )}
                                    
                                     {!readOnly && (
                                         <ThemeDeleteButton
                                            className={styles.deleteButton || "bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-500 p-1 w-6 h-6 border-none transition-opacity"}
                                            onClick={deleteItem}
                                         />
                                     )}
                                 </div>
                            </div>
    
                            <div className={styles.description}>
                                 <InlineEdit readOnly={readOnly} 
                                    value={project.description?.content} 
                                    placeholder="Project description" 
                                    multiline
                                    onSave={(val) => updateItem({ description: { ...project.description, content: val } })}
                                    path={`projects[${i}].description.content`}
                                    alignment={project.description?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                                />
                            </div>
                            
                             <div className={cn(
                                 "flex flex-wrap gap-1 mt-2",
                                 strategy.alignment === "center" && "justify-center"
                             )}>
                                {(project.technologies || []).map((tech, tIndex) => (
                                    <span key={tIndex} className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <InlineEdit readOnly={readOnly}
                                           value={tech}
                                           onSave={(val) => {
                                               const newTech = [...(project.technologies || [])];
                                               newTech[tIndex] = val;
                                               updateItem({ technologies: newTech });
                                           }}
                                           className="bg-transparent"
                                           path={`projects[${i}].technologies[${tIndex}]`}
                                        />
                                          {!readOnly && (
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
                                   {!readOnly && (
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
