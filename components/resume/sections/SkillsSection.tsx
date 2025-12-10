import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "../themes/ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";

interface SkillsSectionProps {
    data: ResumeData;
    theme: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function SkillsSection({ data, theme, onUpdate, readOnly }: SkillsSectionProps) {
    const { updateSection } = useResumeUpdate(data, onUpdate);

    if (!onUpdate && (!data.skills || data.skills.length === 0)) {
        return null;
    }

    const handleUpdate = (newSkills: string[]) => {
        updateSection('skills', newSkills);
    };

    // Creative Theme Logic (Sidebar style)
    if (theme === "creative") {
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="uppercase tracking-widest text-xs font-bold text-slate-500">Skills</h3>
                    {onUpdate && !readOnly && (
                        <ThemeAddButton 
                            label=""
                            className="h-6 w-6 p-0 text-slate-500 hover:text-white bg-transparent"
                            onClick={() => {
                                const newSkills = [...data.skills, "New Skill"];
                                handleUpdate(newSkills);
                            }}
                        />
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                        <div key={index} className="group/skill relative">
                            <span className="px-2 py-1 bg-slate-800 rounded text-xs flex items-center gap-2 hover:bg-slate-700 transition-colors">
                                <InlineEdit readOnly={readOnly || !onUpdate} 
                                    value={skill}
                                    path={`skills[${index}]`}
                                    onSave={(val) => {
                                        const newSkills = [...data.skills];
                                        newSkills[index] = val;
                                        handleUpdate(newSkills);
                                    }}
                                    className="bg-transparent text-slate-300 min-w-[20px]"
                                />
                                {onUpdate && !readOnly && (
                                    <ThemeDeleteButton
                                        onClick={() => {
                                            const newSkills = [...data.skills];
                                            newSkills.splice(index, 1);
                                            handleUpdate(newSkills);
                                        }}
                                        className="w-4 h-4 text-slate-400 hover:text-red-400 bg-transparent p-0 border-none transition-opacity"
                                    />
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Modern & Minimal
    return (
        <section className="mb-8 text-left">
            <div className={cn(
                "flex justify-between items-center mb-4 border-b pb-2",
                theme === "modern" ? "border-slate-700" : "border-slate-200"
            )}>
                <h2
                    className={cn(
                        "font-bold uppercase",
                        theme === "modern" && "text-xl text-white",
                        theme === "minimal" && "text-sm tracking-widest text-center flex-1 border-none text-slate-900"
                    )}
                >
                    Skills
                </h2>
                {onUpdate && !readOnly && (
                    <ThemeAddButton 
                        label=""
                        className="w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500 flex-none"
                        onClick={() => {
                            const newSkills = [...data.skills, "New Skill"];
                            handleUpdate(newSkills);
                        }} 
                    />
                )}
            </div>
            <div
                className={cn(
                    "flex flex-wrap gap-2",
                    theme === "minimal" && "justify-center"
                )}
            >
                {data.skills.map((skill, index) => (
                    <span
                        key={index}
                        className={cn(
                            "text-sm font-medium group/skill relative flex items-center gap-1",
                            theme === "modern" && "px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors",
                            theme === "minimal" && "px-2 border-b border-slate-200 hover:border-slate-400 pb-1 text-slate-900"
                        )}
                    >
                                <InlineEdit readOnly={readOnly || !onUpdate} 
                                    value={skill}
                                    path={`skills[${index}]`}
                                    onSave={(val) => {
                                        const newSkills = [...data.skills];
                                newSkills[index] = val;
                                handleUpdate(newSkills);
                            }}
                            className={theme === "modern" ? "bg-transparent text-slate-700" : "bg-transparent"}
                        />
                        {onUpdate && !readOnly && (
                            <ThemeDeleteButton
                                onClick={() => {
                                    const newSkills = [...data.skills];
                                    newSkills.splice(index, 1);
                                    handleUpdate(newSkills);
                                }}
                                className="w-4 h-4 text-slate-500 hover:text-red-500 bg-transparent p-0 border-none transition-opacity"
                            />
                        )}
                    </span>
                ))}
            </div>
        </section>
    );
}
