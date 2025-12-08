"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface EditorContextType {
  focusedField: string | null;
  setFocusedField: (path: string | null) => void;
  hasSelection: boolean;
  setHasSelection: (hasSelection: boolean) => void;
  aiProcessingField: string | null;
  setAiProcessingField: (path: string | null) => void;
  enableTextAnimations?: boolean;
  scrambleLoop?: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children, enableTextAnimations = false, scrambleLoop = false }: { children: ReactNode, enableTextAnimations?: boolean, scrambleLoop?: boolean }) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [aiProcessingField, setAiProcessingField] = useState<string | null>(null);

  return (
    <EditorContext.Provider value={{ focusedField, setFocusedField, hasSelection, setHasSelection, aiProcessingField, setAiProcessingField, enableTextAnimations, scrambleLoop }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
}
