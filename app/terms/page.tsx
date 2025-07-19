"use client";

import { motion } from "framer-motion";

import MainLayout from "../components/MainLayout";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="px-4 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-orange-500">
            Terms of Service
          </h1>

          <div className="prose prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using DocAider, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our services.
            </p>

            <h2>2. User Conduct</h2>
            <p>
              You agree to use DocAider only for lawful purposes and in a manner
              consistent with applicable laws and regulations. You may not:
            </p>
            <ul>
              <li>
                Use the service to send spam or unsolicited communications
              </li>
              <li>Attempt to interfere with or disrupt the service</li>
              <li>Use the service to transmit viruses or other harmful code</li>
              <li>Violate any intellectual property rights</li>
            </ul>

            <h2>3. Intellectual Property</h2>
            <p>
              All content on DocAider, including but not limited to text,
              images, and software, is owned by DocAider and protected by
              copyright laws.
            </p>

            <h2>4. User Content</h2>
            <p>
              You retain ownership of any content you submit to DocAider.
              However, by submitting content, you grant DocAider a
              non-exclusive, worldwide, royalty-free license to use, display,
              and distribute your content.
            </p>

            <h2>5. Privacy</h2>
            <p>
              Our privacy policy explains how we collect, use, and protect your
              personal information. Please review our privacy policy for more
              details.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              DocAider is not liable for any damages arising from the use of our
              services, including but not limited to direct, indirect,
              incidental, or consequential damages.
            </p>

            <h2>7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your
              continued use of DocAider after changes are posted constitutes
              acceptance of the modified terms.
            </p>

            <h2>8. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the
              laws of Thailand, without regard to its conflict of law
              principles.
            </p>

            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these terms, please contact us at{" "}
              <a href="/contact" className="text-orange-500 hover:underline">
                pasupolworks@gmail.com
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
