
import { ResumeData } from "@/lib/schemas/resume";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ThemeAddButton, ThemeDeleteButton } from "@/components/resume/themes/ThemeControls";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ResumeSectionList } from "./ResumeSectionList";
import { cn } from "@/lib/utils";
import { EmptySectionPlaceholder } from "./EmptySectionPlaceholder";
import { ResumeSection } from "./ResumeSection";
import { getSectionTheme } from "@/lib/themes/styles";

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
    theme = "modern",
    readOnly
}: CustomSectionRendererProps) {
    const { updateField } = useResumeUpdate(data, onUpdate);
    
    // Get Theme Config
    const config = getSectionTheme(theme, 'custom');
    const { styles, strategy } = config;

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
        <ResumeSection
            theme={theme}
            className={cn("group/section", className)}
            title={
                <div className="flex-1">
                    <InlineEdit readOnly={readOnly || !onUpdate}
                        value={section.title}
                        onSave={(val) => handleUpdateSection({ ...section, title: val })}
                        className="bg-transparent w-full break-normal" // Allow full width, standard break
                        path={`customSections[${index}].title`}
                    />
                </div>
            }
            actions={onUpdate && !readOnly && (
                 <ThemeDeleteButton 
                    onClick={handleDeleteSection}
                    className={cn(
                        styles.deleteButton || "bg-transparent text-slate-400 hover:text-red-500 p-1 border-none"
                    )}
                />
            )}
            onAdd={onUpdate && !readOnly ? () => {
                 const createItem = () => ({
                    id: crypto.randomUUID(),
                    title: { content: "New Item" },
                    subtitle: section.type === "list" ? { content: "Subtitle" } : { content: "" },
                    content: { content: "Description or content goes here..." },
                    alignment: undefined // Default
                });
                
                const newItems = [createItem(), ...(section.items || [])];
                handleUpdateSection({ ...section, items: newItems });
            } : undefined}
        >
            
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
                    className="mt-4"
                />
            ) : (
                <ResumeSectionList
                  data={section.items}
                  readOnly={readOnly}
                  onUpdate={(val) => handleUpdateSection({ ...section, items: val })}
                  className={styles.container}
                  renderItem={(item, i, updateItem, deleteItem) => (
                    <div className={cn("min-w-0", styles.item)} key={item.id || i}>
                        {strategy.showDecorations && (
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                        )}

                        <div className={styles.header}>
                             <div className={styles.title}> {/* Flex box sometimes */}
                                 <InlineEdit readOnly={readOnly || !onUpdate}
                                    value={item.title?.content}
                                    placeholder="Title"
                                    className="bg-transparent"
                                    onSave={(val) => updateItem({ title: { ...item.title, content: val } })}
                                    path={`customSections[${index}].items[${i}].title.content`}
                                    alignment={item.title?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                                 />
                             </div>
                             
                             {section.type === "list" && (
                                 <div className={styles.subtitle}>
                                     <InlineEdit readOnly={readOnly || !onUpdate}
                                        value={item.subtitle?.content}
                                        placeholder="Subtitle"
                                        className="bg-transparent"
                                        onSave={(val) => updateItem({ subtitle: { ...item.subtitle, content: val } })}
                                        path={`customSections[${index}].items[${i}].subtitle.content`}
                                        alignment={item.subtitle?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                                     />
                                 </div>
                             )}

                             {onUpdate && !readOnly && (
                                 <ThemeDeleteButton 
                                    className={styles.deleteButton || "opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-0 top-0"}
                                    onClick={deleteItem}
                                 />
                             )}
                        </div>

                        {/* Content */}
                        <div className={styles.description}>
                            <InlineEdit readOnly={readOnly || !onUpdate}
                                value={item.content?.content}
                                placeholder="Content..."
                                multiline
                                onSave={(val) => updateItem({ content: { ...item.content, content: val } })}
                                path={`customSections[${index}].items[${i}].content.content`}
                                alignment={item.content?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                             />
                        </div>
                    </div>
                  )}
                />
            )}
        </ResumeSection>
    );
}
