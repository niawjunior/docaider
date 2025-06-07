"use client";
import { motion } from "framer-motion";
import { Coins, VolumeIcon } from "lucide-react";
import { FaCheck, FaFile } from "react-icons/fa";
import { FaCloud, FaChartBar } from "react-icons/fa6";
import { TbWorld } from "react-icons/tb";
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
          {icon === "data" && <FaChartBar />}
          {icon === "document" && <FaFile />}
          {icon === "web" && <TbWorld />}
          {icon === "tts" && <VolumeIcon />}
          {icon === "weather" && <FaCloud />}
          {icon === "crypto" && <Coins />}
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
