import { useEffect, RefObject } from 'react';

interface UseSelectionMonitorProps {
    isEditing: boolean;
    setHasSelection?: (hasSelection: boolean) => void;
    contentRef: RefObject<HTMLElement | null>;
}

export function useSelectionMonitor({ 
    isEditing, 
    setHasSelection, 
    contentRef 
}: UseSelectionMonitorProps) {
    useEffect(() => {
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
    }, [isEditing, setHasSelection, contentRef]);
}
