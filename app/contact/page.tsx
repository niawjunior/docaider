"use client";

import { motion } from "framer-motion";
import MainLayout from "../components/MainLayout";

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-orange-500">
            Contact Us
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="mb-8">
              We&apos;d love to hear from you! Whether you have questions,
              feedback, or need support, please use the form below to get in
              touch.
            </p>

            <div className="mt-12">
              <p>
                Email:{" "}
                <a
                  href="mailto:pasupolworks@gmail.com"
                  className="text-orange-500 hover:underline"
                >
                  pasupolworks@gmail.com
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://docaider.com"
                  className="text-orange-500 hover:underline"
                >
                  docaider.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
