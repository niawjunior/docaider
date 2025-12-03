import { ref } from "vue";
import type { EmbedChatBoxRef, EmbedTool } from "../components/EmbedChatBox";

// Singleton state to hold the active chat instance reference
const activeChatInstance = ref<EmbedChatBoxRef | null>(null);
const pendingActions = ref<Array<() => void>>([]);

export function useDocaiderEmbed() {
  const registerInstance = (instance: EmbedChatBoxRef) => {
    activeChatInstance.value = instance;
    // Process pending actions
    if (pendingActions.value.length > 0) {
      pendingActions.value.forEach(action => action());
      pendingActions.value = [];
    }
  };

  const safeCall = (fn: (instance: EmbedChatBoxRef) => void) => {
    if (activeChatInstance.value) {
      fn(activeChatInstance.value);
    } else {
      pendingActions.value.push(() => {
        if (activeChatInstance.value) {
          fn(activeChatInstance.value);
        }
      });
    }
  };

  const open = () => safeCall(i => i.open());
  const close = () => safeCall(i => i.close());
  const toggle = () => safeCall(i => i.toggle());
  const setWelcomeMessage = (message?: string) => safeCall(i => i.setWelcomeMessage(message));
  const setMessage = (message: string) => safeCall(i => i.setMessage(message));
  const sendMessage = (message: string) => safeCall(i => i.sendMessage(message));
  
  const useTool = (tool: EmbedTool, options?: { content?: string; prompt?: string }) => {
    safeCall(i => i.useTool(tool, options));
  };

  const useKnowledge = (nameOrContext: string | any, content?: any) => {
    safeCall(i => i.useKnowledge(nameOrContext, content));
  };

  return {
    open,
    close,
    toggle,
    setWelcomeMessage,
    setMessage,
    sendMessage,
    useTool,
    useKnowledge,
    // Internal use only
    _registerInstance: registerInstance,
  };
}
