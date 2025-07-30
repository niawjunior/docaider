"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Loader2 } from "lucide-react";
import { locales, type Locale } from "../../i18n/config";
import { setUserLocale } from "@/app/utils/locale";
import { startTransition } from "react";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import useUserConfig from "../hooks/useUserConfig";

const localeNames: Record<Locale, string> = {
  en: "English",
  th: "ไทย",
};

const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  th: "🇹🇭",
};

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const { session } = useSupabaseSession();
  const settingsT = useTranslations("settings");
  const theme = useTheme();
  const { updateConfig, isUpdating } = useUserConfig(session?.user?.id || "");

  const handleLocaleChange = async (newLocale: Locale) => {
    const locale = newLocale as Locale;
    startTransition(async () => {
      // Apply locale change immediately for better UX
      setUserLocale(locale);

      if (session?.user) {
        try {
          // Use the hook's updateConfig method
          await updateConfig({
            languagePreference: locale,
            themePreference: theme.theme as "system" | "light" | "dark",
          });

          toast.success(settingsT("saveSuccess"));
        } catch (error) {
          toast.error(settingsT("saveError"));
          console.error("Failed to update settings:", error);
        }
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isUpdating}
        >
          {!isUpdating && (
            <>
              <Globe className="h-4 w-4" />
            </>
          )}
          {isUpdating && <Loader2 className="animate-spin" />}
          <span className="hidden sm:inline">
            {localeFlags[locale]} {localeNames[locale]}
          </span>
          <span className="sm:hidden">{localeFlags[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`flex items-center gap-2 ${
              loc === locale ? "bg-accent" : ""
            }`}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
            {loc === locale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
