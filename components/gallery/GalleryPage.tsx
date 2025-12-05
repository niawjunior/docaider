"use client";

import { useState } from "react";
import { ResumeData } from "@/lib/schemas/resume";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";

interface GalleryItem {
  content: ResumeData;
  theme: string;
  slug: string;
  job_title: string;
  summary: string;
  created_at: string;
}

interface GalleryPageProps {
  initialData: GalleryItem[];
}

export function GalleryPage({ initialData }: GalleryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTheme, setFilterTheme] = useState<string>("all");

  const filteredData = initialData.filter((item) => {
    const matchesSearch =
      item.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.personalInfo?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesTheme = filterTheme === "all" || item.theme === filterTheme;
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark">
      {/* Header */}
      <ResumeBuilderHeader theme="dark" className="bg-transparent border-b border-white/10" />

      <main>
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            Discover What's Possible
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            Explore resumes created by our community. Get inspired and build your own.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or role..."
              className="pl-10 bg-slate-900/50 border-white/10 h-9 text-base text-white placeholder:text-slate-500 focus:bg-slate-900 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={filterTheme} onValueChange={setFilterTheme}>
              <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filter by theme" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="all">All Themes</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredData.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.slug}
                className="group relative bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer"
                onClick={() => window.open(`/p/${item.slug}`, "_blank")}
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-950 relative border-b border-white/5">
                  <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none" style={{ containerType: "inline-size" }}>
                    <ResumePreview
                      data={item.content}
                      theme={item.theme as any}
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-white truncate pr-2 group-hover:text-blue-400 transition-colors">
                      {item.job_title || "Community Member"}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-white/10 text-slate-300 rounded-full capitalize shrink-0 border border-white/5">
                      {item.theme}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mb-1">
                    {item.content.personalInfo.fullName}
                  </p>
                  <p className="text-slate-500 text-sm line-clamp-2">
                    {item.summary}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

            {filteredData.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                No resumes found matching your criteria.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
