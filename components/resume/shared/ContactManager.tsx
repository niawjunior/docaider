"use client";

import { useResume } from "@/components/resume/state/ResumeContext";
import { InlineEdit } from "@/components/resume/editor/InlineEdit";
import { ThemeAddButton, ThemeDeleteButton } from "@/components/resume/themes/ThemeControls";
import { Mail, Phone, MapPin, Globe, Linkedin, Link as LinkIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactManagerProps {
    theme?: string;
    className?: string; // Container class
    itemClassName?: string; // Item wrapper class
    readOnly?: boolean;
    layout?: 'row' | 'column';
    align?: 'left' | 'center' | 'right';
}

export function ContactManager({ theme, className, itemClassName, readOnly, layout = 'column', align = 'left' }: ContactManagerProps) {
    const { data, updateField: handleUpdate, readOnly: contextReadOnly } = useResume();
    const isReadOnly = readOnly ?? contextReadOnly;
    const personalInfo = (data.personalInfo || {}) as any;

    const standardFields = [
        { key: 'email', icon: Mail, label: 'Email', placeholder: 'Email Address' },
        { key: 'phone', icon: Phone, label: 'Phone', placeholder: 'Phone Number' },
        { key: 'location', icon: MapPin, label: 'Location', placeholder: 'Location' },
        { key: 'website', icon: Globe, label: 'Website', placeholder: 'Website URL' },
        { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'LinkedIn URL' },
    ];

    const activeStandardFields = standardFields.filter(f => {
        const val = personalInfo[f.key as keyof typeof personalInfo];
        // Show if value exists, is undefined (default), or empty string.
        // Only hide if explicitly set to null (deleted via trash icon).
        return val !== null;
    });

    const additionalLinks = personalInfo.additionalLinks || [];
    
    return (
        <div className={cn(
            "flex gap-4", 
            layout === 'row' ? "flex-row flex-wrap items-center" : "flex-col",
            className
        )}>
             {/* Render Active Standard Fields */}
             {activeStandardFields.map(field => (
                 <div key={field.key} className={cn(
                    "flex items-end gap-2 group relative transition-all", 
                    layout === 'column' ? 'w-full' : '',
                    align === 'center' && "justify-center",
                    itemClassName
                 )}>
                     <field.icon className="w-4 h-4 opacity-70 shrink-0 mb-0.5" /> 
                     <div className={cn(align === 'center' ? "w-auto" : "flex-1 min-w-0")}>
                        <InlineEdit 
                            readOnly={isReadOnly}
                            value={(personalInfo[field.key as keyof typeof personalInfo] as string) === " " ? "" : personalInfo[field.key as keyof typeof personalInfo] as string}
                            placeholder={field.placeholder}
                            onSave={(val) => handleUpdate(`personalInfo.${field.key}`, val)}
                            path={`personalInfo.${field.key}`}
                            className={cn("min-w-[50px]", align !== 'center' && "w-full", align === 'center' && "text-center", align === 'right' && "text-right")}
                        />
                     </div>
                     {!isReadOnly && (
                         <ThemeDeleteButton 
                            className="bg-transparent hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors p-1 shrink-0"
                            onClick={() => handleUpdate(`personalInfo.${field.key}`, null)}
                         />
                     )}
                 </div>
             ))}

             {/* Render Additional Links */}
             {additionalLinks.map((link: { id: any; url: string | null | undefined; }, index: number) => (
                 <div key={link.id || index} className={cn(
                    "flex items-end gap-2 group relative transition-all", 
                    layout === 'column' ? 'w-full' : '',
                    align === 'center' && "justify-center",
                    itemClassName
                 )}>
                     <LinkIcon className="w-4 h-4 opacity-70 shrink-0 mb-0.5" />
                     <div className={cn("flex gap-2", align === 'center' ? "w-auto" : "flex-1 min-w-0")}>
                         {/* We can maybe allow editing label? For now just value. */}
                        <InlineEdit 
                            readOnly={isReadOnly}
                            value={link.url}
                            placeholder="Link URL"
                            onSave={(val) => {
                                const newLinks = [...additionalLinks];
                                newLinks[index] = { ...link, url: val };
                                handleUpdate('personalInfo.additionalLinks', newLinks);
                            }}
                            className={cn("min-w-[50px]", align !== 'center' && "w-full", align === 'center' && "text-center", align === 'right' && "text-right")}
                        />
                     </div>
                     {!isReadOnly && (
                         <ThemeDeleteButton 
                            className="bg-transparent hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors p-1"
                            onClick={() => {
                                const newLinks = [...additionalLinks];
                                newLinks.splice(index, 1);
                                handleUpdate('personalInfo.additionalLinks', newLinks);
                            }}
                         />
                     )}
                 </div>
             ))}

             {/* Add Button Dropdown */}
             {!isReadOnly && (
                 <div className="pt-2 flex justify-center md:justify-start">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={cn(
                                "text-sm gap-2",
                                // Theme-aware button colors
                                (theme === 'minimal' || theme === 'portfolio') 
                                    ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100" 
                                    : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                            )}>
                                <Plus className="w-4 h-4" /> Add Contact
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className={cn(
                            "w-48",
                            (theme === 'minimal' || theme === 'portfolio') 
                                ? "bg-white border-slate-200 text-slate-900" 
                                : "bg-slate-900 border-slate-800 text-slate-50"
                        )}>
                             {standardFields.filter(f => personalInfo[f.key] === null).map(f => (
                                 <DropdownMenuItem 
                                    key={f.key} 
                                    onClick={() => handleUpdate(`personalInfo.${f.key}`, "")} // Set to empty string to make it visible
                                    className={cn(
                                        "cursor-pointer",
                                        (theme === 'minimal' || theme === 'portfolio') 
                                            ? "hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900" 
                                            : "hover:bg-slate-800 focus:bg-slate-800 focus:text-slate-50"
                                    )}
                                 >
                                     <f.icon className="w-4 h-4 mr-2" />
                                     {f.label}
                                 </DropdownMenuItem>
                             ))}
                             <DropdownMenuItem 
                                onClick={() => {
                                    const newLink = { id: crypto.randomUUID(), label: "Custom Link", url: "https://" };
                                    const newLinks = [...(personalInfo.additionalLinks || []), newLink];
                                    handleUpdate('personalInfo.additionalLinks', newLinks);
                                }}
                                className={cn(
                                    "cursor-pointer",
                                    (theme === 'minimal' || theme === 'portfolio') 
                                        ? "hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900" 
                                        : "hover:bg-slate-800 focus:bg-slate-800 focus:text-slate-50"
                                )}
                             >
                                 <LinkIcon className="w-4 h-4 mr-2" />
                                 Custom Link
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                 </div>
             )}
        </div>
    );
}
