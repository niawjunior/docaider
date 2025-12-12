
import { createClient, createServiceClient } from "@/app/utils/supabase/server";
import { ResumeData } from "@/lib/schemas/resume";
import { normalizeResumeData } from "@/lib/utils/resume-normalization";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { redirect } from "next/navigation";

export default async function PrintResumePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ secret?: string }> 
}) {
  const { id } = await params;
  const { secret } = await searchParams;
  
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

  return (
    <div className="print-container bg-white min-h-screen w-full">
      <style>{`
        @page {
          margin: 0;
          size: auto;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
        theme={resume.theme} 
        isThumbnail={false} 
        readOnly={true} // Forcing read-only for print/pdf
      />
    </div>
  );
}
