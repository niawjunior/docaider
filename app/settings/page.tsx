"use client";

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
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import MainLayout from "../components/MainLayout";
import GlobalLoader from "../components/GlobalLoader";
import { Save, Loader2 } from "lucide-react";
import useUserConfig from "../hooks/useUserConfig";
import { setUserLocale } from "../utils/locale";

// Define the Zod schema for form validation
const getFormSchema = () =>
  z.object({
    language_preference: z.enum(["en", "th"]),
    theme_preference: z.enum(["light", "dark", "system"]),
    use_document: z.boolean().default(false),
  });

// Define the form values type explicitly to avoid TypeScript errors
type SettingsFormValues = {
  language_preference: "en" | "th";
  theme_preference: "light" | "dark" | "system";
  use_document: boolean;
};

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const t = useTranslations("settings");
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
    resolver: zodResolver(FormSchema) as any, // Type assertion to fix TypeScript errors
    defaultValues: {
      language_preference: "en",
      theme_preference: "system",
      use_document: false,
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
          use_document: config.useDocument,
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
        useDocument: data.use_document,
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
            </Card>

            {/* Chat Settings */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>{t("chatSettings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="use_document"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("useDocument")}
                          </FormLabel>
                          <FormDescription>
                            {t("useDocumentDescription")}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.formState.isSubmitting || isUpdating}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="col-span-1 md:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isUpdating}
                className="flex items-center gap-2"
              >
                {form.formState.isSubmitting || isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {form.formState.isSubmitting || isUpdating
                  ? t("saving")
                  : t("saveChanges")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
