
import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { MapPin, Mail, Phone, Globe } from "lucide-react";
import { getSectionTheme } from "@/lib/themes/styles";
import { useResume } from "@/components/resume/state/ResumeContext";

interface ContactHeaderProps {
    theme: string;
}

export function ContactHeader({ theme }: ContactHeaderProps) {
    const { data, updateField, readOnly } = useResume();
    
    // Config
    const config = getSectionTheme(theme, 'header');
    const { styles, strategy } = config;
    
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className={styles.item}>
            {children}
        </div>
    );

    const isSidebarLayout = strategy.layout === 'masonry';

    const Title = (
        <h1 className={styles.title}>
            <InlineEdit readOnly={readOnly} 
                value={data.personalInfo.fullName} 
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
                value={data.personalInfo.headerSummary?.content} 
                onSave={(val) => updateField('personalInfo.headerSummary.content', val)} 
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
             {(!readOnly || data.personalInfo.email) && (
                <div className={styles.item}>
                    <Mail className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly} 
                        value={data.personalInfo.email} 
                        placeholder="Email"
                        onSave={(val) => updateField('personalInfo.email', val)} 
                        path="personalInfo.email"
                        className="bg-transparent"
                    />
                </div>
            )}
            {(!readOnly || data.personalInfo.phone) && (
                <div className={styles.item}>
                    <Phone className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly} 
                        value={data.personalInfo.phone} 
                        placeholder="Phone"
                        onSave={(val) => updateField('personalInfo.phone', val)} 
                        path="personalInfo.phone"
                        className="bg-transparent"
                    />
                </div>
            )}
            {(!readOnly || data.personalInfo.location) && (
                <div className={styles.item}>
                    <MapPin className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly} 
                        value={data.personalInfo.location} 
                        placeholder="Location"
                        onSave={(val) => updateField('personalInfo.location', val)} 
                        path="personalInfo.location"
                        className="bg-transparent"
                    />
                </div>
            )}
            {(!readOnly || data.personalInfo.website) && (
                <div className={styles.item}>
                    <Globe className="w-4 h-4 shrink-0" />
                    <InlineEdit readOnly={readOnly} 
                        value={data.personalInfo.website} 
                        placeholder="Website"
                        onSave={(val) => updateField('personalInfo.website', val)} 
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
