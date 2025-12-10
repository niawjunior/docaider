import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ResumeData } from "@/lib/schemas/resume";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import { SortableSectionItem, ItemOverlay } from "@/components/resume/shared/SortableSectionItem";
import { useSectionManagement } from "@/components/resume/editor/hooks/useSectionManagement";


interface SectionManagerProps {
    data: ResumeData;
    onUpdate: (data: ResumeData) => void;
}

export function SectionManager({ data, onUpdate }: SectionManagerProps) {
    const [open, setOpen] = useState(false);

    const {
        activeId,
        setActiveId,
        getLabel,
        isCustom,
        handleDragEnd,
        handleAddCustomSection,
        handleDeleteCustomSection,
        validOrder
    } = useSectionManagement({ data, onUpdate, open });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-white/10 dark">
                    <Layers className="w-4 h-4" />
                    Manage Sections
                </Button>
            </SheetTrigger>
            <SheetContent className="px-4 dark text-foreground">
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
                                    <SortableSectionItem 
                                        key={id} 
                                        id={id} 
                                        label={getLabel(id) || "Untitled"} 
                                        isCustom={isCustom(id)}
                                        onDelete={isCustom(id) ? () => handleDeleteCustomSection(id) : undefined}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                             {activeId ? (
                                <ItemOverlay label={getLabel(activeId) || "Untitled"} />
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

