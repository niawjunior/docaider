/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { createServiceClient } from "@/app/utils/supabase/server";
import { ResumeData } from "@/lib/schemas/resume";

export const runtime = "edge";

export const alt = "Resume Preview";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: resume } = await supabase
    .from("resumes")
    .select("content")
    .eq("slug", slug)
    .single();

  const content = resume?.content as unknown as ResumeData;
  const fullName = content?.personalInfo?.fullName || "Resume";
  const jobTitle = content?.personalInfo?.jobTitle || "Professional Profile";
  const location = content?.personalInfo?.location;
  const initial = fullName.charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC", // slate-50
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
          }}
        />

        {/* Card Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            padding: "60px 80px",
            borderRadius: "24px",
            boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E2E8F0",
            maxWidth: "80%",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Avatar / Icon */}
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#2563EB", // blue-600
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "32px",
              boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.5)",
            }}
          >
            {initial}
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#0F172A", // slate-900
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            {fullName}
          </div>

          {/* Job Title */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "#64748B", // slate-500
              marginBottom: location ? "12px" : "0",
            }}
          >
            {jobTitle}
          </div>

          {/* Location */}
          {location && (
             <div
             style={{
               fontSize: "24px",
               color: "#94A3B8", // slate-400
               display: "flex",
               alignItems: "center",
               gap: "8px",
             }}
           >
             📍 {location}
           </div>
          )}
        </div>

        {/* Footer Branding */}
         <div
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#94A3B8",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Created with <span style={{ color: "#2563EB" }}>DocAider</span>
          </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
