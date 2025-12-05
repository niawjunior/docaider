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
import Image from "next/image";
import { EmbedChatBox } from "docaider-embed";
import { Check } from "lucide-react";

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
  const commonT = useTranslations("common");

  const getPublicKnowledgeBases = kbHooks.getPublicKnowledgeBases;
  const router = useRouter();

  return (
    <MainLayout>
      {/* Background video with enhanced effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
          className="w-full h-full"
        >
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none blur-xs"
            autoPlay
            loop
            muted
            playsInline
            src="/docaider-demo.mp4"
          />
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero content with enhanced animations */}
      <div className="flex-1 px-4 flex flex-col items-center justify-center mt-4 lg:mt-0 py-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="text-center space-y-8 max-w-7xl relative"
        >
          <motion.div className="relative inline-block mx-auto">
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-5xl tracking-tight font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent relative z-10"
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "auto 300px",
              }}
            >
              {t("title")}
            </motion.h1>
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg blur-md -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto"
          >
            {t("subtitle")}
          </motion.p>

          {/* Call to action buttons with hover effects */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/login")}
            >
              {commonT("getStarted")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <section className="relative z-10 mt-16 scroll-mt-16" id="features">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mx-auto"
            >
              {/* Decorative elements */}
              <motion.div
                className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-r from-orange-500/5 to-red-500/5 blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: "easeInOut",
                }}
              />

              {/* Section title with animated underline */}
              <div className="relative mb-12 text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground inline-block">
                  {t("featuresTitle")}
                </h2>
                <motion.div
                  className="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2 mx-auto"
                  initial={{ width: 0 }}
                  whileInView={{ width: "80px" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* Embed Section */}
          <section className="relative z-10 py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="relative mb-8 flex flex-col items-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      {t("embedSection.title")}
                    </h2>
                    <motion.div
                      className="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-24"
                      initial={{ width: 0 }}
                      whileInView={{ width: "96px" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    />
                  </div>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    {t("embedSection.subtitle")}
                  </p>

                  <div className="space-y-4 mb-8">
                    {[
                      t("features.embedFeature.feature1"),
                      t("features.embedFeature.feature2"),
                      t("features.embedFeature.feature3"),
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="text-foreground font-medium">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Decorative background blob */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-red-500/20 rounded-3xl blur-3xl -z-10 transform rotate-6" />

                  <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-h-[600px] relative flex flex-col">
                    {/* Browser Toolbar */}
                    <div className="bg-muted/50 border-b border-border p-4 flex items-center space-x-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                      </div>
                      <div className="flex-1 bg-background rounded-md h-8 flex items-center px-3 text-xs text-muted-foreground border border-border/50">
                        <span className="opacity-50">https://your-awesome-website.com</span>
                      </div>
                    </div>

                    {/* Fake Website Content */}
                    <div className="flex-1 p-8 relative bg-background/50">
                      <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-white/5" />
                      
                      <div className="relative space-y-8 max-w-2xl mx-auto opacity-30 pointer-events-none select-none">
                        {/* Hero Section Mock */}
                        <div className="space-y-4 text-center mt-8">
                          <div className="h-12 bg-foreground/10 rounded-lg w-3/4 mx-auto" />
                          <div className="h-4 bg-foreground/10 rounded w-1/2 mx-auto" />
                        </div>

                        {/* Content Grid Mock */}
                        <div className="grid grid-cols-2 gap-4 mt-12">
                          <div className="space-y-3">
                            <div className="h-40 bg-foreground/5 rounded-lg" />
                            <div className="h-4 bg-foreground/10 rounded w-3/4" />
                            <div className="h-4 bg-foreground/10 rounded w-1/2" />
                          </div>
                          <div className="space-y-3">
                            <div className="h-40 bg-foreground/5 rounded-lg" />
                            <div className="h-4 bg-foreground/10 rounded w-3/4" />
                            <div className="h-4 bg-foreground/10 rounded w-1/2" />
                          </div>
                        </div>
                        
                        {/* Text Block Mock */}
                        <div className="space-y-3 mt-8">
                           <div className="h-4 bg-foreground/10 rounded w-full" />
                           <div className="h-4 bg-foreground/10 rounded w-5/6" />
                           <div className="h-4 bg-foreground/10 rounded w-4/6" />
                        </div>
                      </div>

                      {/* Actual Embed Component */}
                      <EmbedChatBox 
                        knowledgeBaseId="c72b3620-13f3-4b2f-99c2-e34be3f37fe5"
                        theme="blue"
                        position="bottom-right"
                        welcomeMessage="Hi! I'm the Docaider AI assistant. How can I help you today?"
                        src="https://www.docaider.com"
                        chatId="demo-chat"
                        width="400px"
                        height="450px"
                        positionStrategy="absolute"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </motion.div>
        {/* ProductHunt Badge */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex justify-center"
        >
          <a
            href="https://www.producthunt.com/products/docaider?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-docaider"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-90 transition-opacity duration-300"
          >
            <Image
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1008829&theme=light&t=1756029291812"
              alt="Docaider - Transform your documents into an AI knowledge assistant | Product Hunt"
              style={{ width: "250px", height: "54px" }}
              width={250}
              height={54}
            />
          </a>
        </motion.div>

        <section className="relative z-10 py-16 overflow-hidden">
          {/* Decorative elements */}
          <motion.div
            className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: "easeInOut",
            }}
          />

          <div className="max-w-7xl mx-auto px-4">
            {/* Section title with animated underline */}
            <div className="relative mb-12 text-center">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-foreground inline-block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {t("publicKnowledgeBases.title")}
              </motion.h2>
              <motion.div
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mx-auto"
                initial={{ width: 0 }}
                whileInView={{ width: "80px" }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
              />
            </div>

            <motion.p
              className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {t("publicKnowledgeBases.subtitle")}
            </motion.p>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {getPublicKnowledgeBases.isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getPublicKnowledgeBases &&
                getPublicKnowledgeBases.data &&
                getPublicKnowledgeBases.data.length > 0 ? (
                getPublicKnowledgeBases.data
                  .slice(0, 6)
                  .map((kb: any, index: number) => (
                    <motion.div
                      key={kb.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:bg-accent/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl font-bold truncate flex items-center">
                            <motion.div
                              className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3 "
                              initial={{ height: 0 }}
                              whileInView={{ height: 24 }}
                              transition={{
                                delay: 0.2 + index * 0.1,
                                duration: 0.4,
                              }}
                              viewport={{ once: true }}
                            />
                            <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                              {kb.name}
                            </span>
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
                            className="hover:bg-accent/20 transition-all duration-300 hover:scale-105 group"
                            onClick={() => router.push(`/knowledge/${kb.id}`)}
                          >
                            {t("publicKnowledgeBases.explore")}{" "}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
              ) : (
                <div className="col-span-full text-center py-12 border border-dashed border-border rounded-lg">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
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
                  </motion.div>
                </div>
              )}
            </motion.div>

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
                name="Bam"
                role="Student"
                company="N/A"
                avatar="B"
                rating={5}
                content="Docaider has completely transformed how we analyze documents. The AI-powered insights save us hours of manual work every week."
              />
              <TestimonialCard
                name="Chok"
                role="Senior Software Engineer"
                company="N/A"
                avatar="C"
                rating={4}
                content="The knowledge management tools are incredibly intuitive. I can create and query knowledge bases in seconds. The only reason for 4 stars is we'd love to see more advanced RAG features in future updates."
              />
              <TestimonialCard
                name="Niaw"
                role="Software Engineer"
                company="N/A"
                avatar="N"
                rating={5}
                content="Docaider has completely transformed how we analyze documents. The AI-powered insights save us hours of manual work every week."
              />
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
