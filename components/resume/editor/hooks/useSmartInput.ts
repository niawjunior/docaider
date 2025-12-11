import { RefObject, KeyboardEvent, ClipboardEvent } from "react";

interface UseSmartInputProps {
    value: string | undefined | null;
    multiline: boolean;
    readOnly: boolean;
    path?: string;
    onSave: (value: string) => void;
    contentRef: RefObject<HTMLElement | null>;
    setIsEditing: (isEditing: boolean) => void;
    
    // Context Actions
    setAiOpen?: (open: boolean) => void;
    setLockedField?: (field: string | null) => void;
    setFocusedField?: (field: string | null) => void;
    setHasSelection?: (has: boolean) => void;
    disableAi?: boolean;
}

export function useSmartInput({
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
    disableAi = false
}: UseSmartInputProps) {

    const handleBlur = () => {
        if (readOnly) return;
        setIsEditing(false);
        if (setHasSelection) setHasSelection(false);
        if (setFocusedField) setFocusedField(null);
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
            if (newValue !== (value || "")) {
               onSave(normalizedNew); 
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

    const handleKeyDown = (e: KeyboardEvent) => {
        if (readOnly) return;
        
        // Quick AI Trigger: Press Space on empty field
        const currentText = contentRef.current?.innerText || "";
        const isVisuallyEmpty = currentText.replace(/[\u200B\u00A0\n\r]/g, "").trim() === "";
    
        if (e.key === " " && isVisuallyEmpty && !disableAi) {
            e.preventDefault();
            if (setAiOpen && setLockedField && path) {
                setLockedField(path);
                setAiOpen(true);
            }
            return;
        }
    
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
            if (setAiOpen) setAiOpen(false);
        }
    };

    const handlePaste = (e: ClipboardEvent) => {
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

    return {
        handleBlur,
        handleFocus,
        handleKeyDown,
        handlePaste
    };
}
