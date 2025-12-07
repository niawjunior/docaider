import { ResumeData } from "@/lib/schemas/resume";
import { motion } from "framer-motion";
import { 
  Mail, 
  Globe, 
  Linkedin, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineEdit } from "@/components/ui/inline-edit";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ExperienceSection } from "@/components/resume/sections/ExperienceSection";
import { EducationSection } from "@/components/resume/sections/EducationSection";
import { ProjectsSection } from "@/components/resume/sections/ProjectsSection";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { SummarySection } from "@/components/resume/sections/SummarySection";
import { CustomSectionRenderer } from "@/components/resume/shared/CustomSectionRenderer";

interface PortfolioThemeProps {
  data: ResumeData;
  onUpdate?: (data: ResumeData) => void;
  readOnly?: boolean;
}

export const PortfolioTheme = ({ data, onUpdate, readOnly }: PortfolioThemeProps) => {
  const { updateField: handleUpdate } = useResumeUpdate(data, onUpdate);

  // Determine order (fallback if empty)
  const order = (data.sectionOrder && data.sectionOrder.length > 0) 
      ? data.sectionOrder 
      : ["experience", "projects", "education", "skills"];

  const renderSection = (id: string) => {
    switch (id) {
        case 'summary': return <SummarySection key={id} data={data} theme="portfolio" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'experience': return <ExperienceSection key={id} data={data} theme="portfolio" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'education': return <EducationSection key={id} data={data} theme="portfolio" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'projects': return <ProjectsSection key={id} data={data} theme="portfolio" onUpdate={onUpdate} readOnly={readOnly} />;
        case 'skills': return <SkillsSection key={id} data={data} theme="portfolio" onUpdate={onUpdate} readOnly={readOnly} />;
        default:
            const custom = data.customSections?.find(c => c.id === id);
            if (custom) {
                return (
                    <CustomSectionRenderer 
                        key={id} 
                        section={custom} 
                        index={data.customSections?.indexOf(custom) || 0}
                        data={data} 
                        onUpdate={onUpdate} 
                        theme="portfolio"
                        readOnly={readOnly}
                    />
                );
            }
            return null;
    }
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
             <InlineEdit readOnly={readOnly || !onUpdate} 
                value={(data.personalInfo.fullName ?? '').split(' ')[0]}
                onSave={(val) => {
                     // Read-only for nav logo derived from main name
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
                 <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={data.personalInfo.fullName} 
                    onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                    path="personalInfo.fullName"
                    placeholder="Your Name"
                    className="min-w-[200px]"
                 />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
               <InlineEdit readOnly={readOnly || !onUpdate} 
                    value={data.personalInfo.summary} 
                    onSave={(val) => handleUpdate('personalInfo.summary', val)} 
                    placeholder="Brief bio or summary..."
                    multiline
                    path="personalInfo.headerSummary"
                    alignment={(data.personalInfo as any).headerSummaryAlignment}
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
                            <InlineEdit readOnly={readOnly || !onUpdate}
                                value={data.personalInfo.email}
                                placeholder="Email"
                                onSave={(val) => handleUpdate('personalInfo.email', val)}
                                path="personalInfo.email"
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
                        <a href={(data.personalInfo.linkedin as string)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                             <Linkedin className="w-4 h-4" />
                             <span>{(data.personalInfo.linkedin as string)?.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '') || "LinkedIn"}</span>
                        </a>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4" />
                            <InlineEdit readOnly={readOnly || !onUpdate} 
                                value={data.personalInfo.linkedin} 
                                placeholder="LinkedIn URL"
                                onSave={(val) => handleUpdate('personalInfo.linkedin', val)} 
                                path="personalInfo.linkedin"
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
                        <a href={(data.personalInfo.website as string)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                             <Globe className="w-4 h-4" />
                             <span>{(data.personalInfo.website as string)?.replace(/^https?:\/\/(www\.)?/, '') || "Website"}</span>
                        </a>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <InlineEdit readOnly={readOnly || !onUpdate} 
                                value={data.personalInfo.website} 
                                placeholder="Website URL"
                                onSave={(val) => handleUpdate('personalInfo.website', val)} 
                                path="personalInfo.website"
                                className="bg-transparent border-none p-0 h-auto w-auto min-w-[100px]"
                            />
                        </div>
                    )}
                 </Button>
               </div>
            </div>
          </div>
        </motion.section>

        {/* Dynamic Sections */}
        {order.map(id => (
            <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                {renderSection(id)}
            </motion.div>
        ))}

        {onUpdate && !readOnly && (
           <div className="mt-8 border-t border-slate-200 pt-8 flex justify-center print:hidden">
               <Button variant="outline" className="text-slate-900 border-slate-200 hover:bg-slate-100" onClick={() => {
                   const newSection = {
                       id: crypto.randomUUID(),
                       title: "New Section",
                       type: "list" as const,
                       items: []
                   };
                   const newSections = [...(data.customSections || []), newSection];
                   handleUpdate('customSections', newSections);
               }}>
                   <Plus className="w-4 h-4 mr-2" />
                   Add Custom Section
               </Button>
           </div>
       )}

      </main>
    </div>
  );
};
