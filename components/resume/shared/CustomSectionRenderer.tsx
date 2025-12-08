import { ResumeData } from "@/lib/schemas/resume";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ThemeAddButton, ThemeDeleteButton } from "@/components/resume/themes/ThemeControls";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ResumeSectionList } from "./ResumeSectionList";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { EmptySectionPlaceholder } from "./EmptySectionPlaceholder";

interface CustomSectionRendererProps {
    section: NonNullable<ResumeData['customSections']>[number];
    index: number;
    data: ResumeData;
    onUpdate?: (data: ResumeData) => void;
    className?: string;
    theme?: string;
    readOnly?: boolean;
}

export function CustomSectionRenderer({ 
    section, 
    index, 
    data, 
    onUpdate, 
    className,
    theme,
    readOnly
}: CustomSectionRendererProps) {
    const { updateField } = useResumeUpdate(data, onUpdate);

    const handleUpdateSection = (updatedSection: typeof section) => {
        const newSections = [...(data.customSections || [])];
        newSections[index] = updatedSection;
        updateField('customSections', newSections);
    };

    const handleDeleteSection = () => {
        const newSections = [...(data.customSections || [])];
        newSections.splice(index, 1);
        updateField('customSections', newSections);
    };

    // If empty and read-only, don't render
    if (!onUpdate && (!section.items || section.items.length === 0)) {
        return null;
    }

    return (
        <div className={cn("relative group/section mb-12", className)}>
             <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-2">
                <h2 className={cn(
                    "font-bold uppercase flex-1 flex items-center gap-2",
                    theme === "creative" && "text-2xl text-slate-900",
                    theme === "modern" && "text-xl text-slate-900 border-none pb-0", 
                    theme === "minimal" && "text-sm tracking-widest text-center text-slate-900",
                    theme === "studio" && "text-4xl tracking-tight border-none pb-0",
                    theme === "visual" && "text-4xl md:text-6xl tracking-tighter border-none pb-0",
                    theme === "portfolio" && "text-2xl text-slate-900",
                )}>
                    {theme === "creative" && <span className="w-8 h-1 bg-slate-900 block" />}
                    <InlineEdit readOnly={readOnly || !onUpdate}
                        value={section.title}
                        onSave={(val) => handleUpdateSection({ ...section, title: val })}
                        className="bg-transparent"
                    />
                </h2>
                 {onUpdate && !readOnly && (
                    <div className="flex items-center gap-2">
                         <ThemeAddButton 
                            label={theme !== "minimal" ? "Add Item" : ""}
                            className={cn(
                                "flex-none",
                                (theme === "modern" || theme === "minimal") && "bg-transparent text-slate-500 hover:bg-slate-100",
                                theme === "studio" && "bg-transparent text-white border-white/20 hover:bg-white/10",
                                theme === "visual" && "bg-transparent text-white border-white/20 hover:bg-white/10"
                            )}
                            onClick={() => {
                                const createItem = () => ({
                                    id: crypto.randomUUID(),
                                    title: { content: "New Item" },
                                    subtitle: section.type === "list" ? { content: "Subtitle" } : { content: "" },
                                    content: { content: "Description or content goes here..." },
                                    alignment: undefined // Default
                                });
                                
                                const newItems = [createItem(), ...(section.items || [])];
                                handleUpdateSection({ ...section, items: newItems });
                            }} 
                        />
                        <ThemeDeleteButton 
                            onClick={handleDeleteSection}
                            className={cn(
                                "bg-red-50 text-red-600 hover:bg-red-100 border-red-200",
                                (theme === "studio" || theme === "visual") && "bg-red-900/20 text-red-400 border-none hover:bg-red-900/50"
                            )}
                        />
                    </div>
                )}
            </div>

            {(!section.items || section.items.length === 0) && onUpdate && !readOnly ? (
                 <EmptySectionPlaceholder 
                    message={`Add items to ${section.title}`}
                    onClick={() => {
                        const newItems = [{
                            id: crypto.randomUUID(),
                            title: { content: "New Item" },
                            subtitle: section.type === "list" ? { content: "Subtitle" } : { content: "" },
                            content: { content: "Description or content goes here..." }
                        }, ...(section.items || [])];
                        handleUpdateSection({ ...section, items: newItems });
                    }}
                    className={cn(
                         (theme === "studio" || theme === "visual") && "bg-transparent border-white/20 text-white hover:border-white/40"
                    )}
                />
            ) : (
                <ResumeSectionList
                  data={section.items}
                  readOnly={readOnly}
                  onUpdate={(val) => handleUpdateSection({ ...section, items: val })}
                  className={cn(
                      "space-y-6", 
                      section.type === "list" && "grid gap-6",
                      // Theme specific grid adjustments could go here if needed
                  )}
                  renderItem={(item, i, updateItem, deleteItem) => (
                    <div className={cn(
                        "relative group/item",
                        theme === "portfolio" && "bg-white p-6 rounded-xl shadow-sm border border-slate-100",
                        (theme === "studio" || theme === "visual") && "border-l border-white/20 pl-6 ml-2"
                    )}>
                         {onUpdate && (
                             <ThemeDeleteButton 
                                className="absolute right-0 top-0 z-10 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                onClick={deleteItem}
                             />
                        )}
                        
                        {/* Title & Subtitle */}
                        <div className="mb-2">
                             <div className={cn(
                                 "font-bold text-lg",
                                 (theme === "studio" || theme === "visual") ? "text-white" : "text-slate-900"
                             )}>
                                 <InlineEdit readOnly={readOnly || !onUpdate}
                                    value={item.title?.content}
                                    placeholder="Title"
                                    onSave={(val) => updateItem({ title: { ...item.title, content: val } })}
                                    path={`customSections[${index}].items[${i}].title.content`}
                                    alignment={item.title?.alignment || undefined}
                                    className="bg-transparent"
                                 />
                             </div>
                             {section.type === "list" && (
                                 <div className={cn(
                                     "text-sm font-medium",
                                      (theme === "studio" || theme === "visual") ? "text-neutral-400" : (theme === "minimal" ? "text-slate-700" : "text-blue-600")
                                 )}>
                                     <InlineEdit readOnly={readOnly || !onUpdate}
                                        value={item.subtitle?.content}
                                        placeholder="Subtitle"
                                        onSave={(val) => updateItem({ subtitle: { ...item.subtitle, content: val } })}
                                        path={`customSections[${index}].items[${i}].subtitle.content`}
                                        alignment={item.subtitle?.alignment || undefined}
                                        className="bg-transparent"
                                     />
                                 </div>
                             )}
                        </div>

                        {/* Content */}
                        <div className={cn(
                            "text-sm leading-relaxed",
                             (theme === "studio" || theme === "visual") ? "text-neutral-400" : "text-slate-600"
                        )}>
                            <InlineEdit readOnly={readOnly || !onUpdate}
                                value={item.content?.content}
                                placeholder="Content..."
                                multiline
                                onSave={(val) => updateItem({ content: { ...item.content, content: val } })}
                                path={`customSections[${index}].items[${i}].content.content`}
                                alignment={item.content?.alignment || undefined}
                                className="bg-transparent w-full"
                             />
                        </div>
                    </div>
                  )}
                />
            )}
        </div>
    );
}
