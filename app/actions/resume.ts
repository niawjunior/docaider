"use server";

import { createServiceClient, createClient } from "@/app/utils/supabase/server";
import { ResumeData } from "@/lib/schemas/resume";
import { normalizeResumeData } from "@/lib/utils/resume-normalization";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function publishResume(data: {
  content: ResumeData;
  theme: string;
  slug: string;
  id?: string;
  isPublic?: boolean;
}) {
  const supabase = await createClient();
  const adminSupabase = createServiceClient();
  const isPublic = data.isPublic ?? false; // Default to private if not specified

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to publish a resume");
  }

  // Check if resume with slug exists (using admin client to bypass RLS issues)
  const { data: existingResume } = await adminSupabase
    .from("resumes")
    .select("id, user_id")
    .eq("slug", data.slug)
    .single();

  // If ID is provided, we are definitely updating a specific resume
  if (data.id) {
    // Verify ownership of the resume we are trying to update
    const { data: currentResume } = await adminSupabase
      .from("resumes")
      .select("id, user_id")
      .eq("id", data.id)
      .single();
      
    if (!currentResume || currentResume.user_id !== user.id) {
      throw new Error("Unauthorized update");
    }

    // Check if slug string is changing and if the new slug is taken by someone else
    if (existingResume && existingResume.id !== data.id) {
       throw new Error("Slug already taken by another resume");
    }

    // Perform Update
    const { error } = await adminSupabase
      .from("resumes")
      .update({
        content: data.content,
        theme: data.theme,
        slug: data.slug, // Allow updating slug
        job_title: (data.content.personalInfo as any).jobTitle,
        summary: (data.content.personalInfo as any).summary,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) {
      console.error("Error updating resume:", error);
      throw new Error("Failed to update resume");
    }
  } else if (existingResume) {
    // Legacy check: If resume with slug exists, check ownership
    if (existingResume.user_id !== user.id) {
       throw new Error("Slug already taken");
    }
    
    // Update existing
    const { error } = await adminSupabase
      .from("resumes")
      .update({
        content: data.content,
        theme: data.theme,
        job_title: (data.content.personalInfo as any).jobTitle,
        summary: (data.content.personalInfo as any).summary,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingResume.id);

    if (error) {
      console.error("Error updating resume:", error);
      throw new Error("Failed to update resume");
    }
  } else {
    // Insert new
    const { error } = await adminSupabase.from("resumes").insert({
      slug: data.slug,
      user_id: user.id,
      content: data.content,
      theme: data.theme,
      job_title: (data.content.personalInfo as any).jobTitle,
      summary: (data.content.personalInfo as any).summary,
      is_public: isPublic,
    });

    if (error) {
      console.error("Error creating resume:", error);
      throw new Error("Failed to publish resume");
    }
  }

  revalidatePath("/dashboard");
  return { success: true, url: `/p/${data.slug}` };
}

export async function saveDraft(data: {
  content: ResumeData;
  theme: string;
  id?: string;
  slug?: string;
}) {
  const supabase = await createClient();
  const adminSupabase = createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // If ID exists, update
  if (data.id) {
    // Verify ownership
    const { data: current } = await adminSupabase
      .from("resumes")
      .select("user_id")
      .eq("id", data.id)
      .single();

    if (!current || current.user_id !== user.id) {
      throw new Error("Unauthorized");
    }

    const { error } = await adminSupabase
      .from("resumes")
      .update({
        content: data.content,
        theme: data.theme,
        job_title: (data.content.personalInfo as any).jobTitle,
        summary: (data.content.personalInfo as any).summary,
        updated_at: new Date().toISOString(),
        // We don't change public status here, just save content
      })
      .eq("id", data.id);

    if (error) throw new Error("Failed to save draft");
    
    revalidatePath("/resume-builder/dashboard");
    return { success: true, id: data.id, slug: data.slug };
  } else {
    // Create new draft
    const slug = data.slug || `${Date.now()}`;
    const { data: newResume, error } = await adminSupabase
      .from("resumes")
      .insert({
        user_id: user.id,
        content: data.content,
        theme: data.theme,
        job_title: (data.content.personalInfo as any).jobTitle,
        summary: (data.content.personalInfo as any).summary,
        slug: slug,
        is_public: false, // Default to draft/private
      })
      .select("id, slug")
      .single();

    if (error) {
        console.error("Save Draft Error", error);
        throw new Error("Failed to create draft");
    }
    
    return { success: true, id: newResume.id, slug: newResume.slug };
  }
}

export async function getLandingPageData() {
  const supabase = createServiceClient();

  // Get total count of resumes
  const { count } = await supabase
    .from("resumes")
    .select("*", { count: "exact", head: true });

  // Get latest 3 public resumes for showcase
  const { data: showcase } = await supabase
    .from("resumes")
    .select("content, theme, slug, job_title, summary")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return {
    count: count || 0,
    showcase: showcase || [],
  };
}

export async function getGalleryData() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("resumes")
    .select("content, theme, slug, job_title, summary, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}

export async function uploadResumeImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const supabase = createServiceClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }

  const { data: { publicUrl } } = supabase.storage
    .from("resumes")
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function getUserResumes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Use admin client to ensure we can read even if RLS is flaky
  const adminSupabase = createServiceClient();
  
  const { data } = await adminSupabase
    .from("resumes")
    .select("id, slug, theme, content, job_title, summary, created_at, updated_at, is_public")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return data || [];
}

export async function deleteResume(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const adminSupabase = createServiceClient();

  // Verify ownership before deleting
  const { data: existing } = await adminSupabase
    .from("resumes")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    throw new Error("Unauthorized");
  }

  const { error } = await adminSupabase
    .from("resumes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error("Failed to delete resume");
  }

  revalidatePath("/resume-builder/dashboard");
  return { success: true };
}

export async function getResumeById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminSupabase = createServiceClient();
  
  const { data } = await adminSupabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (!data || data.user_id !== user.id) {
    return null;
  }

  return {
    ...data,
    content: normalizeResumeData(data.content as ResumeData)
  };
}
