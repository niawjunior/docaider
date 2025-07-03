"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FeatureCard } from "./components/FeatureCard";
import { TestimonialCard } from "./components/TestimonialCard";
import MainLayout from "./components/MainLayout";

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
      <div className="flex-1 flex flex-col items-center justify-center  mt-4 lg:mt-0 py-4">
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
            Transform your documents into intelligent knowledge bases with our
            RAG-powered AI toolkit.
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
          <section className="relative z-10  bg-zinc-900/50">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of professionals who use our platform to save
                time and make better decisions.
              </p>

              <motion.button
                onClick={() => router.push("/chat")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r cursor-pointer from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:shadow-orange-500/30"
              >
                Get Started for Free
              </motion.button>
            </div>
          </section>
        </motion.div>

        <section className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
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
