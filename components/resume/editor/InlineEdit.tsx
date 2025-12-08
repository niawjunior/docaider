"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrambleText } from "@/components/ui/scramble-text";

import { useEditorContext } from "@/components/resume/editor/EditorContext";

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
  
  // Use context safely (it might not be available in some contexts like preview modal)
  let setFocusedField: ((path: string | null) => void) | undefined;
  let setHasSelection: ((hasSelection: boolean) => void) | undefined;
  let aiProcessingField: string | null = null;
  let enableTextAnimations = false;
  let scrambleLoop = false;
  try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const context = useEditorContext();
      setFocusedField = context.setFocusedField;
      setHasSelection = context.setHasSelection;
      aiProcessingField = context.aiProcessingField;
      enableTextAnimations = context.enableTextAnimations || false;
      scrambleLoop = context.scrambleLoop || false;
  } catch (e) {
      // Context not present, ignore
  }

  // Monitor selection changes when editing
  React.useEffect(() => {
     if (!isEditing || !setHasSelection) return;

     const checkSelection = () => {
         const selection = window.getSelection();
         const hasContent = selection && 
                            !selection.isCollapsed && 
                            selection.toString().trim().length > 0 &&
                            contentRef.current && 
                            contentRef.current.contains(selection.anchorNode);
        
         setHasSelection(!!hasContent);
     };

     document.addEventListener('selectionchange', checkSelection);
     // Initial check
     checkSelection();

     return () => {
         document.removeEventListener('selectionchange', checkSelection);
         setHasSelection && setHasSelection(false);
     };
  }, [isEditing, setHasSelection]);

  // Sync value to DOM when not editing to ensure external updates are reflected
  React.useEffect(() => {
    if (contentRef.current && !isEditing) {
        const currentText = contentRef.current.innerText;
        if (currentText !== (value || "")) {
            contentRef.current.innerText = value || "";
        }
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    if (readOnly) return;
    setIsEditing(false);
    if (setHasSelection) setHasSelection(false);
    if (contentRef.current) {
      // Use textContent for single-line to avoid CSS artifacts (like text-transform), 
      // but fallback to innerText for multiline to preserve line breaks correctly.
      let newValue = !multiline 
        ? (contentRef.current.textContent || "") 
        : contentRef.current.innerText;
      
      const normalize = (str: string) => {
          return str
            .replace(/\u00A0/g, " ") // NBSP -> Space
            .replace(/[\r\n]+/g, multiline ? "\n" : "") // Handle newlines
            .replace(/[ \t]+/g, " ") // Collapse horizontal whitespace
            .trim();
      };

      const normalizedNew = normalize(newValue);
      const normalizedOld = normalize(value || "");

      // 1. If normalized values match, it's a phantom change (whitespace spacing) -> Ignore.
      if (normalizedNew === normalizedOld) {
          // Optional: Revert DOM to exact value to prevent drift, though visually identical
          if (contentRef.current.innerText !== (value || "")) {
             contentRef.current.innerText = value || "";
          }
          return;
      }

      // 2. If genuine change, allow it.
      // But verify we aren't sending literally the same string (redundant to point 1 but safe)
      if (newValue !== (value || "")) {
         // Prefer saving the sanitized/trimmed version if mostly whitespace
         // But preserving user intent if they typed specifically.
         // Actually, for Resume, normalized is usually better.
         // Let's save the normalized version to clean up the DB.
         onSave(normalizedNew); 
         // Note: we save 'normalizedNew' instead of 'newValue' to enforce cleanliness.
      }
    }
  };

  const handleFocus = () => {
      if (readOnly) return;
      setIsEditing(true);
      if (path && setFocusedField) {
          setFocusedField(path);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      contentRef.current?.blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      // Revert content
      if (contentRef.current) {
          contentRef.current.innerText = value || "";
          contentRef.current.blur();
      }
      setIsEditing(false);
    }
  };

  // Sanitize paste to prevent HTML injection
  const handlePaste = (e: React.ClipboardEvent) => {
      if (readOnly) {
          e.preventDefault();
          return;
      }
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      // Insert text at cursor position
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      
      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
  };

  const commonClasses = cn(
    "outline-none min-w-[20px] inline-block transition-all duration-200 border border-transparent",
    // Base state (interactive vs read-only)
    !readOnly && "px-1 -mx-1 rounded cursor-text", 
    !readOnly && "hover:border-blue-500/50 hover:bg-blue-500/5",
    !readOnly && "focus:ring-1 focus:ring-blue-500/30",
    
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
            duration={scrambleLoop ? 0 : 800} // If looping, don't enforce extra duration
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
      {...props}
    />
  );
}
