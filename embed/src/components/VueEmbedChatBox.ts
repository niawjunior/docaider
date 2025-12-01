import { defineComponent, h, ref, onMounted, onUnmounted, watch, type PropType } from "vue";
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { EmbedChatBox } from "./EmbedChatBox";
import { type EmbedChatBoxRef, type EmbedChatBoxProps } from "./EmbedChatBox";
import styles from "../App.css?inline";
import { useDocaiderEmbed } from "../composables/useDocaiderEmbed";
import { GOOGLE_FONTS_URL } from "../constants";

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
    const { _registerInstance } = useDocaiderEmbed();
    const hostRef = ref<HTMLDivElement | null>(null);
    const shadowRoot = ref<ShadowRoot | null>(null);
    const reactRoot = ref<Root | null>(null);
    const chatBoxRef = React.createRef<EmbedChatBoxRef>();
    // Auto-generate chatId if not provided
    const generatedChatId = ref<string>(props.chatId || `chat-${Math.random().toString(36).substring(2, 15)}`);

    const renderReactComponent = () => {
      if (!shadowRoot.value || !reactRoot.value) return;

      const reactProps: EmbedChatBoxProps & React.RefAttributes<EmbedChatBoxRef> = {
        knowledgeBaseId: props.knowledgeBaseId,
        src: props.src,
        chatId: props.chatId || generatedChatId.value,
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
        onRefresh: () => {},
        ref: chatBoxRef,
      };

      reactRoot.value.render(
        React.createElement(
          "div",
          { className: "docaider-embed-container" },
          React.createElement(EmbedChatBox, reactProps)
        )
      );
    };

    // Create a proxy object that matches EmbedChatBoxRef
    const instanceProxy = {
      open: () => chatBoxRef.current?.open(),
      close: () => chatBoxRef.current?.close(),
      toggle: () => chatBoxRef.current?.toggle(),
      setWelcomeMessage: (message: string) => chatBoxRef.current?.setWelcomeMessage(message),
      setMessage: (message: string) => chatBoxRef.current?.setMessage(message),
      sendMessage: (message: string) => chatBoxRef.current?.sendMessage(message),
    };

    onMounted(() => {
      if (hostRef.value) {
        // Create shadow root
        const root = hostRef.value.attachShadow({ mode: "open" });
        shadowRoot.value = root;

        // Inject styles
        const styleElement = document.createElement("style");
        styleElement.textContent = styles;
        root.appendChild(styleElement);

        // Inject Google Fonts (Nunito)
        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = GOOGLE_FONTS_URL;
        root.appendChild(fontLink);

        // Create container for React
        const container = document.createElement("div");
        root.appendChild(container);

        // Create React root and render
        reactRoot.value = createRoot(container);
        renderReactComponent();

        // Register instance for global control
        _registerInstance(instanceProxy);
      }
    });

    onUnmounted(() => {
      if (reactRoot.value) {
        reactRoot.value.unmount();
      }
    });

    // Watch individual props instead of all props to avoid unnecessary re-renders
    watch(
      [
        () => props.knowledgeBaseId,
        () => props.src,
        () => props.chatId,
        () => props.chatboxTitle,
        () => props.position,
        () => props.width,
        () => props.height,
        () => props.welcomeMessage,
        () => props.placeholder,
        () => props.isInitializing,
        () => props.initError,
        () => props.documents,
        () => props.positionStrategy,
        () => props.theme,
      ],
      () => {
        renderReactComponent();
      }
    );

    expose(instanceProxy);

    return () => h("div", { ref: hostRef, style: { display: "contents" } });
  },
});
