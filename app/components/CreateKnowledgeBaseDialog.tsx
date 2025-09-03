"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useKnowledgeBases } from "../hooks/useKnowledgeBases";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the Zod schema for form validation
const getFormSchema = (t: any) =>
  z.object({
    name: z.string().min(1, { message: t("knowledgeBase.nameRequired") }),
    description: z.string().optional(),
    isPublic: z.boolean(),
  });

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

interface CreateKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function CreateKnowledgeBaseDialog({
  open,
  onOpenChange,
  userId,
}: CreateKnowledgeBaseDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  // Import the useKnowledgeBases hook
  const kbHooks = useKnowledgeBases();

  // Initialize react-hook-form with Zod validation
  const FormSchema = getFormSchema(t);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  // Form submission handler using react-hook-form
  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      // Use the createKnowledgeBase mutation from our hook
      await kbHooks.createKnowledgeBase.mutateAsync({
        name: data.name,
        description: data.description || "",
        isPublic: data.isPublic,
        userId,
      });

      // Reset form
      form.reset();

      // Close dialog
      onOpenChange(false);

      toast.success(t("knowledgeBase.createdSuccess"));
    } catch (error: any) {
      console.error("Error creating knowledge base:", error);
      toast.error(error.message || t("knowledgeBase.createError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-3">
        <DialogHeader>
          <DialogTitle>{t("knowledgeBase.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("knowledgeBase.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("knowledgeBase.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("knowledgeBase.namePlaceholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("knowledgeBase.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("knowledgeBase.descriptionPlaceholder")}
                      disabled={isLoading}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("knowledgeBase.descriptionHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t("knowledgeBase.makePublic")}</FormLabel>
                    <FormDescription>
                      {t("knowledgeBase.publicDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("knowledgeBase.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
