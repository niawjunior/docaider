"use client";

import { signInWithGoogle } from "../login/action";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const LoginComponent = () => {
  const searchParams = useSearchParams();
  let callbackUrl = searchParams.get("callback_url") || searchParams.get("next") || searchParams.get("redirect_to") || "/dashboard";

  // Preserve theme parameter if present
  const theme = searchParams.get("theme");
  if (theme) {
     const separator = callbackUrl.includes("?") ? "&" : "?";
     callbackUrl = `${callbackUrl}${separator}theme=${theme}`;
  }

  const t = useTranslations("login");
  return (
    <div className="h-[calc(100dvh-250px)] flex items-center justify-center text-foreground overflow-hidden px-4">
      {/* Login Box */}
      <div className="relative z-10 bg-card/80 backdrop-blur-lg shadow-xl rounded-2xl p-10 w-full max-w-md border border-border">
        <div className="text-center mb-6">
          <span className="text-orange-500 font-bold text-3xl">Docaider</span>
          <h1 className="text-2xl font-semibold mt-2">{t("title")}</h1>
        </div>

        <form>
          <Button
            formAction={() => signInWithGoogle(callbackUrl)}
            variant="default"
            className="w-full h-12"
          >
            <FcGoogle className="text-xl" />
            {t("signInWithGoogle")}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          {t("bySigningIn")}{" "}
          <Link href="/terms" className="text-orange-500 hover:underline">
            {t("termsOfService")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/privacy" className="text-orange-500 hover:underline">
            {t("privacyPolicy")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginComponent;
