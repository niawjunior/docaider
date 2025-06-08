"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { signOut } from "../login/action";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const { session } = useSupabaseSession();

  return (
    <>
      <div className="h-full w-full px-6 py-4 flex justify-between items-center z-50">
        <div className="flex gap-2 items-center">
          <Link href="/">
            <span className="text-white lg:text-xl text-md font-bold">
              ✨ DocAider
            </span>
          </Link>
        </div>

        <div className="flex gap-1 text-sm text-gray-300">
          <Button
            variant="ghost"
            onClick={() => router.push("/pricing")}
            className="text-sm p-2"
          >
            Pricing
          </Button>
          {session ? (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/chat")}
                className="text-sm p-2"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  signOut().then(() => {
                    window.location.reload();
                  })
                }
                className="text-sm p-2"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-sm p-2"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      <div className="px-4">{children}</div>
      <footer className="w-full bg-zinc-900 border-t border-zinc-800 px-6 py-10 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-bold text-white">✨ DocAider</span> &mdash;
            AI-Powered Document & Data Platform
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-end text-gray-400">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>

            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} DocAider. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default MainLayout;
