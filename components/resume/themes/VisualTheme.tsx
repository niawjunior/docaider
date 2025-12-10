import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import {  Mail, MapPin, Globe, Linkedin } from "lucide-react";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { Button } from "@/components/ui/button";
import { ThemeAddButton, ThemeDeleteButton } from "./ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { CustomSectionRenderer } from "@/components/resume/shared/CustomSectionRenderer";
import { Plus, ImageIcon } from "lucide-react";
import { useState } from "react";
import { CoverImagePicker } from "@/components/resume/shared/CoverImagePicker";

interface VisualThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
  containerRef?: React.RefObject<any>;
  isThumbnail?: boolean;
}

export const VisualTheme = ({ data, onUpdate, readOnly, containerRef, isThumbnail }: VisualThemeProps) => {
  const { updateField: handleUpdate } = useResumeUpdate(data, onUpdate);
  const personalInfo = data.personalInfo as any;
  const { scrollYProgress } = useScroll({
    container: containerRef
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  return (
    <div className={cn(
      "bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black",
      isThumbnail ? "h-full w-full overflow-hidden" : "min-h-screen"
    )}>
      {/* Navigation - Hide in thumbnail */}
      {!isThumbnail && (
        <nav className="sticky top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference">
          <span className="text-xl font-bold tracking-tighter uppercase">
               {/* Read-only name for nav */}
              {(personalInfo.fullName ?? '').split(' ')[0]}
          </span>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-widest bg-black/50 backdrop-blur rounded px-4 py-2">
             {(data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : ["summary", "projects", "experience", "skills", "education"]).map(sectionId => {
                 const isCustom = data.customSections?.find(c => c.id === sectionId);
                 const isStandard = ['summary', 'experience', 'projects', 'education', 'skills', 'about', 'contact'].includes(sectionId);
                 
                 if (!isCustom && !isStandard) return null;

                 let label = isCustom ? isCustom.title : sectionId;
                 let href = `#${sectionId}`;

                 if (sectionId === 'summary') {
                     label = 'About';
                     href = '#about';
                 }
                 if (sectionId === 'projects') {
                     label = 'Work';
                     href = '#work';
                 }

                 return (
                     <a key={sectionId} href={href} className="hover:opacity-50 transition-opacity">
                         {label}
                     </a>
                 );
             })}
             <a href="#contact" className="hover:opacity-50 transition-opacity">Contact</a>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <header className={cn(
        "relative w-full flex flex-col justify-end overflow-hidden",
        isThumbnail ? "h-full p-8" : "h-screen p-6 md:p-12"
      )}>
        <div className="absolute inset-0 z-0">
          {data.coverImage ? (
            <motion.div 
                style={isThumbnail ? undefined : { y }} 
                className={cn(
                    "w-full h-[120%] -translate-y-[10%]",
                    isThumbnail && "h-full translate-y-0" // Reset for thumbnail
                )}
            >
              <img 
                src={data.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover opacity-60"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          
          {onUpdate && !readOnly && (
             <div className="absolute top-24 right-6 z-20">
                 <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-black/50 hover:bg-black/80 text-white border-white/20 backdrop-blur-sm"
                    onClick={() => setIsCoverPickerOpen(true)}
                 >
                     <ImageIcon className="w-4 h-4 mr-2" />
                     Change Cover
                 </Button>
             </div>
          )}
        </div>
        
        <CoverImagePicker 
            open={isCoverPickerOpen} 
            onOpenChange={setIsCoverPickerOpen}
            onSelect={(url) => handleUpdate('coverImage', url)}
            currentCover={data.coverImage}
        />

        <div className="relative z-10 max-w-7xl w-full mx-auto">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
             {/* Edit full name here */}
             <div className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.85] font-black uppercase tracking-tighter break-words">
                 <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={personalInfo.fullName} 
                    onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                    path="personalInfo.fullName"
                    className="bg-transparent border-none w-full"
                    placeholder="YOUR NAME"
                 />
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/20 pt-8"
          >
            <div className="text-xl md:text-2xl font-light uppercase tracking-wide max-w-md mb-8 md:mb-0">
               <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={personalInfo.jobTitle} 
                    onSave={(val) => handleUpdate('personalInfo.jobTitle', val)} 
                    path="personalInfo.jobTitle"
                    placeholder="Job Title"
                    className="bg-transparent border-none"
                 />
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-24" id="work">
        {/* Dynamic Section Rendering */}
        {(data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : ["summary", "projects", "experience", "skills", "education"]).map(id => {
            switch(id) {
                case 'summary':
                    return (
                        <motion.section
                            key="summary"
                            id="about"
                            className="py-12 md:py-24 max-w-4xl mx-auto text-center scroll-mt-24"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                          <div className="text-2xl md:text-4xl leading-relaxed font-light text-neutral-300">
                                <InlineEdit readOnly={readOnly || !onUpdate}
                                value={personalInfo.summary.content}
                                placeholder="Write a short bio about yourself..."
                                multiline
                                onSave={(val) => handleUpdate('personalInfo.summary.content', val)}
                                path="personalInfo.summary.content"
                                alignment={personalInfo.summary.alignment || "center"}
                                className="bg-transparent border-none focus:ring-0 w-full"
                             />
                          </div>
                        </motion.section>
                    );
                
                case 'projects':
                    if (!onUpdate && (!data.projects || data.projects.length === 0)) return null;
                    return (
                        <section key="projects" id="work" className="py-24 w-full scroll-mt-24">
                           <div className="flex justify-between items-end mb-16 border-b border-white/20 pb-8">
                             <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent stroke-text-white">
                                Selected Works
                             </h2>
                              {onUpdate && !readOnly && (
                                    <ThemeAddButton 
                                        label="Add Project"
                                        className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white"
                                        onClick={() => {
                                        const newProj = [{
                                            id: crypto.randomUUID(),
                                            name: { content: "Project Name" },
                                            description: { content: "Short description" },
                                            url: "https://project.com",
                                            technologies: []
                                        }, ...data.projects];
                                        handleUpdate('projects', newProj);
                                    }} />
                              )}
                           </div>
                           
                           <div className="space-y-32">
                                {(!data.projects || data.projects.length === 0) && onUpdate && !readOnly ? (
                                     <EmptySectionPlaceholder 
                                        className="border-white/20 hover:border-white/40 bg-transparent text-white"
                                        message="Add your first project"
                                        onClick={() => {
                                            const newProj = [{
                                                id: crypto.randomUUID(),
                                                name: { content: "Project Name" },
                                                description: { content: "Short description" },
                                                url: "https://project.com",
                                                technologies: []
                                            }, ...(data.projects || [])];
                                            handleUpdate('projects', newProj);
                                        }}
                                    />
                               ) : (
                                   data.projects.map((project, i) => (
                                       <motion.div 
                                         key={project.id || i}
                                         initial={{ opacity: 0, y: 50 }}
                                         whileInView={{ opacity: 1, y: 0 }}
                                         viewport={{ once: true }}
                                         transition={{ duration: 0.6 }}
                                         className="group/item relative block"
                                       >
                                           <div className="border-l-2 border-white/20 pl-8 md:pl-16 ml-4 md:ml-0 transition-colors group-hover/item:border-white">
                                               <div className="flex justify-between items-start mb-6">
                                                   <h3 className="text-4xl md:text-5xl font-bold">
                                                    <InlineEdit readOnly={readOnly || !onUpdate}
                                                            value={project.name?.content}
                                                            placeholder="Project Name"
                                                            onSave={(val) => {
                                                                const newProj = [...data.projects];
                                                                newProj[i].name = { ...newProj[i].name, content: val };
                                                                handleUpdate('projects', newProj);
                                                            }}
                                                            path={`projects[${i}].name.content`}
                                                            alignment={project.name?.alignment || undefined}
                                                            className="bg-transparent border-none w-full"
                                                        />
                                                   </h3>
                                                    {onUpdate && !readOnly && (
                                                       <ThemeDeleteButton
                                                          className="text-red-500 hover:bg-red-900/50 bg-transparent border-none"
                                                          onClick={() => {
                                                              const newProj = [...data.projects];
                                                              newProj.splice(i, 1);
                                                              handleUpdate('projects', newProj);
                                                          }}
                                                       />
                                                  )}
                                               </div>
                                               
                                               <div className="text-xl md:text-2xl text-neutral-400 font-light mb-8 max-w-2xl">
                                                    <InlineEdit readOnly={readOnly || !onUpdate}
                                                        value={project.description?.content}
                                                        placeholder="Description..."
                                                        multiline
                                                        onSave={(val) => {
                                                            const newProj = [...data.projects];
                                                            newProj[i].description = { ...newProj[i].description, content: val };
                                                            handleUpdate('projects', newProj);
                                                        }}
                                                        path={`projects[${i}].description.content`}
                                                        alignment={project.description?.alignment || undefined}
                                                        className="bg-transparent border-none w-full"
                                                    />
                                               </div>
                                               
                                               <div className="flex items-center gap-4 text-sm font-mono uppercase tracking-widest text-neutral-500">
                                                    <div className="flex items-center gap-2">
                                                        <span>URL:</span>
                                                         <InlineEdit readOnly={readOnly || !onUpdate}
                                                            value={project.url}
                                                            placeholder="https://..."
                                                            onSave={(val) => {
                                                                const newProj = [...data.projects];
                                                                newProj[i].url = val;
                                                                handleUpdate('projects', newProj);
                                                            }}
                                                            path={`projects[${i}].url`}
                                                            className="bg-transparent border-none min-w-[100px]"
                                                        />
                                                    </div>
                                               </div>
                                           </div>
                                       </motion.div>
                                   ))
                               )}
                           </div>
                        </section>
                    );
                
                case 'experience':
                    if (!onUpdate && (!data.experience || data.experience.length === 0)) return null;
                    return (
                        <section key="experience" id="experience" className="py-24 w-full scroll-mt-24">
                           <div className="flex justify-between items-end mb-12 border-b border-white/20 pb-8">
                             <h2 className="text-4xl font-bold uppercase tracking-tighter">Experience</h2>
                              {onUpdate && !readOnly && (
                                    <ThemeAddButton 
                                        label="Add"
                                        className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white"
                                        onClick={() => {
                                        const newExp = [{
                                            id: crypto.randomUUID(),
                                            company: { content: "Company" },
                                            position: { content: "Role" },
                                            startDate: { content: "2024" },
                                            description: { content: "Description" }
                                        }, ...data.experience];
                                        handleUpdate('experience', newExp);
                                    }} />
                            )}
                           </div>
                           
                           <div className="grid md:grid-cols-2 gap-16">
                                {(!data.experience || data.experience.length === 0) && onUpdate && !readOnly ? (
                                    <div className="col-span-2">
                                         <EmptySectionPlaceholder 
                                            className="border-white/20 hover:border-white/40 bg-transparent text-white"
                                            message="Add your first experience"
                                            onClick={() => {
                                                const newExp = [{
                                                    id: crypto.randomUUID(),
                                                    company: { content: "Company" },
                                                    position: { content: "Role" },
                                                    startDate: { content: "2024" },
                                                    description: { content: "Description" }
                                                }, ...(data.experience || [])];
                                                handleUpdate('experience', newExp);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    data.experience.map((exp, i) => (
                                        <div key={exp.id || i} className="group/item relative">
                                             <div className="flex justify-between items-start">
                                                 <div className="text-neutral-500 font-mono text-sm mb-2 flex gap-1">
                                                      <InlineEdit readOnly={readOnly || !onUpdate}
                                                        value={exp.startDate?.content}
                                                        placeholder="Start"
                                                        onSave={(val) => {
                                                            const newExp = [...data.experience];
                                                            newExp[i].startDate = { ...newExp[i].startDate, content: val };
                                                            handleUpdate('experience', newExp);
                                                        }}
                                                        path={`experience[${i}].startDate.content`}
                                                        alignment={exp.startDate?.alignment || undefined}
                                                        className="bg-transparent border-none text-right"
                                                    />
                                                     <span>-</span>
                                                      <InlineEdit readOnly={readOnly || !onUpdate}
                                                        value={exp.endDate?.content}
                                                        placeholder="Present"
                                                        onSave={(val) => {
                                                            const newExp = [...data.experience];
                                                            newExp[i].endDate = { ...newExp[i].endDate, content: val };
                                                            handleUpdate('experience', newExp);
                                                        }}
                                                        path={`experience[${i}].endDate.content`}
                                                        alignment={exp.endDate?.alignment || undefined}
                                                        className="bg-transparent border-none"
                                                    />
                                                 </div>
                                                  {onUpdate && !readOnly && (
                                                       <ThemeDeleteButton
                                                          className="text-red-500 hover:bg-red-900/50 bg-transparent border-none"
                                                          onClick={() => {
                                                              const newExp = [...data.experience];
                                                              newExp.splice(i, 1);
                                                              handleUpdate('experience', newExp);
                                                          }}
                                                       />
                                                  )}
                                             </div>
                                            
                                            <h3 className="text-2xl font-bold mb-1">
                                                 <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.company?.content}
                                                    placeholder="Company"
                                                    onSave={(val) => {
                                                        const newExp = [...data.experience];
                                                        newExp[i].company = { ...newExp[i].company, content: val };
                                                        handleUpdate('experience', newExp);
                                                    }}
                                                    path={`experience[${i}].company.content`}
                                                    alignment={exp.company?.alignment || undefined}
                                                    className="bg-transparent border-none"
                                                />
                                            </h3>
                                            <div className="text-lg text-neutral-400 mb-4">
                                                 <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.position?.content}
                                                    placeholder="Position"
                                                    onSave={(val) => {
                                                        const newExp = [...data.experience];
                                                        newExp[i].position = { ...newExp[i].position, content: val };
                                                        handleUpdate('experience', newExp);
                                                    }}
                                                    path={`experience[${i}].position.content`}
                                                    alignment={exp.position?.alignment || undefined}
                                                    className="bg-transparent border-none"
                                                />
                                            </div>
                                            
                                            <p className="text-neutral-400 leading-relaxed text-sm">
                                                 <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.description?.content}
                                                    placeholder="Description..."
                                                    multiline
                                                    onSave={(val) => {
                                                        const newExp = [...data.experience];
                                                        newExp[i].description = { ...newExp[i].description, content: val };
                                                        handleUpdate('experience', newExp);
                                                    }}
                                                    path={`experience[${i}].description.content`}
                                                    alignment={exp.description?.alignment || undefined}
                                                    className="bg-transparent border-none w-full"
                                                />
                                            </p>
                                        </div>
                                    ))
                                )}
                           </div>
                        </section>
                    );
                
                case 'skills':
                    if (!onUpdate && (!data.skills || data.skills.length === 0)) return null;
                    return (
                        <section key="skills" id="skills" className="py-12 w-full border-t border-white/10 scroll-mt-24">
                           <div className="flex justify-between items-center mb-8">
                             <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Stack</h3>
                              {onUpdate && !readOnly && (
                                <ThemeAddButton 
                                    label=""
                                    className="w-6 h-6 p-0 bg-transparent hover:bg-white/10 text-white border-white/20 hover:text-white"
                                    onClick={() => {
                                    const newSkills = [...data.skills, "Skill"];
                                    handleUpdate('skills', newSkills);
                                    }} 
                                />
                             )}
                           </div>
                           
                           <div className="flex flex-wrap gap-x-8 gap-y-4">
                              {data.skills.map((skill, i) => (
                                  <span key={i} className="group/item relative text-xl md:text-2xl font-light text-neutral-300 hover:text-white transition-colors">
                                       <InlineEdit readOnly={readOnly || !onUpdate} 
                                            value={skill} 
                                            onSave={(val) => {
                                                const newSkills = [...data.skills];
                                                newSkills[i] = val;
                                                handleUpdate('skills', newSkills);
                                            }}
                                            path={`skills[${i}]`}
                                            className="bg-transparent border-none text-center min-w-[60px]"
                                        />
                                         {onUpdate && !readOnly && (
                                        <ThemeDeleteButton
                                            onClick={() => {
                                                const newSkills = [...data.skills];
                                                newSkills.splice(i, 1);
                                                handleUpdate('skills', newSkills);
                                            }}
                                             className="bg-red-600 hover:bg-red-700 text-white border-none w-5 h-5 p-1 rounded-full transition-all ml-2 align-middle opacity-0 group-hover/item:opacity-100"
                                         />
                                    )}
                                  </span>
                              ))}
                           </div>
                         </section>
                    );
                
                case 'education':
                    if (!onUpdate && (!data.education || data.education.length === 0)) return null;
                    return (
                        <section key="education" id="education" className="w-full py-12 scroll-mt-24">
                            <div className="flex justify-between items-end mb-12 border-b border-neutral-800 pb-8">
                             <h2 className="text-4xl font-bold uppercase tracking-tighter">Education</h2>
                              {onUpdate && !readOnly && (
                                    <ThemeAddButton 
                                        label="Add"
                                        className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white"
                                        onClick={() => {
                                        const newEdu = [{
                                            id: crypto.randomUUID(),
                                            institution: { content: "University" },
                                            degree: { content: "Degree" },
                                            startDate: { content: "2020" },
                                            endDate: { content: "2024" }
                                        }, ...data.education];
                                        handleUpdate('education', newEdu);
                                    }} />
                            )}
                           </div>
                           
                           <div className="space-y-8">
                                {(!data.education || data.education.length === 0) && onUpdate && !readOnly ? (
                                    <EmptySectionPlaceholder 
                                        className="border-white/20 hover:border-white/40 bg-transparent text-white"
                                        message="Add your education"
                                        onClick={() => {
                                            const newEdu = [{
                                                id: crypto.randomUUID(),
                                                institution: { content: "University" },
                                                degree: { content: "Degree" },
                                                startDate: { content: "2020" },
                                                endDate: { content: "2024" }
                                            }, ...(data.education || [])];
                                            handleUpdate('education', newEdu);
                                        }}
                                    />
                                ) : (
                                    data.education.map((edu, i) => (
                                        <div key={edu.id || i} className="group/item relative grid md:grid-cols-[1fr_200px] gap-4 items-end">
                                            <div>
                                                 <h3 className="text-xl font-bold">
                                                     <InlineEdit readOnly={readOnly || !onUpdate} 
                                                        value={edu.institution?.content} 
                                                        placeholder="Institution"
                                                        onSave={(val) => {
                                                            const newEdu = [...data.education];
                                                            newEdu[i].institution = { ...newEdu[i].institution, content: val };
                                                            handleUpdate('education', newEdu);
                                                        }}
                                                        path={`education[${i}].institution.content`}
                                                        alignment={edu.institution?.alignment || undefined}
                                                        className="bg-transparent border-none"
                                                    />
                                                </h3>
                                                 <p className="text-neutral-400 flex gap-1 items-center">
                                                      <InlineEdit readOnly={readOnly || !onUpdate} 
                                                        value={edu.degree?.content} 
                                                        placeholder="Degree"
                                                        onSave={(val) => {
                                                            const newEdu = [...data.education];
                                                            newEdu[i].degree = { ...newEdu[i].degree, content: val };
                                                            handleUpdate('education', newEdu);
                                                        }}
                                                        path={`education[${i}].degree.content`}
                                                        alignment={edu.degree?.alignment || undefined}
                                                        className="bg-transparent border-none"
                                                    />
                                                   <span>-</span>
                                                      <InlineEdit readOnly={readOnly || !onUpdate} 
                                                        value={edu.fieldOfStudy?.content} 
                                                        placeholder="Field"
                                                        onSave={(val) => {
                                                            const newEdu = [...data.education];
                                                            newEdu[i].fieldOfStudy = { ...newEdu[i].fieldOfStudy, content: val };
                                                            handleUpdate('education', newEdu);
                                                        }}
                                                        path={`education[${i}].fieldOfStudy.content`}
                                                        alignment={edu.fieldOfStudy?.alignment || undefined}
                                                        className="bg-transparent border-none"
                                                    />
                                                </p>
                                            </div>
                                            <div className="text-right text-neutral-500 font-mono text-sm flex gap-1 justify-end items-center">
                                                 <InlineEdit readOnly={readOnly || !onUpdate} 
                                                    value={edu.startDate?.content} 
                                                    placeholder="Start"
                                                    onSave={(val) => {
                                                        const newEdu = [...data.education];
                                                        newEdu[i].startDate = { ...newEdu[i].startDate, content: val };
                                                        handleUpdate('education', newEdu);
                                                    }}
                                                    path={`education[${i}].startDate.content`}
                                                    alignment={edu.startDate?.alignment || undefined}
                                                    className="bg-transparent border-none text-right"
                                                />
                                                <span>-</span>
                                                <InlineEdit readOnly={readOnly || !onUpdate} 
                                                    value={edu.endDate?.content} 
                                                    placeholder="Present"
                                                    onSave={(val) => {
                                                        const newEdu = [...data.education];
                                                        newEdu[i].endDate = { ...newEdu[i].endDate, content: val };
                                                        handleUpdate('education', newEdu);
                                                    }}
                                                    path={`education[${i}].endDate.content`}
                                                    alignment={edu.endDate?.alignment || undefined}
                                                    className="bg-transparent border-none"
                                                />
                                                 {onUpdate && !readOnly && (
                                                  <ThemeDeleteButton
                                                     className="text-red-500 hover:bg-red-900/50 bg-transparent border-none ml-2"
                                                     onClick={() => {
                                                         const newEdu = [...data.education];
                                                         newEdu.splice(i, 1);
                                                         handleUpdate('education', newEdu);
                                                     }}
                                                  />
                                             )}
                                            </div>
                                        </div>
                                    ))
                                )}
                           </div>
                        </section>
                    );
                
                default:
                    const custom = data.customSections?.find(c => c.id === id);
                    if (custom) {
                        return (
                             <section key={id} id={id} className="mb-48 border-t border-white/20 pt-24 scroll-mt-24">
                                <CustomSectionRenderer 
                                    section={custom} 
                                    index={data.customSections?.indexOf(custom) || 0} 
                                    data={data} 
                                    onUpdate={onUpdate} 
                                    theme="visual"
                                    readOnly={readOnly}
                                />
                             </section>
                        );
                    }
                    return null;
            }
        })}



        {onUpdate && !readOnly && (
            <div className="flex justify-center mb-48 pt-12 print:hidden">
               <Button variant="outline" onClick={() => {
                   const newSection = {
                       id: crypto.randomUUID(),
                       title: "New Section",
                       type: "list" as const,
                       items: []
                   };
                   const newSections = [...(data.customSections || []), newSection];
                   handleUpdate('customSections', newSections);
               }} className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                   <Plus className="w-4 h-4 mr-2" />
                   Add Section
               </Button>
            </div>
        )}

        {/* Contact Footer */}
        <section id="contact" className="py-48 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8">
            Get in Touch
          </h2>
          <div className="flex flex-col gap-4 text-xl md:text-2xl text-neutral-400 items-center">
             <div className="flex items-center gap-2">
                 <Mail className="w-6 h-6" />
                 <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={personalInfo.email} 
                    placeholder="Email Address"
                    onSave={(val) => handleUpdate('personalInfo.email', val)} 
                    path="personalInfo.email"
                    className="bg-transparent border-none text-center"
                 />
             </div>
             <div className="flex items-center gap-2">
                  <Linkedin className="w-6 h-6" />
                  <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={personalInfo.linkedin} 
                    placeholder="LinkedIn"
                    onSave={(val) => handleUpdate('personalInfo.linkedin', val)} 
                    path="personalInfo.linkedin"
                    className="bg-transparent border-none text-center text-lg"
                 />
             </div>
             <div className="flex items-center gap-2">
                 <Globe className="w-6 h-6" />
                   <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={personalInfo.website} 
                    placeholder="Website"
                    onSave={(val) => handleUpdate('personalInfo.website', val)} 
                    path="personalInfo.website"
                    className="bg-transparent border-none text-center text-lg"
                 />
             </div>
             <div className="flex items-center gap-2 mt-4 text-lg">
                 <MapPin className="w-5 h-5" />
                   <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={personalInfo.location} 
                    placeholder="Location"
                    onSave={(val) => handleUpdate('personalInfo.location', val)} 
                    path="personalInfo.location"
                    className="bg-transparent border-none text-center"
                 />
             </div>
          </div>
        </section>


      </main>
    </div>
  );
};
