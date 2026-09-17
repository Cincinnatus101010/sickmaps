import type { StyleSpecification } from "maplibre-gl";
import { applyGameMapTheme } from "./apply-theme.js";
import { DEFAULT_BASE_STYLE_URL } from "./palettes.js";
import type { GameMapTheme, LoadGameMapStyleOptions } from "./types.js";

export async function loadGameMapStyle(
  theme: GameMapTheme,
  options: LoadGameMapStyleOptions = {},
): Promise<StyleSpecification> {
  const baseStyle =
    options.baseStyle ??
    (await fetchStyle(options.baseStyleUrl ?? DEFAULT_BASE_STYLE_URL));

  return applyGameMapTheme(baseStyle, theme, { hideLabels: options.hideLabels });
}

async function fetchStyle(url: string): Promise<StyleSpecification> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`sickmaps: failed to load base style (${response.status}) from ${url}`);
  }
  return (await response.json()) as StyleSpecification;
}
