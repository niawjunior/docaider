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
  disableAi?: boolean;
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
  disableAi = false,
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
      setHasSelection,
      disableAi
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

  // Real-time visual empty state tracking for native placeholder behavior
  const [isVisualEmpty, setIsVisualEmpty] = React.useState(!value);

  React.useEffect(() => {
      // Sync on external value change, but respect local typing if needed.
      // Here we just re-sync if not editing, or if value changes significantly?
      // Actually, if value prop updates, we should update visual empty.
      // But during editing, value prop lags. So we rely on handleInput for real-time.
      if (!isEditing) {
        setIsVisualEmpty(!value);
      }
  }, [value, isEditing]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
      const text = e.currentTarget.innerText;
      // Check for effectively empty content (including br or whitespace)
      const empty = !text || text === '\n' || text.trim() === '';
      setIsVisualEmpty(empty);
      props.onInput?.(e as any);
  };

  const commonClasses = cn(
    // break-words (overflow-wrap: break-word) prevents aggressive breaking of normal words (fixing placeholder wrapping)
    // while still breaking long unbreakable strings (URLs) to prevent overflow.
    "outline-none min-w-[20px] min-h-[1.5em] leading-normal inline-block transition-all duration-200 border border-transparent max-w-full break-words whitespace-pre-wrap",
    // Base state
    !readOnly && "px-1 rounded cursor-text", 
    !readOnly && "hover:border-blue-500/50 hover:bg-blue-500/5",
    !readOnly && "focus:ring-1 focus:ring-blue-500/30",
    
    // Locked/Active state
    isLocked && "ring-4 ring-blue-500/30 bg-blue-500/5 border-blue-500/50",
    
    // Placeholder rendering driven by real-time visual empty state
    // We remove !isEditing check so styles persist on focus (Native feel).
    !readOnly && isVisualEmpty && "before:content-[attr(data-placeholder)] before:text-neutral-400 before:italic",
    !readOnly && isVisualEmpty && "text-neutral-400 italic bg-blue-500/10 border-dashed border-blue-300",
    
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
      onInput={handleInput}
      className={commonClasses}
      data-placeholder={placeholder}
      data-path={path}
      {...props}
    />
  );
}
