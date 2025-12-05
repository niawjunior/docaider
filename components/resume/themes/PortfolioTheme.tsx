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

interface PortfolioThemeProps {
  data: ResumeData;
}

export const PortfolioTheme = ({ data }: PortfolioThemeProps) => {
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
          <div className="font-bold text-xl tracking-tight">
            {(data.personalInfo.fullName ?? '').split(' ')[0]}
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
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{data.personalInfo.fullName}</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
              {data.personalInfo.summary}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {data.personalInfo.email && (
                <Button variant="outline" className="rounded-full" asChild>
                  <a href={`mailto:${data.personalInfo.email}`}>
                    <Mail className="w-4 h-4 mr-2" /> Email Me
                  </a>
                </Button>
              )}
              {data.personalInfo.linkedin && (
                <Button variant="outline" className="rounded-full" asChild>
                  <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                  </a>
                </Button>
              )}
              {data.personalInfo.website && (
                <Button variant="outline" className="rounded-full" asChild>
                  <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" /> Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-600" />
            Skills & Technologies
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, i) => (
              <motion.div key={i} variants={item}>
                <Badge variant="secondary" className="px-4 py-2 text-sm bg-white border-slate-200 shadow-sm hover:bg-blue-50 transition-colors">
                  {skill}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Experience */}
        <motion.section 
          id="experience"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Work Experience
          </h2>
          <div className="space-y-8 border-l-2 border-slate-200 ml-3 pl-8 relative">
            {data.experience.map((exp, i) => (
              <motion.div key={i} variants={item} className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-blue-600 shadow-sm" />
                <div className="mb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-xl font-bold text-slate-900">{exp.position}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit mt-2 sm:mt-0">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </span>
                </div>
                <div className="text-lg font-medium text-blue-600 mb-4">{exp.company}</div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <motion.section 
            id="projects"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Layout className="w-6 h-6 text-blue-600" />
              Featured Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {data.projects.map((project, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="h-full p-6 hover:shadow-lg transition-shadow border-slate-200 bg-white group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h3>
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <p className="text-slate-600 mb-6 line-clamp-3">
                      {project.description}
                    </p>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.technologies.map((tech, j) => (
                          <span key={j} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Education */}
        <motion.section 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Education
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {data.education.map((edu, i) => (
              <motion.div key={i} variants={item}>
                <Card className="p-6 border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-lg mb-1">{edu.institution}</h3>
                  <div className="text-blue-600 font-medium mb-2">{edu.degree}</div>
                  {edu.fieldOfStudy && (
                    <div className="text-slate-600 text-sm mb-4">{edu.fieldOfStudy}</div>
                  )}
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {edu.startDate} - {edu.endDate || "Present"}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials */}
        {data.testimonials && data.testimonials.length > 0 && (
          <motion.section 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Testimonials
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {data.testimonials.map((testimonial, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="p-8 border-slate-200 bg-white h-full relative">
                    <div className="absolute top-6 left-6 text-blue-100 transform -scale-x-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="opacity-50"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9 14.8954 9.89543 14 11 14C11.5523 14 12 13.5523 12 13V7C12 6.44772 11.5523 6 11 6H5C4.44772 6 4 6.44772 4 7V13C4 14.1046 4.89543 15 6 15V19C6 20.1046 6.89543 21 8 21H14.017ZM21.017 21L21.017 18C21.017 16.8954 20.1216 16 19.017 16H16C16 14.8954 16.8954 14 18 14C18.5523 14 19 13.5523 19 13V7C19 6.44772 18.5523 6 18 6H12C11.4477 6 11 6.44772 11 7V13C11 14.1046 11.8954 15 13 15V19C13 20.1046 13.8954 21 15 21H21.017Z"/></svg>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-6 relative z-10 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {(testimonial.name ?? '').charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                        <div className="text-sm text-slate-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Contact Footer */}
        <motion.footer 
          id="contact"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-slate-200 pt-12 pb-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-6">Let's Connect</h2>
          <div className="flex justify-center gap-6 mb-8">
            {data.personalInfo.email && (
              <a href={`mailto:${data.personalInfo.email}`} className="text-slate-500 hover:text-blue-600 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            )}
            {data.personalInfo.linkedin && (
              <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {data.personalInfo.website && (
              <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
                <Globe className="w-6 h-6" />
              </a>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} {data.personalInfo.fullName}. All rights reserved.
          </p>
        </motion.footer>
      </main>
    </div>
  );
};
