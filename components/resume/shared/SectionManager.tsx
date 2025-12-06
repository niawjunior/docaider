import { DndContext, DragEndEvent, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ResumeData } from "@/lib/schemas/resume";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GripVertical, Layers, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SectionManagerProps {
    data: ResumeData;
    onUpdate: (data: ResumeData) => void;
}

interface SectionItem {
    id: string;
    label: string;
    isCustom: boolean;
}

export function SectionManager({ data, onUpdate }: SectionManagerProps) {
    const { updateField } = useResumeUpdate(data, onUpdate);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    // Initialize order if missing
    useEffect(() => {
        if (!data.sectionOrder || data.sectionOrder.length === 0) {
            const defaultOrder = ["experience", "education", "projects", "skills"];
            // Add existing custom sections
            if (data.customSections) {
                data.customSections.forEach(s => defaultOrder.push(s.id));
            }
            updateField('sectionOrder', defaultOrder);
        } else {
             // Ensure all custom sections are in the order list
             const currentIds = new Set(data.sectionOrder);
             let hasMissing = false;
             const newOrder = [...data.sectionOrder];
             
             // Add missing custom sections
             data.customSections?.forEach(s => {
                 if (!currentIds.has(s.id)) {
                     newOrder.push(s.id);
                     hasMissing = true;
                 }
             });

             // Cleanup deleted custom sections
             // (We keep standard sections even if not in use, but could filter valid IDs)
             
             if (hasMissing) {
                updateField('sectionOrder', newOrder);
             }
        }
    }, [data.customSections?.length, open]); 

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getLabel = (id: string) => {
        switch (id) {
            case 'experience': return 'Experience';
            case 'education': return 'Education';
            case 'projects': return 'Projects';
            case 'skills': return 'Skills';
            case 'summary': return 'Summary';
            default:
                const custom = data.customSections?.find(c => c.id === id);
                return custom ? custom.title : 'Unknown Section';
        }
    };

    const isCustom = (id: string) => {
         return !!data.customSections?.find(c => c.id === id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = (data.sectionOrder || []).indexOf(active.id as string);
            const newIndex = (data.sectionOrder || []).indexOf(over.id as string);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(data.sectionOrder || [], oldIndex, newIndex);
                updateField('sectionOrder', newOrder);
            }
        }
        setActiveId(null);
    };

    const handleAddCustomSection = () => {
        const newId = crypto.randomUUID();
        const newSection = {
            id: newId,
            title: "New Section",
            type: "list" as const,
            items: []
        };
        
        // Add to customSections
        const newCustomSections = [...(data.customSections || []), newSection];
        
        // Add to order
        const newOrder = [...(data.sectionOrder || []), newId];
        
        onUpdate({
            ...data,
            customSections: newCustomSections,
            sectionOrder: newOrder
        });
    };

    const handleDeleteCustomSection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this section?")) return;

        const newCustomSections = (data.customSections || []).filter(c => c.id !== id);
        const newOrder = (data.sectionOrder || []).filter(o => o !== id);

        onUpdate({
            ...data,
            customSections: newCustomSections,
            sectionOrder: newOrder
        });
    };

    // Filter out invalid IDs (e.g. deleted custom sections that might stuck in order)
    const validOrder = (data.sectionOrder || []).filter(id => {
        if (["experience", "education", "projects", "skills", "summary"].includes(id)) return true;
        return data.customSections?.find(c => c.id === id);
    });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Layers className="w-4 h-4" />
                    Manage Sections
                </Button>
            </SheetTrigger>
            <SheetContent className="px-4">
                <SheetHeader className="px-0">
                    <SheetTitle>Manage Sections</SheetTitle>
                    <SheetDescription>
                        Reorder sections or add new ones to customize your resume layout.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={(e) => setActiveId(e.active.id as string)}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={validOrder} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {validOrder.map((id) => (
                                    <SortableItem 
                                        key={id} 
                                        id={id} 
                                        label={getLabel(id)} 
                                        isCustom={isCustom(id)}
                                        onDelete={isCustom(id) ? (e) => handleDeleteCustomSection(id, e) : undefined}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                             {activeId ? (
                                <ItemOverlay label={getLabel(activeId)} />
                             ) : null}
                        </DragOverlay>
                    </DndContext>

                     <Button onClick={handleAddCustomSection} className="w-full mt-4 gap-2" variant="outline">
                        <Plus className="w-4 h-4" />
                        Add Custom Section
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function SortableItem({ id, label, isCustom, onDelete }: { id: string, label: string, isCustom: boolean, onDelete?: (e: React.MouseEvent) => void }) {
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
            "flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm select-none cursor-grab active:cursor-grabbing",
            isDragging && "shadow-lg scale-[1.02]"
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
                    onClick={onDelete}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}

function ItemOverlay({ label }: { label: string }) {
     return (
        <div className="flex items-center gap-3 p-3 bg-white border border-blue-500/50 ring-2 ring-blue-500/20 rounded-md shadow-xl cursor-grabbing">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-sm">{label}</span>
        </div>
     );
}
