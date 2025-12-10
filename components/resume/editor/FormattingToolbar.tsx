"use client";

import { useEditorContext } from "./EditorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Sparkles, Loader2, ArrowUp, CheckCircle2, Minimize2, Maximize2, CornerDownLeft, Languages, Wand2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useResumeUpdate } from "@/lib/hooks/use-resume-update";
import { ResumeData } from "@/lib/schemas/resume";
import { useLayoutEffect, useRef, useState, useEffect } from "react";

interface FormattingToolbarProps {
  resumeData: ResumeData;
  onUpdate: (data: ResumeData) => void;
  theme: string;
}


export function FormattingToolbar({ resumeData, onUpdate, theme }: FormattingToolbarProps) {
  const { 
      focusedField, hasSelection, setAiProcessingField,
      aiOpen, setAiOpen, lockedField, setLockedField 
  } = useEditorContext();
  const { updateField } = useResumeUpdate(resumeData, onUpdate);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const [aiInstruction, setAiInstruction] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Helper to get current value
  const getCurrentValue = () => {
    const target = lockedField || focusedField;
    if (!target) return "";
    const parts = target.split(/[.\[\]]/).filter(Boolean);
    let current = resumeData as any;
    for (const part of parts) {
        if (current === undefined || current === null) return "";
        const index = parseInt(part);
        if (!isNaN(index)) {
             current = current[index];
        } else {
             current = current[part];
        }
    }
    return typeof current === 'string' ? current : "";
  };

  const handleAskAi = async (overrideInstruction?: string) => {
      const currentText = getCurrentValue();
      const instructionToUse = overrideInstruction || aiInstruction;

      console.log("Asking AI:", { currentText, overrideInstruction, aiInstruction });
      
      // If we have no text AND no instruction, we can't do anything
      if (!currentText && !instructionToUse) return;
      const targetField = lockedField || focusedField;
      
      // Use raw path as context - AI can understand "experience[0].company.content"
      const fieldContext = targetField;

      setIsAiLoading(true);
      setAiProcessingField(targetField);
      
      try {
          const res = await fetch("/api/improve-writing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  text: currentText, 
                  instruction: instructionToUse,
                  resumeData, // Pass full context
                  fieldContext 
              })
          });
          const data = await res.json();
          if (data.improvedText) {
              setAiResult(data.improvedText);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsAiLoading(false);
          setAiProcessingField(null);
      }
  };

  const handleAcceptAi = () => {
      const target = lockedField || focusedField;
      if (aiResult && target) {
          updateField(target, aiResult);
          setAiOpen(false);
          setLockedField(null);
          setAiResult(null);
          setAiInstruction("");
      }
  };



  useLayoutEffect(() => {
    const updatePosition = () => {
        let targetRect: DOMRect | null = null;
        
        // Priority 1: Locked Field (Strict AI Context)
        if (aiOpen && lockedField) {
             const element = document.querySelector(`[data-path="${lockedField}"]`);
             if (element) {
                 targetRect = element.getBoundingClientRect();
             }
        } 
        
        // Priority 2: Current Focus (Selection or Element) - Only if NOT in AI mode or AI didn't find target
        if (!targetRect && focusedField) {
             // Try Text Selection first
             if (hasSelection) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const selectionRect = range.getBoundingClientRect();
                    
                    let containerRect = selectionRect;
                    if (selectionRect.width === 0 && selectionRect.height === 0) {
                        const anchorNode = selection.anchorNode;
                        if (anchorNode) {
                            const element = anchorNode.nodeType === Node.TEXT_NODE 
                                ? anchorNode.parentElement 
                                : anchorNode as Element;
                            if (element) {
                                containerRect = element.getBoundingClientRect();
                            }
                        }
                    }
                    if (containerRect.width > 0 || containerRect.height > 0) {
                        targetRect = containerRect;
                    }
                }
             }
             
             // Fallback to Element (e.g. Skills)
             if (!targetRect) {
                 const element = document.querySelector(`[data-path="${focusedField}"]`);
                 if (element) {
                     targetRect = element.getBoundingClientRect();
                 }
             }
        }
        
        if (!targetRect) return;

        const toolbarHeight = 45;
        const stickyTop = 80;
        const naturalTop = targetRect.top - toolbarHeight;
        
        const calculatedTop = Math.min(
            Math.max(naturalTop, stickyTop),
            targetRect.bottom - toolbarHeight
        );

        setPosition({
            top: calculatedTop,
            left: targetRect.left + targetRect.width / 2
        });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { capture: true });
    window.addEventListener("resize", updatePosition);

    return () => {
        window.removeEventListener("scroll", updatePosition, { capture: true });
        window.removeEventListener("resize", updatePosition);
    };
  }, [focusedField, hasSelection, aiOpen, lockedField]);

  // Determine current alignment based on focused field path
  // Prioritize lockedField if AI is open so alignment/positioning stays with the AI task
  const activeTarget = lockedField || focusedField;

  if (!aiOpen && (!focusedField || !hasSelection)) return null;
  // If AI IS open, we render even if selection is lost, using lockedField if available

  // Helper to determine effective alignment
  const getEffectiveAlignment = (val?: string | null) => {
      return val || (theme === "minimal" ? "center" : "left");
  };

  let alignmentPath = "";
  let currentAlignment = "left";
  const targetField = activeTarget || "";

  if (targetField === "personalInfo.summary.content") {
      alignmentPath = "personalInfo.summary.alignment";
      currentAlignment = getEffectiveAlignment((resumeData.personalInfo as any)?.summary?.alignment);
  } else if (targetField === "personalInfo.headerSummary.content") {
      alignmentPath = "personalInfo.headerSummary.alignment";
      currentAlignment = getEffectiveAlignment((resumeData.personalInfo as any)?.headerSummary?.alignment);
  } else if (targetField.endsWith(".content")) {
      // Generic handler for RichTextField which always stores data in { content, alignment }
      // and whose value path ends in ".content"
      alignmentPath = targetField.replace(/\.content$/, ".alignment");
      
      // Resolve current alignment value from path
      const parts = alignmentPath.split(/[.\[\]]/).filter(Boolean);
      let val: any = resumeData;
      for (const part of parts) {
          if (val === undefined || val === null) {
              val = undefined;
              break;
          }
          const index = parseInt(part);
          if (!isNaN(index)) {
              val = val[index];
          } else {
              val = val[part];
          }
      }
      currentAlignment = getEffectiveAlignment(val as string | null);
  }

  // If we couldn't resolve a valid alignment target, AND we're not just in AI mode...
  // BUT we want to show the toolbar for ALL fields to allow AI usage (e.g. skills, job title)
  // even if they don't support alignment.
  // So we only return null if there is NO target field at all.
  if (!targetField && !aiOpen) return null;


  // Helper helper to check if alignment should be disabled
  // Schema allows alignment on all RichTextFields, including dates
  // If alignmentPath is null (not in schema allowlist), alignment is disabled.
  const alignmentDisabled = !alignmentPath;

  return (
    <>
      <div 
          ref={toolbarRef}
          className="fixed z-[500] flex items-center space-x-1 bg-slate-900 text-white rounded-lg p-1 border border-slate-700 shadow-2xl backdrop-blur-md"
          style={{ 
              top: position.top, 
              left: position.left,
              transform: "translateX(-50%)" 
          }}
      >
        <ToolbarButton
          icon={AlignLeft}
          isActive={currentAlignment === "left" || !currentAlignment}
          onClick={() => alignmentPath && updateField(alignmentPath, "left")}
          disabled={alignmentDisabled}
        />
        <ToolbarButton
          icon={AlignCenter}
          isActive={currentAlignment === "center"}
          onClick={() => alignmentPath && updateField(alignmentPath, "center")}
          disabled={alignmentDisabled}
        />
        <ToolbarButton
          icon={AlignRight}
          isActive={currentAlignment === "right"}
          onClick={() => alignmentPath && updateField(alignmentPath, "right")}
          disabled={alignmentDisabled}
        />
        <ToolbarButton
          icon={AlignJustify}
          isActive={currentAlignment === "justify"}
          onClick={() => alignmentPath && updateField(alignmentPath, "justify")}
          disabled={alignmentDisabled}
        />
        

        <div className="w-[1px] h-4 bg-slate-700 mx-1" />

        <DropdownMenu
          open={aiOpen}
          onOpenChange={(open) => {
              // Standard close attempt (e.g. Esc key), mostly handled by onInteractOutside for clicks
              if (!open) {
                  if (isAiLoading || aiResult) {
                      setShowDiscardDialog(true);
                      return;
                  }
                  setAiOpen(false);
                  setLockedField(null);
                  setAiResult(null);
                  setAiInstruction("");
              } else {
                 setAiOpen(true);
                 setLockedField(focusedField);
                 setAiResult(null);
                 setAiInstruction("");
                 setIsAiLoading(false);
              }
          }}
          modal={false} // Always non-modal to prevent flashing; we handle blocking manually
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
              className="w-[500px] p-0 bg-white border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-800 z-[501]"
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
                          <button
                              className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors group text-left"
                              onClick={() => {
                                  setAiInstruction("Help me fill out this field");
                                  handleAskAi("Help me fill out this field");
                              }}
                          >
                              <div className="flex items-center gap-2">
                                  <Wand2 className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                                  <span>Help me fill out</span>
                              </div>
                          </button>
                          <button
                              className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors group text-left"
                              onClick={() => {
                                  setAiInstruction("Improve writing");
                                  handleAskAi("Improve writing");
                              }}
                          >
                              <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                                  <span>Improve writing</span>
                              </div>
                          </button>

                          <button
                              className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors group text-left"
                              onClick={() => {
                                  setAiInstruction("Fix spelling & grammar");
                                  handleAskAi("Fix spelling & grammar");
                              }}
                          >
                              <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  <span>Fix spelling & grammar</span>
                              </div>
                          </button>

                           <button
                              className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors group text-left"
                              onClick={() => {
                                  setAiInstruction("Make shorter");
                                  handleAskAi("Make shorter");
                              }}
                          >
                              <div className="flex items-center gap-2">
                                  <Minimize2 className="w-4 h-4 text-orange-500" />
                                  <span>Make shorter</span>
                              </div>
                          </button>

                           <button
                              className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors group text-left"
                              onClick={() => {
                                  setAiInstruction("Make longer");
                                  handleAskAi("Make longer");
                              }}
                          >
                              <div className="flex items-center gap-2">
                                  <Maximize2 className="w-4 h-4 text-blue-500" />
                                  <span>Make longer</span>
                              </div>
                          </button>

                           <button
                              className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors group text-left"
                              onClick={() => {
                                  setAiInstruction("Translate to English");
                                  handleAskAi("Translate to English");
                              }}
                          >
                              <div className="flex items-center gap-2">
                                  <Languages className="w-4 h-4 text-sky-500" />
                                  <span>Translate to English</span>
                              </div>
                          </button>
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
      </div>

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
                setAiOpen(false);
                setLockedField(null);
                setAiResult(null);
                setAiInstruction("");
                setShowDiscardDialog(false);
            }}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ToolbarButton({ icon: Icon, isActive, onClick, className, disabled }: { icon: any, isActive: boolean, onClick: () => void, className?: string, disabled?: boolean }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className={cn(
                "w-7 h-7 rounded-sm transition-all",
                isActive ? "bg-blue-500 text-white shadow-sm" : "hover:bg-slate-700 text-slate-400 hover:text-slate-200",
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent text-slate-600",
                className
            )}
            onMouseDown={(e) => {
                e.preventDefault(); 
            }}
            onClick={(e) => {
                e.preventDefault();
                if (!disabled) onClick();
            }}
        >
            <Icon className="w-4 h-4" />
        </Button>
    )
}
