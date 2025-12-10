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
    // If AI IS open, we render even if selection is lost, using lockedField if available
    const shouldRender = aiOpen || (focusedField && hasSelection);

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
            
            // Priority 2: Current Focus (Selection or Element) - Only if NOT in AI mode or AI didn't find target
            if (!targetRect && focusedField) {
                 // Try Text Selection first
                 if (hasSelection) {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const selectionRect = range.getBoundingClientRect();
                        
                        let containerRect = selectionRect;
                        if (selectionRect.width === 0 && selectionRect.height === 0) {
                            const anchorNode = selection.anchorNode;
                            if (anchorNode) {
                                const element = anchorNode.nodeType === Node.TEXT_NODE 
                                    ? anchorNode.parentElement 
                                    : anchorNode as Element;
                                if (element) {
                                    containerRect = element.getBoundingClientRect();
                                }
                            }
                        }
                        if (containerRect.width > 0 || containerRect.height > 0) {
                            targetRect = containerRect;
                        }
                    }
                 }
                 
                 // Fallback to Element (e.g. Skills)
                 if (!targetRect) {
                     const element = document.querySelector(`[data-path="${focusedField}"]`);
                     if (element) {
                         targetRect = element.getBoundingClientRect();
                     }
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

        return () => {
            window.removeEventListener("scroll", updatePosition, { capture: true });
            window.removeEventListener("resize", updatePosition);
        };
    }, [focusedField, hasSelection, aiOpen, lockedField, shouldRender]);

    if (!shouldRender) return null;

    return (
        <div 
            ref={toolbarRef}
            className="fixed z-[500] flex items-center space-x-1 bg-slate-900 text-white rounded-lg p-1 border border-slate-700 shadow-2xl backdrop-blur-md"
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
