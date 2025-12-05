"use client";

import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code2,
  Layout
} from "lucide-react";
import { PortfolioTheme } from "./themes/PortfolioTheme";
import { StudioTheme } from "./themes/StudioTheme";
import { VisualTheme } from "./themes/VisualTheme";

interface ResumePreviewProps {
  data: ResumeData;
  theme?: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
  className?: string;
}

export function ResumePreview({
  data,
  theme = "modern",
  className,
}: ResumePreviewProps) {
  if (theme === "portfolio") {
    return <PortfolioTheme data={data} />;
  }

  if (theme === "studio") {
    return <StudioTheme data={data} />;
  }

  if (theme === "visual") {
    return <VisualTheme data={data} />;
  }

  const containerClasses = cn(
    "w-full max-w-full min-h-[1100px] bg-white text-slate-900 shadow-xl mx-auto print:shadow-none",
    theme === "modern" && "p-8",
    theme === "minimal" && "p-12 font-serif",
    theme === "creative" && "p-0 flex",
    className
  );

  if (theme === "creative") {
    return (
      <div className={containerClasses}>
        {/* Sidebar */}
        <div className="w-1/3 bg-slate-900 text-white p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight">
              {data.personalInfo.fullName ?? ''}
            </h1>
            <p className="text-slate-400 text-sm">
              {data.personalInfo.summary}
            </p>
          </div>

          <div className="space-y-4 text-sm">
            {data.personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data.personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{data.personalInfo.location}</span>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{data.personalInfo.website}</span>
              </div>
            )}
          </div>

          {data.skills && (
            <div className="space-y-2">
              <h3 className="uppercase tracking-widest text-xs font-bold text-slate-500">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-800 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8 space-y-8 bg-white">
          {data.experience && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-slate-900 block" /> Experience
              </h2>
              <div className="space-y-8 border-l-2 border-slate-100 pl-6 ml-1">
                {data.experience.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white" />
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <div className="text-slate-600 font-medium mb-1">
                      {exp.company}
                    </div>
                    <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.education && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-slate-900 block" /> Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-bold">{edu.institution}</h3>
                    <div className="text-slate-600">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </div>
                    <div className="text-sm text-slate-400">
                      {edu.startDate} - {edu.endDate || "Present"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.testimonials && data.testimonials.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-slate-900 block" /> Testimonials
              </h2>
              <div className="space-y-6">
                {data.testimonials.map((testimonial, i) => (
                  <div key={i} className="bg-slate-50 p-6 border-l-4 border-slate-900">
                    <p className="text-slate-700 italic mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-600">
                          {(testimonial.name ?? '').charAt(0)}
                       </div>
                       <div>
                          <div className="font-bold text-sm text-slate-900">{testimonial.name}</div>
                          {testimonial.role && <div className="text-xs text-slate-500 uppercase tracking-wider">{testimonial.role}</div>}
                       </div>
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
          theme === "modern" && "border-b-2 border-slate-900 pb-6",
          theme === "minimal" && "text-center pb-8 border-b border-slate-200"
        )}
      >
        <h1
          className={cn(
            "font-bold uppercase tracking-tight mb-2",
            theme === "modern" && "text-4xl",
            theme === "minimal" && "text-3xl tracking-widest font-normal"
          )}
        >
          {data.personalInfo.fullName ?? "Your Name"}
        </h1>
        <p
          className={cn(
            "text-lg text-slate-600 mb-4",
            theme === "minimal" && "italic"
          )}
        >
          {data.personalInfo.summary || "Professional Summary"}
        </p>

        <div
          className={cn(
            "flex flex-wrap gap-4 text-sm text-slate-600",
            theme === "minimal" && "justify-center"
          )}
        >
          {data.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{data.personalInfo.email}</span>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{data.personalInfo.phone}</span>
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{data.personalInfo.location}</span>
            </div>
          )}
          {data.personalInfo.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>{data.personalInfo.website}</span>
            </div>
          )}
        </div>
      </header>

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-8">
          <h2
            className={cn(
              "font-bold uppercase mb-4",
              theme === "modern" && "text-xl border-b border-slate-200 pb-2",
              theme === "minimal" && "text-sm tracking-widest text-center"
            )}
          >
            Experience
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div
                  className={cn(
                    "flex justify-between items-baseline mb-1",
                    theme === "minimal" && "flex-col items-center text-center"
                  )}
                >
                  <h3 className="font-bold text-lg">{exp.position}</h3>
                  <span className="text-sm text-slate-500 whitespace-nowrap">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-slate-700 font-medium mb-2",
                    theme === "minimal" && "text-center"
                  )}
                >
                  {exp.company}
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-8">
          <h2
            className={cn(
              "font-bold uppercase mb-4",
              theme === "modern" && "text-xl border-b border-slate-200 pb-2",
              theme === "minimal" && "text-sm tracking-widest text-center"
            )}
          >
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className={cn(theme === "minimal" && "text-center")}>
                <div
                  className={cn(
                    "flex justify-between items-baseline mb-1",
                    theme === "minimal" && "flex-col items-center"
                  )}
                >
                  <h3 className="font-bold">{edu.institution}</h3>
                  <span className="text-sm text-slate-500">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </span>
                </div>
                <div className="text-slate-700">
                  {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-8">
          <h2
            className={cn(
              "font-bold uppercase mb-4",
              theme === "modern" && "text-xl border-b border-slate-200 pb-2",
              theme === "minimal" && "text-sm tracking-widest text-center"
            )}
          >
            Skills
          </h2>
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
                  "text-sm font-medium",
                  theme === "modern" && "px-3 py-1 bg-slate-100 text-slate-700 rounded-full",
                  theme === "minimal" && "px-2 border-b border-slate-200"
                )}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects (New) */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-8">
          <h2
            className={cn(
              "font-bold uppercase mb-4",
              theme === "modern" && "text-xl border-b border-slate-200 pb-2",
              theme === "minimal" && "text-sm tracking-widest text-center"
            )}
          >
            Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((project, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold">{project.name}</h3>
                  {project.url && (
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className="mb-8">
          <h2
            className={cn(
              "font-bold uppercase mb-4",
              theme === "modern" && "text-xl border-b border-slate-200 pb-2",
              theme === "minimal" && "text-sm tracking-widest text-center"
            )}
          >
            Testimonials
          </h2>
          <div className="space-y-6">
            {data.testimonials.map((testimonial, i) => (
              <div key={i} className={cn(theme === "minimal" && "text-center")}>
                <blockquote className="text-slate-600 italic mb-2 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center gap-2 text-sm justify-start" style={{ justifyContent: theme === 'minimal' ? 'center' : 'flex-start' }}>
                  <span className="font-bold text-slate-900">{testimonial.name}</span>
                  {testimonial.role && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{testimonial.role}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
