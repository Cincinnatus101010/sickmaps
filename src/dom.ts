import { THEME_DEFAULTS } from "./palettes.js";
import type { GameMapTheme } from "./types.js";

const ROOT_CLASS = "sickmaps";

export function decorateMapContainer(container: string | HTMLElement, theme: GameMapTheme): HTMLElement {
  const el =
    typeof container === "string" ? document.getElementById(container) : container;

  if (!el) {
    throw new Error(
      typeof container === "string"
        ? `sickmaps: no element with id "${container}"`
        : "sickmaps: invalid map container",
    );
  }

  el.classList.add(ROOT_CLASS, THEME_DEFAULTS[theme].cssClass);
  return el;
}

export function undecorateMapContainer(container: HTMLElement): void {
  container.classList.remove(
    ROOT_CLASS,
    "sickmaps--minecraft",
    "sickmaps--gta-sa",
    "sickmaps--gta-v",
  );
}
