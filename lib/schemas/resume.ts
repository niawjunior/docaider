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
      company: z.string().optional(),
      position: z.string().optional(),
      startDate: z.string().optional().describe("YYYY-MM or Present"),
      endDate: z.string().optional().describe("YYYY-MM or Present"),
      description: z.string().optional().describe("Bullet points or description of responsibilities"),
    })
  ).optional().default([]).describe("Work experience history"),
  education: z.array(
    z.object({
      institution: z.string().optional(),
      degree: z.string().optional(),
      fieldOfStudy: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ).optional().default([]).describe("Educational background"),
  skills: z.array(z.string()).optional().default([]).describe("List of professional skills"),
  projects: z.array(
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      technologies: z.array(z.string()).optional(),
    })
  ).optional().default([]).describe("Notable projects"),
  testimonials: z.array(
    z.object({
      name: z.string().optional(),
      role: z.string().optional(),
      content: z.string().optional(),
    })
  ).optional().default([]).describe("Client testimonials"),
});

export type ResumeData = z.infer<typeof ResumeSchema>;
