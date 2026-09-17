import type { Map, MapOptions } from "maplibre-gl";
import { getMinecraftPixelRatio, installMinecraftEnhancements } from "./minecraft/runtime.js";
import { THEME_DEFAULTS } from "./palettes.js";
import { decorateMapContainer } from "./dom.js";
import { loadGameMapStyle } from "./style.js";
import type { CreateGameMapOptions, GameMapTheme } from "./types.js";

export type GameMap = Map & {
  sickmapsTheme: GameMapTheme;
  /** Removes Minecraft runtime layers/textures when applicable. */
  sickmapsTeardown?: () => void;
};

/**
 * Creates a MapLibre map with a sickmaps theme applied to the base style.
 * Requires `maplibregl` to be passed in (peer dependency).
 */
export async function createGameMap(
  maplibregl: typeof import("maplibre-gl"),
  options: CreateGameMapOptions,
): Promise<GameMap> {
  const themeDefaults = THEME_DEFAULTS[options.theme];
  decorateMapContainer(options.container, options.theme);

  const style = await loadGameMapStyle(options.theme, options);

  const mapOptions: MapOptions = {
    container: options.container,
    style,
    center: options.center,
    zoom: options.zoom,
    pitch: options.pitch ?? themeDefaults.pitch,
    bearing: options.bearing ?? themeDefaults.bearing,
    maxPitch: themeDefaults.maxPitch,
    antialias: themeDefaults.antialias,
    ...(options.theme === "minecraft" ? { pixelRatio: getMinecraftPixelRatio() } : {}),
  };

  const map = new maplibregl.Map(mapOptions) as GameMap;
  if (options.padding) {
    map.setPadding(options.padding);
  }
  map.sickmapsTheme = options.theme;
  if (options.theme === "minecraft") {
    map.sickmapsTeardown = installMinecraftEnhancements(map);
  }
  return map;
}
