"use client";

import { motion } from "framer-motion";
import { FeatureCard } from "./components/FeatureCard";
import { TestimonialCard } from "./components/TestimonialCard";
import MainLayout from "./components/MainLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useKnowledgeBases } from "./hooks/useKnowledgeBases";
import { useTranslations } from "next-intl";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.8,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  const kbHooks = useKnowledgeBases();
  const t = useTranslations("home");

  const getPublicKnowledgeBases = kbHooks.getPublicKnowledgeBases;
  const router = useRouter();

  return (
    <MainLayout>
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none blur-xs"
        autoPlay
        loop
        muted
        playsInline
        src="/docaider-demo.mp4" // Replace with your actual video path
      />
      <div className="flex-1 px-4 flex flex-col items-center justify-center  mt-4 lg:mt-0 py-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="text-center space-y-8 max-w-7xl relative"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-5xl tracking-tight font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "auto 300px",
            }}
          >
            {t("title")}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto"
          >
            {t("subtitle")}
          </motion.p>
          <section className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className=" mx-auto "
            >
              <h2
                id="features"
                className="text-2xl md:text-4xl font-bold text-foreground text-center mb-8"
              >
                {t("featuresTitle")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                <FeatureCard
                  icon="knowledge"
                  title={t("features.knowledgeManagement.title")}
                  description={t("features.knowledgeManagement.description")}
                  features={[
                    t("features.knowledgeManagement.feature1"),
                    t("features.knowledgeManagement.feature2"),
                    t("features.knowledgeManagement.feature3"),
                  ]}
                />

                <FeatureCard
                  icon="document"
                  title={t("features.documentProcessing.title")}
                  description={t("features.documentProcessing.description")}
                  features={[
                    t("features.documentProcessing.feature1"),
                    t("features.documentProcessing.feature2"),
                    t("features.documentProcessing.feature3"),
                  ]}
                />

                <FeatureCard
                  icon="chat"
                  title={t("features.aiChat.title")}
                  description={t("features.aiChat.description")}
                  features={[
                    t("features.aiChat.feature1"),
                    t("features.aiChat.feature2"),
                    t("features.aiChat.feature3"),
                  ]}
                />
                <FeatureCard
                  icon="share"
                  title={t("features.sharing.title")}
                  description={t("features.sharing.description")}
                  features={[
                    t("features.sharing.feature1"),
                    t("features.sharing.feature2"),
                    t("features.sharing.feature3"),
                  ]}
                />
                <FeatureCard
                  icon="language"
                  title={t("features.multiLanguage.title")}
                  description={t("features.multiLanguage.description")}
                  features={[
                    t("features.multiLanguage.feature1"),
                    t("features.multiLanguage.feature2"),
                    t("features.multiLanguage.feature3"),
                  ]}
                />
                <FeatureCard
                  icon="dashboard"
                  title={t("features.userDashboard.title")}
                  description={t("features.userDashboard.description")}
                  features={[
                    t("features.userDashboard.feature1"),
                    t("features.userDashboard.feature2"),
                    t("features.userDashboard.feature3"),
                  ]}
                />
              </div>
            </motion.div>
          </section>
        </motion.div>

        <section className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
              {t("publicKnowledgeBases.title")}
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              {t("publicKnowledgeBases.subtitle")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {getPublicKnowledgeBases.isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getPublicKnowledgeBases &&
                getPublicKnowledgeBases.data &&
                getPublicKnowledgeBases.data.length > 0 ? (
                getPublicKnowledgeBases.data.slice(0, 6).map((kb: any) => (
                  <Card
                    key={kb.id}
                    className="overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:bg-accent/10 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold truncate">
                        {kb.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-[80px]">
                      <p className="text-sm text-foreground line-clamp-2">
                        {kb.description ||
                          t("publicKnowledgeBases.noDescription")}
                      </p>
                      {kb.isPublic && (
                        <p className="text-xs mt-2 text-muted-foreground">
                          {t("publicKnowledgeBases.createdBy", {
                            name: kb.userName,
                          })}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {t("publicKnowledgeBases.updatedAgo", {
                          time: formatDistanceToNow(new Date(kb.updatedAt)),
                        })}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/knowledge/${kb.id}`)}
                      >
                        {t("publicKnowledgeBases.explore")}{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 border border-dashed border-border rounded-lg">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    {t("publicKnowledgeBases.noKnowledgeBases")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("publicKnowledgeBases.beFirst")}
                  </p>
                  <Button onClick={() => router.push("/dashboard")}>
                    {t("publicKnowledgeBases.goToDashboard")}
                  </Button>
                </div>
              )}
            </div>

            {getPublicKnowledgeBases &&
              getPublicKnowledgeBases.data &&
              getPublicKnowledgeBases.data.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard?tab=public")}
                  >
                    {t("publicKnowledgeBases.viewAll")}
                  </Button>
                </div>
              )}

            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mt-16 mb-4">
              {t("testimonials.title")}
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("testimonials.subtitle")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TestimonialCard
                name="Sarah Johnson"
                role="Data Analyst"
                company="TechCorp"
                avatar="SJ"
                rating={5}
                content="DocAider has completely transformed how we analyze documents. The AI-powered insights save us hours of manual work every week."
              />
              <TestimonialCard
                name="Michael Chen"
                role="Product Manager"
                company="InnoTech"
                avatar="MC"
                rating={4}
                content="The knowledge management tools are incredibly intuitive. I can create and query knowledge bases in seconds. The only reason for 4 stars is we'd love to see more advanced RAG features in future updates."
              />
              <TestimonialCard
                name="Emily Rodriguez"
                role="Researcher"
                company="Global Insights"
                avatar="ER"
                rating={5}
                content="The document intelligence features are game-changing. It's like having a research assistant that works 24/7. The accuracy is impressive!"
              />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <TestimonialCard
                name="Sofia Nguyen"
                role="Product Manager"
                company="Acme AI"
                avatar="SN"
                content="I love how I can juggle multiple conversations and each one remembers its context. It feels like having several smart assistants at once."
                rating={5}
              />
              <TestimonialCard
                name="Priya Patel"
                role="Content Strategist"
                company="ContentMint"
                avatar="PP"
                content="The knowledge base creation and RAG features have streamlined our research process significantly. Highly recommended!"
                rating={5}
              />
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
