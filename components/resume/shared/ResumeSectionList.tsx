import React, { useMemo, useEffect } from "react";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeSectionListProps<T> {
  data: T[];
  onUpdate?: (newData: T[]) => void;
  renderItem: (
    item: T, 
    index: number, 
    updateItem: (val: Partial<T>) => void, 
    deleteItem: () => void
  ) => React.ReactNode;
  className?: string;
  strategy?: "vertical" | "rect";
}

// Extends T with potential ID for internal use
type ItemWithId = { id?: string } & Record<string, any>;

function SortableItem({ 
    id, 
    children, 
    className,
    dragEnabled 
}: { 
    id: string; 
    children: React.ReactNode; 
    className?: string;
    dragEnabled?: boolean;
}) {
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
    zIndex: isDragging ? 50 : "auto",
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative group/sortable", className)}>
       {dragEnabled && (
         <div 
            {...attributes} 
            {...listeners}
            className="absolute -left-6 top-2.5 p-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing opacity-0 group-hover/sortable:opacity-100 transition-opacity z-10"
         >
             <GripVertical className="w-4 h-4" />
         </div>
       )}
       {children}
    </div>
  );
}

export function ResumeSectionList<T extends ItemWithId>({ 
    data, 
    onUpdate, 
    renderItem, 
    className,
    strategy
}: ResumeSectionListProps<T>) {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 1. Ensure all items have IDs for DnD
  // If data comes from DB without IDs, we patch it on mount/update.
  // We use a stable check to avoid infinite loops.
  useEffect(() => {
     if (!onUpdate || !data) return;
     
     const itemsMissingIds = data.some(item => !item.id);
     if (itemsMissingIds) {
         // Patch data with IDs
         const updatedData = data.map(item => item.id ? item : { ...item, id: crypto.randomUUID() });
         onUpdate(updatedData);
     }
  }, [data, onUpdate]);

  const items = useMemo(() => data || [], [data]);

  // If no onUpdate, just render list (read-only mode)
  if (!onUpdate) {
      if (!items.length) return null;
      return (
        <div className={className}>
          {items.map((item, index) => (
             <div key={index} className="relative">
                 {renderItem(
                    item, 
                    index, 
                    () => {}, 
                    () => {} 
                 )}
             </div>
          ))}
        </div>
      );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
       const oldIndex = items.findIndex((item) => item.id === active.id);
       const newIndex = items.findIndex((item) => item.id === over.id);
       
       if (oldIndex !== -1 && newIndex !== -1) {
           const newOrder = arrayMove(items, oldIndex, newIndex);
           onUpdate(newOrder);
       }
    }
  };

  if (!items.length) return null;

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
          items={items.map(item => item.id || `temp-${Math.random()}`)} 
          strategy={strategy === "rect" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item, index) => (
             <SortableItem 
                key={item.id || index} 
                id={item.id || `item-${index}`}
                dragEnabled={!!onUpdate}
             >
                {renderItem(
                    item, 
                    index, 
                    (updates) => {
                         const newData = [...items];
                         newData[index] = { ...newData[index], ...updates };
                         onUpdate(newData);
                    },
                    () => {
                         const newData = [...items];
                         newData.splice(index, 1);
                         onUpdate(newData);
                    }
                )}
             </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
