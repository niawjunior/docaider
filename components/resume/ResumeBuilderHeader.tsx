"use client";

import Link from "next/link";
import { useState } from "react";
import { generateResumePDF } from "@/app/actions/pdf";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, Menu, X, Globe } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import { signOut } from "@/app/login/action";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function XIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 127.14 96.36" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.82,105.82,0,0,0,126.6,80.22c2.36-24.44-2-47.27-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

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
  
  const isDark = theme === "dark";

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const handleCreate = () => {
     router.push("/resume-builder/create");
  };

  const XLink = ({ mobile = false }: { mobile?: boolean }) => (
    <a 
      href="https://x.com/pasupol1x" 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 transition-colors",
        mobile ? "w-full px-4 py-2 hover:bg-slate-100 hover:text-slate-900 rounded-md" : (isDark ? "text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-full" : "text-slate-500 hover:text-black hover:bg-slate-100 p-2 rounded-full")
      )}
    >
      <XIcon className="w-4 h-4" />
      {mobile && <span className="font-medium">Follow Updates</span>}
    </a>
  );

  const DiscordLink = ({ mobile = false }: { mobile?: boolean }) => (
    <a 
      href="https://discord.gg/fHF92ujV" 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 transition-colors",
        mobile ? "w-full px-4 py-2 hover:bg-slate-100 hover:text-slate-900 rounded-md" : (isDark ? "text-slate-400 hover:text-indigo-400 hover:bg-white/5 p-2 rounded-full" : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100 p-2 rounded-full")
      )}
    >
      <DiscordIcon className="w-5 h-5" />
      {mobile && <span className="font-medium">Join Community</span>}
    </a>
  );

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin text-slate-400" />;
    
    if (session) {
      return (
        <>
          <Button 
            onClick={handleCreate} 
            className={cn(
              mobile ? "w-full justify-start" : (isDark && "bg-white text-black hover:bg-slate-200")
            )}
          >
            Create Resume
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/resume-builder/dashboard")}
            className={cn(
              mobile ? "w-full justify-start" : "",
              !mobile && isDark && "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className={cn(
              mobile ? "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" : "",
              !mobile && isDark && "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            Sign Out
          </Button>
        </>
      );
    }
    
    return (
      <>
        <Button 
          variant="ghost" 
          onClick={() => router.push("/login?redirect_to=/resume-builder")}
          className={cn(
            mobile ? "w-full justify-start" : "",
            !mobile && isDark && "text-slate-300 hover:text-white hover:bg-white/10"
          )}
        >
          Sign In
        </Button>
         <Button 
           onClick={handleCreate} 
           className={cn(
             mobile ? "w-full" : "",
             !mobile && isDark && "bg-white text-black hover:bg-slate-200"
           )}
          >
           Create My Website
         </Button>
      </>
    );
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-colors border-b",
      isDark ? "bg-black/80 border-white/10 text-white backdrop-blur-md supports-[backdrop-filter]:bg-black/50" : "bg-white/80 border-slate-200 text-slate-900 backdrop-blur-md supports-[backdrop-filter]:bg-white/50",
      className
    )}>
      <div className={cn("mx-auto px-4 sm:px-6 h-16 flex items-center justify-between", maxWidth)}>
        {/* Left: Branding */}
        <div className="flex items-center gap-4 sm:gap-8">
          {showBackToApp && (
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className={cn(
                  "flex items-center gap-2 transition-colors text-sm font-medium",
                  isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden lg:inline">Docaider App</span>
              </Link>
              <div className={cn(
                "h-6 w-px hidden lg:block",
                isDark ? "bg-white/10" : "bg-slate-200"
              )} />
            </div>
          )}

          <Link href="/resume-builder" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shrink-0",
              isDark ? "bg-white/10 text-white border border-white/10" : "bg-gradient-to-br from-blue-600 to-indigo-600"
            )}>
              R
            </div>
            <span className={cn(
              "font-bold text-lg sm:text-xl tracking-tight",
              isDark ? "text-white" : "text-slate-900"
            )}>
              Resume Builder
            </span>
            <span className={cn(
              "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider hidden sm:inline-block",
              isDark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-blue-100 text-blue-700 border border-blue-200"
            )}>
              Beta
            </span>
          </Link>
        </div>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Custom Children (e.g. Toolbar Actions) */}
          {children}

          {/* Separator if children exist */}
          {children && (
            <div className={cn("h-6 w-px mx-2", isDark ? "bg-white/10" : "bg-slate-200")} />
          )}

          {/* Socials */}
          <XLink />
          <DiscordLink />

          {/* Auth */}
          {showAuth && (
            <div className="flex items-center gap-2 ml-2">
              <AuthButtons />
            </div>
          )}
        </div>

        {/* Right: Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
           {children} {/* Show primary actions (like save) on mobile if they fit, or user usually hides them */}
           
           <Sheet>
             <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(isDark ? "text-slate-300 hover:text-white hover:bg-white/10" : "")}>
                  <Menu className="w-5 h-5" />
                </Button>
             </SheetTrigger>
             <SheetContent side="right" className={cn("w-[300px] sm:w-[400px]", isDark ? "bg-slate-950 border-white/10 text-white" : "")}>
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                     <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm",
                        isDark ? "bg-white/10 border border-white/10" : "bg-gradient-to-br from-blue-600 to-indigo-600"
                      )}>
                        R
                      </div>
                      Resume Builder
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-6 px-4">
                   <div className="flex flex-col gap-2">
                      <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-white" : "text-slate-400")}>Menu</h4>
                      {showAuth && <AuthButtons mobile />}
                   </div>

                   <div className="h-px bg-white/10 w-full" />

                   <div className="flex flex-col gap-2">
                      <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-white" : "text-slate-400")}>Community</h4>
                      <XLink mobile />
                      <DiscordLink mobile />
                      {showBackToApp && (
                        <Link href="/" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors">
                           <Globe className="w-4 h-4" />
                           <span className="font-medium">Docaider App</span>
                        </Link>
                      )}
                   </div>
                </div>
             </SheetContent>
           </Sheet>
        </div>
      </div>
    </header>
  );
}
