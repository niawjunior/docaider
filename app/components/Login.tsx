"use client";

import { signInWithGoogle } from "../login/action";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Import ShadCN Button

const LoginComponent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url") || "/chat";
  return (
    <div className=" min-h-screen flex items-center justify-center bg-zinc-950 text-white overflow-hidden px-4">
      {/* Login Box */}
      <div className="relative z-10 bg-zinc-800/80 backdrop-blur-lg shadow-xl rounded-2xl p-10 w-full max-w-md border border-zinc-700">
        <div className="text-center mb-6">
          <span className="text-orange-500 font-bold text-3xl">DocAider</span>
          <h1 className="text-2xl font-semibold mt-2">
            Sign in to your account
          </h1>
        </div>

        <form>
          {/* Replace custom button with ShadCN Button */}
          <Button
            type="submit" // Important for form submission behavior
            formAction={() => signInWithGoogle(callbackUrl)}
            variant="outline" // Or other variants like "default", "secondary"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 font-medium text-base"
            // Adjusted padding and font-medium, text-base for similar look.
            // bg-white text-black hover:bg-gray-100 are handled by variant="outline" or other variants.
            // Shadow can be part of a variant or added via className if needed.
          >
            <FcGoogle className="text-xl" />
            Sign in with Google
          </Button>
        </form>

        <p className="text-sm text-zinc-400 mt-6 text-center">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-orange-500 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-orange-500 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginComponent;
