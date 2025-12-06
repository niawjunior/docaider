"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Wand2 } from "lucide-react";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onUploadSuccess: (data: ResumeData) => void;
  isLoading?: boolean;
}

export function ResumeUploader({ onUploadSuccess, isLoading: externalLoading }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);

  const parseResume = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to parse resume");
      return res.json() as Promise<ResumeData>;
    },
    onSuccess: async (data) => {
      // Always enforce default cover image, ignoring AI hallucination
      data.coverImage = "/images/cover.png";
      onUploadSuccess(data);
    },
    onError: (error) => {
      toast.error("Failed to parse resume. Please try again.");
      console.error(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      parseResume.mutate(file);
    }
  };

  const isLoading = externalLoading || parseResume.isPending;

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center">
        <Upload className="w-12 h-12 text-blue-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">
          Build your Resume
        </h2>
        <p className="text-slate-400 max-w-md text-lg">
          Upload your existing PDF or Word resume to get started, or create one from scratch.
        </p>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors p-6 space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                  <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-slate-200">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500">PDF, DOCX (MAX. 5MB)</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11"
              onClick={handleUpload}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Import & Edit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
