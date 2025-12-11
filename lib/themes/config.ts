export type ThemeKey = "modern" | "professional" | "creative" | "minimal" | "simple" | "elegant" | "studio" | "visual" | "portfolio";

export interface ThemeConfig {
    key: ThemeKey;
    name: string;
    description: string;
    
    // Layout characteristics
    layout: "single-column" | "two-column" | "grid";
    
    // Default Font settings (can be overridden by user later)
    fontFamily: string;
    fontSize: string;
    
    // Color scheme defaults
    colors: {
        primary: string;
        accent: string;
        text: string;
        background: string;
    };
}

export const THEME_CONFIGS: Record<ThemeKey, ThemeConfig> = {
    modern: {
        key: "modern",
        name: "Modern",
        description: "Clean sidebar layout with blue accents.",
        layout: "two-column",
        fontFamily: "Inter",
        fontSize: "sm",
        colors: {
            primary: "slate-900",
            accent: "blue-600",
            text: "slate-800",
            background: "white"
        }
    },
    visual: {
        key: "visual",
        name: "Visual",
        description: "Bold, high-contrast design with large typography.",
        layout: "single-column",
        fontFamily: "Outfit",
        fontSize: "base",
        colors: {
            primary: "white",
            accent: "neutral-800",
            text: "neutral-200",
            background: "neutral-950"
        }
    },
    // Add placeholders for others to be filled as we refactor
    professional: { key: "professional", name: "Professional", description: "", layout: "two-column", fontFamily: "Inter", fontSize: "sm", colors: { primary: "", accent: "", text: "", background: "" } },
    creative: { key: "creative", name: "Creative", description: "", layout: "two-column", fontFamily: "Inter", fontSize: "sm", colors: { primary: "", accent: "", text: "", background: "" } },
    minimal: { key: "minimal", name: "Minimal", description: "", layout: "single-column", fontFamily: "Inter", fontSize: "sm", colors: { primary: "", accent: "", text: "", background: "" } },
    simple: { key: "simple", name: "Simple", description: "", layout: "single-column", fontFamily: "Inter", fontSize: "sm", colors: { primary: "", accent: "", text: "", background: "" } },
    elegant: { key: "elegant", name: "Elegant", description: "", layout: "two-column", fontFamily: "Inter", fontSize: "sm", colors: { primary: "", accent: "", text: "", background: "" } },
    studio: { key: "studio", name: "Studio", description: "", layout: "single-column", fontFamily: "Inter", fontSize: "sm", colors: { primary: "", accent: "", text: "", background: "" } },
    portfolio: { key: "portfolio", name: "Portfolio", description: "", layout: "single-column", fontFamily: "Inter", fontSize: "sm", colors: { primary: "", accent: "", text: "", background: "" } },
};
