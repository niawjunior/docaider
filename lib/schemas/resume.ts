import { z } from "zod";

const RichTextFieldSchema = z.object({
  content: z.string().nullish().describe("Text content"),
  alignment: z.enum(["left", "center", "right", "justify"]).nullish().describe("Text alignment"),
  color: z.string().nullish().describe("Text color"),
  fontSize: z.string().nullish().describe("Text font size"),
}).nullish();

export const ResumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().nullish().describe("The full name of the person"),
    jobTitle: z.string().nullish().describe("Current job title or professional headline"),
    email: z.string().nullish().describe("Email address"),
    phone: z.string().nullish().describe("Phone number"),
    website: z.string().nullish().describe("Personal website or portfolio URL"),
    linkedin: z.string().nullish().describe("LinkedIn profile URL"),
    location: z.string().nullish().describe("City, Country. Format: 'City, Country' (e.g. 'New York, NY'). No sentences."),
    summary: RichTextFieldSchema.describe("A brief professional summary or bio"),
    headerSummary: RichTextFieldSchema.describe("Summary displayed in the header"),
    additionalLinks: z.array(z.object({
        id: z.string().nullish(),
        label: z.string().nullish(),
        url: z.string().nullish(),
    })).nullish().transform(v => v ?? []),
  }).nullish().transform(v => v ?? {}).describe("Personal contact information"),
  
  coverImage: z.string().nullish(),
  
  experience: z.array(
    z.object({
      id: z.string().nullish().describe("Unique identifier for the experience entry"),
      company: RichTextFieldSchema.describe("Name of the company or organization. Format: Name only."),
      position: RichTextFieldSchema.describe("Job title or role held. Format: Title only."),
      startDate: RichTextFieldSchema.describe("Start date (YYYY-MM or Present)"),
      endDate: RichTextFieldSchema.describe("End date (YYYY-MM or Present)"),
      description: RichTextFieldSchema.describe("Bullet points or detailed description of responsibilities and achievements"),
    })
  ).nullish().transform(v => v ?? []).describe("Work experience history"),
  
  education: z.array(
    z.object({
      id: z.string().nullish().describe("Unique identifier for the education entry"),
      institution: RichTextFieldSchema.describe("Name of the university, college, or school. Format: Name only."),
      degree: RichTextFieldSchema.describe("Degree or certificate obtained. Format: Degree name only."),
      fieldOfStudy: RichTextFieldSchema.describe("Major or field of study. Format: Major name only (e.g. Computer Science)."),
      startDate: RichTextFieldSchema.describe("Start date (YYYY-MM)"),
      endDate: RichTextFieldSchema.describe("End date or Graduation date (YYYY-MM)"),
    })
  ).nullish().transform(v => v ?? []).describe("Educational background"),
  
  skills: z.array(z.string()).nullish().transform(v => v ?? []).describe("List of professional skills"),
  
  projects: z.array(
    z.object({
      id: z.string().nullish().describe("Unique identifier for the project"),
      name: RichTextFieldSchema.describe("Name of the project. Format: Name only."),
      description: RichTextFieldSchema.describe("Brief description of the project and your role"),
      url: z.string().nullish().describe("URL to the project"),
      technologies: z.array(z.string()).nullish().describe("List of technologies used in the project"),
    })
  ).nullish().transform(v => v ?? []).describe("Notable projects"),
  
  testimonials: z.array(
    z.object({
      id: z.string().nullish(),
      name: z.string().nullish(),
      role: z.string().nullish(),
      content: z.string().nullish(),
    })
  ).nullish().transform(v => v ?? []).describe("Client testimonials"),
  
  customSections: z.array(
    z.object({
      id: z.string().nullish().default(() => `cs-${Math.random().toString(36).slice(2, 9)}`),
      title: z.string().nullish().default("Untitled Section"),
      type: z.enum(["list", "text"]).nullish().default("text"),
      items: z.array(
        z.object({
          id: z.string().nullish().default(() => `item-${Math.random().toString(36).slice(2, 9)}`),
          title: RichTextFieldSchema.describe("Main title of the item"),
          subtitle: RichTextFieldSchema.describe("Subtitle of the item"),
          content: RichTextFieldSchema.describe("Description or content of the item"),
        })
      ).nullish().transform(v => v ?? [])
    })
  ).nullish().transform(v => v ?? []).describe("Custom user-defined sections"),
  
  sectionOrder: z.array(z.string()).nullish().transform(v => v ?? [
    "summary",
    "experience", 
    "education", 
    "projects", 
    "skills"
  ]).describe("Order of sections to render"),
});

export type ResumeData = z.infer<typeof ResumeSchema>;
