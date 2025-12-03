import { defineComponent, h, ref, onMounted, onUnmounted, watch, type PropType, shallowRef } from "vue";
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { EmbedChatBox } from "./EmbedChatBox";
import { type EmbedChatBoxRef, type EmbedChatBoxProps, type EmbedTool } from "./EmbedChatBox";
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
    // Use shallowRef for non-Vue reactive objects to prevent performance issues and potential loops
    const shadowRoot = shallowRef<ShadowRoot | null>(null);
    const reactRoot = shallowRef<Root | null>(null);
    const chatBoxRef = React.createRef<EmbedChatBoxRef>();
    // Auto-generate chatId if not provided
    const generatedChatId = ref<string>(props.chatId || `chat-${Math.random().toString(36).substring(2, 15)}`);
    const isMounted = ref(false);

    let renderTimeout: ReturnType<typeof setTimeout> | null = null;

    let lastPropsJson: string = "";

    const renderReactComponent = () => {
      if (!isMounted.value) return;
      if (renderTimeout) clearTimeout(renderTimeout);

      renderTimeout = setTimeout(() => {
        if (!shadowRoot.value || !reactRoot.value || !isMounted.value) return;

        // Create props object
        const currentProps = {
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
        };

        // Simple deep comparison using JSON.stringify
        // This is efficient enough for these props and prevents re-renders if objects are structurally same
        const propsJson = JSON.stringify(currentProps);
        if (propsJson === lastPropsJson) {
           return;
        }
        lastPropsJson = propsJson;

        const reactProps: EmbedChatBoxProps & React.RefAttributes<EmbedChatBoxRef> = {
          ...currentProps,
          onRefresh: () => {},
          ref: chatBoxRef,
        };

        // Wrap in try-catch to prevent React errors from crashing Vue app
        try {
          reactRoot.value.render(
            React.createElement(
              "div",
              { className: "docaider-embed-container" },
              React.createElement(EmbedChatBox, reactProps)
            )
          );
        } catch (error) {
          console.error("VueEmbedChatBox: Error rendering React component", error);
        }
      }, 10); // Small debounce to prevent rapid re-renders
    };

    // Queue for actions called before mount
    const pendingActions = ref<Array<() => void>>([]);

    // Create a proxy object that matches EmbedChatBoxRef
    const instanceProxy = {
      open: () => chatBoxRef.current?.open(),
      close: () => chatBoxRef.current?.close(),
      toggle: () => chatBoxRef.current?.toggle(),
      setWelcomeMessage: (message?: string) => chatBoxRef.current?.setWelcomeMessage(message),
      setMessage: (message: string) => chatBoxRef.current?.setMessage(message),
      sendMessage: (message: string) => chatBoxRef.current?.sendMessage(message),
      useTool: (tool: EmbedTool, options?: { content?: string; prompt?: string }) => chatBoxRef.current?.useTool(tool, options),
      useKnowledge: (nameOrContext: string | any, content?: any) => {
        if (chatBoxRef.current) {
          chatBoxRef.current.useKnowledge(nameOrContext, content);
        } else {
          // Queue the action if not ready
          pendingActions.value.push(() => {
            chatBoxRef.current?.useKnowledge(nameOrContext, content);
          });
        }
      },
    };

    onMounted(() => {
      isMounted.value = true;
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

        // Process pending actions after a short delay to ensure React ref is populated
        setTimeout(() => {
          if (pendingActions.value.length > 0) {
            console.log(`VueEmbedChatBox: Processing ${pendingActions.value.length} pending actions`);
            pendingActions.value.forEach(action => action());
            pendingActions.value = [];
          }
        }, 100);
      }
    });

    onUnmounted(() => {
      isMounted.value = false;
      if (renderTimeout) clearTimeout(renderTimeout);
      
      if (reactRoot.value) {
        // Use setTimeout to allow current render cycle to finish
        setTimeout(() => {
          try {
            reactRoot.value?.unmount();
          } catch (e) {
            console.warn("VueEmbedChatBox: Error unmounting React root", e);
          }
        }, 0);
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
      (newValues, oldValues) => {
        // Only log if actually different (though watch handles this, the array ref might change)
        // console.log("VueEmbedChatBox: Props changed, re-rendering React component");
        renderReactComponent();
      },
      { deep: true } // Ensure deep watch for objects like documents
    );

    expose(instanceProxy);

    return () => h("div", { ref: hostRef, style: { display: "contents" } });
  },
});
