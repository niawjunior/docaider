"use client";

import { motion } from "framer-motion";
import MainLayout from "../components/MainLayout";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("privacy");
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
            <h2>{t("informationCollect.title")}</h2>
            <p>{t("informationCollect.description")}</p>
            <ul>
              {(t.raw("informationCollect.items") as string[]).map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>

            <h2>{t("informationUse.title")}</h2>
            <p>{t("informationUse.description")}</p>
            <ul>
              {(t.raw("informationUse.items") as string[]).map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>

            <h2>{t("dataSecurity.title")}</h2>
            <p>{t("dataSecurity.description")}</p>

            <h2>{t("yourRights.title")}</h2>
            <p>{t("yourRights.description")}</p>
            <ul>
              {(t.raw("yourRights.items") as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>{t("thirdParty.title")}</h2>
            <p>{t("thirdParty.description")}</p>

            <h2>{t("changes.title")}</h2>
            <p>{t("changes.description")}</p>

            <h2>{t("contact.title")}</h2>
            <p>
              {t("contact.description")}{" "}
              <a
                href="mailto:pasupolworks@gmail.com"
                className="text-orange-500 hover:underline"
              >
                {t("contact.email")}
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
