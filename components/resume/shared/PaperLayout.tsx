import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PaperLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * If true, applies standard A4 dimensions (210mm x 297mm).
     * Defaults to true. Set to false for web-only themes.
     */
    isA4?: boolean;
    
    /**
     * If provided, applies the "Solid Background + Bleed Stripe" fix 
     * matching this color. Use this if your theme has a left sidebar 
     * that needs to visually extend to the bottom edge.
     * Example: "#0f172a"
     */
    sidebarMatchColor?: string;

    children: React.ReactNode;
}

/**
 * A standard chassis for print-ready resumes.
 * Encapsulates dimensions, print hiding, and robust rendering fixes.
 */
export const PaperLayout = forwardRef<HTMLDivElement, PaperLayoutProps>(
    ({ className, isA4 = true, sidebarMatchColor, children, style, ...props }, ref) => {
        
        // Combine custom styles with the layout robustness fix
        const combinedStyle: React.CSSProperties = {
            ...style,
            ...(sidebarMatchColor ? { backgroundColor: sidebarMatchColor } : {}),
        };

        return (
            <div
                ref={ref}
                id="resume-preview"
                className={cn(
                    // Base Layout
                    "mx-auto relative bg-white transition-all duration-200",
                    
                    // A4 Enforcements
                    // Removed print:h-[297mm] and print:overflow-hidden to allow multi-page
                    isA4 && "w-[210mm] min-h-[297mm] shadow-xl print:shadow-none print:w-[210mm]",
                    
                    className
                )}
                style={combinedStyle}
                {...props}
            >
                {/* 
                  Robustness Fix: Visual Bleed Stripe 
                  Only renders if a sidebar color is provided.
                  Physically covers the sub-pixel anti-aliasing gap on the left edge.
                  z-index high to ensure it sits ON TOP of the seam.
                */}
                {sidebarMatchColor && (
                    <div 
                        className="absolute top-0 bottom-0 -left-[1px] w-[2px] z-50 pointer-events-none print:block" 
                        style={{ backgroundColor: sidebarMatchColor }}
                    />
                )}

                {children}
            </div>
        );
    }
);

PaperLayout.displayName = "PaperLayout";
