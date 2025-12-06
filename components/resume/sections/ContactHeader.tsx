import { ResumeData } from "@/lib/schemas/resume";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/ui/inline-edit";
import { MapPin, Mail, Phone, Globe } from "lucide-react";

interface ContactHeaderProps {
    data: ResumeData;
    theme: "modern" | "minimal" | "creative" | "portfolio" | "studio" | "visual";
    onUpdate?: (data: ResumeData) => void;
}

export function ContactHeader({ data, theme, onUpdate }: ContactHeaderProps) {
    
    const handleUpdate = (path: string, value: any) => {
        if (!onUpdate) return;
        const newData = JSON.parse(JSON.stringify(data));
        
        // Helper - simplified version for this component level if needed, 
        // but since we need to update the ROOT data, we must modify the full object.
        // The path provided here is relative to root (e.g. 'personalInfo.fullName')
        const parts = path.split('.');
        let current = newData;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        
        onUpdate(newData);
    };

    if (theme === "creative") {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold leading-tight">
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.fullName} 
                            onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                            className="text-white hover:bg-white/10"
                        />
                    </h1>
                    <div className="text-slate-400 text-sm">
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.summary} 
                            onSave={(val) => handleUpdate('personalInfo.summary', val)} 
                            multiline
                            className="text-slate-400 hover:bg-white/10"
                        />
                    </div>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 shrink-0" />
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.email} 
                            onSave={(val) => handleUpdate('personalInfo.email', val)} 
                            className="text-white hover:bg-white/10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 shrink-0" />
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.phone} 
                            onSave={(val) => handleUpdate('personalInfo.phone', val)} 
                            className="text-white hover:bg-white/10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.location} 
                            onSave={(val) => handleUpdate('personalInfo.location', val)} 
                            className="text-white hover:bg-white/10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 shrink-0" />
                        <InlineEdit readOnly={!onUpdate} 
                            value={data.personalInfo.website} 
                            onSave={(val) => handleUpdate('personalInfo.website', val)} 
                            className="text-white hover:bg-white/10"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Modern & Minimal (and default)
    return (
        <header
            className={cn(
                "mb-8",
                theme === "modern" && "border-b-2 border-slate-900 pb-6 text-left",
                theme === "minimal" && "text-center pb-8 border-b border-slate-200"
            )}
        >
            <div
                className={cn(
                    "font-bold uppercase tracking-tight mb-2 w-full",
                    theme === "modern" && "text-4xl",
                    theme === "minimal" && "text-3xl tracking-widest font-normal"
                )}
            >
                <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.fullName} 
                    placeholder="Your Name"
                    onSave={(val) => handleUpdate('personalInfo.fullName', val)} 
                    className={theme === "minimal" ? "text-center w-full block" : ""}
                />
            </div>
            <div
                className={cn(
                    "text-lg text-slate-600 mb-4 w-full",
                    theme === "minimal" && "italic text-center"
                )}
            >
                <InlineEdit readOnly={!onUpdate} 
                    value={data.personalInfo.summary} 
                    placeholder="Professional Summary"
                    multiline
                    onSave={(val) => handleUpdate('personalInfo.summary', val)} 
                    className={theme === "minimal" ? "text-center w-full block" : ""}
                />
            </div>

            <div
                className={cn(
                    "flex flex-wrap gap-4 text-sm text-slate-600",
                    theme === "minimal" && "justify-center"
                )}
            >
                <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <InlineEdit readOnly={!onUpdate} 
                        value={data.personalInfo.email} 
                        placeholder="Email"
                        onSave={(val) => handleUpdate('personalInfo.email', val)} 
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <InlineEdit readOnly={!onUpdate} 
                        value={data.personalInfo.phone} 
                        placeholder="Phone"
                        onSave={(val) => handleUpdate('personalInfo.phone', val)} 
                    />
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <InlineEdit readOnly={!onUpdate} 
                        value={data.personalInfo.location} 
                        placeholder="Location"
                        onSave={(val) => handleUpdate('personalInfo.location', val)} 
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <InlineEdit readOnly={!onUpdate} 
                        value={data.personalInfo.website} 
                        placeholder="Website"
                        onSave={(val) => handleUpdate('personalInfo.website', val)} 
                    />
                </div>
            </div>
        </header>
    );
}
