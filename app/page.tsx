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
            className="text-4xl md:text-5xl tracking-tight font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "auto 300px",
            }}
          >
            AI-Powered Knowledge Management Platform
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 font-medium leading-relaxed max-w-3xl mx-auto"
          >
            Transform your documents into intelligent knowledge bases with AI
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
                className="text-3xl md:text-4xl font-bold text-white text-center mb-8"
              >
                Powerful Features for Knowledge Management
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                <FeatureCard
                  icon="document"
                  title="Document Intelligence"
                  description="Process and analyze documents with AI."
                  features={[
                    "Document Q&A",
                    "Text Extraction",
                    "Content Analysis",
                  ]}
                />

                <FeatureCard
                  icon="knowledge"
                  title="Knowledge Base Creation"
                  description="Build intelligent knowledge bases from your documents."
                  features={[
                    "Automatic Indexing",
                    "Semantic Search",
                    "Knowledge Extraction",
                  ]}
                />

                <FeatureCard
                  icon="rag"
                  title="Retrieval-Augmented Generation"
                  description="Enhance AI responses with your own knowledge base."
                  features={[
                    "Context-Aware Responses",
                    "Source Attribution",
                    "Factual Grounding",
                  ]}
                />
                <FeatureCard
                  icon="chat"
                  title="Multi-Chat with Memory"
                  description="Create and manage multiple chat sessions with persistent memory."
                  features={[
                    "Multiple Concurrent Chats",
                    "Session-Based Memory",
                    "Context-Aware Responses",
                  ]}
                />
                <FeatureCard
                  icon="vector"
                  title="Vector Database Integration"
                  description="Store and retrieve knowledge using advanced vector embeddings."
                  features={[
                    "Semantic Similarity Search",
                    "Efficient Knowledge Retrieval",
                    "Scalable Document Storage",
                  ]}
                />
                <FeatureCard
                  icon="analytics"
                  title="Knowledge Analytics"
                  description="Gain insights from your knowledge base usage and performance."
                  features={[
                    "Usage Patterns Analysis",
                    "Knowledge Gap Identification",
                    "Relevance Metrics",
                  ]}
                />
              </div>
            </motion.div>
          </section>
        </motion.div>

        <section className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Public Knowledge Bases
            </h2>
            <p className="text-xl text-gray-400 text-center mb-8 max-w-2xl mx-auto">
              Explore public knowledge bases created by our community.
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
                    className="overflow-hidden border-gray-800 bg-gray-950/50 backdrop-blur-sm hover:bg-gray-900/50 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold truncate">
                        {kb.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {kb.description || "No description provided."}
                      </p>
                      {kb.isPublic && (
                        <p className="text-xs mt-2 text-gray-400">
                          Created by {kb.userName}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-800">
                      <div className="text-xs text-gray-400">
                        Updated {formatDistanceToNow(new Date(kb.updatedAt))}{" "}
                        ago
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/knowledge/${kb.id}`)}
                      >
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 border border-dashed border-gray-700 rounded-lg">
                  <Database className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No public knowledge bases yet
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Be the first to create and share a knowledge base!
                  </p>
                  <Button onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
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
                    View All Public Knowledge Bases
                  </Button>
                </div>
              )}

            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mt-16 mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              See what our users are saying about their experience with our
              platform.
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
