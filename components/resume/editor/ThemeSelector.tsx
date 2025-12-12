"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AVAILABLE_THEMES, ThemeConfig } from "@/lib/themes/registry";
import { cn } from "@/lib/utils";
import { Check, FileText, Globe, Palette, Search } from "lucide-react";
import { useState } from "react";
import { THEME_DEMOS } from "@/lib/themes";
import { ResumePreview } from "@/components/resume/ResumePreview";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "document" | "web">("all");

  const filteredThemes = AVAILABLE_THEMES.filter((theme) => {
    const matchesSearch = theme.label.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || theme.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const selectedThemeConfig = AVAILABLE_THEMES.find((t) => t.id === currentTheme);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-[180px] justify-between text-slate-300 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
        >
          <span className="flex items-center gap-2 truncate">
            <Palette className="w-4 h-4 text-slate-400" />
            {selectedThemeConfig?.label || "Select Theme"}
          </span>
          <span className="text-xs text-slate-500 font-mono ml-2 border border-white/10 rounded px-1.5 py-0.5 uppercase">
             {selectedThemeConfig?.type === 'web' ? 'Web' : 'PDF'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] h-[85vh] flex flex-col p-0 gap-0 dark text-foreground border-slate-800">
        <div className="p-6 border-b border-slate-800 space-y-4 shrink-0 bg-slate-900 z-10">
          <DialogHeader>
            <DialogTitle className="text-xl">Template Gallery</DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose a design that best fits your profession and personality.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col w-full justify-between gap-4 pt-2">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-slate-950/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="document" className="gap-2">
                  <FileText className="w-4 h-4" />
                  PDF
                </TabsTrigger>
                <TabsTrigger value="web" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Web
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                className="pl-9 bg-slate-950/50 border-slate-800 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6 bg-slate-950/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={currentTheme === theme.id}
                onSelect={() => {
                  onThemeChange(theme.id);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          {filteredThemes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <p>No themes found matching your criteria.</p>
              <Button 
                variant="link" 
                onClick={() => { setSearch(""); setActiveTab("all"); }}
                className="text-blue-400"
              >
                Clear filters
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeConfig;
  isActive: boolean;
  onSelect: () => void;
}) {
    // Find the demo data for this theme, or fallback to the first one if not found (shouldn't happen)
    const demoData = THEME_DEMOS.find(d => d.id === theme.id)?.data || THEME_DEMOS[0].data;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden bg-slate-950/50 hover:bg-slate-900 flex flex-col",
        isActive
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/10"
          : "border-slate-800 hover:border-slate-700 hover:shadow-lg"
      )}
    >
      {/* Live Preview Area */}
      <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900/50">
        {/* Scaled Preview Container - simulates a thumbnail similar to gallery */}
         <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
             <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]" style={{ containerType: "inline-size" }}>
                <ResumePreview 
                    data={demoData} 
                    theme={theme.id as any} 
                    isThumbnail={true}
                    className="h-full bg-white text-slate-900" 
                />
             </div>
         </div>
        
        {/* Overlay for hover effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        
        {/* Badge Overlay */}
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {theme.type === 'web' && (
             <span className="bg-purple-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm border border-purple-400/20">
                WEB
             </span>
          )}
           {theme.type === 'document' && (
             <span className="bg-blue-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm border border-blue-400/20">
                PDF
             </span>
          )}
        </div>

        {/* Selected Checkmark */}
        {isActive && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center backdrop-blur-[1px] z-20">
                <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg scale-100 animate-in zoom-in-50 duration-200">
                    <Check className="w-6 h-6" />
                </div>
            </div>
        )}
      </div>

      <div className="p-4 space-y-2 bg-slate-900/50 border-t border-slate-800/50 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <h3 className={cn("font-bold text-base text-slate-200 group-hover:text-white transition-colors")}>
            {theme.label}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
           {theme.description}
        </p>
      </div>
    </div>
  );
}
