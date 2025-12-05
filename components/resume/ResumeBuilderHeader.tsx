
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import { signOut } from "@/app/login/action";
import { cn } from "@/lib/utils";

interface ResumeBuilderHeaderProps {
  children?: React.ReactNode;
  className?: string;
  showBackToApp?: boolean;
  showAuth?: boolean;
  maxWidth?: string;
}

export function ResumeBuilderHeader({ 
  children, 
  className,
  showBackToApp = true,
  showAuth = true,
  maxWidth = "max-w-7xl"
}: ResumeBuilderHeaderProps) {
  const router = useRouter();
  const { session, loading } = useSupabaseSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const handleCreate = () => {
     localStorage.removeItem("resume_draft"); 
     localStorage.removeItem("resume_theme");
     router.push("/resume-builder/create");
  };

  return (
    <header className={cn("bg-white border-b border-slate-200 sticky top-0 z-50", className)}>
      <div className={cn("mx-auto px-6 h-16 flex items-center justify-between", maxWidth)}>
        <div className="flex items-center gap-8">
          {showBackToApp && (
            <>
              <Link 
                href="/" 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Docaider</span>
                <span className="sm:hidden">App</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            </>
          )}

          <Link href="/resume-builder" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              R
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline">Resume Builder</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {children}

          {showAuth && !children && (
            <>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : session ? (
                <>
                  <Button variant="ghost" onClick={() => router.push("/resume-builder/dashboard")}>
                    Dashboard
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                  <Button onClick={handleCreate}>
                    Create My Website
                  </Button>
                </>
              ) : (
                <>
                   <Button variant="ghost" onClick={() => router.push("/login")}>
                    Sign In
                  </Button>
                  <Button onClick={handleCreate}>
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
