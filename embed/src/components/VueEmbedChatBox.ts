import { defineComponent, h, ref, onMounted, onUnmounted, watch, type PropType } from "vue";
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { ShadowEmbedChatBox } from "./ShadowEmbedChatBox";
import { type EmbedChatBoxRef, type EmbedChatBoxProps } from "./EmbedChatBox";

export const VueEmbedChatBox = defineComponent({
  name: "VueEmbedChatBox",
  props: {
    knowledgeBaseId: { type: String, required: true },
    src: { type: String, required: true },
    chatId: { type: String as PropType<string | null>, default: null },
    chatboxTitle: { type: String, default: "AI Assistant" },
    position: { type: String as PropType<"bottom-right" | "bottom-left" | "top-right" | "top-left">, default: "bottom-right" },
    width: { type: String, default: "350px" },
    height: { type: String, default: "500px" },
    welcomeMessage: { type: String, default: "Hello! How can I help you today?" },
    placeholder: { type: String, default: "Ask a question..." },
    isInitializing: { type: Boolean, default: false },
    initError: { type: Object as PropType<Error | null>, default: null },
    documents: { type: Array as PropType<{ title: string }[]>, default: () => [] },
    positionStrategy: { type: String as PropType<"fixed" | "absolute">, default: "fixed" },
    theme: { type: String as PropType<"blue" | "gray" | "green">, default: "blue" },
  },
  setup(props, { expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const reactRoot = ref<Root | null>(null);
    const chatBoxRef = React.createRef<EmbedChatBoxRef>();

    const renderReactComponent = () => {
      if (!containerRef.value || !reactRoot.value) return;

      const reactProps: EmbedChatBoxProps & { ref: React.RefObject<EmbedChatBoxRef | null> } = {
        knowledgeBaseId: props.knowledgeBaseId,
        src: props.src,
        chatId: props.chatId,
        chatboxTitle: props.chatboxTitle,
        position: props.position,
        width: props.width,
        height: props.height,
        welcomeMessage: props.welcomeMessage,
        placeholder: props.placeholder,
        isInitializing: props.isInitializing,
        initError: props.initError,
        documents: props.documents,
        positionStrategy: props.positionStrategy,
        theme: props.theme,
        ref: chatBoxRef,
      };

      reactRoot.value.render(React.createElement(ShadowEmbedChatBox, reactProps));
    };

    onMounted(() => {
      if (containerRef.value) {
        reactRoot.value = createRoot(containerRef.value);
        renderReactComponent();
      }
    });

    onUnmounted(() => {
      if (reactRoot.value) {
        reactRoot.value.unmount();
      }
    });

    watch(() => props, () => {
      renderReactComponent();
    }, { deep: true });

    expose({
      open: () => chatBoxRef.current?.open(),
      close: () => chatBoxRef.current?.close(),
      toggle: () => chatBoxRef.current?.toggle(),
      setWelcomeMessage: (message: string) => chatBoxRef.current?.setWelcomeMessage(message),
      setMessage: (message: string) => chatBoxRef.current?.setMessage(message),
      sendMessage: (message: string) => chatBoxRef.current?.sendMessage(message),
    });

    return () => h("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
  },
});
