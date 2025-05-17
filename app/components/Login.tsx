"use client";

import { signInWithGoogle } from "../login/action";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

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
          <button
            formAction={() => signInWithGoogle(callbackUrl)}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-4 rounded-lg shadow hover:bg-gray-100 transition font-medium"
          >
            <FcGoogle className="text-xl" />
            Sign in with Google
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-6 text-center">
          By signing in, you agree to our{" "}
          <a href="#" className="text-orange-500 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-orange-500 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginComponent;
