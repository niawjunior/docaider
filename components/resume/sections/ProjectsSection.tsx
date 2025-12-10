
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "@/components/resume/shared/ResumeSectionList";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { getSectionTheme } from "@/lib/themes/styles";

interface ProjectsSectionProps {
    data: ResumeData;
    theme: string;
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function ProjectsSection({ data, theme, onUpdate, readOnly }: ProjectsSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    // Get Theme Config
    const config = getSectionTheme(theme, 'projects');
    const { styles, strategy } = config;

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
            theme={theme} // Still passed for fallback or specialized hook usage inside ResumeSection
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
                                        <InlineEdit readOnly={readOnly || !onUpdate} 
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
                                       <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.metadata}>
                                             <InlineEdit readOnly={readOnly || !onUpdate} 
                                            value={project.url} 
                                            placeholder="URL"
                                            onSave={(val) => updateItem({ url: val })}
                                         />
                                       </a>
                                    )}
                                    
                                     {onUpdate && !readOnly && (
                                         <ThemeDeleteButton
                                            className={styles.deleteButton || "bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-500 p-1 w-6 h-6 border-none transition-opacity"}
                                            onClick={deleteItem}
                                         />
                                     )}
                                 </div>
                            </div>
    
                            <div className={styles.description}>
                                 <InlineEdit readOnly={readOnly || !onUpdate} 
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
