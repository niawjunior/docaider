import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatConfig } from "../types";

interface ChatButtonProps {
  isOpen: boolean;
  config: ChatConfig;
  onToggle: () => void;
}

export function ChatButton({ isOpen, config, onToggle }: ChatButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex justify-end"
    >
      <button
        onClick={onToggle}
        className={`shadow-lg ${
          config.appearance?.showButtonText
            ? "rounded-lg px-4 py-2"
            : "rounded-full"
        } flex items-center justify-center transition-opacity hover:opacity-90 border-none outline-none`}
        style={{
          backgroundColor: config.theme?.primaryColor,
          color: config.theme?.textColor,
          width: config.appearance?.showButtonText
            ? "auto"
            : config.appearance?.iconSize,
          height: config.appearance?.showButtonText
            ? "auto"
            : config.appearance?.iconSize,
          fontFamily: config.theme?.fontFamily,
        }}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {config.appearance?.showButtonText && (
              <span className="font-medium">
                {config.appearance?.buttonText}
              </span>
            )}
          </div>
        )}
      </button>
    </motion.div>
  );
}
