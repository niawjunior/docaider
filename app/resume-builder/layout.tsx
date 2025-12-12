import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder | Docaider",
  description: "Create professional resumes in minutes with our AI-powered builder.",
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
