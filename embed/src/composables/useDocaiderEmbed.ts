import { ref } from "vue";
import type { EmbedChatBoxRef } from "../components/EmbedChatBox";

// Singleton state to hold the active chat instance reference
const activeChatInstance = ref<EmbedChatBoxRef | null>(null);

export function useDocaiderEmbed() {
  const registerInstance = (instance: EmbedChatBoxRef) => {
    activeChatInstance.value = instance;
  };

  const open = () => {
    activeChatInstance.value?.open();
  };

  const close = () => {
    activeChatInstance.value?.close();
  };

  const toggle = () => {
    activeChatInstance.value?.toggle();
  };

  const setWelcomeMessage = (message: string) => {
    activeChatInstance.value?.setWelcomeMessage(message);
  };

  const setMessage = (message: string) => {
    activeChatInstance.value?.setMessage(message);
  };

  const sendMessage = (message: string) => {
    activeChatInstance.value?.sendMessage(message);
  };

  return {
    open,
    close,
    toggle,
    setWelcomeMessage,
    setMessage,
    sendMessage,
    // Internal use only
    _registerInstance: registerInstance,
  };
}
