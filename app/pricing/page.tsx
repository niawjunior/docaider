"use client";
import { Check } from "lucide-react";
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

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for trying out our platform",
    price: "Free",
    credits: "50",
    features: [
      "50 AI Credits",
      "All Basic Features",
      "Standard Support",
      "Community Access",
    ],
    cta: "Get Started",
    href: "/chat",
    featured: false,
    disabled: false,
  },
  {
    name: "Pro",
    description: "For professionals and small teams",
    price: "$9",
    credits: "500",
    features: [
      "500 AI Credits",
      "All Pro Features",
      "Priority Support",
      "API Access",
      "Team Collaboration",
    ],
    cta: "Coming Soon",
    href: "#",
    featured: true,
    disabled: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Custom",
    credits: "Unlimited",
    features: [
      "Unlimited Credits",
      "All Enterprise Features",
      "24/7 Support",
      "Dedicated Account Manager",
      "Custom Integrations",
      "SLA & Security Review",
    ],
    cta: "Coming Soon",
    href: "/contact",
    featured: false,
    disabled: true,
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white  sm:tracking-tight lg:text-4xl">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Plans for Every Team
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-400">
            Start with 50 free credits. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-5">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`
              relative h-full flex flex-col
              ${plan.featured ? "border-orange-500" : "border-zinc-700"}
              ${plan.disabled ? "opacity-60" : ""}
              transition-all duration-200 hover:border-orange-500/50
            `}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-4">
                  <p className="text-4xl font-bold text-white">
                    {plan.price}
                    <span className="text-base font-normal text-gray-400">
                      {plan.price !== "Free" &&
                        plan.price !== "Custom" &&
                        "/mo"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {plan.credits} credits included
                  </p>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-3 text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                <Button
                  asChild
                  variant="outline"
                  disabled={plan.disabled}
                  className={`
                  w-full py-6 text-lg font-semibold
                  ${
                    plan.featured
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      : "bg-zinc-500"
                  }
                  ${plan.disabled ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                  onClick={
                    plan.disabled ? undefined : () => router.push(plan.href)
                  }
                >
                  <span>{plan.cta}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
