import type { App } from "vue";
import { VueEmbedChatBox } from "./components/VueEmbedChatBox";

export { VueEmbedChatBox } from "./components/VueEmbedChatBox";
export type { EmbedChatBoxRef as VueEmbedChatBoxRef } from "./components/EmbedChatBox";
export { useDocaiderEmbed } from "./composables/useDocaiderEmbed";

export const DocaiderEmbed = {
  install(app: App) {
    app.component("VueEmbedChatBox", VueEmbedChatBox);
  },
};
