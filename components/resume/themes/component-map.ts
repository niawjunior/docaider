import { PortfolioTheme } from "./PortfolioTheme";
import { StudioTheme } from "./StudioTheme";
import { VisualTheme } from "./VisualTheme";
import { ModernTheme } from "./ModernTheme";
import { MinimalTheme } from "./MinimalTheme";
import { CreativeTheme } from "./CreativeTheme";

export interface ThemeComponentProps {
  containerRef?: React.RefObject<any>;
  isThumbnail?: boolean;
}

export const THEME_COMPONENTS: Record<string, React.ComponentType<ThemeComponentProps>> = {
  modern: ModernTheme,
  minimal: MinimalTheme,
  creative: CreativeTheme,
  portfolio: PortfolioTheme,
  studio: StudioTheme,
  visual: VisualTheme,
};
