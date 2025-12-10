
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { getSectionTheme } from "@/lib/themes/styles";

interface SkillsSectionProps {
    data: ResumeData;
    theme: string;
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function SkillsSection({ data, theme, onUpdate, readOnly }: SkillsSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    // Get Theme Config
    const config = getSectionTheme(theme, 'skills');
    const { styles } = config;

    if (!onUpdate && (!data.skills || data.skills.length === 0)) {
        return null;
    }

    const handleUpdate = (newSkills: string[]) => {
        updateSection('skills', newSkills);
    };

    // To mimic the "Creative" theme's unique Sidebar style (small header),
    // we can pass a className override to ResumeSection for the 'Creative' theme if absolutely required.
    // However, for decoupling, we should rely on ResumeSection's own standard "Creative" header style.
    // The previous implementation had a very small "Skills" header for Creative.
    // ResumeSection's Creative header is BIG (2xl).
    // If we want to preserve the specific "Sidebar" look for Skills in Creative:
    // We should probably rely on the layout grid to position it, but visually the header is different.
    // Let's settle for the Standard Creative Header (2xl) for consistency unless user complains.

    // Determine if this section is in the sidebar (Modern and Creative themes put Skills in sidebar)
    const isSidebar = theme === 'modern' || theme === 'creative';
    const sectionTheme = isSidebar ? `${theme}-sidebar` : theme;

    return (
        <ResumeSection
            title="Skills"
            theme={sectionTheme}
            // Add Button integrated into ResumeSection header
            onAdd={onUpdate && !readOnly ? () => {
                const newSkills = [...(data.skills || []), "New Skill"];
                handleUpdate(newSkills);
            } : undefined}
            className={theme === "creative" ? "space-y-4" : ""}
        >
             <div className={styles.container}>
                {(data.skills || []).map((skill, index) => (
                    <div key={index} className={styles.item}>
                         {/* Skill Content */}
                         <InlineEdit 
                            readOnly={readOnly || !onUpdate} 
                            value={skill}
                            path={`skills[${index}]`}
                            onSave={(val) => {
                                const newSkills = [...data.skills];
                                newSkills[index] = val;
                                handleUpdate(newSkills);
                            }}
                            className="bg-transparent min-w-[20px]" 
                         />
                         
                         {/* Delete Button */}
                         {onUpdate && !readOnly && (
                            <ThemeDeleteButton
                                onClick={() => {
                                    const newSkills = [...data.skills];
                                    newSkills.splice(index, 1);
                                    handleUpdate(newSkills);
                                }}
                                className={cn(styles.deleteButton, "ml-1")}
                            />
                        )}
                    </div>
                ))}
            </div>
        </ResumeSection>
    );
}
