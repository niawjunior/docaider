export type ThemeType = 'document' | 'web';

export interface ThemeConfig {
  id: string;
  label: string;
  type: ThemeType;
}

export const THEME_REGISTRY: Record<string, ThemeConfig> = {
  modern: { id: 'modern', label: 'Modern', type: 'document' },
  minimal: { id: 'minimal', label: 'Minimal', type: 'document' },
  creative: { id: 'creative', label: 'Creative', type: 'document' },
  portfolio: { id: 'portfolio', label: 'Portfolio', type: 'web' },
  studio: { id: 'studio', label: 'Studio', type: 'web' },
  visual: { id: 'visual', label: 'Visual', type: 'web' },
};

export const AVAILABLE_THEMES = Object.values(THEME_REGISTRY);

export function isDocumentTheme(themeId: string): boolean {
  return THEME_REGISTRY[themeId]?.type === 'document';
}

export function getThemeLabel(themeId: string): string {
  return THEME_REGISTRY[themeId]?.label || themeId;
}
