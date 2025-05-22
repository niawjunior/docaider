import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ToolsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tools: Array<{
    name: string;
    description: string;
    enabled: boolean;
    id: string;
  }>;
  toolIcons: Record<string, React.ReactNode>;
  onUpdateConfig: (updates: Partial<Record<string, boolean>>) => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onOpenChange,
  tools,
  toolIcons,
  onUpdateConfig,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Tools</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {toolIcons[tool.id] || (
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                  )}{" "}
                  {/* Placeholder icon */}
                  <div>
                    <Label
                      htmlFor={`tool-switch-${tool.id}`}
                      className="font-medium"
                    >
                      {tool.name}
                    </Label>
                    <p className="text-xs text-gray-500">{tool.description}</p>
                  </div>
                </div>
                <Switch
                  id={`tool-switch-${tool.id}`}
                  checked={tool.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdateConfig({ [tool.id]: enabled })
                  }
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ToolsModal;
