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
  Layout
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineEdit } from "@/components/ui/inline-edit";
import { EmptySectionPlaceholder } from "@/components/resume/shared/EmptySectionPlaceholder";
import { ThemeAddButton, ThemeDeleteButton } from "./ThemeControls";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeSectionList } from "../shared/ResumeSectionList";
import { SkillsSection } from "../sections/SkillsSection"; // Skills can perhaps stay as section if it works well

interface PortfolioThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
}

export const PortfolioTheme = ({ data, onUpdate }: PortfolioThemeProps) => {
  const { updateField: handleUpdate } = useResumeUpdate(data, onUpdate);

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

      <main className="max-w-5xl mx-auto px-8 py-12 space-y-24">
        {/* About / Hero */}
        <motion.section 
          id="about"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
            
            <div className="flex flex-wrap gap-4 scroll-mt-24" id="contact">
               {/* Email */}
               <div className="flex items-center gap-2">
                 <Button variant="outline" className="rounded-full px-4 hover:bg-slate-100 hover:text-slate-900 border-slate-200" asChild={!onUpdate}>
                    {!onUpdate ? (
                        <a href={`mailto:${data.personalInfo.email}`} className="flex items-center gap-2">
                             <Mail className="w-4 h-4" />
                             <span>{data.personalInfo.email || "Email"}</span>
                        </a>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <InlineEdit readOnly={!onUpdate} 
                                value={data.personalInfo.email} 
                                placeholder="Email"
                                onSave={(val) => handleUpdate('personalInfo.email', val)} 
                                className="bg-transparent border-none p-0 h-auto w-auto min-w-[100px]"
                            />
                        </div>
                    )}
                 </Button>
               </div>
               
               {/* LinkedIn */}
               <div className="flex items-center gap-2">
                 <Button variant="outline" className="rounded-full px-4 hover:bg-slate-100 hover:text-slate-900 border-slate-200" asChild={!onUpdate}>
                    {!onUpdate ? (
                        <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                             <Linkedin className="w-4 h-4" />
                             <span>{data.personalInfo.linkedin?.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '') || "LinkedIn"}</span>
                        </a>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4" />
                            <InlineEdit readOnly={!onUpdate} 
                                value={data.personalInfo.linkedin} 
                                placeholder="LinkedIn URL"
                                onSave={(val) => handleUpdate('personalInfo.linkedin', val)} 
                                className="bg-transparent border-none p-0 h-auto w-auto min-w-[100px]"
                            />
                        </div>
                    )}
                 </Button>
               </div>

               {/* Website */}
                <div className="flex items-center gap-2">
                 <Button variant="outline" className="rounded-full px-4 hover:bg-slate-100 hover:text-slate-900 border-slate-200" asChild={!onUpdate}>
                    {!onUpdate ? (
                        <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                             <Globe className="w-4 h-4" />
                             <span>{data.personalInfo.website?.replace(/^https?:\/\/(www\.)?/, '') || "Website"}</span>
                        </a>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <InlineEdit readOnly={!onUpdate} 
                                value={data.personalInfo.website} 
                                placeholder="Website URL"
                                onSave={(val) => handleUpdate('personalInfo.website', val)} 
                                className="bg-transparent border-none p-0 h-auto w-auto min-w-[100px]"
                            />
                        </div>
                    )}
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
                    <ThemeAddButton 
                        onClick={() => {
                            const newSkills = [...data.skills, "New Skill"];
                            handleUpdate('skills', newSkills);
                        }} 
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                    />
                )}
             </div>
             
             <div className="flex flex-wrap gap-3">
                {data.skills.map((skill, index) => (
                    <div key={index} className="group/skill">
                        <Badge variant="default" className="text-base bg-gray-200 text-black px-3 py-2 transition-all flex items-center gap-2 pr-1">
                             <InlineEdit readOnly={!onUpdate} 
                                value={skill}
                                onSave={(val) => {
                                    const newSkills = [...data.skills];
                                    newSkills[index] = val;
                                    handleUpdate('skills', newSkills);
                                }}
                                className="bg-transparent"
                             />
                             {onUpdate && (
                                <ThemeDeleteButton
                                    onClick={() => {
                                        const newSkills = [...data.skills];
                                        newSkills.splice(index, 1);
                                        handleUpdate('skills', newSkills);
                                    }}
                                    className="w-4 h-4 text-slate-500 hover:text-red-500 bg-transparent p-0 border-none transition-opacity"
                                />
                            )}
                        </Badge>
                    </div>
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
                    <ThemeAddButton 
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
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                    />
                )}
             </div>

            <ResumeSectionList
              data={data.experience}
              onUpdate={(val) => handleUpdate('experience', val)}
              className="border-l-2 border-slate-200 ml-3 space-y-12"
              renderItem={(exp, i, updateItem, deleteItem) => (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="relative pl-8"
                >
                    {/* Timeline dot */}
                 {onUpdate && (
                     <ThemeDeleteButton 
                        className="absolute right-2 top-2 z-10"
                        onClick={deleteItem}
                     />
                )}
                <span className="absolute -left-[41px] top-2 w-5 h-5 rounded-full border-4 border-white bg-blue-600 shadow-sm" />
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                         <h3 className="text-xl font-bold text-slate-900">
                             <InlineEdit readOnly={!onUpdate} 
                                value={exp.position} 
                                placeholder="Position"
                                onSave={(val) => updateItem({ position: val })}
                            />
                        </h3>
                         <div className="text-lg text-blue-600 font-medium">
                            <InlineEdit readOnly={!onUpdate} 
                                value={exp.company} 
                                placeholder="Company"
                                onSave={(val) => updateItem({ company: val })}
                            />
                         </div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full w-fit flex gap-1">
                             <InlineEdit readOnly={!onUpdate} 
                                value={exp.startDate} 
                                placeholder="Start"
                                onSave={(val) => updateItem({ startDate: val })}
                            />
                            <span>-</span>
                             <InlineEdit readOnly={!onUpdate} 
                                value={exp.endDate} 
                                placeholder="Present"
                                onSave={(val) => updateItem({ endDate: val })}
                            />
                        </span>
                    </div>
                
                    <p className="text-slate-600 leading-relaxed">
                        <InlineEdit readOnly={!onUpdate} 
                            value={exp.description} 
                            multiline
                            placeholder="Description..."
                            onSave={(val) => updateItem({ description: val })}
                        />
                    </p>
                </div>
                </motion.div>
              )}
            />
        </motion.section>

        {/* Projects */}
        {(onUpdate || (data.projects && data.projects.length > 0)) && (
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
                     <ThemeAddButton 
                        onClick={() => {
                            const newProj = [{
                                id: crypto.randomUUID(),
                                name: "Project Name",
                                description: "Description",
                                technologies: []
                            }, ...(data.projects || [])];
                            handleUpdate('projects', newProj);
                        }} 
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                     />
                )}
             </div>

            {/* Projects Grid Container Adjustment - Add AnimatePresence if desired, but for now just fix item animation */}
            {/* Projects Grid Container Adjustment */}
            {(!data.projects || data.projects.length === 0) && onUpdate ? (
                 <EmptySectionPlaceholder 
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
                  onUpdate={(val) => handleUpdate('projects', val)}
                  className="grid md:grid-cols-2 gap-6"
                  strategy="rect"
                  renderItem={(project, i, updateItem, deleteItem) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-full relative group/item"
                    >
                       {onUpdate && (
                         <ThemeDeleteButton
                            className="absolute -right-2 -top-2 z-10"
                            onClick={deleteItem}
                         />
                        )}
                      <Card className="h-full p-6 hover:shadow-lg transition-all border-slate-200 bg-white">
                         <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                <InlineEdit readOnly={!onUpdate} 
                                    value={project.name} 
                                    placeholder="Project Name"
                                    onSave={(val) => updateItem({ name: val })}
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
                                    placeholder="Link"
                                    onSave={(val) => updateItem({ url: val })}
                                />
                            </div>
                         </div>
                         <p className="text-slate-600 leading-relaxed mb-4">
                             <InlineEdit readOnly={!onUpdate} 
                                value={project.description} 
                                placeholder="Project description..."
                                multiline
                                onSave={(val) => updateItem({ description: val })}
                            />
                         </p>
                         <div className="flex flex-wrap gap-2">
                             {(project.technologies || ["Tech 1", "Tech 2"]).map((tech, t) => (
                                 <Badge key={t} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                     {tech}
                                 </Badge>
                             ))}
                         </div>
                      </Card>
                    </motion.div>
                  )}
                />
            )}
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
                    <ThemeAddButton 
                        onClick={() => {
                            const newEdu = [{
                                id: crypto.randomUUID(),
                                institution: "University",
                                degree: "Degree",
                                startDate: "2020",
                                endDate: "2024"
                            }, ...(data.education || [])];
                            handleUpdate('education', newEdu);
                        }} 
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                    />
                )}
            </div>

            {(!data.education || data.education.length === 0) && onUpdate ? (
                <EmptySectionPlaceholder 
                    message="Add your first Education entry"
                    onClick={() => {
                        const newEdu = [{
                            id: crypto.randomUUID(),
                            institution: "University",
                            degree: "Degree",
                            startDate: "2020",
                            endDate: "2024"
                        }, ...(data.education || [])];
                        handleUpdate('education', newEdu);
                    }}
                />
            ) : (
                <ResumeSectionList
                    data={data.education}
                    onUpdate={(val) => handleUpdate('education', val)}
                    className="space-y-8"
                    renderItem={(edu, i, updateItem, deleteItem) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-lg border border-slate-100 hover:border-blue-100 transition-colors relative group/edu"
                        >
                             {onUpdate && (
                                 <ThemeDeleteButton
                                    className="absolute top-2 right-2 z-10"
                                    onClick={deleteItem}
                                 />
                                )}
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">
                                     <InlineEdit readOnly={!onUpdate} 
                                        value={edu.institution} 
                                        placeholder="Institution"
                                        onSave={(val) => updateItem({ institution: val })}
                                    />
                                </h3>
                                <div className="text-slate-600 flex gap-1">
                                    <InlineEdit readOnly={!onUpdate} 
                                        value={edu.degree} 
                                        placeholder="Degree"
                                        onSave={(val) => updateItem({ degree: val })}
                                    />
                                    <span>in</span>
                                    <InlineEdit readOnly={!onUpdate} 
                                        value={edu.fieldOfStudy} 
                                        placeholder="Field"
                                        onSave={(val) => updateItem({ fieldOfStudy: val })}
                                    />
                                 </div>
                            </div>
                            <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full mt-2 md:mt-0 w-fit flex gap-1">
                                 <InlineEdit readOnly={!onUpdate} 
                                    value={edu.startDate} 
                                    placeholder="Start"
                                    onSave={(val) => updateItem({ startDate: val })}
                                />
                                <span>-</span>
                                 <InlineEdit readOnly={!onUpdate} 
                                    value={edu.endDate} 
                                    placeholder="Present"
                                    onSave={(val) => updateItem({ endDate: val })}
                                />
                            </div>
                        </motion.div>
                    )}
                />
            )}
        </motion.section>

      </main>
    </div>
  );
};
