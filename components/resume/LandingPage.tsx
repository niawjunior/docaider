"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wand2, Layout, Share2, ArrowLeft, Loader2 } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import { signOut } from "@/app/login/action";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";

interface LandingPageProps {
  initialData: { count: number; showcase: any[] };
}

export function LandingPage({ initialData }: LandingPageProps) {
  const router = useRouter();
  // We can remove useSupabaseSession and handleSignOut/handleCreate from here if we don't rely on them for other things.
  // BUT handleUseTemplate uses router, which is fine.
  // The header component handles its own auth checks.

  const handleCreate = () => {
    // Clear any existing draft to ensure a fresh start
    localStorage.removeItem("resume_draft");
    localStorage.removeItem("resume_theme");
    router.push("/resume-builder/create");
  };

  const handleUseTemplate = (data: ResumeData, theme: string) => {
    // Save to localStorage so the editor can pick it up
    localStorage.setItem("resume_draft", JSON.stringify(data));
    localStorage.setItem("resume_theme", theme);
    router.push(`/resume-builder/create?theme=${theme}`);
    toast.success("Template loaded!");
  };

  // Merge real data with static examples
  const showcaseItems = [
    ...initialData.showcase.map((item) => ({
      role: item.job_title || item.content.personalInfo.role || "Community Member",
      theme: item.theme,
      slug: item.slug,
      data: item.content as ResumeData,
    })),
  ].slice(0, 3);

  // Demo data for the theme showcase
  const DEMO_DATA: ResumeData = {
    personalInfo: {
      fullName: "Alex Morgan",
      summary: "Product Designer with 5 years of experience building digital products.",
      email: "alex@example.com",
    },
    experience: [
      {
        company: "Tech Corp",
        position: "Senior Designer",
        startDate: "2021",
        endDate: "Present",
        description: "Leading the design system team.",
      },
    ],
    projects: [
      { name: "E-commerce API", description: "High-performance API handling 10k req/s" }
    ],
    testimonials: [],
    education: [],
    skills: ["Figma", "React", "UI/UX"],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ResumeBuilderHeader className="bg-white/80 backdrop-blur-md" />

      <main>
        <section className="relative py-24 px-6 text-center max-w-5xl mx-auto space-y-8 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-50 to-white rounded-full blur-3xl -z-10 opacity-60" />
          
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              New: Portfolio Mode Available
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Turn your Resume into a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Personal Website
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload your PDF, and our AI will build you a stunning portfolio website in seconds. No coding required.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all" onClick={handleCreate}>
              <Wand2 className="w-5 h-5 mr-2" />
              Build for Free
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-200 hover:bg-slate-50" asChild>
              <a href="#examples">View Examples</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-slate-100 mt-16">
            {[
              { label: "Resumes Built", value: initialData.count > 0 ? `${initialData.count}` : "0" },
              { label: "Time Saved", value: "20hrs" },
              { label: "Themes", value: "4+" },
              { label: "Cost", value: "Free" },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Showcase */}
        <section id="examples" className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900">Built by the Community</h2>
              <p className="text-slate-600 text-lg">
                See how professionals from different fields are using our platform to showcase their work.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {showcaseItems.map((example, i) => (
                <div 
                  key={i} 
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer"
                  onClick={() => window.open(`/p/${example.slug}`, '_blank')}
                >
                  <div className="aspect-video overflow-hidden bg-slate-100 relative">
                    <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none" style={{ containerType: "inline-size" }}>
                      <ResumePreview data={example.data} theme={example.theme as any} />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        View Profile
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{example.role}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full text-slate-600 capitalize">
                        {example.theme}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2">
                      {example.data.personalInfo.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center pt-12">
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <a href="/resume-builder/gallery">View All Examples</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 border-none shadow-lg bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">AI Powered Parsing</h3>
              <p className="text-slate-600">
                Don't start from scratch. We extract all data from your existing resume automatically.
              </p>
            </Card>
            <Card className="p-8 space-y-4 border-none shadow-lg bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Premium Themes</h3>
              <p className="text-slate-600">
                Choose from professionally designed themes including our new Portfolio mode.
              </p>
            </Card>
            <Card className="p-8 space-y-4 border-none shadow-lg bg-white/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Instant Hosting</h3>
              <p className="text-slate-600">
                Get a unique <code className="bg-slate-100 px-1 rounded">docaider.com/p/you</code> link to share with recruiters instantly.
              </p>
            </Card>
          </div>
        </section>

        {/* Theme Showcase */}
        <section id="themes" className="py-20 px-6">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Stunning Templates</h2>
              <p className="text-slate-600">Choose a style that fits your personality.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Portfolio", value: "portfolio", desc: "Interactive website style", projects: [
          { name: "Rebrand 2023", description: "Complete visual identity overhaul" }
        ],
        testimonials: [], },
                { name: "Modern", value: "modern", desc: "Clean and professional" },
                { name: "Minimal", value: "minimal", desc: "Typography focused" },
                { name: "Creative", value: "creative", desc: "Bold and dark", projects: [
          { name: "Banking App Study", description: "Usability study for major bank app" }
        ],
        testimonials: [], },
                { name: "Studio", value: "studio", desc: "Agency style (New)" },
              ].map((t) => (
                <div key={t.value} className="space-y-4 group cursor-pointer" onClick={() => handleUseTemplate(DEMO_DATA, t.value)}>
                  <div className="aspect-[210/297] rounded-xl overflow-hidden border border-slate-200 shadow-xl group-hover:shadow-2xl transition-all relative bg-slate-50">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none scale-[0.4] origin-top-left w-[250%] h-[250%]">
                      <ResumePreview data={DEMO_DATA} theme={t.value as any} />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button variant="secondary" className="shadow-lg">Use This Template</Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{t.name}</h3>
                    <p className="text-sm text-slate-500">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
