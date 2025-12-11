"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { ResumeData } from "@/lib/schemas/resume";

interface ResumeContextType {
    data: ResumeData;
    updateField: (path: string, value: any) => void;
    readOnly: boolean;
    isThumbnail: boolean;
    theme?: string;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

interface ResumeProviderProps {
    children: ReactNode;
    data: ResumeData;
    updateField?: (path: string, value: any) => void;
    readOnly?: boolean;
    isThumbnail?: boolean;
    theme?: string;
}

export function ResumeProvider({ 
    children, 
    data, 
    updateField = () => {}, 
    readOnly = false,
    isThumbnail = false,
    theme
}: ResumeProviderProps) {
    return (
        <ResumeContext.Provider value={{
            data,
            updateField,
            readOnly,
            isThumbnail,
            theme
        }}>
            {children}
        </ResumeContext.Provider>
    );
}

export function useResume() {
    const context = useContext(ResumeContext);
    if (context === undefined) {
        throw new Error("useResume must be used within a ResumeProvider");
    }
    return context;
}
