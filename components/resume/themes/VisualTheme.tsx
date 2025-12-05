import { ResumeData } from "@/lib/schemas/resume";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Mail, MapPin, Globe, Linkedin } from "lucide-react";

interface VisualThemeProps {
  data: ResumeData;
}

export const VisualTheme = ({ data }: VisualThemeProps) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference">
        <span className="text-xl font-bold tracking-tighter uppercase">{data.personalInfo.fullName}</span>
        <div className="flex gap-6 text-sm font-medium uppercase tracking-widest">
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
          <motion.h1 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.85] font-black uppercase tracking-tighter mb-8 break-words"
          >
            {/* Split name for visual impact if possible, otherwise just display */}
            {(data.personalInfo.fullName || "").split(" ").map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/20 pt-8"
          >
            <p className="text-xl md:text-2xl font-light uppercase tracking-wide max-w-md mb-8 md:mb-0">
              {data.personalInfo.jobTitle || "Creative Developer & Designer"}
            </p>
            <p className="text-neutral-400 max-w-md text-sm md:text-base">
              {data.personalInfo.summary}
            </p>
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
              <span className="hidden md:block text-xl font-light opacity-50">
                ( {String(data.projects.length).padStart(2, '0')} )
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
              {data.projects.map((project, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6, delay: i % 2 * 0.2 }}
                  className={`group ${i % 2 === 1 ? "md:mt-32" : ""}`}
                >
                  <a href={project.url || "#"} target={project.url ? "_blank" : undefined} className="block cursor-pointer">
                    <div className="aspect-[3/4] mb-8 overflow-hidden bg-neutral-900 relative">
                       {/* Placeholder pattern since we don't have project images yet */}
                      <div className="w-full h-full bg-neutral-800 group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center">
                         <span className="text-neutral-700 text-9xl font-black opacity-20 group-hover:opacity-40 transition-opacity">
                           {String(i + 1).padStart(2, '0')}
                         </span>
                      </div>
                      <div className="absolute top-4 right-4 bg-white text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="border-t border-white/20 pt-6">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-3xl font-bold uppercase tracking-tight group-hover:text-neutral-400 transition-colors">
                          {project.name}
                        </h3>
                        {project.technologies?.[0] && (
                           <span className="text-sm font-light text-neutral-500 uppercase tracking-widest">
                             {project.technologies[0]}
                           </span>
                        )}
                      </div>
                      <p className="text-neutral-400 line-clamp-2">{project.description}</p>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Education */}
        <div className="grid md:grid-cols-2 gap-24 mb-48">
          {/* Skills */}
          <section>
             <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-12">
              Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 border border-white/20 rounded-full text-sm font-medium uppercase tracking-widest hover:bg-white hover:text-black transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
             <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-12">
              Education
            </h2>
            <div className="space-y-8">
              {data.education.map((edu, i) => (
                <div key={i} className="border-l-2 border-white/10 pl-6 hover:border-white transition-colors">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{edu.institution}</h3>
                  <p className="text-neutral-400 mt-1">{edu.degree}</p>
                  <p className="text-sm text-neutral-500 font-medium uppercase tracking-widest mt-2">
                    {edu.startDate} — {edu.endDate || "Present"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Experience Section */}
        <section className="mb-48" id="about">
           <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-24">
              Experience
            </h2>
            <div className="space-y-0">
              {data.experience.map((exp, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group border-t border-white/20 py-12 hover:bg-white/5 transition-colors"
                >
                  <div className="grid md:grid-cols-12 gap-8 items-baseline">
                    <div className="md:col-span-3">
                      <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
                        {exp.startDate} — {exp.endDate || "Present"}
                      </span>
                    </div>
                    <div className="md:col-span-4">
                      <h3 className="text-3xl font-bold uppercase tracking-tight">{exp.company}</h3>
                      <p className="text-xl font-light text-neutral-400 mt-1">{exp.position}</p>
                    </div>
                    <div className="md:col-span-5">
                       <p className="text-neutral-400 leading-relaxed">{exp.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        </section>

        {/* Testimonials */}
        {data.testimonials && data.testimonials.length > 0 && (
          <section className="mb-48">
             <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-24">
                Testimonials
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                {data.testimonials.map((testimonial, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/5 p-8 border border-white/10 relative"
                  >
                    <p className="text-xl leading-relaxed mb-8 relative z-10 font-light">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-full" />
                      <div>
                        <div className="font-bold uppercase tracking-tight">{testimonial.name}</div>
                        <div className="text-sm text-neutral-500 font-medium uppercase tracking-widest">{testimonial.role}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-white/20 pt-24 pb-12" id="contact">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-6xl md:text-7xl font-bold uppercase tracking-tighter leading-none mb-12">
                Let's<br/>Talk
              </h2>
              <div className="flex flex-col gap-4 items-start">
                 <a 
                   href={`mailto:${data.personalInfo.email}`} 
                   className="text-2xl hover:text-neutral-400 transition-colors flex items-center gap-3"
                 >
                   <Mail className="w-6 h-6" />
                   {data.personalInfo.email}
                 </a>
                 {data.personalInfo.linkedin && (
                   <a 
                     href={data.personalInfo.linkedin}
                     target="_blank"
                     className="text-2xl hover:text-neutral-400 transition-colors flex items-center gap-3"
                   >
                     <Linkedin className="w-6 h-6" />
                     LinkedIn
                   </a>
                 )}
              </div>
            </div>
             <div className="flex flex-col justify-end items-start md:items-end text-neutral-500 font-medium uppercase tracking-widest text-sm">
                <p>Based in {data.personalInfo.location || "Earth"}</p>
                <p className="mt-2">© {new Date().getFullYear()} {data.personalInfo.fullName}</p>
             </div>
          </div>
        </footer>

      </main>
    </div>
  );
};
