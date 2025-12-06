"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InlineEditProps extends React.HTMLAttributes<HTMLElement> {
  value: string | undefined | null;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function InlineEdit({ 
  value, 
  onSave, 
  multiline = false, 
  placeholder = "Click to edit", 
  className,
  readOnly = false,
  ...props 
}: InlineEditProps) {
  const contentRef = React.useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);

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
    if (contentRef.current) {
      const newValue = contentRef.current.innerText;
      // Only save if changed
      if (newValue !== (value || "")) {
        onSave(newValue);
      }
    }
  };

  const handleFocus = () => {
      if (readOnly) return;
      setIsEditing(true);
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
      className={cn(
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
        className
      )}
      data-placeholder={placeholder}
      {...props}
    />
  );
}
