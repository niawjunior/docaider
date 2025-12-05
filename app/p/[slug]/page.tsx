import { notFound } from "next/navigation";
import { createServiceClient } from "@/app/utils/supabase/server";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeData } from "@/lib/schemas/resume";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicResumePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !resume) {
    notFound();
  }

  const resumeData = resume.content as unknown as ResumeData;

  return (
    <div className="min-h-screen bg-slate-50">
      <ResumePreview data={resumeData} theme={resume.theme as any} />
      
      <div className="text-center mt-8 text-slate-400 text-sm">
        <p>Powered by <a href="https://docaider.com" className="hover:text-slate-600 underline">Docaider</a></p>
      </div>
    </div>
  );
}
