import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableSectionItemProps {
    id: string;
    label: string;
    isCustom: boolean;
    onDelete?: () => void;
}

export function SortableSectionItem({ id, label, isCustom, onDelete }: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cn(
            "flex items-center justify-between p-3 border border-slate-800 rounded-md shadow-sm select-none cursor-grab active:cursor-grabbing hover:bg-slate-900/50 transition-colors",
            isDragging && "opacity-50"
        )}>
            <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-sm">{label}</span>
                {isCustom && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Custom</span>}
            </div>
             {onDelete && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}

export function ItemOverlay({ label }: { label: string }) {
     return (
        <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 shadow-xl cursor-grabbing rounded-md">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-sm text-slate-200">{label}</span>
        </div>
     );
}
