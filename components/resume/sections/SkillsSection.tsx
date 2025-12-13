
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { ResumeSection } from "@/components/resume/shared/ResumeSection";
import { getSectionTheme } from "@/lib/themes/styles";
import { useResume } from "@/components/resume/state/ResumeContext";

interface SkillsSectionProps {
    theme: string;
    className?: string;
    id?: string;
}

export function SkillsSection({ theme, className, id }: SkillsSectionProps) {
    const { data, updateField, readOnly } = useResume();

    // Get Theme Config
    const config = getSectionTheme(theme, 'skills');
    const { styles } = config;

    // Must have updateField to edit
    if (!updateField && (!data.skills || data.skills.length === 0)) {
        return null;
    }

    const handleUpdate = (newSkills: string[]) => {
        updateField('skills', newSkills);
    };

    return (
        <ResumeSection
            id={id}
            title="Skills"
            theme={theme}
            // Add Button integrated into ResumeSection header
            onAdd={!readOnly ? () => {
                const newSkills = [...(data.skills || []), "New Skill"];
                handleUpdate(newSkills);
            } : undefined}
            className={className}
        >
             <div className={styles.container}>
                {(data.skills || []).map((skill, index) => (
                    <div key={index} className={styles.item}>
                         {/* Skill Content */}
                         <InlineEdit 
                            readOnly={readOnly} 
                            value={skill}
                            path={`skills[${index}]`}
                            onSave={(val) => {
                                const newSkills = [...(data.skills || [])];
                                newSkills[index] = val;
                                handleUpdate(newSkills);
                            }}
                            className="bg-transparent min-w-[20px]" 
                         />
                         
                         {/* Delete Button */}
                         {!readOnly && (
                            <ThemeDeleteButton
                                onClick={() => {
                                    const newSkills = [...(data.skills || [])];
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
