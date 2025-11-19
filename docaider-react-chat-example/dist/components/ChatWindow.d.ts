import { ChatConfig } from "../types";
interface ChatWindowProps {
    messages: any[];
    isLoading: boolean;
    error: string | null | undefined;
    status: string;
    config: ChatConfig;
    onClose: () => void;
    onSendMessage: (message: string) => void;
    onStop: () => void;
}
export declare function ChatWindow({ messages, isLoading, error, status, config, onClose, onSendMessage, onStop, }: ChatWindowProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ChatWindow.d.ts.map