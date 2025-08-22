"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { HexColorPicker } from "react-colorful";
import { Copy, Check, Code } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBaseId: string;
  isPublic: boolean;
  allowEmbedding: boolean;
  embedConfig?: Record<string, any>;
}

export default function EmbedDialog({
  open,
  onOpenChange,
  knowledgeBaseId,
  isPublic,
  allowEmbedding,
  embedConfig: initialEmbedConfig = {},
}: EmbedDialogProps) {
  const t = useTranslations("EmbedDialog");

  // Local state for embed settings
  const [localAllowEmbedding, setLocalAllowEmbedding] =
    useState(allowEmbedding);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("code");

  // Embed configuration options
  const [embedConfig, setEmbedConfig] = useState({
    primaryColor: initialEmbedConfig.primaryColor || "#7C3AED", // Default Docaider purple
    textColor: initialEmbedConfig.textColor || "#FFFFFF",
    position: initialEmbedConfig.position || "bottom-right",
    welcomeMessage:
      initialEmbedConfig.welcomeMessage ||
      "Hi there! How can I help you with your questions?",
    buttonIcon: initialEmbedConfig.buttonIcon || "chat",
    buttonText: initialEmbedConfig.buttonText || "Chat with AI",
    showButtonText:
      initialEmbedConfig.showButtonText !== undefined
        ? initialEmbedConfig.showButtonText
        : true,
    height: initialEmbedConfig.height || "500px",
    width: initialEmbedConfig.width || "350px",
  });

  // Update local state when props change
  useEffect(() => {
    setLocalAllowEmbedding(allowEmbedding);

    // Update embed config if initialEmbedConfig changes
    if (initialEmbedConfig && Object.keys(initialEmbedConfig).length > 0) {
      setEmbedConfig({
        primaryColor: initialEmbedConfig.primaryColor || "#7C3AED",
        textColor: initialEmbedConfig.textColor || "#FFFFFF",
        position: initialEmbedConfig.position || "bottom-right",
        welcomeMessage:
          initialEmbedConfig.welcomeMessage ||
          "Hi there! How can I help you with your questions?",
        buttonIcon: initialEmbedConfig.buttonIcon || "chat",
        buttonText: initialEmbedConfig.buttonText || "Chat with AI",
        showButtonText:
          initialEmbedConfig.showButtonText !== undefined
            ? initialEmbedConfig.showButtonText
            : true,
        height: initialEmbedConfig.height || "500px",
        width: initialEmbedConfig.width || "350px",
      });
    }
  }, [allowEmbedding, initialEmbedConfig]);

  // Generate embed code based on current settings
  const generateEmbedCode = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const dataAttributes = [
      `data-kb-id="${knowledgeBaseId}"`,
      `data-primary-color="${embedConfig.primaryColor}"`,
      `data-text-color="${embedConfig.textColor}"`,
      `data-position="${embedConfig.position}"`,
      `data-welcome-message="${embedConfig.welcomeMessage}"`,
      `data-button-icon="${embedConfig.buttonIcon}"`,
      `data-button-text="${embedConfig.buttonText}"`,
      `data-show-button-text="${embedConfig.showButtonText}"`,
      `data-height="${embedConfig.height}"`,
      `data-width="${embedConfig.width}"`,
    ].join(" ");

    return `<script src="${origin}/embed.js" ${dataAttributes}></script>`;
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    toast.success(t("codeCopied"));

    setTimeout(() => setCopied(false), 2000);
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      const response = await fetch(
        `/api/knowledge-bases/${knowledgeBaseId}/embed`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allowEmbedding: localAllowEmbedding,
            embedConfig,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save embed settings");
      }

      toast.success(t("embedSettingsSaved"));
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving embed settings:", error);
      toast.error(t("errorSavingSettings"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("embedKnowledgeBase")}</DialogTitle>
          <DialogDescription>{t("embedDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <Switch
            id="allow-embedding"
            checked={localAllowEmbedding}
            onCheckedChange={setLocalAllowEmbedding}
          />
          <Label htmlFor="allow-embedding">{t("allowEmbedding")}</Label>
        </div>

        {!isPublic && !localAllowEmbedding && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-sm text-yellow-800 dark:text-yellow-300">
            {t("privateKnowledgeBaseWarning")}
          </div>
        )}

        {(isPublic || localAllowEmbedding) && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">
                <Code className="mr-2 h-4 w-4" />
                {t("embedCode")}
              </TabsTrigger>
              <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4">
              <div className="mt-4">
                <Label htmlFor="embed-code">{t("copyCodeBelow")}</Label>
                <div className="relative mt-1">
                  <Input
                    id="embed-code"
                    value={generateEmbedCode()}
                    readOnly
                    className="pr-10 font-mono text-xs h-auto py-2"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("addCodeToWebsite")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-message">{t("welcomeMessage")}</Label>
                <Input
                  id="welcome-message"
                  value={embedConfig.welcomeMessage}
                  onChange={(e) =>
                    setEmbedConfig({
                      ...embedConfig,
                      welcomeMessage: e.target.value,
                    })
                  }
                  placeholder={t("welcomeMessagePlaceholder")}
                />
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("primaryColor")}</Label>
                  <HexColorPicker
                    color={embedConfig.primaryColor}
                    onChange={(color) =>
                      setEmbedConfig({ ...embedConfig, primaryColor: color })
                    }
                  />
                  <Input
                    value={embedConfig.primaryColor}
                    onChange={(e) =>
                      setEmbedConfig({
                        ...embedConfig,
                        primaryColor: e.target.value,
                      })
                    }
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("position")}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "bottom-right",
                        "bottom-left",
                        "top-right",
                        "top-left",
                      ].map((position) => (
                        <Button
                          key={position}
                          type="button"
                          variant={
                            embedConfig.position === position
                              ? "default"
                              : "outline"
                          }
                          className="justify-center"
                          onClick={() =>
                            setEmbedConfig({ ...embedConfig, position })
                          }
                        >
                          {t(position)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("buttonText")}</Label>
                    <Input
                      value={embedConfig.buttonText}
                      onChange={(e) =>
                        setEmbedConfig({
                          ...embedConfig,
                          buttonText: e.target.value,
                        })
                      }
                      placeholder={t("buttonTextPlaceholder")}
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="show-button-text"
                        checked={embedConfig.showButtonText}
                        onCheckedChange={(checked) =>
                          setEmbedConfig({
                            ...embedConfig,
                            showButtonText: !!checked,
                          })
                        }
                      />
                      <Label htmlFor="show-button-text">
                        {t("showButtonText")}
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("size")}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="width" className="text-xs">
                          {t("width")}
                        </Label>
                        <Input
                          id="width"
                          value={embedConfig.width}
                          onChange={(e) =>
                            setEmbedConfig({
                              ...embedConfig,
                              width: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-xs">
                          {t("height")}
                        </Label>
                        <Input
                          id="height"
                          value={embedConfig.height}
                          onChange={(e) =>
                            setEmbedConfig({
                              ...embedConfig,
                              height: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSaveSettings}>{t("saveSettings")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
