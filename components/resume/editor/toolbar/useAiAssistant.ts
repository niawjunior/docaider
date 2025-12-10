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
    const [aiResults, setAiResults] = useState<string[]>([]);
    const [resultIndex, setResultIndex] = useState(0);
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
        setAiResults([]);
        setResultIndex(0);
        
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
            if (data.options && Array.isArray(data.options)) {
                setAiResults(data.options);
                setResultIndex(0);
            } else if (data.improvedText) {
                // Fallback for old API
                setAiResults([data.improvedText]);
                setResultIndex(0);
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
        const currentResult = aiResults[resultIndex];
        
        if (currentResult && target) {
            updateField(target, currentResult);
            // Close logic
            closeAi();
        }
    };

    const handleNextResult = () => {
        setResultIndex((prev) => (prev + 1) % aiResults.length);
    };

    const handlePrevResult = () => {
        setResultIndex((prev) => (prev - 1 + aiResults.length) % aiResults.length);
    };

    const closeAi = () => {
        setAiOpen(false);
        setLockedField(null);
        setAiResults([]);
        setResultIndex(0);
        setAiInstruction("");
        setIsAiLoading(false);
        setShowDiscardDialog(false);
    };

    return {
        aiInstruction,
        setAiInstruction,
        isAiLoading,
        aiResults,
        resultIndex,
        currentResult: aiResults[resultIndex] || null,
        handleNextResult,
        handlePrevResult,
        showDiscardDialog,
        setShowDiscardDialog,
        handleAskAi,
        handleAcceptAi,
        closeAi,
        setAiResults,
        // Expose explicit setters for specialized reset logic if needed
        setIsAiLoading
    };
}
