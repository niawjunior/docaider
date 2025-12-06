
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmptySectionPlaceholderProps {
    className?: string;
    message?: string;
    onClick?: () => void;
}

export function EmptySectionPlaceholder({ 
    className, 
    message = "Add your first item", 
    onClick 
}: EmptySectionPlaceholderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClick}
            className={cn(
                "group relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-12",
                "flex flex-col items-center justify-center text-center gap-4 cursor-pointer",
                "hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200",
                className
            )}
        >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Plus className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                {message}
            </p>
        </motion.div>
    );
}
