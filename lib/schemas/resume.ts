import { z } from "zod";

export const ResumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().optional().describe("The full name of the person"),
    jobTitle: z.string().optional().describe("Current job title or professional headline"),
    email: z.string().optional().describe("Email address"),
    phone: z.string().optional().describe("Phone number"),
    website: z.string().optional().describe("Personal website or portfolio URL"),
    linkedin: z.string().optional().describe("LinkedIn profile URL"),
    location: z.string().optional().describe("City, Country"),
    summary: z.string().optional().describe("A brief professional summary or bio"),
  }).optional().default({}),
  coverImage: z.string().optional(),
  experience: z.array(
    z.object({
      id: z.string().optional().describe("Unique identifier for the experience entry"),
      company: z.string().optional().describe("Name of the company or organization"),
      position: z.string().optional().describe("Job title or role held"),
      startDate: z.string().optional().describe("Start date (YYYY-MM or Present)"),
      endDate: z.string().optional().describe("End date (YYYY-MM or Present)"),
      description: z.string().optional().describe("Bullet points or detailed description of responsibilities and achievements"),
    })
  ).optional().default([]).describe("Work experience history"),
  education: z.array(
    z.object({
      id: z.string().optional().describe("Unique identifier for the education entry"),
      institution: z.string().optional().describe("Name of the university, college, or school"),
      degree: z.string().optional().describe("Degree or certificate obtained (e.g. Bachelor of Science)"),
      fieldOfStudy: z.string().optional().describe("Major or field of study"),
      startDate: z.string().optional().describe("Start date (YYYY-MM)"),
      endDate: z.string().optional().describe("End date or Graduation date (YYYY-MM)"),
    })
  ).optional().default([]).describe("Educational background"),
  skills: z.array(z.string()).optional().default([]).describe("List of professional skills"),
  projects: z.array(
    z.object({
      id: z.string().optional().describe("Unique identifier for the project"),
      name: z.string().optional().describe("Name of the project"),
      description: z.string().optional().describe("Brief description of the project and your role"),
      url: z.string().optional().describe("URL to the project (e.g. GitHub link or live demo)"),
      technologies: z.array(z.string()).optional().describe("List of technologies used in the project"),
    })
  ).optional().default([]).describe("Notable projects"),
  testimonials: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      role: z.string().optional(),
      content: z.string().optional(),
    })
  ).optional().default([]).describe("Client testimonials"),
  customSections: z.array(
    z.object({
      id: z.string().optional().default(() => `cs-${Math.random().toString(36).slice(2, 9)}`).describe("Unique identifier for the custom section"),
      title: z.string().optional().default("Untitled Section").describe("Title of the custom section (e.g. 'Volunteering', 'Awards')"),
      type: z.enum(["list", "text"]).optional().default("text").describe("Type of content: 'list' for items with titles/subtitles, 'text' for paragraphs"),
      items: z.array(
        z.object({
          id: z.string().optional().default(() => `item-${Math.random().toString(36).slice(2, 9)}`).describe("Unique identifier for the item"),
          title: z.string().optional().default("").describe("Main title of the item (e.g. Award Name)"),
          subtitle: z.string().optional().default("").describe("Subtitle of the item (e.g. Date, Organization)"),
          content: z.string().optional().default("").describe("Description or content of the item"),
        })
      ).optional().default([]).describe("List of items in this section")
    })
  ).optional().default([]).describe("Custom user-defined sections"),
  sectionOrder: z.array(z.string()).default([
    "summary",
    "experience", 
    "education", 
    "projects", 
    "skills"
  ]).describe("Order of sections to render"),
});

export type ResumeData = z.infer<typeof ResumeSchema>;
