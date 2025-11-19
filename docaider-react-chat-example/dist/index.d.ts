import * as react_jsx_runtime from 'react/jsx-runtime';

interface ChatWidgetProps {
    knowledgeBaseId: string;
    apiEndpoint?: string;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    theme?: {
        primaryColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    appearance?: {
        width?: string;
        height?: string;
        iconSize?: string;
        showButtonText?: boolean;
        buttonText?: string;
        title?: string;
    };
    behavior?: {
        welcomeMessage?: string;
        inputPlaceholder?: string;
        autoOpen?: boolean;
    };
    onOpen?: () => void;
    onClose?: () => void;
    onMessageSent?: (message: string) => void;
}
interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: Date;
}
interface ChatState {
    isOpen: boolean;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    chatId: string | null;
}
interface ChatConfig {
    knowledgeBaseId: string;
    apiEndpoint: string;
    chatId: string | null;
    theme: Required<ChatWidgetProps["theme"]>;
    appearance: Required<ChatWidgetProps["appearance"]>;
    behavior: Required<ChatWidgetProps["behavior"]>;
}

declare function ChatWidget({ knowledgeBaseId, apiEndpoint, position, theme, appearance, behavior, onOpen, onClose, onMessageSent, }: ChatWidgetProps): react_jsx_runtime.JSX.Element;

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
declare function ChatWindow({ messages, isLoading, error, status, config, onClose, onSendMessage, onStop, }: ChatWindowProps): react_jsx_runtime.JSX.Element;

interface ChatButtonProps {
    isOpen: boolean;
    config: ChatConfig;
    onToggle: () => void;
}
declare function ChatButton({ isOpen, config, onToggle }: ChatButtonProps): react_jsx_runtime.JSX.Element;

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    placeholder?: string;
    disabled?: boolean;
    primaryColor?: string;
}
declare function MessageInput({ onSendMessage, placeholder, disabled, primaryColor, }: MessageInputProps): react_jsx_runtime.JSX.Element;

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
declare function useDocaiderChat(config: ChatConfig): UseDocaiderChatReturn;

export { ChatButton, ChatConfig, ChatMessage, ChatState, ChatWidget, ChatWidgetProps, ChatWindow, MessageInput, ChatWidget as default, useDocaiderChat };
