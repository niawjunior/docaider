"use client";

import Link from "next/link";
import { useState } from "react";
import { generateResumePDF } from "@/app/actions/pdf";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import { signOut } from "@/app/login/action";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ResumeBuilderHeaderProps {
  children?: React.ReactNode;
  className?: string;
  showBackToApp?: boolean;
  showAuth?: boolean;
  maxWidth?: string;
  theme?: "light" | "dark";
}

export function ResumeBuilderHeader({ 
  children, 
  className,
  showBackToApp = true,
  showAuth = true,
  maxWidth = "max-w-7xl",
  theme = "light"
}: ResumeBuilderHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const { session, loading } = useSupabaseSession();
  
  // Safely extract resume ID from params if available (e.g., in builder route)
  // const resumeId = typeof params?.id === 'string' ? params.id : null;



  const isDark = theme === "dark";

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const handleCreate = () => {
     router.push("/resume-builder/create");
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-colors",
      isDark ? "bg-black/20 border-white/10 text-white backdrop-blur-md" : "bg-white border-slate-200 text-slate-900",
      className
    )}>
      <div className={cn("mx-auto px-6 h-16 flex items-center justify-between", maxWidth)}>
        <div className="flex items-center gap-8">
          {showBackToApp && (
            <>
              <Link 
                href="/" 
                className={cn(
                  "flex items-center gap-2 transition-colors text-sm font-medium",
                  isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Docaider</span>
                <span className="sm:hidden">App</span>
              </Link>
              <div className={cn(
                "h-6 w-px hidden sm:block",
                isDark ? "bg-white/10" : "bg-slate-200"
              )} />
            </>
          )}

          <Link href="/resume-builder" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm",
              isDark ? "bg-white/10 text-white border border-white/10" : "bg-gradient-to-br from-blue-600 to-indigo-600"
            )}>
              R
            </div>
            <span className={cn(
              "font-bold text-xl tracking-tight hidden sm:inline",
              isDark ? "text-white" : "text-slate-900"
            )}>
              Resume Builder
            </span>
            <span className={cn(
              "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider",
              isDark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-blue-100 text-blue-700 border border-blue-200"
            )}>
              Beta
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {children}



          {showAuth && (
            <>
              {children && session && (
                <div className={cn(
                  "h-6 w-px hidden sm:block mx-2",
                  isDark ? "bg-white/10" : "bg-slate-200"
                )} />
              )}
              
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : session ? (
                <>
                  {!children && (
                    <Button onClick={handleCreate} className={cn(isDark && "bg-white text-black hover:bg-slate-200")}>
                      Create Resume
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push("/resume-builder/dashboard")}
                    className={cn(isDark && "text-slate-300 hover:text-white hover:bg-white/10")}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className={cn(isDark && "text-slate-300 hover:text-white hover:bg-white/10")}
                  >
                    Sign Out
                  </Button>
                
                </>
              ) : (
                <>
                   <Button 
                    variant="ghost" 
                    onClick={() => router.push("/login?redirect_to=/resume-builder")}
                    className={cn(isDark && "text-slate-300 hover:text-white hover:bg-white/10")}
                  >
                    Sign In
                  </Button>
                  <Button onClick={handleCreate} className={cn(isDark && "bg-white text-black hover:bg-slate-200")}>
                    Create My Website
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
