"use client";

import { motion } from "framer-motion";
import MainLayout from "../components/MainLayout";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");
  return (
    <MainLayout>
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-orange-500">
            {t("title")}
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="mb-8">{t("description")}</p>

            <div className="mt-12">
              <p>
                {t("email")}{" "}
                <a
                  href="mailto:pasupolworks@gmail.com"
                  className="text-orange-500 hover:underline"
                >
                  {t("emailAddress")}
                </a>
              </p>
              <p>
                {t("website")}{" "}
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
