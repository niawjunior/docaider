"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { signOut } from "../login/action";
import { Menu, Mail, CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCredit } from "../hooks/useCredit";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import LocaleSwitcher from "./LocaleSwitcher";
import { useTranslations } from "next-intl";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { session } = useSupabaseSession();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const { credit, isLoading } = useCredit(session?.user?.id || "");
  const t = useTranslations("common");

  // Set user email when session is available
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleSignOut = () => {
    signOut().then(() => {
      window.location.reload();
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900">
        <div className="px-6 flex h-16 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Link href="/">
              <span className="text-white lg:text-xl text-md font-bold">
                ✨ {t("appName")}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 text-sm text-gray-300">
            {session && (
              <Badge
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 mx-4"
              >
                <CreditCard size={16} />
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <span>{credit?.balance || 0} </span>
                )}
                {t("credits")}
              </Badge>
            )}
            <Button
              variant="ghost"
              onClick={() => router.push("/pricing")}
              className="text-sm"
            >
              {t("pricing")}
            </Button>
            {session ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-sm"
                >
                  {t("dashboard")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  {t("signOut")}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-sm"
              >
                {t("signIn")}
              </Button>
            )}
            <LocaleSwitcher />
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[250px] bg-zinc-900 border-zinc-800"
            >
              {/* User info and credits section - mobile only */}
              {session && (
                <div className="border-b border-zinc-800 pb-4 mb-4">
                  <div className="flex items-center gap-2 mb-3 px-4 py-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-1 mx-4"
                  >
                    <CreditCard size={16} />
                    <span>
                      {credit?.balance || 0} {t("credits")}
                    </span>
                  </Badge>
                </div>
              )}

              <div className="flex flex-col space-y-4">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/pricing")}
                    className="justify-start"
                  >
                    {t("pricing")}
                  </Button>
                </SheetClose>
                {session ? (
                  <>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation("/dashboard")}
                        className="justify-start"
                      >
                        {t("dashboard")}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="justify-start"
                      >
                        {t("signOut")}
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation("/login")}
                      className="justify-start"
                    >
                      {t("signIn")}
                    </Button>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <LocaleSwitcher />
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className=" py-2 min-h-[calc(100vh-160px)]">{children}</main>
      <footer className="w-full bg-zinc-900 border-t border-zinc-800 px-6 py-3 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-bold text-white">✨ {t("appName")}</span>{" "}
            &mdash;
            {t("tagline")}
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-end text-gray-400">
            <Link href="/privacy" className="hover:text-white transition">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              {t("terms")}
            </Link>

            <Link href="/contact" className="hover:text-white transition">
              {t("contact")}
            </Link>
          </div>
        </div>

        <div className="mt-2 text-center text-xs text-gray-400">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </footer>
    </>
  );
};

export default MainLayout;
