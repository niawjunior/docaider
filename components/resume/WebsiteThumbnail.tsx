"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface WebsiteThumbnailProps {
  slug: string;
  className?: string;
}

export function WebsiteThumbnail({ slug, className }: WebsiteThumbnailProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-50 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      <iframe
        src={`/p/${slug}`}
        className="absolute inset-0 w-[400%] h-[400%] scale-[0.25] origin-top-left border-none pointer-events-none z-0 "
        onLoad={() => setLoading(false)}
        tabIndex={-1}
        aria-hidden="true"
        
      />
      {/* Overlay to prevent interaction with iframe content and allow clicking the card */}
      <div className="absolute inset-0 z-10 bg-transparent" />
    </div>
  );
}
