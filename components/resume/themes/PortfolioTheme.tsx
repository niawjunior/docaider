import { ResumeData } from "@/lib/schemas/resume";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  ExternalLink,
  Calendar,
  Briefcase,
  GraduationCap,
  Code2,
  Layout,
  Plus,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineEdit } from "@/components/ui/inline-edit";

interface PortfolioThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
}

export const PortfolioTheme = ({ data, onUpdate }: PortfolioThemeProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Hero Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-slate-200 sticky top-0 z-50 bg-opacity-90 backdrop-blur-sm"
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tight flex items-center gap-1">
             <InlineEdit readOnly={!onUpdate} 
                value={(data.personalInfo.fullName ?? '').split(' ')[0]}
                onSave={(val) => {
                    // This is a bit tricky as we only show first name here but edit full name usually
                    // For simply, let's just edit the full name and picking the first part is for display
                    // OR we just show full name here to be editable.
                    // Let's make it editable as full name for simplicity in this "logo" area or just first name
                    // If user edits "John" to "Jane", we update full name? No, that's ambiguous.
                    // Let's display Full Name here for editing purposes if clicked, or maybe just leave this as a non-editable "Logo"
                    // derived from the main title. 
                    // Better UX: This is just a nav logo, let's leave it read-only derived from data, 
                    // editing happens in the main Body.
                }}
                className="pointer-events-none" 
             />
             <span>{(data.personalInfo.fullName ?? '').split(' ')[0]}</span>
            <span className="text-blue-600">.</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#experience" className="hover:text-blue-600 transition-colors">Experience</a>
            <a href="#projects" className="hover:text-blue-600 transition-colors">Projects</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </nav>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-24">
        {/* About / Hero */}
        <motion.section 
          id="about"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-12 md:py-20"
        >
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 flex flex-wrap gap-2 items-baseline">
              <span>Hi, I'm</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                 <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.fullName} 
                    onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                    placeholder="Your Name"
                    className="min-w-[200px]"
                 />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
               <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.summary} 
                    onSave={(val) => handleUpdate('personalInfo.summary', val)} 
                    placeholder="Brief bio or summary..."
                    multiline
                 />
            </p>
            
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2">
                 <Button variant="outline" className="rounded-full px-4" asChild={false}>
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.email} 
                            placeholder="Email"
                            onSave={(val) => handleUpdate('personalInfo.email', val)} 
                            className="bg-transparent border-none p-0 h-auto w-auto min-w-[100px]"
                        />
                    </div>
                 </Button>
               </div>
               
               <div className="flex items-center gap-2">
                 <Button variant="outline" className="rounded-full px-4" asChild={false}>
                    <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.linkedin} 
                            placeholder="LinkedIn URL"
                            onSave={(val) => handleUpdate('personalInfo.linkedin', val)} 
                            className="bg-transparent border-none p-0 h-auto w-auto min-w-[100px]"
                        />
                    </div>
                 </Button>
               </div>

                <div className="flex items-center gap-2">
                 <Button variant="outline" className="rounded-full px-4" asChild={false}>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.website} 
                            placeholder="Website URL"
                            onSave={(val) => handleUpdate('personalInfo.website', val)} 
                            className="bg-transparent border-none p-0 h-auto w-auto min-w-[100px]"
                        />
                    </div>
                 </Button>
               </div>
            </div>
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section
             initial="hidden"
             whileInView="show"
             viewport={{ once: true }}
             variants={container}
        >
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-blue-600" />
                    Skills
                </h2>
                 {onUpdate && (
                     <Button variant="ghost" size="sm" onClick={() => {
                            const newSkills = [...data.skills, "New Skill"];
                            handleUpdate('skills', newSkills);
                     }}>
                         <Plus className="w-4 h-4" />
                     </Button>
                )}
             </div>
             
             <div className="flex flex-wrap gap-3">
                {data.skills.map((skill, index) => (
                    <motion.div key={index} variants={item} className="relative group/skill">
                        <Badge variant="secondary" className="text-base px-4 py-2 hover:bg-white hover:shadow-md transition-all">
                             <InlineEdit readOnly={!onUpdate} 
                                value={skill}
                                onSave={(val) => {
                                    const newSkills = [...data.skills];
                                    newSkills[index] = val;
                                    handleUpdate('skills', newSkills);
                                }}
                                className="bg-transparent"
                             />
                        </Badge>
                         {onUpdate && (
                            <button 
                                onClick={() => {
                                    const newSkills = [...data.skills];
                                    newSkills.splice(index, 1);
                                    handleUpdate('skills', newSkills);
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-[2px] opacity-0 group-hover/skill:opacity-100 transition-opacity text-white"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </motion.div>
                ))}
             </div>
        </motion.section>

        {/* Experience */}
        <motion.section 
            id="experience"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
        >
             <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    Work Experience
                </h2>
                {onUpdate && (
                    <Button variant="outline" size="sm" onClick={() => {
                        const newExp = [{
                            company: "Company Name",
                            position: "Position",
                            startDate: "2024",
                            description: "Job description goes here..."
                        }, ...data.experience];
                        handleUpdate('experience', newExp);
                    }}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                )}
             </div>

          <div className="space-y-8 border-l-2 border-slate-200 ml-3 pl-8 relative">
            {data.experience.map((exp, i) => (
              <motion.div key={i} variants={item} className="relative group/item">
                 {onUpdate && (
                     <button 
                        className="absolute -left-14 top-0 opacity-0 group-hover/item:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded"
                        onClick={() => {
                            const newExp = [...data.experience];
                            newExp.splice(i, 1);
                            handleUpdate('experience', newExp);
                        }}
                     >
                         <Trash2 className="w-4 h-4" />
                     </button>
                )}
                <span className="absolute -left-[41px] top-2 w-5 h-5 rounded-full border-4 border-white bg-blue-600 shadow-sm" />
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                         <h3 className="text-xl font-bold text-slate-900">
                             <InlineEdit readOnly={!onUpdate} 
                                value={exp.position} 
                                placeholder="Position"
                                onSave={(val) => {
                                    const newExp = [...data.experience];
                                    newExp[i].position = val;
                                    handleUpdate('experience', newExp);
                                }}
                            />
                         </h3>
                         <div className="text-lg text-blue-600 font-medium">
                            <InlineEdit readOnly={!onUpdate} 
                                value={exp.company} 
                                placeholder="Company"
                                onSave={(val) => {
                                    const newExp = [...data.experience];
                                    newExp[i].company = val;
                                    handleUpdate('experience', newExp);
                                }}
                            />
                         </div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full w-fit flex gap-1">
                             <InlineEdit readOnly={!onUpdate} 
                                value={exp.startDate} 
                                placeholder="Start"
                                onSave={(val) => {
                                    const newExp = [...data.experience];
                                    newExp[i].startDate = val;
                                    handleUpdate('experience', newExp);
                                }}
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
                            />
                        </span>
                    </div>
                
                    <p className="text-slate-600 leading-relaxed">
                        <InlineEdit readOnly={!onUpdate} 
                            value={exp.description} 
                            multiline
                            placeholder="Description..."
                            onSave={(val) => {
                                const newExp = [...data.experience];
                                newExp[i].description = val;
                                handleUpdate('experience', newExp);
                            }}
                        />
                    </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <motion.section 
            id="projects"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
          >
             <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Layout className="w-6 h-6 text-blue-600" />
                    Projects
                </h2>
                 {onUpdate && (
                     <Button variant="outline" size="sm" onClick={() => {
                            const newProj = [{
                                name: "Project Name",
                                description: "Description",
                                technologies: []
                            }, ...data.projects];
                            handleUpdate('projects', newProj);
                     }}>
                         <Plus className="w-4 h-4" />
                     </Button>
                )}
             </div>

            <div className="grid md:grid-cols-2 gap-6">
              {data.projects.map((project, i) => (
                <motion.div key={i} variants={item} className="h-full relative group/item">
                   {onUpdate && (
                     <button 
                        className="absolute -right-2 -top-2 z-10 opacity-0 group-hover/item:opacity-100 p-2 bg-white shadow-md text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => {
                            const newProjs = [...data.projects];
                            newProjs.splice(i, 1);
                            handleUpdate('projects', newProjs);
                        }}
                     >
                         <Trash2 className="w-4 h-4" />
                     </button>
                    )}
                  <Card className="h-full p-6 hover:shadow-lg transition-all border-slate-200 bg-white">
                     <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            <InlineEdit readOnly={!onUpdate} 
                                value={project.name} 
                                placeholder="Project Name"
                                onSave={(val) => {
                                    const newProjs = [...data.projects];
                                    newProjs[i].name = val;
                                    handleUpdate('projects', newProjs);
                                }}
                            />
                        </h3>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                             <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        <div className="text-xs text-blue-500">
                            <InlineEdit readOnly={!onUpdate} 
                                value={project.url} 
                                placeholder="URL (optional)"
                                onSave={(val) => {
                                    const newProjs = [...data.projects];
                                    newProjs[i].url = val;
                                    handleUpdate('projects', newProjs);
                                }}
                            />
                        </div>
                     </div>
                     <p className="text-slate-600 mb-6 leading-relaxed">
                         <InlineEdit readOnly={!onUpdate} 
                            value={project.description} 
                            multiline
                            placeholder="Description..."
                            onSave={(val) => {
                                const newProjs = [...data.projects];
                                newProjs[i].description = val;
                                handleUpdate('projects', newProjs);
                            }}
                        />
                     </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Education */}
        <motion.section 
            id="education"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
        >
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                    Education
                </h2>
                 {onUpdate && (
                    <Button variant="outline" size="sm" onClick={() => {
                        const newEdu = [{
                            institution: "University",
                            degree: "Degree",
                            startDate: "2020",
                            endDate: "2024"
                        }, ...(data.education || [])];
                        handleUpdate('education', newEdu);
                    }}>
                            <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                {data.education.map((edu, i) => (
                    <motion.div key={i} variants={item} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-slate-100 rounded-xl relative group/item">
                          {onUpdate && (
                             <button 
                                className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded"
                                onClick={() => {
                                    const newEdu = [...data.education];
                                    newEdu.splice(i, 1);
                                    handleUpdate('education', newEdu);
                                }}
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                            )}
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">
                                 <InlineEdit readOnly={!onUpdate} 
                                    value={edu.institution} 
                                    placeholder="Institution"
                                    onSave={(val) => {
                                        const newEdu = [...data.education];
                                        newEdu[i].institution = val;
                                        handleUpdate('education', newEdu);
                                    }}
                                />
                            </h3>
                            <div className="text-slate-600 flex gap-1">
                                <InlineEdit readOnly={!onUpdate} 
                                    value={edu.degree} 
                                    placeholder="Degree"
                                    onSave={(val) => {
                                        const newEdu = [...data.education];
                                        newEdu[i].degree = val;
                                        handleUpdate('education', newEdu);
                                    }}
                                />
                                <span>in</span>
                                <InlineEdit readOnly={!onUpdate} 
                                    value={edu.fieldOfStudy} 
                                    placeholder="Field"
                                    onSave={(val) => {
                                        const newEdu = [...data.education];
                                        newEdu[i].fieldOfStudy = val;
                                        handleUpdate('education', newEdu);
                                    }}
                                />
                             </div>
                        </div>
                        <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full mt-2 md:mt-0 w-fit flex gap-1">
                             <InlineEdit readOnly={!onUpdate} 
                                value={edu.startDate} 
                                placeholder="Start"
                                onSave={(val) => {
                                    const newEdu = [...data.education];
                                    newEdu[i].startDate = val;
                                    handleUpdate('education', newEdu);
                                }}
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
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>

      </main>
    </div>
  );
};
