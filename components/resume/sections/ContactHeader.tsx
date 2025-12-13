
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { getSectionTheme } from "@/lib/themes/styles";
import { useResume } from "@/components/resume/state/ResumeContext";
import { ContactManager } from "../shared/ContactManager";

interface ContactHeaderProps {
    theme: string;
}

export function ContactHeader({ theme }: ContactHeaderProps) {
    const { data, updateField, readOnly } = useResume();
    
    // Config
    const config = getSectionTheme(theme, 'header');
    const { styles, strategy } = config;
    
    const isSidebarLayout = strategy.layout === 'masonry';
    const personalInfo = (data.personalInfo || {}) as any;

    const Title = (
        <h1 className={styles.title}>
            <InlineEdit readOnly={readOnly} 
                value={personalInfo.fullName} 
                placeholder="Your Name"
                onSave={(val) => updateField('personalInfo.fullName', val)} 
                path="personalInfo.fullName"
                className={cn(strategy.alignment === "center" ? "text-center w-full block" : "", "bg-transparent")}
            />
        </h1>
    );

    const Summary = (
        <div className={styles.subtitle}>
             <InlineEdit readOnly={readOnly} 
                value={personalInfo.headerSummary?.content} 
                onSave={(val) => updateField('personalInfo.headerSummary.content', val)} 
                multiline
                placeholder="Professional Summary"
                path="personalInfo.headerSummary.content"
                alignment={personalInfo.headerSummary?.alignment || (strategy.alignment === "center" ? "center" : undefined)}
                className={cn(strategy.alignment === "center" ? "w-full block" : "", "bg-transparent")}
            />
        </div>
    );



    const ContactInfo = (
        <ContactManager 
            readOnly={readOnly}
            theme={theme}
            layout={isSidebarLayout ? 'column' : 'row'} 
            className={styles.metadata}
            itemClassName={styles.item}
            align={strategy.alignment as "left" | "center" | "right"}
        />
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
