
import { ResumeData } from "@/lib/schemas/resume";

export const THEME_DEMOS = [
    {
      id: "studio",
      name: "Studio",
      role: "Graphic Designer",
      description: "Bold, agency-style layout for creatives.",
      data: {
        personalInfo: { fullName: "Alex Morgan", summary: "Visual identity specialist.", email: "alex@design.com", jobTitle: "Graphic Designer" },
        experience: [{ company: "Design Co", position: "Senior Designer", startDate: "2020", endDate: "Present", description: "Led rebranding projects." }],
        education: [],
        skills: ["Typography", "Branding", "Adobe Suite"],
        projects: [],
        testimonials: []
      }
    },
    {
      id: "visual",
      name: "Visual",
      role: "Software Engineer",
      description: "Visual-first dark mode for modern tech.",
      data: {
        personalInfo: { fullName: "Sarah Chen", summary: "Full-stack developer building scalable apps.", email: "sarah@tech.com", jobTitle: "Senior Engineer" },
        experience: [{ company: "Tech Giants", position: "Lead Dev", startDate: "2019", endDate: "Present", description: "Architecture and systems design." }],
        education: [],
        skills: ["React", "Node.js", "AWS", "System Design"],
        projects: [],
        testimonials: []
      }
    },
    {
      id: "portfolio",
      name: "Portfolio",
      role: "Product Manager",
      description: "Clean, scrollable digital layout.",
      data: {
        personalInfo: { fullName: "Marcus J.", summary: "Product strategist with 7y experience.", email: "marcus@pm.com", jobTitle: "Product Lead" },
        experience: [{ company: "Startup Inc", position: "Head of Product", startDate: "2021", endDate: "Present", description: "Managed 3 successful launches." }],
        education: [],
        skills: ["Strategy", "Analytics", "Roadmapping"],
        projects: [],
        testimonials: []
      }
    },
    {
      id: "modern",
      name: "Modern",
      role: "Marketing Director",
      description: "Professional and clean for corporate roles.",
      data: {
        personalInfo: { fullName: "Emily White", summary: "Digital marketing expert driving growth.", email: "emily@growth.com", jobTitle: "Marketing Director" },
        experience: [{ company: "Global Corp", position: "Marketing VP", startDate: "2018", endDate: "Present", description: "Oversaw $5M ad spend." }],
        education: [],
        skills: ["SEO/SEM", "Content Strategy", "Team Leadership"],
        projects: [],
        testimonials: []
      }
    },
    {
      id: "creative",
      name: "Creative",
      role: "UX Researcher",
      description: "Unique split-layout for storytellers.",
      data: {
        personalInfo: { fullName: "David Kim", summary: "Understanding user behavior through data.", email: "david@ux.com", jobTitle: "UX Researcher" },
        experience: [{ company: "Agency X", position: "Senior Researcher", startDate: "2021", endDate: "Present", description: "Conducted 50+ user studies." }],
        education: [],
        skills: ["User Testing", "Figma", "Data Analysis"],
        projects: [],
        testimonials: []
      }
    },
    {
      id: "minimal",
      name: "Minimal",
      role: "Content Writer",
      description: "Distraction-free focus on typography.",
      data: {
        personalInfo: { fullName: "Lisa Ray", summary: "Crafting compelling narratives for brands.", email: "lisa@writer.com", jobTitle: "Senior Copywriter" },
        experience: [{ company: "Media House", position: "Editor", startDate: "2019", endDate: "Present", description: "Editorial direction for tech blog." }],
        education: [],
        skills: ["Copywriting", "Editing", "SEO"],
        projects: [],
        testimonials: []
      }
    }
] as const;

export function getThemeById(id: string) {
    return THEME_DEMOS.find(t => t.id === id);
}
