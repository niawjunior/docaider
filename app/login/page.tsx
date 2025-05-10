"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoginComponent from "../components/Login";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url") || "/chat";
  console.log(callbackUrl);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent callbackUrl={callbackUrl} />
    </Suspense>
  );
}
