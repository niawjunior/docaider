"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import MainLayout from "../components/MainLayout";
import GlobalLoader from "../components/GlobalLoader";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

type UserConfig = {
  language_preference: string;
  theme_preference: string;
};

export default function SettingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { handleSubmit, reset, setValue, watch } = useForm<UserConfig>({
    defaultValues: {
      language_preference: "en",
      theme_preference: "dark",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchUserConfig();
    }
  }, [user, loading, router]);

  const fetchUserConfig = async () => {
    try {
      const response = await fetch("/api/user/config");
      if (!response.ok) throw new Error("Failed to fetch user config");
      const data = await response.json();

      // Set form values from the API response
      if (data) {
        reset({
          language_preference: data.language_preference || "en",
          theme_preference: data.theme_preference || "dark",
        });
      }
    } catch (error) {
      console.error("Error fetching user config:", error);
      toast.error(t("fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserConfig) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/user/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast.success(t("saveSuccess"));
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <MainLayout>
      <div className="px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col md:flex-row items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              {tCommon("backToDashboard")}
            </Button>
            <h1 className="md:text-lg text-md font-bold">{t("title")}</h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Display Settings */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>{t("displaySettings")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("language")}</Label>
                  <Select
                    value={watch("language_preference")}
                    onValueChange={(value) =>
                      setValue("language_preference", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="th">ไทย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("theme")}</Label>
                  <Select
                    value={watch("theme_preference")}
                    onValueChange={(value) =>
                      setValue("theme_preference", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectTheme")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t("light")}</SelectItem>
                      <SelectItem value="dark">{t("dark")}</SelectItem>
                      <SelectItem value="system">{t("system")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? t("saving") : t("saveChanges")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
