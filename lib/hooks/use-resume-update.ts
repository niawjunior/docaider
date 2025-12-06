import { ResumeData } from "@/lib/schemas/resume";

/**
 * Hook to decouple data update logic from UI components.
 * Returns helper functions to update specific fields or entire sections of the resume data.
 */
export function useResumeUpdate(data: ResumeData, onUpdate?: (data: ResumeData) => void) {
    
    // Updates a specific nested path (e.g. "personalInfo.email" or "experience[0].company")
    // NOTE: This uses deep cloning which is safe but not the most performant for very massive objects.
    // For a resume editor, it is perfectly fine.
    const updateField = (path: string, value: any) => {
        if (!onUpdate) return;

        // Create a deep copy to ensure immutability
        const newData = JSON.parse(JSON.stringify(data));
        
        const parts = path.split('.');
        let current = newData;
        
        // Traverse to the parent key
        for (let i = 0; i < parts.length - 1; i++) {
            // Handle array indices in path if needed, though usually path is "prop.prop"
            // If parts[i] doesn't exist, we might need to create it, but usually schema ensures structure.
            if (current[parts[i]] === undefined) {
                 // naive creation
                 current[parts[i]] = {}; 
            }
            current = current[parts[i]];
        }
        
        // Check if value actually changed (prevents phantom updates)
        if (current[parts[parts.length - 1]] === value) {
            return;
        }

        // Update the value
        current[parts[parts.length - 1]] = value;
        
        onUpdate(newData);
    };

    // Updates a top-level section (e.g. "skills", "experience") directly.
    // This is more efficient than deep updates if you have the whole array/object ready.
    const updateSection = (section: keyof ResumeData, value: any) => {
        if (!onUpdate) return;
        const newData = { ...data, [section]: value };
        onUpdate(newData);
    };

    return { updateField, updateSection };
}
