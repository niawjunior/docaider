import { motion } from "framer-motion";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number; // Add rating prop (1-5)
}

export function TestimonialCard({
  name,
  role,
  company,
  content,
  avatar,
  rating = 5, // Default to 5 stars
}: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-zinc-800/50 p-6 rounded-2xl backdrop-blur-sm border border-zinc-700 hover:border-orange-500/30 transition-colors h-full flex flex-col"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-xl font-bold text-orange-500 mr-4">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold text-white">{name}</h4>
          <p className="text-sm text-gray-400">
            {role} at {company}
          </p>
        </div>
      </div>
      <p className="text-gray-300 flex-grow">&quot;{content}&quot;</p>
      <div className="mt-4 flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "fill-current" : "fill-gray-700"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </motion.div>
  );
}
