"use client";

import { useEditorContext } from "./EditorContext";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeData } from "@/lib/schemas/resume";
import { FloatingToolbarWrapper } from "./toolbar/FloatingToolbarWrapper";
import { AlignmentTools } from "./toolbar/AlignmentTools";
import { AiAssistant } from "./toolbar/AiAssistant";

interface FormattingToolbarProps {
  resumeData: ResumeData;
  onUpdate: (data: ResumeData) => void;
  theme: string;
}

export function FormattingToolbar({ resumeData, onUpdate, theme }: FormattingToolbarProps) {
  const { 
      focusedField, 
      setAiProcessingField,
      aiOpen, 
      setAiOpen, 
      lockedField, 
      setLockedField 
  } = useEditorContext();

  const { updateField } = useResumeUpdate(resumeData, onUpdate);

  // Determine current alignment based on focused field path
  // Prioritize lockedField if AI is open so alignment/positioning stays with the AI task
  const activeTarget = lockedField || focusedField;

  return (
    <FloatingToolbarWrapper>
        <AlignmentTools
            resumeData={resumeData}
            onUpdate={onUpdate}
            activeTarget={activeTarget}
            theme={theme}
            updateField={updateField}
        />
        
        <AiAssistant 
            resumeData={resumeData}
            updateField={updateField}
            focusedField={focusedField}
            lockedField={lockedField}
            setLockedField={setLockedField}
            aiOpen={aiOpen}
            setAiOpen={setAiOpen}
            setAiProcessingField={setAiProcessingField}
        />
    </FloatingToolbarWrapper>
  );
}
