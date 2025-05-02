"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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
    <div className="w-full h-screen flex flex-col">
      <div className="absolute top-0 w-full px-6 py-4 flex justify-between items-center">
        <span className="text-white text-xl font-bold">
          ✨ AI Visualization
        </span>
        <div className="flex gap-4 text-sm text-gray-300">
          <a href="/docs">Docs</a>
          <a href="/login" className="hover:text-white">
            Sign In
          </a>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 mt-12 lg:mt-0">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="text-center space-y-8 max-w-4xl relative"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl tracking-tight font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
          >
            AI-Powered Visualization
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-gray-300">
            Describe your data in plain language. We’ll turn it into stunning,
            interactive charts – automatically.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-4 text-gray-400 text-sm text-center"
          >
            No datasets. No manual setup. Just type what you want to see — and
            let AI do the rest.
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={() => router.push("/dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:shadow-orange-500/30"
            >
              Get Started
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-zinc-800/50 p-6 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-orange-500 mb-2">
                Real-Time Visualization
              </h3>
              <p className="text-gray-400">
                Get instant insights from your data with our AI-powered
                visualization.
              </p>
            </div>
            <div className="bg-zinc-800/50 p-6 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-orange-500 mb-2">
                Smart Visualization
              </h3>
              <p className="text-gray-400">
                Our AI detects patterns and provides actionable recommendations.
              </p>
            </div>
            <div className="bg-zinc-800/50 p-6 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-orange-500 mb-2">
                Data Visualization
              </h3>
              <p className="text-gray-400">
                Transform complex data into beautiful, interactive
                visualizations.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
