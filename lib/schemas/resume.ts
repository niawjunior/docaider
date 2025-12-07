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
    location: z.string().nullish().describe("City, Country"),
    summary: RichTextFieldSchema.describe("A brief professional summary or bio"),
    headerSummary: RichTextFieldSchema.describe("Summary displayed in the header"),
  }).nullish().transform(v => v ?? {}).describe("Personal contact information"),
  
  coverImage: z.string().nullish(),
  
  experience: z.array(
    z.object({
      id: z.string().nullish().describe("Unique identifier for the experience entry"),
      company: z.string().nullish().describe("Name of the company or organization"),
      position: z.string().nullish().describe("Job title or role held"),
      startDate: z.string().nullish().describe("Start date (YYYY-MM or Present)"),
      endDate: z.string().nullish().describe("End date (YYYY-MM or Present)"),
      description: z.string().nullish().describe("Bullet points or detailed description of responsibilities and achievements"),
      alignment: z.enum(["left", "center", "right", "justify"]).nullish(), // For Description
      companyAlignment: z.enum(["left", "center", "right", "justify"]).nullish(),
      positionAlignment: z.enum(["left", "center", "right", "justify"]).nullish(),
      dateAlignment: z.enum(["left", "center", "right", "justify"]).nullish(),
    })
  ).nullish().transform(v => v ?? []).describe("Work experience history"),
  
  education: z.array(
    z.object({
      id: z.string().nullish().describe("Unique identifier for the education entry"),
      institution: z.string().nullish().describe("Name of the university, college, or school"),
      degree: z.string().nullish().describe("Degree or certificate obtained (e.g. Bachelor of Science)"),
      fieldOfStudy: z.string().nullish().describe("Major or field of study"),
      startDate: z.string().nullish().describe("Start date (YYYY-MM)"),
      endDate: z.string().nullish().describe("End date or Graduation date (YYYY-MM)"),
      alignment: z.enum(["left", "center", "right", "justify"]).nullish(), // For FieldOfStudy/Description
      institutionAlignment: z.enum(["left", "center", "right", "justify"]).nullish(),
      degreeAlignment: z.enum(["left", "center", "right", "justify"]).nullish(),
      dateAlignment: z.enum(["left", "center", "right", "justify"]).nullish(),
    })
  ).nullish().transform(v => v ?? []).describe("Educational background"),
  
  skills: z.array(z.string()).nullish().transform(v => v ?? []).describe("List of professional skills"),
  
  projects: z.array(
    z.object({
      id: z.string().nullish().describe("Unique identifier for the project"),
      name: z.string().nullish().describe("Name of the project"),
      description: z.string().nullish().describe("Brief description of the project and your role"),
      url: z.string().nullish().describe("URL to the project (e.g. GitHub link or live demo)"),
      technologies: z.array(z.string()).nullish().describe("List of technologies used in the project"),
      alignment: z.enum(["left", "center", "right", "justify"]).nullish(),
      nameAlignment: z.enum(["left", "center", "right", "justify"]).nullish(),
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
      id: z.string().nullish().default(() => `cs-${Math.random().toString(36).slice(2, 9)}`).describe("Unique identifier for the custom section"),
      title: z.string().nullish().default("Untitled Section").describe("Title of the custom section (e.g. 'Volunteering', 'Awards')"),
      type: z.enum(["list", "text"]).nullish().default("text").describe("Type of content: 'list' for items with titles/subtitles, 'text' for paragraphs"),
      items: z.array(
        z.object({
          id: z.string().nullish().default(() => `item-${Math.random().toString(36).slice(2, 9)}`).describe("Unique identifier for the item"),
          title: z.string().nullish().default("").describe("Main title of the item (e.g. Award Name)"),
          subtitle: z.string().nullish().default("").describe("Subtitle of the item (e.g. Date, Organization)"),
          content: z.string().nullish().default("").describe("Description or content of the item"),
          alignment: z.enum(["left", "center", "right", "justify"]).nullish(),
        })
      ).nullish().transform(v => v ?? []).describe("List of items in this section")
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
