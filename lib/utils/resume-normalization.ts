import { ResumeData } from "@/lib/schemas/resume";

export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience", 
  "projects", 
  "skills", 
  "education"
];

/**
 * Normalizes resume data to ensure all required fields and sections exist.
 * This handles migration for legacy data or incomplete AI parsing results.
 */
export function normalizeResumeData(data: Partial<ResumeData>): ResumeData {
  // 1. Ensure personalInfo exists with all sub-objects
  const personalInfo = data.personalInfo || {} as any;
  
  // Ensure summary objects exist if missing
  if (!personalInfo.summary) {
      personalInfo.summary = { content: "", alignment: "left" };
  } else {
      // Ensure properties exist on partial object
      personalInfo.summary = {
          content: personalInfo.summary.content || "",
          alignment: personalInfo.summary.alignment || "left",
          ...personalInfo.summary
      };
  }

  // Header Summary
  if (!personalInfo.headerSummary) {
     // Default to summary content if header summary is missing
     personalInfo.headerSummary = { content: personalInfo.summary.content, alignment: "left" };
  }

  // 2. Ensure Arrays exist
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const testimonials = data.testimonials || [];
  const customSections = data.customSections || [];

  // 3. Normalize Section Order
  // Merge existing order with potentially new default sections
  let sectionOrder = data.sectionOrder || [...DEFAULT_SECTION_ORDER];

  // A. Add any standard sections that might be missing from the order
  const standardSections = ["summary", "experience", "education", "projects", "skills"];
  standardSections.forEach(section => {
      if (!sectionOrder.includes(section)) {
          // Add to end, or specific logic? 
          // Usually 'summary' goes first, but if it's missing, let's prepend it.
          // Others append.
          if (section === "summary") {
              sectionOrder = [section, ...sectionOrder];
          } else {
              sectionOrder.push(section);
          }
      }
  });

  // B. Ensure custom sections are in the order
  customSections.forEach(section => {
      if (section.id && !sectionOrder.includes(section.id)) {
          sectionOrder.push(section.id);
      }
  });

  // C. Remove duplicates
  sectionOrder = Array.from(new Set(sectionOrder));

  return {
    ...data,
    personalInfo: {
        ...personalInfo,
        // Ensure other simple fields are at least null or string
        fullName: personalInfo.fullName || "",
        jobTitle: personalInfo.jobTitle || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        location: personalInfo.location || "",
        website: personalInfo.website || "",
        linkedin: personalInfo.linkedin || "",
    },
    experience,
    education,
    skills,
    projects,
    testimonials,
    customSections,
    sectionOrder,
    coverImage: data.coverImage || "/images/cover.png"
  };
}
