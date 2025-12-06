"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  ExternalLink,
  Trash2,
  Plus
} from "lucide-react";
import { PortfolioTheme } from "./themes/PortfolioTheme";
import { StudioTheme } from "./themes/StudioTheme";
import { VisualTheme } from "./themes/VisualTheme";
import { InlineEdit } from "@/components/ui/inline-edit";
import { Button } from "@/components/ui/button";
import { ThemeAddButton, ThemeDeleteButton } from "./themes/ThemeControls";

interface ResumePreviewProps {
  data: ResumeData;
  theme?: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
  className?: string;
  onUpdate?: (data: ResumeData) => void;
}

export function ResumePreview({
  data,
  theme = "modern",
  className,
  onUpdate
}: ResumePreviewProps) {
  
  const handleUpdate = (path: string, value: any) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    
    // Helper to set value at path
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    
    onUpdate(newData);
  };

  if (theme === "portfolio") {
    // Pass onUpdate to themes if they support it
    return <PortfolioTheme data={data} onUpdate={onUpdate} />;
  }

  if (theme === "studio") {
    return <StudioTheme data={data} onUpdate={onUpdate} />;
  }

  if (theme === "visual") {
    return <VisualTheme data={data} onUpdate={onUpdate} />;
  }

  const containerClasses = cn(
    "w-full max-w-full min-h-[1100px] bg-white text-slate-900 shadow-xl mx-auto print:shadow-none group/resume text-left",
    theme === "modern" && "p-8",
    theme === "minimal" && "p-12 font-serif",
    theme === "creative" && "p-0 flex",
    className
  );

  // Creative theme is separate layout
  if (theme === "creative") {
    return (
      <div className={containerClasses}>
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8 text-left">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight">
               <InlineEdit readOnly={!onUpdate} 
                 value={data.personalInfo.fullName} 
                 onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                 className="text-white hover:bg-white/10"
               />
            </h1>
            <div className="text-slate-400 text-sm">
                <InlineEdit readOnly={!onUpdate} 
                 value={data.personalInfo.summary} 
                 onSave={(val) => handleUpdate('personalInfo.summary', val)} 
                 multiline
                 className="text-slate-400 hover:bg-white/10"
               />
            </div>
          </div>

          <div className="space-y-4 text-sm">
             <div className="flex items-center gap-2">
                 <Mail className="w-4 h-4 shrink-0" />
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.email} 
                    onSave={(val) => handleUpdate('personalInfo.email', val)} 
                    className="text-white hover:bg-white/10"
                 />
             </div>
             <div className="flex items-center gap-2">
                 <Phone className="w-4 h-4 shrink-0" />
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.phone} 
                    onSave={(val) => handleUpdate('personalInfo.phone', val)} 
                    className="text-white hover:bg-white/10"
                 />
             </div>
             <div className="flex items-center gap-2">
                 <MapPin className="w-4 h-4 shrink-0" />
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.location} 
                    onSave={(val) => handleUpdate('personalInfo.location', val)} 
                    className="text-white hover:bg-white/10"
                 />
             </div>
             <div className="flex items-center gap-2">
                 <Globe className="w-4 h-4 shrink-0" />
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.website} 
                    onSave={(val) => handleUpdate('personalInfo.website', val)} 
                    className="text-white hover:bg-white/10"
                 />
             </div>
          </div>

          <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <h3 className="uppercase tracking-widest text-xs font-bold text-slate-500">Skills</h3>
                 {onUpdate && (
                   <ThemeAddButton 
                        label=""
                        className="h-6 w-6 p-0 text-slate-500 hover:text-white bg-transparent"
                        onClick={() => {
                            const newSkills = [...data.skills, "New Skill"];
                            handleUpdate('skills', newSkills);
                        }}
                    />
                 )}
              </div>
               <div className="flex flex-wrap gap-2">
                 {data.skills.map((skill, index) => (
                     <div key={index} className="group/skill relative">
                         <span className="px-2 py-1 bg-slate-800 rounded text-xs block">
                              <InlineEdit readOnly={!onUpdate} 
                                 value={skill}
                                 onSave={(val) => {
                                     const newSkills = [...data.skills];
                                     newSkills[index] = val;
                                     handleUpdate('skills', newSkills);
                                 }}
                                 className="hover:bg-slate-700"
                              />
                         </span>
                         {onUpdate && (
                             <ThemeDeleteButton
                                onClick={() => {
                                    const newSkills = [...data.skills];
                                    newSkills.splice(index, 1);
                                    handleUpdate('skills', newSkills);
                                }}
                                 className="absolute -top-1 -right-1 bg-red-500 rounded-full p-[2px] w-4 h-4 border-none text-white"
                             />
                         )}
                    </div>
                ))}
              </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 space-y-8 bg-white text-left">
          <section>
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-1 bg-slate-900 block" /> Experience
                </h2>
                {onUpdate && (
                    <ThemeAddButton 
                        label="Add"
                        className="border-slate-200"
                        onClick={() => {
                        const newExp = [{
                            company: "Company Name",
                            position: "Position",
                            startDate: "2024",
                            description: "Job description goes here..."
                        }, ...data.experience];
                        handleUpdate('experience', newExp);
                    }} />
                )}
             </div>
             
              <div className="space-y-8 border-l-2 border-slate-100 pl-6 ml-1">
                {data.experience.map((exp, index) => (
                  <div key={index} className="relative group/exp">
                     {onUpdate && (
                        <ThemeDeleteButton
                            className="absolute -right-4 top-0 p-2 text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-8 h-8"
                            onClick={() => {
                                const newExp = [...data.experience];
                                newExp.splice(index, 1);
                                handleUpdate('experience', newExp);
                            }}
                        />
                     )}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                    <h3 className="font-bold text-lg">
                        <InlineEdit readOnly={!onUpdate} 
                            value={exp.position} 
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[index].position = val;
                                handleUpdate('experience', newExp);
                            }}
                        />
                    </h3>
                    <div className="text-slate-600 font-medium mb-1">
                         <InlineEdit readOnly={!onUpdate} 
                            value={exp.company} 
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[index].company = val;
                                handleUpdate('experience', newExp);
                            }}
                        />
                    </div>
                    <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider flex gap-1">
                         <InlineEdit readOnly={!onUpdate} 
                            value={exp.startDate} 
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[index].startDate = val;
                                handleUpdate('experience', newExp);
                            }}
                        />
                        <span>-</span>
                        <InlineEdit readOnly={!onUpdate} 
                            value={exp.endDate} 
                            placeholder="Present"
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[index].endDate = val;
                                handleUpdate('experience', newExp);
                            }}
                        />
                    </div>
                    <div className="text-slate-600 text-sm leading-relaxed">
                        <InlineEdit readOnly={!onUpdate} 
                            value={exp.description} 
                            multiline
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[index].description = val;
                                handleUpdate('experience', newExp);
                            }}
                        />
                    </div>
                  </div>
                ))}
              </div>
          </section>

           {/* Education Section */}
           {data.education && (
             <section>
                 <div className="flex justify-between items-center mb-6 mt-8 border-b border-slate-100 pb-2">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-8 h-1 bg-slate-900 block" /> Education
                    </h2>
                     {onUpdate && (
                        <ThemeAddButton 
                            label="Add"
                            className="border-slate-200"
                            onClick={() => {
                            const newEdu = [{
                                institution: "University",
                                degree: "Degree",
                                startDate: "2020",
                                endDate: "2024"
                            }, ...(data.education || [])];
                            handleUpdate('education', newEdu);
                        }} />
                    )}
                 </div>
               <div className="space-y-4">
                 {data.education.map((edu, index) => (
                   <div key={index} className="group/edu relative">
                     {onUpdate && (
                        <ThemeDeleteButton
                            className="absolute -right-4 top-0 p-2 text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-8 h-8"
                            onClick={() => {
                                const newEdu = [...data.education];
                                newEdu.splice(index, 1);
                                handleUpdate('education', newEdu);
                            }}
                        />
                     )}
                     <h3 className="font-bold">
                        <InlineEdit readOnly={!onUpdate} 
                            value={edu.institution} 
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].institution = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                     </h3>
                     <div className="text-slate-600 flex gap-1">
                        <InlineEdit readOnly={!onUpdate} 
                            value={edu.degree} 
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].degree = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                        <span>in</span>
                        <InlineEdit readOnly={!onUpdate} 
                            value={edu.fieldOfStudy} 
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].fieldOfStudy = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                     </div>
                     <div className="text-sm text-slate-400 flex gap-1">
                        <InlineEdit readOnly={!onUpdate} 
                            value={edu.startDate} 
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].startDate = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                        <span>-</span>
                        <InlineEdit readOnly={!onUpdate} 
                            value={edu.endDate} 
                            placeholder="Present"
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].endDate = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                     </div>
                   </div>
                 ))}
               </div>
             </section>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Header */}
      <header
        className={cn(
          "mb-8",
          theme === "modern" && "border-b-2 border-slate-900 pb-6 text-left",
          theme === "minimal" && "text-center pb-8 border-b border-slate-200"
        )}
      >
        <div
          className={cn(
            "font-bold uppercase tracking-tight mb-2 w-full",
            theme === "modern" && "text-4xl",
            theme === "minimal" && "text-3xl tracking-widest font-normal"
          )}
        >
          <InlineEdit readOnly={!onUpdate} 
            value={data.personalInfo.fullName} 
            placeholder="Your Name"
            onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
            className={theme === "minimal" ? "text-center w-full block" : ""}
          />
        </div>
        <div
          className={cn(
            "text-lg text-slate-600 mb-4 w-full",
            theme === "minimal" && "italic text-center"
          )}
        >
           <InlineEdit readOnly={!onUpdate} 
            value={data.personalInfo.summary} 
            placeholder="Professional Summary"
            multiline
            onSave={(val) => handleUpdate('personalInfo.summary', val)} 
            className={theme === "minimal" ? "text-center w-full block" : ""}
          />
        </div>

        <div
          className={cn(
            "flex flex-wrap gap-4 text-sm text-slate-600",
            theme === "minimal" && "justify-center"
          )}
        >
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <InlineEdit readOnly={!onUpdate} 
                value={data.personalInfo.email} 
                placeholder="Email"
                onSave={(val) => handleUpdate('personalInfo.email', val)} 
              />
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <InlineEdit readOnly={!onUpdate} 
                value={data.personalInfo.phone} 
                placeholder="Phone"
                onSave={(val) => handleUpdate('personalInfo.phone', val)} 
              />
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <InlineEdit readOnly={!onUpdate} 
                value={data.personalInfo.location} 
                placeholder="Location"
                onSave={(val) => handleUpdate('personalInfo.location', val)} 
              />
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <InlineEdit readOnly={!onUpdate} 
                value={data.personalInfo.website} 
                placeholder="Website"
                onSave={(val) => handleUpdate('personalInfo.website', val)} 
              />
            </div>
        </div>
      </header>

      {/* Experience */}
      <section className="mb-8 text-left">
        <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
            <h2
                className={cn(
                "font-bold uppercase",
                theme === "modern" && "text-xl",
                theme === "minimal" && "text-sm tracking-widest text-center w-full border-none"
                )}
            >
                Experience
            </h2>
            {onUpdate && theme !== "minimal" && (
                 <ThemeAddButton 
                    label=""
                    className="w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500"
                    onClick={() => {
                        const newExp = [{
                            company: "Company Name",
                            position: "Position",
                            startDate: "2024",
                            description: "Description"
                        }, ...data.experience];
                        handleUpdate('experience', newExp);
                 }} />
            )}
        </div>
        
        <div className="space-y-6">
        {data.experience.map((exp, index) => (
            <div key={index} className="group/item relative hover:bg-slate-50 p-2 -mx-2 rounded transition-colors">
                {onUpdate && (
                     <ThemeDeleteButton
                        className="absolute right-0 top-0 p-2 text-red-400 hover:text-red-600 transition-opacity bg-transparent border-none shadow-none w-8 h-8"
                        onClick={() => {
                            const newExp = [...data.experience];
                            newExp.splice(index, 1);
                            handleUpdate('experience', newExp);
                        }}
                     />
                )}
            <div
                className={cn(
                "flex justify-between items-baseline mb-1",
                theme === "minimal" && "flex-col items-center text-center"
                )}
            >
                <div className="font-bold text-lg w-full">
                    <InlineEdit readOnly={!onUpdate} 
                        value={exp.position} 
                        placeholder="Position"
                        className={theme === "minimal" ? "text-center w-full block" : ""}
                        onSave={(val) => {
                            const newExp = [...data.experience];
                            newExp[index].position = val;
                            handleUpdate('experience', newExp);
                        }}
                    />
                </div>
                <div className="text-sm text-slate-500 whitespace-nowrap flex gap-1">
                    <InlineEdit readOnly={!onUpdate} 
                        value={exp.startDate} 
                        placeholder="Start"
                        onSave={(val) => {
                            const newExp = [...data.experience];
                            newExp[index].startDate = val;
                            handleUpdate('experience', newExp);
                        }}
                    />
                    <span>-</span>
                    <InlineEdit readOnly={!onUpdate} 
                        value={exp.endDate} 
                        placeholder="Present"
                        onSave={(val) => {
                            const newExp = [...data.experience];
                            newExp[index].endDate = val;
                            handleUpdate('experience', newExp);
                        }}
                    />
                </div>
            </div>
            <div
                className={cn(
                "text-slate-700 font-medium mb-2",
                theme === "minimal" && "text-center"
                )}
            >
                 <InlineEdit readOnly={!onUpdate} 
                    value={exp.company} 
                    placeholder="Company"
                    className={theme === "minimal" ? "text-center w-full block" : ""}
                    onSave={(val) => {
                        const newExp = [...data.experience];
                        newExp[index].company = val;
                        handleUpdate('experience', newExp);
                    }}
                />
            </div>
            <div className="text-sm text-slate-600 whitespace-pre-line">
                 <InlineEdit readOnly={!onUpdate} 
                    value={exp.description} 
                    placeholder="Description"
                    multiline
                    className={theme === "minimal" ? "text-center w-full block" : ""}
                    onSave={(val) => {
                        const newExp = [...data.experience];
                        newExp[index].description = val;
                        handleUpdate('experience', newExp);
                    }}
                />
            </div>
            </div>
        ))}
        </div>
      </section>

      {/* Education */}
       <section className="mb-8 text-left">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
            <h2
                className={cn(
                "font-bold uppercase",
                theme === "modern" && "text-xl",
                theme === "minimal" && "text-sm tracking-widest text-center w-full border-none"
                )}
            >
                Education
            </h2>
             {onUpdate && theme !== "minimal" && (
                 <ThemeAddButton 
                    label=""
                    className="w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500"
                    onClick={() => {
                        const newEdu = [{
                            institution: "University",
                            degree: "Degree",
                            startDate: "2020",
                            endDate: "2024"
                        }, ...(data.education || [])];
                        handleUpdate('education', newEdu);
                 }} />
            )}
         </div>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className={cn(
                  "group/item relative hover:bg-slate-50 p-2 -mx-2 rounded transition-colors",
                  theme === "minimal" && "text-center"
                )}>
                 {onUpdate && (
                     <ThemeDeleteButton
                        className="absolute right-0 top-0 p-2 text-red-400 hover:text-red-600 transition-opacity bg-transparent border-none shadow-none w-8 h-8"
                        onClick={() => {
                            const newEdu = [...data.education];
                            newEdu.splice(index, 1);
                            handleUpdate('education', newEdu);
                        }}
                     />
                )}
                <div
                  className={cn(
                    "flex justify-between items-baseline mb-1",
                    theme === "minimal" && "flex-col items-center"
                  )}
                >
                  <h3 className="font-bold w-full">
                       <InlineEdit readOnly={!onUpdate} 
                            value={edu.institution} 
                            placeholder="Institution"
                            className={theme === "minimal" ? "text-center w-full block" : ""}
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].institution = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                  </h3>
                  <div className="text-sm text-slate-500 flex gap-1 whitespace-nowrap">
                       <InlineEdit readOnly={!onUpdate} 
                            value={edu.startDate} 
                            placeholder="Start"
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].startDate = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                        <span>-</span>
                        <InlineEdit readOnly={!onUpdate} 
                            value={edu.endDate} 
                            placeholder="Present"
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].endDate = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                  </div>
                </div>
                <div className="text-slate-700 flex gap-1 justify-center">
                     <InlineEdit readOnly={!onUpdate} 
                            value={edu.degree} 
                            placeholder="Degree"
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].degree = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                     <span>in</span>
                     <InlineEdit readOnly={!onUpdate} 
                            value={edu.fieldOfStudy} 
                            placeholder="Field"
                            onSave={(val) => {
                                const newEdu = [...data.education];
                                newEdu[index].fieldOfStudy = val;
                                handleUpdate('education', newEdu);
                            }}
                        />
                </div>
              </div>
            ))}
          </div>
        </section>

      {/* Skills */}
        <section className="mb-8 text-left">
           <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
            <h2
                className={cn(
                "font-bold uppercase",
                theme === "modern" && "text-xl",
                theme === "minimal" && "text-sm tracking-widest text-center w-full border-none"
                )}
            >
                Skills
            </h2>
             {onUpdate && theme !== "minimal" && (
                 <ThemeAddButton 
                    label=""
                    className="w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500"
                    onClick={() => {
                        const newSkills = [...data.skills, "New Skill"];
                        handleUpdate('skills', newSkills);
                 }} />
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
                  "text-sm font-medium group/skill relative",
                  theme === "modern" && "px-3 py-1 bg-slate-100 text-slate-700 rounded-full",
                  theme === "minimal" && "px-2 border-b border-slate-200"
                )}
              >
                <InlineEdit readOnly={!onUpdate} 
                    value={skill}
                    onSave={(val) => {
                        const newSkills = [...data.skills];
                        newSkills[index] = val;
                        handleUpdate('skills', newSkills);
                    }}
                    className={theme === "modern" ? "bg-transparent text-slate-700" : ""}
                />
                 {onUpdate && (
                    <ThemeDeleteButton
                        onClick={() => {
                            const newSkills = [...data.skills];
                            newSkills.splice(index, 1);
                            handleUpdate('skills', newSkills);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-[1px] w-4 h-4 text-white border-none"
                    />
                )}
              </span>
            ))}
          </div>
        </section>

      {/* Projects (New) */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-8 text-left">
           <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
            <h2
                className={cn(
                "font-bold uppercase",
                theme === "modern" && "text-xl",
                theme === "minimal" && "text-sm tracking-widest text-center w-full border-none"
                )}
            >
                Projects
            </h2>
             {onUpdate && theme !== "minimal" && (
                 <ThemeAddButton 
                    label=""
                    className="w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500"
                    onClick={() => {
                        const newProj = [{
                            name: "Project Name",
                            description: "Description",
                            technologies: []
                        }, ...data.projects];
                        handleUpdate('projects', newProj);
                 }} />
            )}
          </div>
          <div className="space-y-4">
            {data.projects.map((project, i) => (
              <div key={i} className="group/item relative hover:bg-slate-50 p-2 -mx-2 rounded transition-colors">
                 {onUpdate && (
                     <ThemeDeleteButton
                        className="absolute right-0 top-0 p-2 text-red-400 hover:text-red-600 transition-opacity bg-transparent border-none shadow-none w-8 h-8"
                        onClick={() => {
                            const newProjs = [...data.projects];
                            newProjs.splice(i, 1);
                            handleUpdate('projects', newProjs);
                        }}
                     />
                )}
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold">
                       <InlineEdit readOnly={!onUpdate} 
                            value={project.name}
                            onSave={(val) => {
                                const newProjs = [...data.projects];
                                newProjs[i].name = val;
                                handleUpdate('projects', newProjs);
                            }}
                        />
                  </h3>
                   <div className="flex items-center gap-1 text-sm text-blue-600">
                      <span>Link:</span>
                      <InlineEdit readOnly={!onUpdate} 
                            value={project.url}
                            placeholder="URL"
                            onSave={(val) => {
                                const newProjs = [...data.projects];
                                newProjs[i].url = val;
                                handleUpdate('projects', newProjs);
                            }}
                            className="bg-transparent"
                        />
                   </div>
                </div>
                <p className="text-sm text-slate-600">
                    <InlineEdit readOnly={!onUpdate} 
                            value={project.description}
                            multiline
                            onSave={(val) => {
                                const newProjs = [...data.projects];
                                newProjs[i].description = val;
                                handleUpdate('projects', newProjs);
                            }}
                        />
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className="mb-8 text-left">
           <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
            <h2
                className={cn(
                "font-bold uppercase",
                theme === "modern" && "text-xl",
                theme === "minimal" && "text-sm tracking-widest text-center w-full border-none"
                )}
            >
                Testimonials
            </h2>
             {onUpdate && theme !== "minimal" && (
                 <Button variant="ghost" size="sm" onClick={() => {
                        const newTest = [{
                            name: "Name",
                            role: "Role",
                            content: "Content"
                        }, ...data.testimonials];
                        handleUpdate('testimonials', newTest);
                 }}>
                     <Plus className="w-4 h-4" />
                 </Button>
            )}
           </div>
          <div className="space-y-6">
            {data.testimonials.map((testimonial, i) => (
              <div key={i} className={cn(theme === "minimal" && "text-center", "group/item relative hover:bg-slate-50 p-2 -mx-2 rounded")}>
                 {onUpdate && (
                     <button 
                        className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 p-2 text-red-400 hover:text-red-600 transition-opacity"
                        onClick={() => {
                            const newTest = [...data.testimonials];
                            newTest.splice(i, 1);
                            handleUpdate('testimonials', newTest);
                        }}
                     >
                         <Trash2 className="w-4 h-4" />
                     </button>
                )}
                <blockquote className="text-slate-600 italic mb-2 leading-relaxed">
                  "<InlineEdit readOnly={!onUpdate} 
                        value={testimonial.content}
                        multiline
                        onSave={(val) => {
                            const newTest = [...data.testimonials];
                            newTest[i].content = val;
                            handleUpdate('testimonials', newTest);
                        }}
                    />"
                </blockquote>
                <div className="flex items-center gap-2 text-sm justify-start" style={{ justifyContent: theme === 'minimal' ? 'center' : 'flex-start' }}>
                  <span className="font-bold text-slate-900">
                       <InlineEdit readOnly={!onUpdate} 
                            value={testimonial.name}
                            onSave={(val) => {
                                const newTest = [...data.testimonials];
                                newTest[i].name = val;
                                handleUpdate('testimonials', newTest);
                            }}
                        />
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                       <InlineEdit readOnly={!onUpdate} 
                            value={testimonial.role}
                            onSave={(val) => {
                                const newTest = [...data.testimonials];
                                newTest[i].role = val;
                                handleUpdate('testimonials', newTest);
                            }}
                        />
                   </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
