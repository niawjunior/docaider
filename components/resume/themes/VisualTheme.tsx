import { ResumeData } from "@/lib/schemas/resume";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Mail, MapPin, Globe, Linkedin, ExternalLink } from "lucide-react";
import { InlineEdit } from "@/components/ui/inline-edit";
import { Button } from "@/components/ui/button";
import { ThemeAddButton, ThemeDeleteButton } from "./ThemeControls";

interface VisualThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
}

export const VisualTheme = ({ data, onUpdate }: VisualThemeProps) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference">
        <span className="text-xl font-bold tracking-tighter uppercase">
             {/* Read-only name for nav */}
            {(data.personalInfo.fullName ?? '').split(' ')[0]}
        </span>
        <div className="flex gap-6 text-sm font-medium uppercase tracking-widest bg-black/50 backdrop-blur rounded px-4 py-2">
          <a href="#work" className="hover:opacity-50 transition-opacity">Work</a>
          <a href="#about" className="hover:opacity-50 transition-opacity">About</a>
          <a href="#contact" className="hover:opacity-50 transition-opacity">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full h-screen flex flex-col justify-end p-6 md:p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {data.coverImage ? (
            <motion.div style={{ y }} className="w-full h-[120%] -y-[10%]">
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
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
             {/* Edit full name here */}
             <div className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.85] font-black uppercase tracking-tighter break-words">
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.fullName} 
                    onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
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
               <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.jobTitle} 
                    onSave={(val) => handleUpdate('personalInfo.jobTitle', val)} 
                    placeholder="Job Title"
                    className="bg-transparent border-none"
                 />
            </div>
            <div className="text-neutral-400 max-w-md text-sm md:text-base">
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.summary} 
                    onSave={(val) => handleUpdate('personalInfo.summary', val)} 
                    multiline
                    placeholder="Professional summary..."
                    className="bg-transparent border-none"
                 />
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-24" id="work">
        
        {/* Selected Works */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-48">
             <div className="flex items-end justify-between mb-24">
              <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter">
                Selected<br/>Works
              </h2>
               {onUpdate && (
                     <ThemeAddButton 
                        label="Add Project"
                        className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white"
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

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
              {data.projects.map((project, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6, delay: i % 2 * 0.2 }}
                  className={`group/item relative ${i % 2 === 1 ? "md:mt-32" : ""}`}
                >
                     {onUpdate && (
                     <ThemeDeleteButton
                        className="absolute right-0 top-0 z-20 bg-red-600 hover:bg-red-700 text-white border-none"
                        onClick={() => {
                            //e.preventDefault(); // StopPropagation handled in component
                            const newProjs = [...data.projects];
                            newProjs.splice(i, 1);
                            handleUpdate('projects', newProjs);
                        }}
                     />
                    )}
                  <div className="block cursor-default">
                    <div className="aspect-[3/4] mb-8 overflow-hidden bg-neutral-900 relative">
                       {/* Placeholder pattern since we don't have project images yet */}
                      <div className="w-full h-full bg-neutral-800 group-hover/item:scale-105 transition-transform duration-700 ease-out flex items-center justify-center">
                         <span className="text-neutral-700 text-9xl font-black opacity-20 group-hover/item:opacity-40 transition-opacity">
                           {String(i + 1).padStart(2, '0')}
                         </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold uppercase tracking-tighter mb-2">
                             <InlineEdit readOnly={!onUpdate} 
                                value={project.name} 
                                onSave={(val) => {
                                    const newProjs = [...data.projects];
                                    newProjs[i].name = val;
                                    handleUpdate('projects', newProjs);
                                }}
                                className="bg-transparent border-none"
                                placeholder="Project Name"
                             />
                        </h3>
                        <p className="text-neutral-500 text-sm mb-4">
                             <InlineEdit readOnly={!onUpdate} 
                                value={project.description} 
                                onSave={(val) => {
                                    const newProjs = [...data.projects];
                                    newProjs[i].description = val;
                                    handleUpdate('projects', newProjs);
                                }}
                                multiline
                                className="bg-transparent border-none h-auto min-h-[40px]"
                                placeholder="Description"
                             />
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 text-neutral-500">
                          <div className="flex items-center gap-1 group/link">
                             <ExternalLink className="w-4 h-4" />
                              <InlineEdit readOnly={!onUpdate} 
                                value={project.url} 
                                onSave={(val) => {
                                    const newProjs = [...data.projects];
                                    newProjs[i].url = val;
                                    handleUpdate('projects', newProjs);
                                }}
                                className="bg-transparent border-none text-xs text-right"
                                placeholder="Project URL"
                             />
                          </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        <section id="about" className="mb-48 max-w-3xl">
           <div className="flex justify-between items-end mb-12 border-b border-neutral-800 pb-8">
             <h2 className="text-4xl font-bold uppercase tracking-tighter">Experience</h2>
              {onUpdate && (
                    <ThemeAddButton 
                        label="Add"
                        className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white"
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

          <div className="space-y-12">
            {data.experience.map((exp, i) => (
              <div key={i} className="group/item relative border-l border-neutral-800 pl-8 ml-3">
                 {onUpdate && (
                     <ThemeDeleteButton
                        className="absolute -right-8 top-0 text-red-500 hover:bg-red-900/50 bg-transparent border-none"
                        onClick={() => {
                            const newExp = [...data.experience];
                            newExp.splice(i, 1);
                            handleUpdate('experience', newExp);
                        }}
                     />
                    )}
                <div className="absolute -left-[5px] top-2 w-2 h-2 bg-neutral-600 rounded-full" />
                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
                  <h3 className="text-2xl font-bold">
                       <InlineEdit readOnly={!onUpdate} 
                            value={exp.position} 
                            placeholder="Position"
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[i].position = val;
                                handleUpdate('experience', newExp);
                            }}
                            className="bg-transparent border-none"
                        />
                  </h3>
                  <div className="text-neutral-500 font-mono text-sm flex gap-1">
                     <InlineEdit readOnly={!onUpdate} 
                            value={exp.startDate} 
                            placeholder="Start"
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[i].startDate = val;
                                handleUpdate('experience', newExp);
                            }}
                            className="bg-transparent border-none text-right"
                        />
                        <span>-</span>
                         <InlineEdit readOnly={!onUpdate} 
                            value={exp.endDate} 
                            placeholder="Present"
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[i].endDate = val;
                                handleUpdate('experience', newExp);
                            }}
                            className="bg-transparent border-none"
                        />
                  </div>
                </div>
                <div className="text-xl text-neutral-400 mb-4">
                     <InlineEdit readOnly={!onUpdate} 
                            value={exp.company} 
                            placeholder="Company"
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[i].company = val;
                                handleUpdate('experience', newExp);
                            }}
                            className="bg-transparent border-none"
                        />
                </div>
                <p className="text-neutral-400 leading-relaxed">
                     <InlineEdit readOnly={!onUpdate} 
                            value={exp.description} 
                            placeholder="Description"
                            multiline
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[i].description = val;
                                handleUpdate('experience', newExp);
                            }}
                            className="bg-transparent border-none"
                        />
                </p>
              </div>
            ))}
          </div>
        </section>

         {/* Skills - Often forgotten in visual themes but useful */}
         <section className="mb-48">
            <div className="flex justify-between items-center mb-12 border-b border-neutral-800 pb-8">
             <h2 className="text-4xl font-bold uppercase tracking-tighter">Skills</h2>
              {onUpdate && (
                     <ThemeAddButton 
                        label="Add"
                        className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white"
                        onClick={() => {
                        const newSkills = [...data.skills, "SKILL"];
                        handleUpdate('skills', newSkills);
                    }} />
            )}
           </div>
           <div className="flex flex-wrap gap-4">
              {data.skills.map((skill, i) => (
                  <span key={i} className="group/skill relative border border-white/20 px-6 py-3 rounded-full uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors">
                     <InlineEdit readOnly={!onUpdate} 
                            value={skill} 
                            placeholder="SKILL"
                            onSave={(val) => {
                                const newSkills = [...data.skills];
                                newSkills[i] = val;
                                handleUpdate('skills', newSkills);
                            }}
                            className="bg-transparent border-none text-center min-w-[60px]"
                        />
                         {onUpdate && (
                        <ThemeDeleteButton
                            onClick={() => {
                                const newSkills = [...data.skills];
                                newSkills.splice(i, 1);
                                handleUpdate('skills', newSkills);
                            }}
                             className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white border-none w-5 h-5 p-1"
                         />
                    )}
                  </span>
              ))}
           </div>
         </section>

        {/* Education */}
        <section className="max-w-3xl">
            <div className="flex justify-between items-end mb-12 border-b border-neutral-800 pb-8">
             <h2 className="text-4xl font-bold uppercase tracking-tighter">Education</h2>
              {onUpdate && (
                    <ThemeAddButton 
                        label="Add"
                        className="text-white border-white/20 hover:bg-white/10 bg-transparent hover:text-white"
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
           
           <div className="space-y-8">
               {data.education.map((edu, i) => (
                   <div key={i} className="group/item relative grid md:grid-cols-[1fr_200px] gap-4 items-end">
                         {onUpdate && (
                              <ThemeDeleteButton
                                 className="absolute -left-12 top-0 text-red-500 hover:bg-red-900/50 bg-transparent border-none"
                                 onClick={() => {
                                     const newEdu = [...data.education];
                                     newEdu.splice(i, 1);
                                     handleUpdate('education', newEdu);
                                 }}
                              />
                         )}
                       <div>
                           <h3 className="text-xl font-bold">
                                <InlineEdit readOnly={!onUpdate} 
                                    value={edu.institution} 
                                    placeholder="Institution"
                                    onSave={(val) => {
                                        const newEdu = [...data.education];
                                        newEdu[i].institution = val;
                                        handleUpdate('education', newEdu);
                                    }}
                                    className="bg-transparent border-none"
                                />
                           </h3>
                           <p className="text-neutral-400 flex gap-1">
                                <InlineEdit readOnly={!onUpdate} 
                                    value={edu.degree} 
                                    placeholder="Degree"
                                    onSave={(val) => {
                                        const newEdu = [...data.education];
                                        newEdu[i].degree = val;
                                        handleUpdate('education', newEdu);
                                    }}
                                    className="bg-transparent border-none"
                                />
                                 <span>-</span>
                                 <InlineEdit readOnly={!onUpdate} 
                                    value={edu.fieldOfStudy} 
                                    placeholder="Field"
                                    onSave={(val) => {
                                        const newEdu = [...data.education];
                                        newEdu[i].fieldOfStudy = val;
                                        handleUpdate('education', newEdu);
                                    }}
                                    className="bg-transparent border-none"
                                />
                           </p>
                       </div>
                       <div className="text-right text-neutral-500 font-mono text-sm flex gap-1 justify-end">
                            <InlineEdit readOnly={!onUpdate} 
                                value={edu.startDate} 
                                placeholder="Start"
                                onSave={(val) => {
                                    const newEdu = [...data.education];
                                    newEdu[i].startDate = val;
                                    handleUpdate('education', newEdu);
                                }}
                                className="bg-transparent border-none text-right"
                            />
                            <span>-</span>
                            <InlineEdit readOnly={!onUpdate} 
                                value={edu.endDate} 
                                placeholder="Present"
                                onSave={(val) => {
                                    const newEdu = [...data.education];
                                    newEdu[i].endDate = val;
                                    handleUpdate('education', newEdu);
                                }}
                                className="bg-transparent border-none"
                            />
                       </div>
                   </div>
               ))}
           </div>
        </section>

        {/* Contact Footer */}
        <section id="contact" className="py-48 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8">
            Get in Touch
          </h2>
          <div className="flex flex-col gap-4 text-xl md:text-2xl text-neutral-400 items-center">
             <div className="flex items-center gap-2">
                 <Mail className="w-6 h-6" />
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.email} 
                    placeholder="Email Address"
                    onSave={(val) => handleUpdate('personalInfo.email', val)} 
                    className="bg-transparent border-none text-center"
                 />
             </div>
             <div className="flex items-center gap-2">
                  <Linkedin className="w-6 h-6" />
                  <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.linkedin} 
                    placeholder="LinkedIn"
                    onSave={(val) => handleUpdate('personalInfo.linkedin', val)} 
                    className="bg-transparent border-none text-center text-lg"
                 />
             </div>
             <div className="flex items-center gap-2">
                 <Globe className="w-6 h-6" />
                  <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.website} 
                    placeholder="Website"
                    onSave={(val) => handleUpdate('personalInfo.website', val)} 
                    className="bg-transparent border-none text-center text-lg"
                 />
             </div>
             <div className="flex items-center gap-2 mt-4 text-lg">
                 <MapPin className="w-5 h-5" />
                  <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.location} 
                    placeholder="Location"
                    onSave={(val) => handleUpdate('personalInfo.location', val)} 
                    className="bg-transparent border-none text-center"
                 />
             </div>
          </div>
        </section>

      </main>
    </div>
  );
};
