import { Suspense } from "react";
import LoginComponent from "../components/Login";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense>
      <div className="w-full h-screen flex flex-col">
        <div className="absolute top-1 w-full px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-white text-xl font-bold">✨ DocAider</span>
          </Link>
        </div>
        <LoginComponent />
      </div>
    </Suspense>
  );
}
