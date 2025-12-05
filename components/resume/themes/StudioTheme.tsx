import { ResumeData } from "@/lib/schemas/resume";
import { motion } from "framer-motion";
import { 
  ArrowUpRight,
  Mail, 
  Linkedin, 
  Globe,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioThemeProps {
  data: ResumeData;
}

export const StudioTheme = ({ data }: StudioThemeProps) => {
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
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 mix-blend-difference px-6 py-6 flex justify-between items-center bg-black/0 backdrop-blur-sm">
        <div className="text-xl font-bold tracking-tighter uppercase">
          {(data.personalInfo.fullName ?? '').split(' ')[0]}
        </div>
        <div className="flex gap-6 text-sm font-medium uppercase tracking-widest">
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
              <span className="text-[10cqw] font-black leading-none uppercase tracking-tighter">
                {data.personalInfo.jobTitle || "Creative Developer"}
              </span>
              <span className="text-[10cqw] font-black leading-none text-transparent stroke-text">
                —
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <main className="px-6">
        {/* Intro */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-24 max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
            {data.personalInfo.summary}
          </h1>
          <div className="flex flex-wrap gap-4">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-4 py-2 border border-neutral-800 rounded-full text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Selected Work */}
        {data.projects && data.projects.length > 0 && (
          <section id="work" className="py-24 border-t border-neutral-800">
            <div className="flex justify-between items-end mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Selected Work</h2>
              <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
                {data.projects.length} Projects
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
              {data.projects.map((project, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-neutral-900 mb-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-neutral-800 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <ArrowUpRight className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-4">
                        {project.name}
                      </h3>
                      <p className="text-neutral-400 max-w-sm">
                        {project.description}
                      </p>
                    </div>
                    {project.technologies && (
                      <div className="text-xs text-neutral-500 uppercase tracking-widest text-right">
                        {project.technologies.slice(0, 3).join(" / ")}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        <section id="about" className="py-24 border-t border-neutral-800">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 sticky top-32">Experience</h2>
            </div>
            <div className="md:col-span-8 space-y-16">
              {data.experience.map((exp, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-2xl font-bold">{exp.position}</h3>
                    <span className="text-sm font-medium text-neutral-500">
                      {exp.startDate} — {exp.endDate || "Present"}
                    </span>
                  </div>
                  <div className="text-lg text-neutral-400 mb-4">{exp.company}</div>
                  <p className="text-neutral-300 leading-relaxed max-w-2xl">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {data.testimonials && data.testimonials.length > 0 && (
          <section className="py-24 border-t border-neutral-800">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-16">Testimonials</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {data.testimonials.map((testimonial, i) => (
                <div key={i} className="bg-neutral-900 p-8 relative">
                  <Quote className="w-8 h-8 text-neutral-700 absolute top-8 left-8" />
                  <p className="text-xl leading-relaxed mb-8 pt-8 relative z-10">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-800 rounded-full" />
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-neutral-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer id="contact" className="py-24 border-t border-neutral-800">
          <div className="text-center">
            <h2 className="text-[8cqw] font-black leading-none uppercase tracking-tighter mb-12 hover:text-neutral-400 transition-colors cursor-pointer">
              Let's Talk
            </h2>
            <div className="flex justify-center gap-8">
              {data.personalInfo.email && (
                <a href={`mailto:${data.personalInfo.email}`} className="flex items-center gap-2 text-lg hover:underline decoration-2 underline-offset-4">
                  <Mail className="w-5 h-5" /> Email
                </a>
              )}
              {data.personalInfo.linkedin && (
                <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg hover:underline decoration-2 underline-offset-4">
                  <Linkedin className="w-5 h-5" /> LinkedIn
                </a>
              )}
              {data.personalInfo.website && (
                <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg hover:underline decoration-2 underline-offset-4">
                  <Globe className="w-5 h-5" /> Website
                </a>
              )}
            </div>
            <p className="mt-24 text-neutral-600 text-sm uppercase tracking-widest">
              © {new Date().getFullYear()} {data.personalInfo.fullName}
            </p>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
