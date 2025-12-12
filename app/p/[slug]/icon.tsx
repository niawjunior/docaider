import { ImageResponse } from "next/og";
import { createServiceClient } from "@/app/utils/supabase/server";
import { ResumeData } from "@/lib/schemas/resume";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: resume } = await supabase
    .from("resumes")
    .select("content")
    .eq("slug", slug)
    .single();

  const content = resume?.content as unknown as ResumeData;
  const fullName = content?.personalInfo?.fullName || "D";
  const initial = fullName.charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#2563EB", // blue-600
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px", // Rounded square
          fontWeight: 700,
        }}
      >
        {initial}
      </div>
    ),
    {
      ...size,
    }
  );
}
