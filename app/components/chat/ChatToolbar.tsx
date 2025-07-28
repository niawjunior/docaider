"use client";

import { useTranslations } from "next-intl";
import { TiDelete } from "react-icons/ti";
import { FaFilePdf, FaHammer, FaQuestion } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tool {
  name: string;
  description: string;
}

interface ChatToolbarProps {
  isShowTool?: boolean;
  messages: any[];
  documents: any[];
  currentTool: string;
  setCurrentTool: (tool: string) => void;
  onOpenPdfModal: () => void;
  onOpenShareModal: () => void;
  isKnowledgeBase?: boolean;
}

const toolIcons = {
  askQuestion: <FaQuestion />,
};

export default function ChatToolbar({
  isShowTool,
  documents,
  currentTool,
  setCurrentTool,
  onOpenPdfModal,
}: ChatToolbarProps) {
  const t = useTranslations("chat");

  const tools: Tool[] = [
    {
      name: "askQuestion",
      description: t("askQuestionDescription"),
    },
  ];

  return (
    <div className="flex justify-between items-center pt-2">
      <div className="flex gap-2">
        {isShowTool && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    className="ml-2 relative"
                    size="icon"
                    onClick={onOpenPdfModal}
                  >
                    <FaFilePdf className="h-8 w-8" />
                    <div className="absolute text-[10px] top-[-10px] right-[-10px] w-5 h-5 flex items-center justify-center bg-orange-500 rounded-full">
                      {documents?.length}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("manageDocuments")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Button variant="outline" className="ml-2 relative" size="icon">
                  <FaHammer className="h-8 w-8" />
                  <div className="absolute text-[10px] top-[-10px] right-[-10px] w-5 h-5 flex items-center justify-center bg-orange-500 rounded-full">
                    {tools.length}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="h-[300px] max-w-[300px]"
                align="start"
                side="top"
                sideOffset={10}
                alignOffset={-25}
              >
                <DropdownMenuLabel>{t("availableTools")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tools.map((tool) => (
                  <DropdownMenuCheckboxItem
                    key={tool.name}
                    className="flex items-center gap-2 px-2 cursor-pointer"
                    checked={currentTool === tool.name}
                    onCheckedChange={() => setCurrentTool(tool.name)}
                  >
                    <div className="h-8 w-8 flex items-center justify-center">
                      {toolIcons[tool.name as keyof typeof toolIcons]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium leading-none truncate">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 ">
                        {tool.description}
                      </p>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {currentTool && (
              <Button
                onClick={() => setCurrentTool("")}
                variant="outline"
                className="ml-1 text-xs cursor-pointer border hover:text-white"
              >
                {currentTool}
                <TiDelete className="ml-1" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
