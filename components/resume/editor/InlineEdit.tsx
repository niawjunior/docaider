import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrambleText } from "@/components/ui/scramble-text";

import { useEditorContext } from "@/components/resume/editor/EditorContext";
import { useSelectionMonitor } from "./hooks/useSelectionMonitor";
import { useSmartInput } from "./hooks/useSmartInput";

interface InlineEditProps extends React.HTMLAttributes<HTMLElement> {
  value: string | undefined | null;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  path?: string;
  alignment?: "left" | "center" | "right" | "justify";
}

export function InlineEdit({ 
  value, 
  onSave, 
  multiline = false, 
  placeholder = "Click to edit", 
  className,
  readOnly = false,
  path,
  alignment,
  ...props 
}: InlineEditProps) {
  const contentRef = React.useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Use context safely
  let contextSafe: any = null;
  try {
      contextSafe = useEditorContext();
  } catch (e) {
      // Ignore
  }

  const setFocusedField = contextSafe?.setFocusedField;
  const setHasSelection = contextSafe?.setHasSelection;
  const aiProcessingField = contextSafe?.aiProcessingField;
  const enableTextAnimations = contextSafe?.enableTextAnimations || false;
  const scrambleLoop = contextSafe?.scrambleLoop || false;
  const setAiOpen = contextSafe?.setAiOpen;
  const setLockedField = contextSafe?.setLockedField;
  const lockedField = contextSafe?.lockedField;

  // 1. Monitor Selection
  useSelectionMonitor({
      isEditing,
      setHasSelection,
      contentRef
  });

  // 2. Smart Input Handling
  const { handleBlur, handleFocus, handleKeyDown, handlePaste } = useSmartInput({
      value,
      multiline,
      readOnly,
      path,
      onSave,
      contentRef,
      setIsEditing,
      setAiOpen,
      setLockedField,
      setFocusedField,
      setHasSelection
  });

  // Sync value to DOM when not editing
  React.useEffect(() => {
    if (contentRef.current && !isEditing) {
        const currentText = contentRef.current.innerText;
        if (currentText !== (value || "")) {
            contentRef.current.innerText = value || "";
        }
    }
  }, [value, isEditing]);

  const isLocked = !readOnly && path && lockedField === path;

  const commonClasses = cn(
    "outline-none min-w-[20px] inline-block transition-all duration-200 border border-transparent",
    // Base state
    !readOnly && "px-1 -mx-1 rounded cursor-text", 
    !readOnly && "hover:border-blue-500/50 hover:bg-blue-500/5",
    !readOnly && "focus:ring-1 focus:ring-blue-500/30",
    
    // Locked/Active state
    isLocked && "ring-1 ring-blue-500/30 bg-blue-500/5 border-blue-500/50",
    
    // Placeholder state
    !readOnly && "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:italic",
    !readOnly && !value && !isEditing && "text-slate-400 italic bg-blue-500/10 border-dashed border-blue-300",
    
    // Read-only state
    readOnly && "cursor-default min-w-0 px-0 mx-0 border-none",
    
    // AI Processing state
    path && aiProcessingField === path && "animate-scan cursor-wait",

    // Alignment
    alignment === "left" && "text-left",
    alignment === "center" && "text-center",
    alignment === "right" && "text-right",
    alignment === "justify" && "text-justify",
    
    className
  );

  if (enableTextAnimations && !isEditing && value) {
      return (
          <ScrambleText 
            text={value}
            className={commonClasses}
            onClick={props.onClick}
            loop={scrambleLoop}
            duration={scrambleLoop ? 0 : 800}
            {...props}
          />
      );
  }

  return (
    <span
      ref={contentRef}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      aria-placeholder={placeholder}
      aria-readonly={readOnly}
      tabIndex={readOnly ? undefined : 0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={commonClasses}
      data-placeholder={placeholder}
      data-path={path}
      {...props}
    />
  );
}
