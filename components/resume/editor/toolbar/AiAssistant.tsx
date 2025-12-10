import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { 
    Sparkles, 
    Loader2, 
    CornerDownLeft, 
    Wand2, 
    CheckCircle2, 
    Minimize2, 
    Maximize2, 
    Languages 
} from "lucide-react";
import { useAiAssistant } from "./useAiAssistant";
import { ResumeData } from "@/lib/schemas/resume";

interface AiAssistantProps {
    resumeData: ResumeData;
    updateField: (path: string, value: any) => void;
    focusedField: string | null;
    lockedField: string | null;
    setLockedField: (field: string | null) => void;
    aiOpen: boolean;
    setAiOpen: (open: boolean) => void;
    setAiProcessingField: (field: string | null) => void;
}

export function AiAssistant({
    resumeData,
    updateField,
    focusedField,
    lockedField,
    setLockedField,
    aiOpen,
    setAiOpen,
    setAiProcessingField
}: AiAssistantProps) {
    const {
        aiInstruction,
        setAiInstruction,
        isAiLoading,
        setIsAiLoading,
        aiResult,
        setAiResult,
        showDiscardDialog,
        setShowDiscardDialog,
        handleAskAi,
        handleAcceptAi,
        closeAi
    } = useAiAssistant({
        resumeData,
        updateField,
        focusedField,
        lockedField,
        setLockedField,
        setAiOpen,
        setAiProcessingField
    });

    return (
        <>
            <DropdownMenu
                open={aiOpen}
                onOpenChange={(open) => {
                    // Standard close attempt
                    if (!open) {
                        if (isAiLoading || aiResult) {
                            setShowDiscardDialog(true);
                            return;
                        }
                        closeAi();
                    } else {
                        setAiOpen(true);
                        setLockedField(focusedField);
                        // Reset state on open
                        setAiResult(null);
                        setAiInstruction("");
                        setIsAiLoading(false);
                    }
                }}
                modal={false}
            >
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "w-7 h-7 rounded-sm transition-all",
                            aiOpen ? "bg-purple-900/50 text-purple-400" : "hover:bg-slate-700 text-slate-400 hover:text-slate-200",
                            "text-purple-400 hover:text-purple-300"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    side="bottom"
                    sideOffset={10}
                    data-ai-menu="true"
                    className="w-[500px] p-0 bg-white border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-800 z-[8]"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                        if (aiOpen && (isAiLoading || aiResult)) {
                            e.preventDefault();
                            setShowDiscardDialog(true);
                        }
                    }}
                >
                    {!aiResult ? (
                        <>
                            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <Input
                                    value={aiInstruction}
                                    onChange={(e) => setAiInstruction(e.target.value)}
                                    placeholder="Ask AI anything..."
                                    className="border-none shadow-none focus-visible:ring-0 px-0 h-9 text-base bg-transparent placeholder:text-slate-400 flex-1 text-slate-900"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAskAi();
                                    }}
                                    autoFocus
                                    disabled={isAiLoading}
                                />
                                <div className="flex items-center gap-1 text-slate-400">
                                    {isAiLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                    ) : (
                                        <button
                                            onClick={() => handleAskAi()}
                                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                                        >
                                            <CornerDownLeft className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-2 bg-slate-50/50">
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5 mb-1">
                                    Suggested
                                </div>
                                <div className="space-y-0.5">
                                    <SuggestionButton 
                                        icon={Wand2} 
                                        label="Help me fill out" 
                                        color="text-purple-500 group-hover:text-purple-600"
                                        onClick={() => {
                                            setAiInstruction("Help me fill out this field");
                                            handleAskAi("Help me fill out this field");
                                        }}
                                    />
                                    <SuggestionButton 
                                        icon={Sparkles} 
                                        label="Improve writing" 
                                        color="text-purple-500 group-hover:text-purple-600"
                                        onClick={() => {
                                            setAiInstruction("Improve writing");
                                            handleAskAi("Improve writing");
                                        }}
                                    />
                                    <SuggestionButton 
                                        icon={CheckCircle2} 
                                        label="Fix spelling & grammar" 
                                        color="text-green-500"
                                        onClick={() => {
                                            setAiInstruction("Fix spelling & grammar");
                                            handleAskAi("Fix spelling & grammar");
                                        }}
                                    />
                                    <SuggestionButton 
                                        icon={Minimize2} 
                                        label="Make shorter" 
                                        color="text-orange-500"
                                        onClick={() => {
                                            setAiInstruction("Make shorter");
                                            handleAskAi("Make shorter");
                                        }}
                                    />
                                    <SuggestionButton 
                                        icon={Maximize2} 
                                        label="Make longer" 
                                        color="text-blue-500"
                                        onClick={() => {
                                            setAiInstruction("Make longer");
                                            handleAskAi("Make longer");
                                        }}
                                    />
                                    <SuggestionButton 
                                        icon={Languages} 
                                        label="Translate to English" 
                                        color="text-sky-500"
                                        onClick={() => {
                                            setAiInstruction("Translate to English");
                                            handleAskAi("Translate to English");
                                        }}
                                    />
                                  
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 bg-slate-50">
                            <div className="mb-3 text-sm text-slate-600">
                                {isAiLoading ? (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Thinking...
                                    </div>
                                ) : aiResult}
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setAiResult(null);
                                        setAiInstruction("");
                                    }}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    Discard
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAcceptAi}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    Replace Selection
                                </Button>
                            </div>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard AI Response?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have an active AI task. Doing this will discard the current progress. Are you sure?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            closeAi();
                        }}>
                            Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function SuggestionButton({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
    return (
        <button
            className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors group text-left"
            onClick={onClick}
        >
            <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", color)} />
                <span>{label}</span>
            </div>
        </button>
    )
}
