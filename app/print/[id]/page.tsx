import { createClient, createServiceClient } from "@/app/utils/supabase/server";
import { ResumeData } from "@/lib/schemas/resume";
import { normalizeResumeData } from "@/lib/utils/resume-normalization";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ secret?: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const { secret } = await searchParams;
  
  const isServiceBypass = secret === process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = isServiceBypass ? createServiceClient() : await createClient();

  const { data: resume } = await supabase
    .from("resumes")
    .select("content")
    .eq("id", id)
    .single();

  if (!resume) {
    return {
      title: "Resume Not Found"
    };
  }

  const fullName = (resume.content as ResumeData).personalInfo?.fullName || "Resume";
  return {
    title: `${fullName} - Resume`
  };
}

export default async function PrintResumePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ secret?: string; theme?: string }> 
}) {
  const { id } = await params;
  const { secret, theme: themeParam } = await searchParams;
  
  // BYPASS LOGIC:
  // If the secret matches the Service Role Key, use the Admin Client (bypass RLS)
  // Otherwise, use the standard User Client (respect RLS/Auth)
  const isServiceBypass = secret === process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = isServiceBypass 
    ? createServiceClient() 
    : await createClient();

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (!resume) {
    return <div>Resume not found</div>;
  }

  const content = normalizeResumeData(resume.content as ResumeData);

  const activeTheme = (themeParam as any) || resume.theme || 'modern';

  // Theme-specific Print Configuration
  // 1. Full Bleed Themes (Sidebar, Creative, Dark Backgrounds) -> margin: 0
  // 2. Document Themes (Standard White, Text-heavy) -> margin: 20mm
  const FULL_BLEED_THEMES = ['creative', 'creative-sidebar', 'studio', 'visual', 'modern-sidebar', 'modern'];
  const isFullBleed = FULL_BLEED_THEMES.includes(activeTheme);

  const pageMargin = isFullBleed 
    ? 'margin: 0;' 
    : 'margin-top: 20mm; margin-bottom: 20mm; margin-left: 0; margin-right: 0;';

  return (
    <div className="print-container bg-white min-h-screen w-full">
      <style>{`
        @page {
          ${pageMargin}
          size: auto;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }
        /* Ensure background colors are printed */
        * {
            -webkit-print-color-adjust: exact !important;   /* Chrome, Safari, Edge */
            print-color-adjust: exact !important;           /* Firefox */
        }
      `}</style>
      <ResumePreview 
        data={content} 
        theme={activeTheme} 
        isThumbnail={false} 
        readOnly={true} // Forcing read-only for print/pdf
      />
    </div>
  );
}
