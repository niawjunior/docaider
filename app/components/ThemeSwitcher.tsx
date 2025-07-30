"use client";

import * as React from "react";
import { Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Locale, useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSupabaseSession from "../hooks/useSupabaseSession";
import { toast } from "sonner";
import useUserConfig from "../hooks/useUserConfig";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const t = useTranslations("common");
  const settingsT = useTranslations("settings");
  const { session } = useSupabaseSession();
  const locale = useLocale() as Locale;
  const { updateConfig, isUpdating } = useUserConfig(session?.user?.id || "");

  const handleThemeChange = async (theme: string) => {
    // Apply theme immediately for better UX
    setTheme(theme);

    if (session?.user) {
      try {
        // Use the hook's updateConfig method
        await updateConfig({
          themePreference: theme as "system" | "light" | "dark",
          languagePreference: locale as "en" | "th",
        });

        toast.success(settingsT("saveSuccess"));
      } catch (error) {
        toast.error(settingsT("saveError"));
        console.error("Failed to update settings:", error);
      }
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating}>
          {!isUpdating && (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </>
          )}
          <span className="sr-only">{t("selectTheme")}</span>
          {isUpdating && <Loader2 className="animate-spin" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
