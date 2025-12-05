"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Wand2, Share2, Plus, Trash2, Layout, X } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { publishResume, uploadResumeImage, getResumeById } from "@/app/actions/resume";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";

export function ResumeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const idParam = searchParams.get("id");
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<"modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual">("modern");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage or Server
  useEffect(() => {
    const loadData = async () => {
      // If editing existing resume
      if (idParam) {
         try {
           const data = await getResumeById(idParam);
           if (data) {
             setResumeData(data.content);
             setTheme(data.theme as any);
             setSlug(data.slug);
             // Ensure we are in "edit/publish" mode
             setPublishedUrl(null); 
           }
         } catch (e) {
           console.error("Failed to load resume", e);
           toast.error("Failed to load resume");
         } finally {
           setIsLoading(false);
         }
         return;
      }

      // Normal localStorage load
      const savedDraft = localStorage.getItem("resume_draft");
      const savedTheme = localStorage.getItem("resume_theme");
      if (savedDraft) {
        try {
          setResumeData(JSON.parse(savedDraft));
        } catch (e) {
          console.error("Failed to parse saved draft", e);
        }
      }
      if (themeParam) {
        setTheme(themeParam as any);
      } else if (savedTheme) {
        setTheme(savedTheme as any);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [idParam, themeParam]);

  // Save to localStorage on change (only if not in strict edit mode? or always sync?)
  useEffect(() => {
    if (resumeData) {
      localStorage.setItem("resume_draft", JSON.stringify(resumeData));
    }
    localStorage.setItem("resume_theme", theme);
  }, [resumeData, theme]);

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
    onSuccess: (data) => {
      // Always enforce default cover image, ignoring AI hallucination
      data.coverImage = "/images/cover.png";
      
      setResumeData(data);
      toast.success("Resume parsed successfully!");
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

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !resumeData) return;

    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const publicUrl = await uploadResumeImage(formData);

      setResumeData({
        ...resumeData,
        coverImage: publicUrl,
      });
      toast.success("Cover image uploaded!");
    } catch (error) {
      toast.error("Error uploading image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-slate-950 text-white flex flex-col text-slate-100 dark">
      <ResumeBuilderHeader 
        maxWidth="max-w-full" 
        showBackToApp={false}
        className="bg-transparent border-b border-white/10 relative z-50 backdrop-blur-md"
        theme="dark"
      >
        <div className="flex gap-2 items-center">
          {resumeData && (
            <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
              <span className="text-sm text-slate-400 font-medium hidden sm:inline">Theme:</span>
              <Select
                value={theme}
                onValueChange={(value: any) => setTheme(value)}
              >
                <SelectTrigger className="w-[140px] sm:w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="portfolio">Portfolio (Resume)</SelectItem>
                  <SelectItem value="studio">Studio (Agency)</SelectItem>
                  <SelectItem value="visual">Visual (New)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={!resumeData || isLoading}>
                <Share2 className="w-4 h-4 mr-2" />
                {idParam ? "Update Resume" : "Publish Resume"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{idParam ? "Update your Resume" : "Publish your Resume"}</DialogTitle>
                <DialogDescription>
                  {idParam ? "Save changes to your existing resume." : "Choose a unique URL for your resume."}
                </DialogDescription>
              </DialogHeader>
              
              {!publishedUrl ? (
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Public URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-sm">docaider.com/p/</span>
                      <Input 
                        placeholder="your-name" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{idParam ? "Resume Updated!" : "Resume Published!"}</h3>
                    <p className="text-slate-500">Your resume is now live at:</p>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg text-sm font-mono break-all">
                    <Link href={publishedUrl} target="_blank" className="text-blue-600 hover:underline">
                      {window.location.origin}{publishedUrl}
                    </Link>
                  </div>
                </div>
              )}

              <DialogFooter>
                {!publishedUrl ? (
                  <Button 
                    onClick={async () => {
                      if (!resumeData || !slug) return;
                      setIsPublishing(true);
                      try {
                        const result = await publishResume({
                          content: resumeData,
                          theme,
                          slug,
                          id: idParam || undefined,
                        });
                        setPublishedUrl(result.url);
                        toast.success(idParam ? "Updated successfully!" : "Published successfully!");
                      } catch (err) {
                        toast.error("Failed to publish. Slug might be taken.");
                      } finally {
                        setIsPublishing(false);
                      }
                    }}
                    disabled={isPublishing || !slug}
                  >
                    {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {idParam ? "Update Now" : "Publish Now"}
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href={publishedUrl} target="_blank">View Live Resume</Link>
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ResumeBuilderHeader>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 h-[calc(100vh-70px)] max-w-xl border-r border-white/10 bg-slate-900 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : !resumeData ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Upload your Resume
                </h2>
                <p className="text-slate-500 max-w-sm">
                  Upload your existing PDF or Word resume and we'll transform it
                  into a beautiful website in seconds.
                </p>
              </div>
              
              <div className="w-full max-w-sm space-y-4">
                <Input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleUpload}
                  disabled={!file || parseResume.isPending}
                >
                  {parseResume.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Website
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Edit Content</h2>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Upload Your Resume
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear your current draft and you will lose all unsaved changes. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setResumeData(null);
                          localStorage.removeItem("resume_draft");
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Cover Image Upload - Only for Visual Theme */}
              {theme === "visual" && (
                <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Cover Image
                  </h3>
                <div className="flex items-center gap-4">
                  {resumeData.coverImage && (
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200">
                      <img 
                        src={resumeData.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        onClick={() => setResumeData({ ...resumeData, coverImage: undefined })}
                        variant="destructive"
                        className="absolute top-1 right-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="cover-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full h-16 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-2 text-slate-500">
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {isUploading ? "Uploading..." : "Upload Cover Image"}
                          </span>
                        </div>
                      </div>
                      <Input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageUpload}
                        disabled={isUploading}
                      />
                    </Label>
                  </div>
                </div>
              </section>
              )}

              {/* Personal Info Form */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Personal Info
                </h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <Input
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          personalInfo: {
                            ...resumeData.personalInfo,
                            fullName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Job Title</Label>
                    <Input
                      value={resumeData.personalInfo.jobTitle || ""}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          personalInfo: {
                            ...resumeData.personalInfo,
                            jobTitle: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Professional Summary</Label>
                    <Textarea
                      value={resumeData.personalInfo.summary}
                      rows={4}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          personalInfo: {
                            ...resumeData.personalInfo,
                            summary: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Experience Form */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Experience
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setResumeData({
                        ...resumeData,
                        experience: [
                          {
                            company: "New Company",
                            position: "Position",
                            startDate: "2023",
                            description: "Description",
                          },
                          ...resumeData.experience,
                        ],
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                {resumeData.experience.map((exp, index) => (
                  <Card key={index} className="p-4 space-y-4 relative group bg-slate-800/50 border-white/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-2"
                      onClick={() => {
                        const newExp = [...resumeData.experience];
                        newExp.splice(index, 1);
                        setResumeData({ ...resumeData, experience: newExp });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].company = e.target.value;
                            setResumeData({ ...resumeData, experience: newExp });
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].position = e.target.value;
                            setResumeData({ ...resumeData, experience: newExp });
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        rows={3}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[index].description = e.target.value;
                          setResumeData({ ...resumeData, experience: newExp });
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </section>

              {/* Education Form */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Education
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setResumeData({
                        ...resumeData,
                        education: [
                          ...resumeData.education,
                          {
                            institution: "New Institution",
                            degree: "Degree",
                            startDate: "2023",
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                {resumeData.education.map((edu, index) => (
                  <Card key={index} className="p-4 space-y-4 relative group bg-slate-800/50 border-white/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-2"
                      onClick={() => {
                        const newEdu = [...resumeData.education];
                        newEdu.splice(index, 1);
                        setResumeData({ ...resumeData, education: newEdu });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid gap-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education];
                          newEdu[index].institution = e.target.value;
                          setResumeData({ ...resumeData, education: newEdu });
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].degree = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.fieldOfStudy || ""}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].fieldOfStudy = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Start Date</Label>
                        <Input
                          value={edu.startDate || ""}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].startDate = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>End Date</Label>
                        <Input
                          value={edu.endDate || ""}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].endDate = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </section>

              {/* Skills Form */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 p-4  rounded-lg">
                  {resumeData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 border border-slate-200 rounded-full text-sm"
                    >
                      <span>{skill}</span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const newSkills = [...resumeData.skills];
                          newSkills.splice(index, 1);
                          setResumeData({ ...resumeData, skills: newSkills });
                        }}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      placeholder="Add skill..."
                      className=" text-sm  border-none shadow-none focus-visible:ring-0 mt-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            setResumeData({
                              ...resumeData,
                              skills: [...resumeData.skills, val],
                            });
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* Projects Form */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Projects
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setResumeData({
                        ...resumeData,
                        projects: [
                          ...(resumeData.projects || []),
                          {
                            name: "New Project",
                            description: "Description",
                            technologies: [],
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                {(resumeData.projects || []).map((proj, index) => (
                  <Card key={index} className="p-4 space-y-4 relative group bg-transparent">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-2"
                      onClick={() => {
                        const newProjs = [...(resumeData.projects || [])];
                        newProjs.splice(index, 1);
                        setResumeData({ ...resumeData, projects: newProjs });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid gap-2">
                      <Label>Project Name</Label>
                      <Input
                        value={proj.name}
                        onChange={(e) => {
                          const newProjs = [...(resumeData.projects || [])];
                          newProjs[index].name = e.target.value;
                          setResumeData({ ...resumeData, projects: newProjs });
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={proj.description}
                        rows={3}
                        onChange={(e) => {
                          const newProjs = [...(resumeData.projects || [])];
                          newProjs[index].description = e.target.value;
                          setResumeData({ ...resumeData, projects: newProjs });
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </section>

              {/* Testimonials Form */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Testimonials
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setResumeData({
                        ...resumeData,
                        testimonials: [
                          ...(resumeData.testimonials || []),
                          {
                            name: "Client Name",
                            role: "Role / Company",
                            content: "Testimonial content...",
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                {(resumeData.testimonials || []).map((testimonial, index) => (
                  <Card key={index} className="p-4 space-y-4 relative group bg-transparent">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-2"
                      onClick={() => {
                        const newTestimonials = [...(resumeData.testimonials || [])];
                        newTestimonials.splice(index, 1);
                        setResumeData({ ...resumeData, testimonials: newTestimonials });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                          value={testimonial.name}
                          onChange={(e) => {
                            const newTestimonials = [...(resumeData.testimonials || [])];
                            newTestimonials[index].name = e.target.value;
                            setResumeData({ ...resumeData, testimonials: newTestimonials });
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Role</Label>
                        <Input
                          value={testimonial.role}
                          onChange={(e) => {
                            const newTestimonials = [...(resumeData.testimonials || [])];
                            newTestimonials[index].role = e.target.value;
                            setResumeData({ ...resumeData, testimonials: newTestimonials });
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Content</Label>
                      <Textarea
                        value={testimonial.content}
                        rows={3}
                        onChange={(e) => {
                          const newTestimonials = [...(resumeData.testimonials || [])];
                          newTestimonials[index].content = e.target.value;
                          setResumeData({ ...resumeData, testimonials: newTestimonials });
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </section>
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-950/50 h-[calc(100vh-70px)] overflow-y-auto flex items-start justify-center" style={{ containerType: "inline-size" }}>
            {resumeData ? (
              <ResumePreview data={resumeData} theme={theme} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300">
                <div className="text-center space-y-4">
                  <Layout className="w-20 h-20 mx-auto opacity-20" />
                  <p className="text-lg font-medium">Preview will appear here</p>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
