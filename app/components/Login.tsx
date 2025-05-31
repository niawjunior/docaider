"use client";

import { signInWithGoogle } from "../login/action";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <Button
            formAction={() => signInWithGoogle(callbackUrl)}
            variant="default"
            className="w-full h-12"
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
