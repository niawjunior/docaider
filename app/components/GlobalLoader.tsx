"use client";

// components/GlobalLoader.tsx
import { Loader2 } from "lucide-react";

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    </div>
  );
}
