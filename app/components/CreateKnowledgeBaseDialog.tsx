"use client";

import { useState } from "react";
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
const FormSchema = z.object({
  name: z.string().min(1, { message: "Knowledge base name is required" }),
  description: z.string().optional(),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

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
  const [isLoading, setIsLoading] = useState(false);

  // Import the useKnowledgeBases hook
  const kbHooks = useKnowledgeBases();

  // Initialize react-hook-form with Zod validation
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

      toast.success("Knowledge base created successfully");
    } catch (error: any) {
      console.error("Error creating knowledge base:", error);
      toast.error(error.message || "Failed to create knowledge base");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Knowledge Base</DialogTitle>
          <DialogDescription>
            Create a new knowledge base to organize your documents and share
            knowledge.
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter knowledge base name"
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this knowledge base is about"
                      disabled={isLoading}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about the purpose and content of this
                    knowledge base.
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
                    <FormLabel>Make Public</FormLabel>
                    <FormDescription>
                      Public knowledge bases can be viewed by anyone
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
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
