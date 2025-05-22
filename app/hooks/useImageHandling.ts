import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query"; // Removed useQueryClient as it's not used
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export interface UploadedImage {
  url: string;
  file?: File;
  isUploading: boolean;
  uploadProgress: number;
  publicUrl?: string;
  id: string;
}

// This function uploads directly to Supabase, not via a custom API endpoint.
// Therefore, it won't return standardized API responses. Errors are Supabase errors.
const uploadImageToSupabaseFn = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
  const supabase = createClient();

  const { error } = await supabase.storage
    .from("chat-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image to Supabase:", error);
    throw new Error(error.message || "Failed to upload image to Supabase."); // Throw Supabase error
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("chat-images").getPublicUrl(fileName);
  if (!publicUrl) {
    throw new Error("Failed to get public URL for uploaded image.");
  }
  return publicUrl;
};

// This function deletes directly from Supabase.
const deleteImageFromSupabaseFn = async (publicUrl: string) => {
  const supabase = createClient();
  const filePath = publicUrl.substring(publicUrl.lastIndexOf("/") + 1);

  if (!filePath) {
    throw new Error("Could not determine file path from public URL.");
  }

  const { error } = await supabase.storage
    .from("chat-images")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image from Supabase:", error);
    throw new Error(error.message || "Failed to delete image from Supabase."); // Throw Supabase error
  }
};

export const useImageHandling = (maxImages: number = 5) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Helper for standardized error toasts, adapted for direct Supabase errors
  const commonSupabaseErrorToast = (error: any, contextMessage: string) => {
    const errorMessage =
      error.message || "An unexpected error occurred with image operation.";
    toast.error(`${contextMessage}: ${errorMessage}`);
    console.error(contextMessage, error);
  };

  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, id }: { file: File; id: string }) => {
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, isUploading: true, uploadProgress: 0 }
            : img,
        ),
      );

      // Simulate progress for UI
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + 20, 90);
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, uploadProgress: progress } : img,
          ),
        );
      }, 200);

      try {
        const publicUrl = await uploadImageToSupabaseFn(file); // Direct Supabase call
        clearInterval(interval);
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  isUploading: false,
                  publicUrl,
                  uploadProgress: 100,
                  file: undefined,
                }
              : img,
          ),
        );
        return { id, publicUrl };
      } catch (error) {
        clearInterval(interval);
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? { ...img, isUploading: false, uploadProgress: 0 }
              : img,
          ),
        );
        throw error; // Rethrow to be caught by onError, error is Supabase error
      }
    },
    onSuccess: (data, variables) => {
      toast.success(`Image uploaded successfully!`);
    },
    onError: (error: any, variables) => {
      // error is Supabase error
      commonSupabaseErrorToast(error, `Failed to upload image`);
      setUploadedImages((prev) =>
        prev.filter((img) => img.id !== variables.id),
      );
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async ({ image }: { image: UploadedImage }) => {
      if (image.publicUrl) {
        await deleteImageFromSupabaseFn(image.publicUrl); // Direct Supabase call
      }
      return image;
    },
    onSuccess: (data, variables) => {
      setUploadedImages((prev) => prev.filter((img) => img.id !== data.id));
      if (data.url.startsWith("blob:")) {
        URL.revokeObjectURL(data.url);
      }
      toast.info("Image removed.");
    },
    onError: (error: any) => {
      // error is Supabase error
      commonSupabaseErrorToast(error, "Failed to delete image");
    },
  });

  const handleFiles = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        toast.warning("No image files selected.");
        return;
      }

      const currentImageCount = uploadedImages.length;
      if (currentImageCount + imageFiles.length > maxImages) {
        toast.warning(
          `Cannot upload more than ${maxImages} images. ${imageFiles.length - (maxImages - currentImageCount)} files were not added.`,
        );
        imageFiles.splice(maxImages - currentImageCount);
      }

      const newImagesToUpload: UploadedImage[] = [];
      imageFiles.forEach((file) => {
        const imageId = `${file.name}-${Date.now()}`;
        newImagesToUpload.push({
          id: imageId,
          url: URL.createObjectURL(file),
          file,
          isUploading: true,
          uploadProgress: 0,
        });
        uploadImageMutation.mutate({ file, id: imageId });
      });

      setUploadedImages((prev) => [...prev, ...newImagesToUpload]);
    },
    [uploadedImages.length, maxImages, uploadImageMutation],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(Array.from(e.target.files));
        e.target.value = "";
      }
    },
    [handleFiles],
  );

  const removeImage = useCallback(
    (image: UploadedImage) => {
      deleteImageMutation.mutate({ image });
    },
    [deleteImageMutation],
  );

  const clearAllImages = useCallback(() => {
    uploadedImages.forEach((img) => {
      if (img.publicUrl) {
        // To delete from Supabase, would need to call deleteImageMutation for each
        // deleteImageMutation.mutate({ image: img }); // This might be too aggressive or cause many toasts
      }
      if (img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });
    setUploadedImages([]);
    toast.info(
      "All image previews cleared. Uploaded images may still exist in storage unless explicitly deleted one by one.",
    );
  }, [uploadedImages]);

  return {
    uploadedImages,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeImage,
    clearAllImages,
    isUploading:
      uploadImageMutation.isPending ||
      uploadedImages.some((img) => img.isUploading),
    isDeleting: deleteImageMutation.isPending,
  };
};
