"use client";

import { motion } from "framer-motion";
import { GoHomeFill } from "react-icons/go";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
        >
          <GoHomeFill /> Home
        </Link>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-orange-500">
            Privacy Policy
          </h1>

          <div className="prose prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect certain information when you use DocAider, including:
            </p>
            <ul>
              <li>Personal information (name, email) when you sign up</li>
              <li>Chat history and interactions</li>
              <li>Document processing data</li>
              <li>Usage statistics and analytics</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Process your documents and generate insights</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Analyze usage patterns to enhance our platform</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>
              We implement security measures to protect your information from
              unauthorized access, disclosure, or alteration. Your chat history
              and document content are encrypted and stored securely.
            </p>

            <h2>4. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Request corrections or updates</li>
              <li>Delete your account and data</li>
              <li>Opt-out of certain communications</li>
            </ul>

            <h2>5. Third-Party Services</h2>
            <p>
              We may use third-party services (like OpenAI and Supabase) to
              provide our services. These services have their own privacy
              policies and terms of service.
            </p>

            <h2>6. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes
              will be posted here and take effect immediately.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about our privacy practices, please
              contact us at{" "}
              <a href="/contact" className="text-orange-500 hover:underline">
                privacy@docaider.com
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
