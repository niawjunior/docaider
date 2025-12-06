import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeAddButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

export function ThemeAddButton({ onClick, label = "Add", className }: ThemeAddButtonProps) {
    return (
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClick}
            className={cn("gap-1", className)}
        >
            <Plus className="w-3 h-3" /> 
            {label && <span>{label}</span>}
        </Button>
    );
}

interface ThemeDeleteButtonProps {
    onClick: () => void;
    className?: string;
}

export function ThemeDeleteButton({ onClick, className }: ThemeDeleteButtonProps) {
    return (
        <Button 
            variant="ghost"
            size="icon"
            className={cn("w-8 h-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20", className)}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    );
}
