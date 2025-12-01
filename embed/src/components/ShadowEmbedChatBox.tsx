import { useRef, useState, useLayoutEffect, forwardRef } from "react";
import { createPortal } from "react-dom";
// @ts-ignore
import styles from "@/App.css?inline";
import { EmbedChatBox, type EmbedChatBoxRef, type EmbedChatBoxProps } from "./EmbedChatBox";

export const ShadowEmbedChatBox = forwardRef<EmbedChatBoxRef, EmbedChatBoxProps>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    if (hostRef.current && !shadowRoot) {
      let root = hostRef.current.shadowRoot;
      
      if (!root) {
        root = hostRef.current.attachShadow({ mode: "open" });
        
        // Inject styles
        const styleElement = document.createElement("style");
        styleElement.textContent = styles;
        root.appendChild(styleElement);

        // Inject Google Fonts (Nunito)
        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
        root.appendChild(fontLink);
      }

      setShadowRoot(root);
    }
  }, [shadowRoot]);

  return (
    <div ref={hostRef} style={{ display: 'contents' }}>
      {shadowRoot && createPortal(
        <div className="docaider-embed-container">
          <EmbedChatBox {...props} ref={ref} />
        </div>,
        shadowRoot
      )}
    </div>
  );
});
