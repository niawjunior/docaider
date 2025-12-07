import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Image as ImageIcon, Link as LinkIcon, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentCover?: string | null;
}

const PRESETS = [
  "/images/covers/photo-1618005182384-a83a8bd57fbe.avif", // Abstract Dark
  "/images/covers/photo-1550684848-fac1c5b4e853.avif", // Minimal Gradient
  "/images/covers/photo-1579546929518-9e396f3cc809.avif", // Colorful Gradient
  "/images/covers/photo-1506744038136-46273834b3fb.avif", // Landscape
  "/images/covers/photo-1451187580459-43490279c0fa.avif", // Tech/Space
];

export function CoverImagePicker({ open, onOpenChange, onSelect, currentCover }: CoverImagePickerProps) {
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("presets");

  const handleCustomSubmit = () => {
    if (url) {
      onSelect(url);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle>Change Cover Image</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="presets" className="data-[state=active]:bg-slate-700">Gallery</TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-slate-700">Custom URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="mt-4 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 {PRESETS.map((preset, i) => (
                     <button
                        key={i}
                        className={cn(
                            "relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:opacity-100",
                            currentCover === preset ? "border-blue-500 opacity-100 ring-2 ring-blue-500/50" : "border-transparent opacity-60 hover:border-slate-600"
                        )}
                        onClick={() => {
                            onSelect(preset);
                            onOpenChange(false);
                        }}
                     >
                         <img src={preset} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                     </button>
                 ))}
             </div>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-4 space-y-4">
            <div className="space-y-4 py-8">
                <div className="flex items-center space-x-2">
                    <Input 
                        placeholder="https://example.com/image.jpg" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                    />
                    <Button onClick={handleCustomSubmit} disabled={!url} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Set
                    </Button>
                </div>
                <div className="text-xs text-slate-500 text-center">
                    Enter any public image URL. Unsplash URLs work best.
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
