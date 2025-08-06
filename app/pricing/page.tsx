"use client";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import MainLayout from "../components/MainLayout";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import useSupabaseSession from "../hooks/useSupabaseSession";

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  credits: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
  disabled: boolean;
  stripePriceId?: string;
}

const getPricingPlans = (
  t: ReturnType<typeof useTranslations>
): PricingPlan[] => [
  {
    name: t("plans.starter.name"),
    description: t("plans.starter.description"),
    price: t("plans.starter.price"),
    credits: t("plans.starter.credits"),
    features: t.raw("plans.starter.features") as string[],
    cta: t("plans.starter.cta"),
    href: "/dashboard",
    featured: false,
    disabled: false,
    stripePriceId: "price_free", // Free plan doesn't need a real Stripe price ID
  },
  {
    name: t("plans.pro.name"),
    description: t("plans.pro.description"),
    price: t("plans.pro.price"),
    credits: t("plans.pro.credits"),
    features: t.raw("plans.pro.features") as string[],
    cta: t("plans.pro.cta"),
    href: "#",
    featured: true,
    disabled: false, // Enable the Pro plan
    stripePriceId: "price_1OvXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual Stripe Price ID
  },
  {
    name: t("plans.enterprise.name"),
    description: t("plans.enterprise.description"),
    price: t("plans.enterprise.price"),
    credits: t("plans.enterprise.credits"),
    features: t.raw("plans.enterprise.features") as string[],
    cta: t("plans.enterprise.cta"),
    href: "#",
    featured: false,
    disabled: true, // Enable the Enterprise plan
    stripePriceId: "price_1OvXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual Stripe Price ID
  },
];

export default function PricingPage() {
  const router = useRouter();
  const t = useTranslations("pricing");
  const commonT = useTranslations("common");
  const supabase = useSupabaseSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const pricingPlans = getPricingPlans(t);

  const handleCheckout = async (plan: PricingPlan) => {
    // Free plan - redirect to dashboard
    if (plan.price === t("plans.starter.price")) {
      router.push("/dashboard");
      return;
    }

    // Enterprise plan - redirect to contact
    if (plan.price === t("plans.enterprise.price")) {
      router.push("/contact");
      return;
    }

    if (!supabase?.session?.user) {
      toast.error(t("loginRequired"), {
        description: t("pleaseLoginToSubscribe"),
      });
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    try {
      setIsLoading(plan.name);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planName: plan.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(t("checkoutError"), {
        description: error.message || t("somethingWentWrong"),
      });
      setIsLoading(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-foreground  sm:tracking-tight lg:text-4xl">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {t("title")}
            </span>{" "}
            {t("plansForEveryTeam")}
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-muted-foreground">
            {t("startWithFreeCredits")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-5">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`
              relative h-full flex flex-col
              ${plan.featured ? "border-orange-500" : "border-border"}
              ${plan.disabled ? "opacity-60" : ""}
              transition-all duration-200 hover:border-orange-500/50
            `}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {t("mostPopular")}
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-4">
                  <p className="text-4xl font-bold text-foreground">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      {plan.price !== t("plans.starter.price") &&
                        plan.price !== t("plans.enterprise.price") &&
                        t("perMonth")}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.credits} {t("creditsIncluded")}
                  </p>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-3 text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                <Button
                  variant="outline"
                  disabled={plan.disabled || isLoading === plan.name}
                  className={`
                  w-full py-6 text-lg font-semibold
                  ${
                    plan.featured
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      : "bg-muted"
                  }
                  ${plan.disabled ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                  onClick={() => handleCheckout(plan)}
                >
                  {isLoading === plan.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {commonT("loading")}
                    </>
                  ) : (
                    <span>{plan.cta}</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
