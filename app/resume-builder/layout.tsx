import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Resume Builder",
  description: "Create professional resumes in minutes with our AI-powered builder. Choose from modern, Ats-friendly templates and export to PDF instantly.",
  openGraph: {
    title: "Free AI Resume Builder | Docaider",
    description: "Create professional resumes in minutes with our AI-powered builder. Choose from modern templates and export to PDF instantly.",
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
