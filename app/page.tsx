"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import useSupabaseSession from "./hooks/useSupabaseSession";
import Link from "next/link";
import { signOut } from "./login/action";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "./components/FeatureCard";

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

  const { session } = useSupabaseSession();

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="absolute top-0 w-full px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="text-white text-xl font-bold">✨ DocAider</span>
        </Link>
        <div className="flex gap-4 text-sm text-gray-300">
          {session ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/chat")}>
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  signOut().then(() => {
                    window.location.reload();
                  })
                }
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none blur-xs"
        autoPlay
        loop
        muted
        playsInline
        src="/docaider-demo.mp4" // Replace with your actual video path
      />
      <div className="flex-1 flex flex-col items-center justify-center px-4 mt-12 lg:mt-0 py-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="text-center space-y-8 max-w-4xl relative"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:mt-10 mt-6 md:text-5xl tracking-tight font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
          >
            AI-Powered Document & Data Platform
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-gray-300">
            Transform documents, analyze data, and get insights with our
            comprehensive AI toolkit.
          </motion.p>
          <section className="relative z-10 px-6 ">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
                Powerful Features for Your Data Needs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon="data"
                  title="Data Visualization"
                  description="Create beautiful bar and pie charts from your data with simple prompts."
                  features={[
                    "Generate Bar Charts",
                    "Create Pie Charts",
                    "Interactive Visualizations",
                  ]}
                />

                <FeatureCard
                  icon="document"
                  title="Document Intelligence"
                  description="Process and analyze documents with advanced AI capabilities."
                  features={[
                    "Document Q&A",
                    "Text Extraction",
                    "Content Analysis",
                  ]}
                />

                <FeatureCard
                  icon="crypto"
                  title="Market Data"
                  description="Get real-time cryptocurrency market data and price information."
                  features={[
                    "Crypto Prices",
                    "Market Summaries",
                    "Trend Analysis",
                  ]}
                />

                <FeatureCard
                  icon="web"
                  title="Web Search"
                  description="Find and extract information from the web with AI-powered search."
                  features={[
                    "Web Search",
                    "Content Extraction",
                    "Data Collection",
                  ]}
                />

                <FeatureCard
                  icon="weather"
                  title="Weather Data"
                  description="Get accurate weather information for any location."
                  features={[
                    "Current Conditions",
                    "Forecasts",
                    "Location-based Data",
                  ]}
                />

                <FeatureCard
                  icon="tts"
                  title="Text-to-Speech"
                  description="Convert text into natural-sounding speech."
                  features={[
                    "AI Voice Generation",
                    "Multiple Languages",
                    "Customizable Voices",
                  ]}
                />
              </div>
            </motion.div>
          </section>
          <section className="relative z-10 px-6  bg-zinc-900/50">
            <div className="max-w-4xl mx-auto text-center">
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
      </div>
      <footer className="w-full bg-zinc-900 border-t border-zinc-800 px-6 py-10 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-bold text-white">✨ DocAider</span> &mdash;
            Turn text into stunning visualizations.
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-end text-gray-400">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>

            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} DocAider. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
