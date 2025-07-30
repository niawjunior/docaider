"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import MainLayout from "../components/MainLayout";
import GlobalLoader from "../components/GlobalLoader";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import useUserConfig from "../hooks/useUserConfig";
import { setUserLocale } from "../utils/locale";

// Define the Zod schema for form validation
const getFormSchema = () =>
  z.object({
    language_preference: z.enum(["en", "th"]),
    theme_preference: z.enum(["light", "dark", "system"]),
  });

type SettingsFormValues = z.infer<ReturnType<typeof getFormSchema>>;

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { setTheme } = useTheme();

  // Use the hook to get and update user config
  const {
    config,
    loading: configLoading,
    updateConfig,
    isUpdating,
  } = useUserConfig(user?.id || "");

  // Initialize form with Zod validation
  const FormSchema = getFormSchema();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      language_preference: "en",
      theme_preference: "system",
    },
  });

  // Use useEffect to update form values when config loads
  useEffect(() => {
    if (config) {
      // Use reset with keepDefaultValues: false to ensure complete reset
      setTimeout(() => {
        form.reset({
          language_preference: config.languagePreference as "en" | "th",
          theme_preference: config.themePreference as
            | "light"
            | "dark"
            | "system",
        });
      }, 100);
    }
  }, [config, form]);

  // Form submission handler
  async function onSubmit(data: SettingsFormValues) {
    try {
      // Use the hook's updateConfig method
      await updateConfig({
        themePreference: data.theme_preference,
        languagePreference: data.language_preference,
      });

      // Apply theme immediately for better UX
      setTheme(data.theme_preference);
      setUserLocale(data.language_preference);

      toast.success(t("saveSuccess"));
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(t("saveError"));
    }
  }

  if (userLoading || configLoading) {
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Display Settings */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>{t("displaySettings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="language_preference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("language")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={form.formState.isSubmitting || isUpdating}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("selectLanguage")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="th">ไทย</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theme_preference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("theme")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={form.formState.isSubmitting || isUpdating}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("selectTheme")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">
                                {t("light")}
                              </SelectItem>
                              <SelectItem value="dark">{t("dark")}</SelectItem>
                              <SelectItem value="system">
                                {t("system")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={
                    isUpdating ||
                    !form.formState.isDirty ||
                    form.formState.isSubmitting
                  }
                  className="flex items-center gap-2"
                >
                  {isUpdating || form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isUpdating || form.formState.isSubmitting
                    ? t("saving")
                    : t("saveChanges")}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
