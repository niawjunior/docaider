import { ChatConfig } from "../types";
interface UseDocaiderChatReturn {
    isOpen: boolean;
    messages: any[];
    isLoading: boolean;
    error: string | null | undefined;
    chatId: string | null;
    status: string;
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
    sendMessage: (message: string) => void;
    stop: () => void;
    config: ChatConfig;
}
export declare function useDocaiderChat(config: ChatConfig): UseDocaiderChatReturn;
export {};
//# sourceMappingURL=useDocaiderChat.d.ts.map