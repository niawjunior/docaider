"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { HexColorPicker } from "react-colorful";
import { Copy, Check, Code, ArrowLeft, Edit, Share2, Settings, Save, RefreshCw, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSupabaseSession from "@/app/hooks/useSupabaseSession";
import { useKnowledgeBases } from "@/app/hooks/useKnowledgeBases";
import GlobalLoader from "@/app/components/GlobalLoader";
import MainLayout from "@/app/components/MainLayout";
import { EmbedChatBoxPreview } from "@/app/components/knowledge/EmbedChatBoxPreview";
import { v4 as uuidv4 } from "uuid";

export default function DeployKnowledgeBasePage() {
  const t = useTranslations("EmbedDialog");
  const kbT = useTranslations("knowledgeBase");
  const commonT = useTranslations("common");
  const { session } = useSupabaseSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kbHooks = useKnowledgeBases();

  // State for loading and data
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Local state for embed settings
  const [localAllowEmbedding, setLocalAllowEmbedding] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("instruction"); // Default to instruction
  const [chatId, setChatId] = useState(() => uuidv4());

  // Embed configuration options
  const [embedConfig, setEmbedConfig] = useState({
    primaryColor: "#7C3AED", // Default Docaider purple
    textColor: "#FFFFFF",
    position: "bottom-right",
    welcomeMessage: "Hi there! How can I help you with your questions?",
    buttonIcon: "chat",
    buttonText: "Chat with AI",
    showButtonText: true,
    height: "500px",
    width: "350px",
    title: "AI Assistant",
  });

  // Use React Query hooks for fetching knowledge base
  const {
    data: knowledgeBaseData,
    isLoading: isLoadingKB,
    error: kbError,
  } = kbHooks.useKnowledgeBaseById(params.id);

  // Update state when data is fetched
  useEffect(() => {
    if (knowledgeBaseData) {
      setKnowledgeBase(knowledgeBaseData);
      setLocalAllowEmbedding(knowledgeBaseData.allowEmbedding || false);
      setInstruction(knowledgeBaseData.instruction || "");

      // Update embed config if it exists
      if (
        knowledgeBaseData.embedConfig &&
        Object.keys(knowledgeBaseData.embedConfig).length > 0
      ) {
        setEmbedConfig({
          primaryColor: knowledgeBaseData.embedConfig.primaryColor || "#7C3AED",
          textColor: knowledgeBaseData.embedConfig.textColor || "#FFFFFF",
          position: knowledgeBaseData.embedConfig.position || "bottom-right",
          welcomeMessage:
            knowledgeBaseData.embedConfig.welcomeMessage ||
            "Hi there! How can I help you with your questions?",
          buttonIcon: knowledgeBaseData.embedConfig.buttonIcon || "chat",
          buttonText:
            knowledgeBaseData.embedConfig.buttonText || "Chat with AI",
          showButtonText:
            knowledgeBaseData.embedConfig.showButtonText !== undefined
              ? knowledgeBaseData.embedConfig.showButtonText
              : true,
          height: knowledgeBaseData.embedConfig.height || "500px",
          width: knowledgeBaseData.embedConfig.width || "350px",
          title: knowledgeBaseData.embedConfig.title || "AI Assistant",
        });
      }
      setIsLoading(false);
    }
  }, [knowledgeBaseData]);

  // Handle errors
  useEffect(() => {
    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
      setError("Failed to fetch knowledge base");
      setIsLoading(false);
    }
  }, [kbError]);

  // Handle errors and permission checks
  useEffect(() => {
    if (error) {
      toast.error(error);
      if (error.includes("404") || error.includes("401")) {
        router.push("/dashboard");
      }
    }
  }, [error, router]);

  // Generate embed code based on current settings
  const generateEmbedCode = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const dataAttributes = [
      `data-kb-id="${params.id}"`,
      `data-primary-color="${embedConfig.primaryColor}"`,
      `data-text-color="${embedConfig.textColor}"`,
      `data-position="${embedConfig.position}"`,
      `data-welcome-message="${embedConfig.welcomeMessage}"`,
      `data-button-icon="${embedConfig.buttonIcon}"`,
      `data-button-text="${embedConfig.buttonText}"`,
      `data-title="${embedConfig.title}"`,
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
    setIsSaving(true);
    try {
      // Save embed settings
      const embedResponse = await fetch(`/api/knowledge-bases/${params.id}/embed`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allowEmbedding: localAllowEmbedding,
          embedConfig,
        }),
      });

      if (!embedResponse.ok) {
        throw new Error("Failed to save embed settings");
      }

      // Save instruction
      const instructionResponse = await fetch(`/api/knowledge-base/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instruction,
        }),
      });

      if (!instructionResponse.ok) {
        throw new Error("Failed to save instruction");
      }

      toast.success(t("settingsSaved", { defaultValue: "Settings saved successfully" }));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("errorSavingSettings"));
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading || isLoadingKB) {
    return <GlobalLoader />;
  }

  if (!knowledgeBase) {
    return null;
  }

  // Check if user can edit the knowledge base
  const canEdit = session && session.user.id === knowledgeBase.userId;

  return (
    <MainLayout>
      <div className="px-4">
        <div className="flex flex-col gap-2">
          <div className="flex md:flex-row flex-col gap-2 w-full items-center justify-between">
            <div className="md:flex hidden w-full gap-2 flex-col md:flex-row items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/knowledge/${params.id}`)}
                className="w-full md:w-auto"
              >
                <ArrowLeft size={16} className="mr-2" />
                {commonT("backToKnowledgeBase")}
              </Button>
              <h1 className="md:text-md text-md font-bold">
                {knowledgeBase.name}
              </h1>
            </div>

            {canEdit && (
              <div className="flex md:justify-end justify-between w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="md:hidden "
                >
                  <ArrowLeft size={16} />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/knowledge/${params.id}/edit`)}
                  >
                    <Edit size={16} className="mr-2" />
                    {kbT("edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/knowledge/${params.id}`)}
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
            <h1 className="md:text-md text-md font-bold flex md:hidden">
              {knowledgeBase.name}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t("embedKnowledgeBase")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("embedDescription")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {canEdit && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-embedding"
                        checked={localAllowEmbedding}
                        onCheckedChange={setLocalAllowEmbedding}
                      />
                      <Label htmlFor="allow-embedding">
                        {t("allowEmbedding")}
                      </Label>
                    </div>
                  )}

                  {!knowledgeBase.isPublic && !localAllowEmbedding && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-sm text-yellow-800 dark:text-yellow-300">
                      {t("privateKnowledgeBaseWarning")}
                    </div>
                  )}

                  {(knowledgeBase.isPublic || localAllowEmbedding) && (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="instruction">
                          <Settings className="mr-2 h-4 w-4" />
                          {t("instruction", { defaultValue: "Instruction" })}
                        </TabsTrigger>
                        <TabsTrigger value="code">
                          <Code className="mr-2 h-4 w-4" />
                          {t("embedCode")}
                        </TabsTrigger>
                        <TabsTrigger value="appearance">
                          {t("appearance")}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="instruction" className="space-y-4">
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="instruction">{t("systemInstruction", { defaultValue: "System Instruction" })}</Label>
                            <p className="text-sm text-muted-foreground">
                              {t("instructionHelp", { defaultValue: "Define how your AI assistant should behave, its tone of voice, and any specific rules it should follow." })}
                            </p>
                            <Textarea
                              id="instruction"
                              value={instruction}
                              onChange={(e) => setInstruction(e.target.value)}
                              placeholder={t("instructionPlaceholder", { defaultValue: "You are a helpful assistant..." })}
                              className="min-h-[100px] max-h-[100px] overflow-y-auto text-sm"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="code" className="space-y-4">
                        <div className="mt-4">
                          <Label htmlFor="embed-code">
                            {t("copyCodeBelow")}
                          </Label>
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
                          <Label htmlFor="title">{t("title")}</Label>
                          <Input
                            id="title"
                            value={embedConfig.title}
                            onChange={(e) =>
                              setEmbedConfig({
                                ...embedConfig,
                                title: e.target.value,
                              })
                            }
                            placeholder={t("titlePlaceholder")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="welcome-message">
                            {t("welcomeMessage")}
                          </Label>
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
                                setEmbedConfig({
                                  ...embedConfig,
                                  primaryColor: color,
                                })
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
                                      setEmbedConfig({
                                        ...embedConfig,
                                        position,
                                      })
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

                  {canEdit && (
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/knowledge/${params.id}`)}
                      >
                        {t("cancel")}
                      </Button>
                      <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("saveSettings")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="w-full lg:sticky lg:top-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Preview</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Test your chat widget with current settings
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setChatId(uuidv4())}
                    title="Reset Chat"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-[500px] mx-auto m-auto flex justify-center items-center">
                    <EmbedChatBoxPreview
                      knowledgeBaseId={params.id}
                      src={
                        typeof window !== "undefined"
                          ? window.location.origin
                          : ""
                      }
                      chatId={chatId}
                      chatboxTitle={embedConfig.title}
                      position={embedConfig.position as any}
                      width={embedConfig.width}
                      height={embedConfig.height}
                      welcomeMessage={embedConfig.welcomeMessage}
                      buttonText={embedConfig.buttonText}
                      showButtonText={embedConfig.showButtonText}
                      primaryColor={embedConfig.primaryColor}
                      textColor={embedConfig.textColor}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
