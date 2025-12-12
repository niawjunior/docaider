import { useMemo } from 'react';
import { ResumeData } from '@/lib/schemas/resume';

interface UseResumeSectionsProps {
    data: ResumeData;
    /**
     * List of section IDs that should be strictly rendered in the sidebar (or separate area).
     * These will be excluded from the 'mainSections' return.
     */
    sidebarIds?: string[];
    /**
     * Default order to use if data.sectionOrder is empty.
     */
    defaultOrder?: string[];
}

/**
 * Hook to simplify splitting resume sections between Main Content and Sidebar.
 * Handles fallback ordering and filtering automatically.
 */
export const useResumeSections = ({
    data,
    sidebarIds = [],
    defaultOrder = ["experience", "education", "projects", "skills"]
}: UseResumeSectionsProps) => {

    const order = useMemo(() => {
        return (data.sectionOrder && data.sectionOrder.length > 0)
            ? data.sectionOrder
            : defaultOrder;
    }, [data.sectionOrder, defaultOrder]);

    const { mainSections, sidebarSections } = useMemo(() => {
        const main: string[] = [];
        const sidebar: string[] = [];

        order.forEach(id => {
            if (sidebarIds.includes(id)) {
                sidebar.push(id);
            } else {
                main.push(id);
            }
        });

        // Ensure sidebar items that might NOT be in the order (like static fixed ones)
        // are strictly handled by the filtering, but usually the order dictates presence.
        // If a sidebar item is NOT in 'order', it won't be in 'sidebar' here.
        // If you want rigid sidebar items that always appear regardless of order,
        // you should render them manually in your component (like Contact).
        
        return { mainSections: main, sidebarSections: sidebar };
    }, [order, sidebarIds]);

    return {
        allSections: order,
        mainSections,
        sidebarSections,
    };
};
