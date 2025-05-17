"use client";

// components/GlobalLoader.tsx
export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );
}
