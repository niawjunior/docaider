import { useState } from "react";
import { ResumeData } from "@/lib/schemas/resume";

interface UseAiAssistantProps {
    resumeData: ResumeData;
    updateField: (path: string, value: any) => void;
    focusedField: string | null;
    lockedField: string | null;
    setLockedField: (field: string | null) => void;
    setAiOpen: (open: boolean) => void;
    setAiProcessingField: (field: string | null) => void;
}

export function useAiAssistant({
    resumeData,
    updateField,
    focusedField,
    lockedField,
    setLockedField,
    setAiOpen,
    setAiProcessingField
}: UseAiAssistantProps) {
    const [aiInstruction, setAiInstruction] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    // Helper to get current value
    const getCurrentValue = () => {
        const target = lockedField || focusedField;
        if (!target) return "";
        const parts = target.split(/[.\[\]]/).filter(Boolean);
        let current = resumeData as any;
        for (const part of parts) {
            if (current === undefined || current === null) return "";
            const index = parseInt(part);
            if (!isNaN(index)) {
                current = current[index];
            } else {
                current = current[part];
            }
        }
        return typeof current === 'string' ? current : "";
    };

    const handleAskAi = async (overrideInstruction?: string) => {
        const currentText = getCurrentValue();
        const instructionToUse = overrideInstruction || aiInstruction;

        console.log("Asking AI:", { currentText, overrideInstruction, aiInstruction });
        
        // If we have no text AND no instruction, we can't do anything
        if (!currentText && !instructionToUse) return;
        const targetField = lockedField || focusedField;
        
        // Use raw path as context - AI can understand "experience[0].company.content"
        const fieldContext = targetField;

        setIsAiLoading(true);
        setAiProcessingField(targetField);
        
        try {
            const res = await fetch("/api/improve-writing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    text: currentText, 
                    instruction: instructionToUse,
                    resumeData, // Pass full context
                    fieldContext 
                })
            });
            const data = await res.json();
            if (data.improvedText) {
                setAiResult(data.improvedText);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiLoading(false);
            setAiProcessingField(null);
        }
    };

    const handleAcceptAi = () => {
        const target = lockedField || focusedField;
        if (aiResult && target) {
            updateField(target, aiResult);
            // Close logic
            closeAi();
        }
    };

    const closeAi = () => {
        setAiOpen(false);
        setLockedField(null);
        setAiResult(null);
        setAiInstruction("");
        setIsAiLoading(false);
        setShowDiscardDialog(false);
    };

    return {
        aiInstruction,
        setAiInstruction,
        isAiLoading,
        aiResult,
        setAiResult,
        showDiscardDialog,
        setShowDiscardDialog,
        handleAskAi,
        handleAcceptAi,
        closeAi,
        // Expose explicit setters for specialized reset logic if needed
        setIsAiLoading
    };
}
