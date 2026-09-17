import type { StyleSpecification } from "maplibre-gl";

export type GameMapTheme = "minecraft" | "gta-sa" | "gta-v";

export type GameMapThemeDefaults = {
  pitch: number;
  bearing: number;
  maxPitch: number;
  antialias: boolean;
  cssClass: string;
};

export type LoadGameMapStyleOptions = {
  /** MapLibre style JSON URL to restyle (OpenFreeMap works well). */
  baseStyleUrl?: string;
  /** Use an in-memory style instead of fetching. */
  baseStyle?: StyleSpecification;
  /** Hide most labels for a cleaner minimap (default true). */
  hideLabels?: boolean;
};

export type CreateGameMapOptions = LoadGameMapStyleOptions & {
  theme: GameMapTheme;
  container: string | HTMLElement;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  padding?: { top: number; bottom: number; left: number; right: number };
};
