"use client";
import { motion } from "framer-motion";
import { FaCheck, FaFile } from "react-icons/fa";
import { LuBrain } from "react-icons/lu";
import { CiChat1 } from "react-icons/ci";
import { CiShare2 } from "react-icons/ci";
import { IoLanguageOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

export function FeatureCard({
  icon,
  title,
  description,
  features,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-zinc-800/50 p-4 rounded-2xl backdrop-blur-sm border border-zinc-700 hover:border-orange-500/50 transition-colors h-full flex flex-col"
    >
      <div className="text-md font-bold flex justify-center  items-center text-white gap-2 mb-2 ">
        <div className=" font-bold  flex items-center gap-2">
          {icon === "knowledge" && <LuBrain />}
          {icon === "document" && <FaFile />}
          {icon === "chat" && <CiChat1 />}
          {icon === "share" && <CiShare2 />}
          {icon === "language" && <IoLanguageOutline />}
          {icon === "dashboard" && <LuLayoutDashboard />}
          {title}
        </div>
      </div>
      <p className="text-gray-400 mb-2 text-sm flex-grow">{description}</p>
      <ul className="space-y-2 mt-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-400 text-sm">
            <span className="text-orange-500 mr-2">
              <FaCheck />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
