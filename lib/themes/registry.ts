export type ThemeType = 'document' | 'web';

export interface ThemeConfig {
  id: string;
  label: string;
  type: ThemeType;
  description: string;
}

export const THEME_REGISTRY: Record<string, ThemeConfig> = {
  modern: { 
    id: 'modern', 
    label: 'Modern', 
    type: 'document',
    description: 'A clean and professional template suitable for most industries. Prioritizes readability and standard formatting.'
  },
  minimal: { 
    id: 'minimal', 
    label: 'Minimal', 
    type: 'document',
    description: 'Stripped back and elegant. Focuses purely on your content with centered headers and subtle typography.'
  },
  creative: { 
    id: 'creative', 
    label: 'Creative', 
    type: 'document',
    description: 'Features a distinct sidebar and bold headers. Perfect for designers, marketers, and creative professionals.'
  },
  portfolio: { 
    id: 'portfolio', 
    label: 'Portfolio', 
    type: 'web',
    description: 'Showcase your work with a focus on visual impact. Ideal for linking to projects and online presence.'
  },
  studio: { 
    id: 'studio', 
    label: 'Studio', 
    type: 'web',
    description: 'High-contrast dark mode design. Makes a bold statement for tech and creative roles.'
  },
  visual: { 
    id: 'visual', 
    label: 'Visual', 
    type: 'web',
    description: 'A visually striking layout with large typography and unique section styling. Best for screen viewing.'
  },
};

export const AVAILABLE_THEMES = Object.values(THEME_REGISTRY);

export function isDocumentTheme(themeId: string): boolean {
  return THEME_REGISTRY[themeId]?.type === 'document';
}

export function getThemeLabel(themeId: string): string {
  return THEME_REGISTRY[themeId]?.label || themeId;
}
