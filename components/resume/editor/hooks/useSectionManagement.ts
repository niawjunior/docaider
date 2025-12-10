import { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ResumeData } from "@/lib/schemas/resume";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";

interface UseSectionManagementProps {
    data: ResumeData;
    onUpdate: (data: ResumeData) => void;
    open: boolean;
}

export function useSectionManagement({ data, onUpdate, open }: UseSectionManagementProps) {
    const { updateField } = useResumeUpdate(data, onUpdate);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Initialize order if missing or sync custom sections
    useEffect(() => {
        if (!data.sectionOrder || data.sectionOrder.length === 0) {
            const defaultOrder = ["experience", "education", "projects", "skills"];
            if (data.customSections) {
                data.customSections.forEach(s => {
                    if (s.id) defaultOrder.push(s.id);
                });
            }
            updateField('sectionOrder', defaultOrder);
        } else {
             // Ensure all custom sections are in the order list
             const currentIds = new Set(data.sectionOrder);
             let hasMissing = false;
             const newOrder = [...data.sectionOrder];
             
             data.customSections?.forEach(s => {
                 if (s.id && !currentIds.has(s.id)) {
                     newOrder.push(s.id);
                     hasMissing = true;
                 }
             });

             if (hasMissing) {
                updateField('sectionOrder', newOrder);
             }
        }
    }, [data.customSections?.length, open]); 

    const getLabel = (id: string) => {
        switch (id) {
            case 'experience': return 'Experience';
            case 'education': return 'Education';
            case 'projects': return 'Projects';
            case 'skills': return 'Skills';
            case 'summary': return 'Summary';
            default:
                const custom = data.customSections?.find(c => c.id === id);
                return custom ? custom.title : 'Unknown Section';
        }
    };

    const isCustom = (id: string) => {
         return !!data.customSections?.find(c => c.id === id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = (data.sectionOrder || []).indexOf(active.id as string);
            const newIndex = (data.sectionOrder || []).indexOf(over.id as string);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(data.sectionOrder || [], oldIndex, newIndex);
                updateField('sectionOrder', newOrder);
            }
        }
        setActiveId(null);
    };

    const handleAddCustomSection = () => {
        const newId = crypto.randomUUID();
        const newSection = {
            id: newId,
            title: "New Section",
            type: "list" as const,
            items: []
        };
        
        const newCustomSections = [...(data.customSections || []), newSection];
        const newOrder = [...(data.sectionOrder || []), newId];
        
        onUpdate({
            ...data,
            customSections: newCustomSections,
            sectionOrder: newOrder
        });
    };

    const handleDeleteCustomSection = (id: string) => {
        const newCustomSections = (data.customSections || []).filter(c => c.id !== id);
        const newOrder = (data.sectionOrder || []).filter(o => o !== id);

        onUpdate({
            ...data,
            customSections: newCustomSections,
            sectionOrder: newOrder
        });
    };

    const validOrder = (data.sectionOrder || []).filter(id => {
        if (["experience", "education", "projects", "skills", "summary"].includes(id)) return true;
        return data.customSections?.find(c => c.id === id);
    });

    return {
        activeId,
        setActiveId,
        getLabel,
        isCustom,
        handleDragEnd,
        handleAddCustomSection,
        handleDeleteCustomSection,
        validOrder
    };
}
