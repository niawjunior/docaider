
"use client";

import { useEffect, useState } from "react";
import { getUserResumes, deleteResume } from "@/app/actions/resume";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, Monitor, Edit, Trash2, ExternalLink } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await getUserResumes();
      setResumes(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Website deleted successfully");
    } catch (error) {
      toast.error("Failed to delete website");
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleEdit = (resume: any) => {
    // Load resume into local storage draft then navigate
    localStorage.setItem("resume_draft", JSON.stringify(resume.content));
    localStorage.setItem("resume_theme", resume.theme || "modern");
    // We also pass the slug so we know we are editing an existing one? 
    // Currently the editor doesn't support "update mode" explicitly via URL ID, 
    // it just uses the slug at publish time to check existence.
    // So loading into draft is enough to "restore" the state.
    // However, if they change the slug, it might create a new one?
    // For now, let's just load the content.
    router.push(`/resume-builder/create?theme=${resume.theme || "modern"}&id=${resume.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ResumeBuilderHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Websites</h1>
            <p className="text-slate-500 mt-2">Manage your personal portfolio websites</p>
          </div>
          <Button onClick={() => {
              localStorage.removeItem("resume_draft"); 
              localStorage.removeItem("resume_theme");
              router.push("/resume-builder/create");
            }}>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No websites yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Create your first personal website from your resume in seconds.
            </p>
            <Button size="lg" onClick={() => router.push("/resume-builder/create")}>
              Build for Free
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200 pt-0">
                <div className="aspect-video bg-slate-100 relative group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden">
                  <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none" style={{ containerType: "inline-size" }}>
                    <ResumePreview
                      data={resume.content}
                      theme={resume.theme || "modern"}
                    />
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/p/${resume.slug}`} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Live
                      </Link>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(resume)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 truncate pr-4">
                        {resume.content.personalInfo.fullName || "Untitled Resume"}
                      </h3>
                      <p className="text-sm text-slate-500 capitalize">{resume.theme} Theme</p>
                    </div>
                    {resume.is_public && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Live
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}
                    </span>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Website?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your website and remove it from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(resume.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={deletingId === resume.id}
                          >
                            {deletingId === resume.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
