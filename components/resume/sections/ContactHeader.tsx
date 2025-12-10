
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { MapPin, Mail, Phone, Globe } from "lucide-react";
import { getSectionTheme } from "@/lib/themes/styles";

interface ContactHeaderProps {
    data: ResumeData;
    theme: string;
    onUpdate?: (data: ResumeData) => void;
    readOnly?: boolean;
}

export function ContactHeader({ data, theme, onUpdate, readOnly }: ContactHeaderProps) {
    const config = getSectionTheme(theme, 'header');
    const { styles, strategy } = config;
    
    // Generic Helper for deeply specific update since we don't have updateSection hook for root here easily without refactoring prop storage
    const handleUpdate = (path: string, value: any) => {
        if (!onUpdate) return;
        const newData = JSON.parse(JSON.stringify(data));
        
        const parts = path.split('.');
        let current = newData;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        onUpdate(newData);
    };

    // Layout: 'masonry' is our flag for the "Sidebar / Vertical" layout used in Creative theme.
    // 'list' is the standard horizontal top header.
    const isSidebarLayout = strategy.layout === 'masonry';

    // Render Components
    const Title = (
        <h1 className={styles.title}>
            <InlineEdit readOnly={readOnly || !onUpdate} 
                value={data.personalInfo.fullName} 
                placeholder="Your Name"
                onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                path="personalInfo.fullName"
                className={cn(strategy.alignment === "center" ? "text-center w-full block" : "", "bg-transparent")}
            />
        </h1>
    );

    const Summary = (
        <div className={styles.subtitle}>
             <InlineEdit readOnly={readOnly || !onUpdate} 
                value={data.personalInfo.headerSummary?.content} 
                onSave={(val) => handleUpdate('personalInfo.headerSummary.content', val)} 
                multiline
                placeholder="Professional Summary"
                path="personalInfo.headerSummary.content"
                alignment={data.personalInfo.headerSummary?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                className={cn(strategy.alignment === "center" ? "w-full block" : "", "bg-transparent")}
            />
        </div>
    );

    const ContactInfo = (
        <div className={styles.metadata}>
             {(onUpdate || data.personalInfo.email) && (
                <div className={styles.item}>
                    <Mail className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.email} 
                        placeholder="Email"
                        onSave={(val) => handleUpdate('personalInfo.email', val)} 
                        path="personalInfo.email"
                        className="bg-transparent"
                    />
                </div>
            )}
            {(onUpdate || data.personalInfo.phone) && (
                <div className={styles.item}>
                    <Phone className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.phone} 
                        placeholder="Phone"
                        onSave={(val) => handleUpdate('personalInfo.phone', val)} 
                        path="personalInfo.phone"
                        className="bg-transparent"
                    />
                </div>
            )}
            {(onUpdate || data.personalInfo.location) && (
                <div className={styles.item}>
                    <MapPin className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.location} 
                        placeholder="Location"
                        onSave={(val) => handleUpdate('personalInfo.location', val)} 
                        path="personalInfo.location"
                        className="bg-transparent"
                    />
                </div>
            )}
            {(onUpdate || data.personalInfo.website) && (
                <div className={styles.item}>
                    <Globe className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly || !onUpdate} 
                        value={data.personalInfo.website} 
                        placeholder="Website"
                        onSave={(val) => handleUpdate('personalInfo.website', val)} 
                        path="personalInfo.website"
                        className="bg-transparent"
                    />
                </div>
            )}
        </div>
    );

    if (isSidebarLayout) {
        return (
            <div className={styles.container}>
                <div className="space-y-2">
                    {Title}
                    {Summary}
                </div>
                {ContactInfo}
            </div>
        );
    }

    // Standard Layout (Modern, Minimal, Studio, etc.)
    return (
        <header className={styles.container}>
            <div className={strategy.alignment === 'center' ? "text-center" : "text-left"}>
                {Title}
                {Summary}
            </div>
            {ContactInfo}
        </header>
    );
}
