import { notFound } from "next/navigation";
import { createServiceClient } from "@/app/utils/supabase/server";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeData } from "@/lib/schemas/resume";

import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: resume } = await supabase
    .from("resumes")
    .select("content")
    .eq("slug", slug)
    .single();

  if (!resume) {
    return {
      title: "Resume Not Found | Docaider",
    };
  }

  const content = resume.content as unknown as ResumeData;
  const fullName = content.personalInfo?.fullName || "Resume";
  const jobTitle = content.personalInfo?.jobTitle || "Professional Profile";
  const summary = content.personalInfo?.summary?.content || `Building my career with Docaider.`;

  return {
    title: {
      absolute: `${fullName} - ${jobTitle}`,
    },
    description: summary.slice(0, 160), // Truncate for SEO
    openGraph: {
      title: `${fullName} - ${jobTitle}`,
      description: summary.slice(0, 160),
      siteName: "Docaider",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${fullName} - ${jobTitle}`,
      description: summary.slice(0, 160),
    },
  };
}

export default async function PublicResumePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !resume) {
    notFound();
  }

  const resumeData = resume.content as unknown as ResumeData;

  return (
    <div className="min-h-screen bg-slate-50 dark">
      <ResumePreview data={resumeData} theme={resume.theme as any} readOnly={true} />
      
      <div className="text-center mt-8 text-slate-400 text-sm">
        <p>Powered by <a href="https://docaider.com" className="hover:text-slate-600 underline">Docaider</a></p>
      </div>
    </div>
  );
}
