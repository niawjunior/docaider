import { useLayoutEffect, useState, useRef } from "react";
import { useEditorContext } from "../EditorContext";

interface FloatingToolbarWrapperProps {
    children: React.ReactNode;
}

export function FloatingToolbarWrapper({ children }: FloatingToolbarWrapperProps) {
    const { 
        focusedField, hasSelection, 
        aiOpen, lockedField 
    } = useEditorContext();

    const [position, setPosition] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Visibility Check
    // Render if AI is open OR if we have a focused field (don't strictly require selection range)
    const shouldRender = aiOpen || !!focusedField;

    useLayoutEffect(() => {
        if (!shouldRender) return;

        const updatePosition = () => {
            let targetRect: DOMRect | null = null;
            
            // Priority 1: Locked Field (Strict AI Context)
            if (aiOpen && lockedField) {
                 const element = document.querySelector(`[data-path="${lockedField}"]`);
                 if (element) {
                     targetRect = element.getBoundingClientRect();
                 }
            } 
            
            // Priority 2: Current Focus (Element only, no cursor tracking as requested)
            if (!targetRect && focusedField) {
                 const element = document.querySelector(`[data-path="${focusedField}"]`);
                 const elementRect = element?.getBoundingClientRect();

                 // Simplified: Just center on the element at the top
                 if (elementRect) {
                     targetRect = elementRect;
                 }
            }
            
            if (!targetRect) return;

            const toolbarHeight = 45;
            const stickyTop = 80;
            const naturalTop = targetRect.top - toolbarHeight;
            
            const calculatedTop = Math.min(
                Math.max(naturalTop, stickyTop),
                targetRect.bottom - toolbarHeight
            );

            setPosition({
                top: calculatedTop,
                left: targetRect.left + targetRect.width / 2
            });
        };

        updatePosition();
        window.addEventListener("scroll", updatePosition, { capture: true });
        window.addEventListener("resize", updatePosition);
        document.addEventListener("selectionchange", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, { capture: true });
            window.removeEventListener("resize", updatePosition);
            document.removeEventListener("selectionchange", updatePosition);
        };
    }, [focusedField, hasSelection, aiOpen, lockedField, shouldRender]);

    if (!shouldRender) return null;

    return (
        <div 
            ref={toolbarRef}
            className="fixed z-[7] flex items-center space-x-1 bg-slate-900 text-white rounded-lg p-1 border border-slate-700 shadow-2xl backdrop-blur-md"
            style={{ 
                top: position.top, 
                left: position.left,
                transform: "translateX(-50%)" 
            }}
        >
            {children}
        </div>
    );
}
