import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center relative z-10 animate-bounce-slight">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2 animate-in fade-in duration-500 delay-150 fill-mode-forwards opacity-0">
          <h3 className="text-lg font-semibold text-slate-900">Loading Profile</h3>
          <p className="text-sm text-slate-500">Preparing document...</p>
      </div>
    </div>
  );
}
