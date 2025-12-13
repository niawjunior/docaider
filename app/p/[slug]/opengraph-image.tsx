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
          backgroundColor: "#020617", // slate-950
          backgroundImage: "radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 75%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.15,
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", // Fade out at bottom
          }}
        />

        {/* Glowing Orbs */}
        <div 
            style={{
                position: "absolute",
                top: "-20%",
                left: "20%",
                width: "600px",
                height: "600px",
                background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(40px)",
                opacity: 0.8,
            }}
        />
        <div 
            style={{
                position: "absolute",
                bottom: "-10%",
                right: "10%",
                width: "500px",
                height: "500px",
                background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(50px)",
                opacity: 0.6,
            }}
        />

        {/* Main Glass Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.6)", // slate-900/60
            padding: "80px 100px",
            borderRadius: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
            maxWidth: "85%",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Avatar / Icon with Gradient Ring */}
          <div
            style={{
              padding: "4px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", // Blue to Purple
              marginBottom: "32px",
              boxShadow: "0 0 40px -10px rgba(59, 130, 246, 0.5)",
              display: "flex",
            }}
          >
            <div
                style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    backgroundColor: "#0f172a", // slate-900
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "56px",
                    fontWeight: "bold",
                    border: "4px solid #0f172a", // Inner border match background
                }}
            >
                {initial}
            </div>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              background: "linear-gradient(to bottom right, #ffffff 0%, #cbd5e1 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {fullName}
          </div>

          {/* Job Title */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: 500,
              color: "#94a3b8", // slate-400
              marginBottom: location ? "16px" : "0",
              letterSpacing: "-0.01em",
            }}
          >
            {jobTitle}
          </div>

          {/* Location */}
          {location && (
             <div
             style={{
               fontSize: "24px",
               color: "#64748b", // slate-500
               display: "flex",
               alignItems: "center",
               gap: "8px",
               marginTop: "8px",
               fontWeight: 400,
             }}
           >
             <span style={{ fontSize: "20px" }}>📍</span> {location}
           </div>
          )}
        </div>

        {/* Footer Branding */}
         <div
            style={{
              position: "absolute",
              bottom: "60px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#64748b", // slate-500
              fontSize: "22px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6" }} /> 
            Created with <span style={{ color: "#e2e8f0", fontWeight: 600 }}>DocAider</span>
          </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
