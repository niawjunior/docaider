import { ResumeData } from "@/lib/schemas/resume";
import { motion } from "framer-motion";
import { 
  Mail, 
  Linkedin, 
  Globe,
} from "lucide-react";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { Button } from "@/components/ui/button";
import { ThemeAddButton, ThemeDeleteButton } from "./ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "../shared/ResumeSectionList";
import { EmptySectionPlaceholder } from "../shared/EmptySectionPlaceholder";
import { CustomSectionRenderer } from "../shared/CustomSectionRenderer";
import { Plus } from "lucide-react";

interface StudioThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
}

export const StudioTheme = ({ data, onUpdate, readOnly }: StudioThemeProps) => {
  const { updateField: handleUpdate } = useResumeUpdate(data, onUpdate);

  const marqueeVariants = {
    animate: {
      x: [0, -1035],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop" as const,
          duration: 20,
          ease: "linear" as const,
        },
      },
    },
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden relative">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 mix-blend-difference px-6 py-6 flex justify-between items-center bg-black/0 backdrop-blur-sm">
        <div className="text-xl font-bold tracking-tighter uppercase">
           {/* Static Logo from Name */}
          {(data.personalInfo.fullName ?? '').split(' ')[0]}
        </div>
        <div className="flex gap-6 text-sm font-medium uppercase tracking-widest hidden sm:flex">
          <a href="#work" className="hover:underline decoration-2 underline-offset-4">Work</a>
          <a href="#about" className="hover:underline decoration-2 underline-offset-4">About</a>
          <a href="#contact" className="hover:underline decoration-2 underline-offset-4">Contact</a>
        </div>
      </nav>

      {/* Hero Marquee */}
      <div className="pt-12 pb-12 border-b border-neutral-800 overflow-hidden whitespace-nowrap">
        <motion.div
          className="inline-flex gap-8"
          variants={marqueeVariants}
          animate="animate"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="text-[10cqw] font-black leading-none uppercase tracking-tighter text-white">
                 {/* Marquee text is usually job title */}
                 {data.personalInfo.jobTitle || "Creative Developer"}
              </span>
              <span className="text-[10cqw] font-black leading-none text-transparent stroke-text">
                —
              </span>
            </div>
          ))}
        </motion.div>


        {onUpdate && (
          <div className="px-6 mt-4 text-center">
              <div className="text-sm text-neutral-500 mb-1">MARQUEE TEXT (Edit here):</div>
              <InlineEdit readOnly={readOnly || !onUpdate}
                  value={data.personalInfo.jobTitle}
                  placeholder="CREATIVE DEVELOPER"
                  onSave={(val) => handleUpdate('personalInfo.jobTitle', val?.toUpperCase())}
                  path="personalInfo.jobTitle"
                  className="text-2xl font-bold uppercase tracking-tighter bg-neutral-900 border-none text-center"
              />
          </div>
        )}
      </div>

      <main className="px-6">
        {/* Dynamic Section Rendering */}
        {(data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : ["summary", "skills", "projects", "experience", "education"]).map(id => {
            switch(id) {
                case 'summary':
                    return (
                        <motion.section
                          key="summary"
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8 }}
                          className="py-24 max-w-4xl border-t border-neutral-800"
                          id="about"
                        >
                           <div className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                             <InlineEdit readOnly={readOnly || !onUpdate}
                                value={data.personalInfo.summary?.content}
                                placeholder="Your professional summary goes here..."
                                multiline
                                onSave={(val) => handleUpdate('personalInfo.summary.content', val)}
                                path="personalInfo.summary.content"
                                alignment={data.personalInfo.summary?.alignment || undefined}
                                className="bg-transparent border-neutral-800"
                             />
                           </div>
                        </motion.section>
                    );
                
                case 'skills':
                    if (!onUpdate && (!data.skills || data.skills.length === 0)) return null;
                    return (
                        <motion.section 
                            key="skills"
                            className="py-12 max-w-4xl border-t border-neutral-800"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                           <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                   <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Skills</h3>
                                    {onUpdate && !readOnly && (
                                       <ThemeAddButton
                                         label=""
                                         className="w-6 h-6 p-0 bg-transparent hover:bg-neutral-800 text-white border-neutral-800 hover:text-white"
                                         onClick={() => {
                                              const newSkills = [...data.skills, "New Skill"];
                                              handleUpdate('skills', newSkills);
                                         }}
                                       />
                                 )}
                              </div>
                             <div className="flex flex-wrap gap-4">
                                 {data.skills.map((skill, i) => (
                                 <span key={i} className="group/skill relative inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm tracking-wider uppercase">
                                      <InlineEdit readOnly={readOnly || !onUpdate}
                                         value={skill}
                                         onSave={(val) => {
                                             const newSkills = [...data.skills];
                                             newSkills[i] = val;
                                             handleUpdate('skills', newSkills);
                                         }}
                                         className="bg-transparent"
                                      />
                                       {onUpdate && !readOnly && (
                                         <ThemeDeleteButton
                                             onClick={() => {
                                                 const newSkills = [...data.skills];
                                                 newSkills.splice(i, 1);
                                                 handleUpdate('skills', newSkills);
                                             }}
                                             className="w-4 h-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-none p-[2px] rounded-full transition-all"
                                         />
                                     )}
                                 </span>
                                 ))}
                             </div>
                           </div>
                        </motion.section>
                    );

                case 'projects':
                     // Selected Work
                    if (!onUpdate && (!data.projects || data.projects.length === 0)) return null;
                    return (
                      <section key="projects" id="work" className="py-24 border-t border-neutral-800">
                         <div className="flex justify-between items-end mb-16">
                            <h2 className="text-8xl font-black uppercase tracking-tighter stroke-text text-transparent">
                                Work
                            </h2>
                             {onUpdate && !readOnly && (
                                 <ThemeAddButton
                                    label="Add Project"
                                    className="border-neutral-700 hover:bg-neutral-800 text-white bg-transparent hover:text-white"
                                    onClick={() => {
                                        const newProj = [{
                                            id: crypto.randomUUID(),
                                            name: "Project Name",
                                            description: "Description",
                                            technologies: []
                                        }, ...data.projects];
                                        handleUpdate('projects', newProj);
                                    }}
                                />
                            )}
                         </div>

                        {(!data.projects || data.projects.length === 0) && onUpdate && !readOnly ? (
                             <EmptySectionPlaceholder
                                className="border-neutral-800 hover:border-neutral-600 bg-transparent"
                                message="Add your first Project"
                                onClick={() => {
                                    const newProj = [{
                                        id: crypto.randomUUID(),
                                        name: "Project Name",
                                        description: "Description",
                                        technologies: []
                                    }, ...(data.projects || [])];
                                    handleUpdate('projects', newProj);
                                }}
                            />
                        ) : (
                            <ResumeSectionList
                              data={data.projects}
                              readOnly={readOnly}
                              onUpdate={(val) => handleUpdate('projects', val)}
                              className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16"
                              renderItem={(project, i, updateItem, deleteItem) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group/item relative"
                                >
                                  <div className="border-b border-neutral-800 pb-4 mb-4 flex justify-between items-end">
                                    <div className="flex-1 flex items-start gap-2">
                                        <h3 className="text-3xl font-bold">
                                            <InlineEdit readOnly={readOnly || !onUpdate}
                                                value={project.name}
                                                placeholder="Project Name"
                                                onSave={(val) => updateItem({ name: val })}
                                                path={`projects[${i}].name`}
                                                alignment={(project as any).nameAlignment}
                                                className="bg-transparent"
                                            />
                                        </h3>
                                        {onUpdate && !readOnly && (
                                             <ThemeDeleteButton
                                                className="text-red-500 hover:bg-red-900/50 border-none bg-transparent transition-opacity shrink-0"
                                                onClick={deleteItem}
                                             />
                                        )}
                                    </div>
                                     <div className="flex flex-col gap-1 text-neutral-500">
                                         <div className="flex items-center gap-1">
                                             <span className="text-xs uppercase tracking-wider">URL:</span>
                                             <InlineEdit readOnly={readOnly || !onUpdate}
                                                value={project.url}
                                                placeholder="https://..."
                                                onSave={(val) => updateItem({ url: val })}
                                                path={`projects[${i}].url`}
                                                className="bg-transparent text-sm"
                                            />
                                         </div>
                                     </div>
                                  </div>
                                  <div>
                                    <p className="text-xl text-neutral-400 font-light leading-relaxed">
                                         <InlineEdit readOnly={readOnly || !onUpdate}
                                            value={project.description}
                                            placeholder="Project description..."
                                            multiline
                                            onSave={(val) => updateItem({ description: val })}
                                            path={`projects[${i}].description`}
                                            alignment={(project as any).alignment}
                                            className="bg-transparent"
                                        />
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            />
                        )}
                      </section>
                    );

                case 'experience':
                    if (!onUpdate && (!data.experience || data.experience.length === 0)) return null;
                    return (
                        <section key="experience" className="py-24 border-t border-neutral-800">
                             <div className="flex justify-between items-end mb-16">
                                <h2 className="text-4xl font-bold uppercase tracking-tight">
                                    Experience
                                </h2>
                                 {onUpdate && !readOnly && (
                                    <ThemeAddButton
                                        label="Add"
                                        className="bg-white text-black hover:bg-neutral-200 border-none"
                                        onClick={() => {
                                            const newExp = [{
                                                id: crypto.randomUUID(),
                                                company: "Company Name",
                                                position: "Position",
                                                startDate: "2024",
                                                description: "Job description goes here..."
                                            }, ...data.experience];
                                            handleUpdate('experience', newExp);
                                        }}
                                    />
                                )}
                            </div>

                            {(!data.experience || data.experience.length === 0) && onUpdate && !readOnly ? (
                                 <EmptySectionPlaceholder
                                    className="border-neutral-800 hover:border-neutral-600 bg-transparent"
                                    message="Add your first Experience"
                                    onClick={() => {
                                        const newExp = [{
                                            id: crypto.randomUUID(),
                                            company: "Company Name",
                                            position: "Position",
                                            startDate: "2024",
                                            description: "Job description goes here..."
                                        }, ...(data.experience || [])];
                                        handleUpdate('experience', newExp);
                                    }}
                                />
                            ) : (
                                <ResumeSectionList
                                  data={data.experience}
                                  readOnly={readOnly || !onUpdate}
                                  onUpdate={(val) => handleUpdate('experience', val)}
                                  className="grid grid-cols-1 gap-12"
                                  renderItem={(exp, i, updateItem, deleteItem) => (
                                    <div className="group/item relative border-l border-neutral-800 pl-8 ml-2">
                                        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4 relative pr-8">
                                            <h3 className="text-2xl font-bold text-white">
                                                <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.company}
                                                    placeholder="Company"
                                                    onSave={(val) => updateItem({ company: val })}
                                                    path={`experience[${i}].company`}
                                                    alignment={(exp as any).companyAlignment}
                                                    className="bg-transparent"
                                                />
                                            </h3>
                                             <div className="text-neutral-500 font-mono text-sm mr-2">
                                                <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.startDate}
                                                    placeholder="Start"
                                                    onSave={(val) => updateItem({ startDate: val })}
                                                    path={`experience[${i}].startDate`}
                                                    alignment={(exp as any).dateAlignment}
                                                    className="bg-transparent text-right"
                                                />
                                                {" — "}
                                                <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.endDate}
                                                    placeholder="Present"
                                                    onSave={(val) => updateItem({ endDate: val })}
                                                    path={`experience[${i}].endDate`}
                                                    alignment={(exp as any).dateAlignment}
                                                    className="bg-transparent text-right"
                                                />
                                            </div>
                                             {onUpdate && !readOnly && (
                                              <ThemeDeleteButton
                                                 className="absolute right-0 top-1 text-neutral-500 hover:text-red-500 bg-transparent border-none"
                                                 onClick={deleteItem}
                                              />
                                             )}
                                        </div>

                                        <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800/50">
                                            <h4 className="text-xl text-neutral-300 mb-4">
                                                <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.position}
                                                    placeholder="Position"
                                                    onSave={(val) => updateItem({ position: val })}
                                                    path={`experience[${i}].position`}
                                                    alignment={(exp as any).positionAlignment}
                                                    className="bg-transparent"
                                                />
                                            </h4>
                                            <p className="text-neutral-400 leading-relaxed font-light">
                                                 <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={exp.description}
                                                    placeholder="Description..."
                                                    multiline
                                                    onSave={(val) => updateItem({ description: val })}
                                                    path={`experience[${i}].description`}
                                                    alignment={(exp as any).alignment}
                                                    className="bg-transparent"
                                                />
                                            </p>
                                        </div>
                                    </div>
                                  )}
                                />
                            )}
                        </section>
                    );

                case 'education':
                    // Add Education Section for Studio Theme
                    if (!onUpdate && (!data.education || data.education.length === 0)) return null;
                    return (
                        <section key="education" className="py-24 border-t border-neutral-800">
                             <div className="flex justify-between items-end mb-16">
                                <h2 className="text-4xl font-bold uppercase tracking-tight">
                                    Education
                                </h2>
                                 {onUpdate && !readOnly && (
                                    <ThemeAddButton
                                        label="Add"
                                        className="bg-white text-black hover:bg-neutral-200 border-none"
                                        onClick={() => {
                                            const newEdu = [{
                                                id: crypto.randomUUID(),
                                                school: "University",
                                                degree: "Degree",
                                                year: "2024"
                                            }, ...data.education];
                                            handleUpdate('education', newEdu);
                                        }}
                                    />
                                )}
                            </div>

                            {(!data.education || data.education.length === 0) && onUpdate && !readOnly ? (
                                 <EmptySectionPlaceholder
                                    className="border-neutral-800 hover:border-neutral-600 bg-transparent"
                                    message="Add your Education"
                                    onClick={() => {
                                        const newEdu = [{
                                            id: crypto.randomUUID(),
                                            school: "University",
                                            degree: "Degree",
                                            year: "2024"
                                        }, ...(data.education || [])];
                                        handleUpdate('education', newEdu);
                                    }}
                                />
                            ) : (
                                <ResumeSectionList
                                  data={data.education}
                                  readOnly={readOnly || !onUpdate}
                                  onUpdate={(val) => handleUpdate('education', val)}
                                  className="grid grid-cols-1 gap-12"
                                  renderItem={(edu, i, updateItem, deleteItem) => (
                                    <div className="group/item relative border-l border-neutral-800 pl-8 ml-2">
                                        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4 relative pr-8">
                                            <h3 className="text-2xl font-bold text-white">
                                                <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={edu.institution}
                                                    placeholder="School/University"
                                                    onSave={(val) => updateItem({ institution: val })}
                                                    path={`education[${i}].institution`}
                                                    alignment={(edu as any).institutionAlignment}
                                                    className="bg-transparent"
                                                />
                                            </h3>
                                             <div className="text-neutral-500 font-mono text-sm mr-2">
                                                <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={edu.endDate}
                                                    placeholder="Year"
                                                    onSave={(val) => updateItem({ endDate: val })}
                                                    path={`education[${i}].endDate`}
                                                    alignment={(edu as any).dateAlignment}
                                                    className="bg-transparent text-right"
                                                />
                                            </div>
                                            {onUpdate && !readOnly && (
                                              <ThemeDeleteButton
                                                 className="absolute right-0 top-1 text-neutral-500 hover:text-red-500 bg-transparent border-none"
                                                 onClick={deleteItem}
                                              />
                                             )}
                                        </div>

                                        <div className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800/50">
                                            <p className="text-xl text-neutral-400 font-light">
                                                 <InlineEdit readOnly={readOnly || !onUpdate}
                                                    value={edu.degree}
                                                    placeholder="Degree/Certificate"
                                                    onSave={(val) => updateItem({ degree: val })}
                                                    path={`education[${i}].degree`}
                                                    alignment={(edu as any).degreeAlignment}
                                                    className="bg-transparent"
                                                />
                                            </p>
                                        </div>
                                    </div>
                                  )}
                                />
                            )}
                        </section>
                    );

                default:
                    const custom = data.customSections?.find(c => c.id === id);
                    if (custom) {
                        return (
                             <section key={id} className="py-24 border-t border-neutral-800">
                                <CustomSectionRenderer
                                    section={custom}
                                    index={data.customSections?.indexOf(custom) || 0}
                                    data={data}
                                    onUpdate={onUpdate}
                                    theme="studio"
                                    readOnly={readOnly}
                                />
                             </section>
                        );
                    }
                    return null;
            }
        })}

        {onUpdate && !readOnly && (
            <div className="flex justify-center py-24 border-t border-neutral-800 print:hidden">
               <Button variant="outline" onClick={() => {
                   const newSection = {
                       id: crypto.randomUUID(),
                       title: "New Section",
                       type: "list" as const,
                       items: []
                   };
                   const newSections = [...(data.customSections || []), newSection];
                   const newOrder = [...(data.sectionOrder || []), newSection.id];
                   
                   // Update both
                   onUpdate({ 
                       ...data, 
                       customSections: newSections, 
                       sectionOrder: newOrder 
                    });
               }} className="bg-transparent border-neutral-800 text-white hover:bg-neutral-800 hover:text-white">
                   <Plus className="w-4 h-4 mr-2" />
                   Add Section
               </Button>
            </div>
        )}
        {/* Contact */}
        <section id="contact" className="py-24 border-t border-neutral-800 mb-20">
          <div className="max-w-4xl">
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-12">
              Let's Talk
            </h2>
            <div className="flex flex-col gap-8 text-xl">
               <div className="flex items-center gap-4 group">
                    <Mail className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors" />
                    <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.email} 
                        placeholder="Email Address"
                        onSave={(val) => handleUpdate('personalInfo.email', val)} 
                        path="personalInfo.email"
                        className="bg-transparent border-neutral-800"
                     />
               </div>
               <div className="flex items-center gap-4 group">
                    <Linkedin className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors" />
                     <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.linkedin} 
                        placeholder="LinkedIn URL"
                        onSave={(val) => handleUpdate('personalInfo.linkedin', val)} 
                        path="personalInfo.linkedin"
                        className="bg-transparent border-neutral-800"
                     />
               </div>
               <div className="flex items-center gap-4 group">
                    <Globe className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors" />
                     <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.website} 
                        placeholder="Website URL"
                        onSave={(val) => handleUpdate('personalInfo.website', val)} 
                        path="personalInfo.website"
                        className="bg-transparent border-neutral-800"
                     />
               </div>
            </div>
            
            <div className="mt-20 pt-8 border-t border-neutral-900 text-neutral-600 text-sm flex justify-between items-center">
                 <div>
                    <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.fullName} 
                        placeholder="Your Name"
                        onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                        path="personalInfo.fullName"
                        className="bg-transparent font-bold"
                     />
                    <span> © {new Date().getFullYear()}</span>
                 </div>
                 <div>
                     <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.location} 
                        placeholder="Location"
                        onSave={(val) => handleUpdate('personalInfo.location', val)} 
                        path="personalInfo.location"
                        className="bg-transparent text-right"
                     />
                 </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};
