# sickmaps

MapLibre themes that mimic **Minecraft** world maps and **GTA** in-game minimaps. Restyle any compatible vector basemap (OpenFreeMap by default) and wrap the map container with optional HUD CSS.

## Install

```bash
npm install sickmaps maplibre-gl
```

From GitHub (builds on install):

```bash
npm install github:Cincinnatus101010/sickmaps
```

## Themes

| Theme | Vibe | Default camera |
|--------|------|----------------|
| `minecraft` | Block textures, biome blocks, extruded builds, chunk grid | 45° pitch |
| `gta-sa` | San Andreas–style flat minimap, muted roads | Top-down |
| `gta-v` | GTA V–style HUD map | Top-down |

## Quick start

```ts
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createGameMap } from "sickmaps";
import "sickmaps/css";

const map = await createGameMap(maplibregl, {
  theme: "minecraft",
  container: "map",
  center: [-74.02, 40.72],
  zoom: 12,
});
```

## Minecraft rendering

The `minecraft` theme applies a dedicated style pass (biome block colors, 3D buildings, no raster terrain) plus runtime enhancements:

```ts
import {
  loadGameMapStyle,
  getMinecraftPixelRatio,
  installMinecraftEnhancements,
  decorateMapContainer,
} from "sickmaps";
import "sickmaps/css";

decorateMapContainer("map", "minecraft");
const style = await loadGameMapStyle("minecraft");
const map = new maplibregl.Map({
  container: "map",
  style,
  pixelRatio: getMinecraftPixelRatio(),
  pitch: 45,
  antialias: false,
});
map.on("load", () => installMinecraftEnhancements(map));
```

Zoom in (≈14+) to see the 16-block chunk grid.

## API

| Export | Purpose |
|--------|---------|
| `createGameMap(maplibregl, options)` | Map + theme + CSS classes (+ Minecraft runtime when theme is `minecraft`) |
| `loadGameMapStyle(theme, options?)` | Fetch base style and apply theme |
| `applyGameMapTheme(style, theme)` | Pure style transform (no fetch) |
| `installMinecraftEnhancements(map)` | Block textures, patterns, chunk grid |
| `getMinecraftPixelRatio()` | Chunky canvas DPI for Minecraft |
| `decorateMapContainer(el, theme)` | HUD CSS classes on container |
| `PALETTES`, `THEME_DEFAULTS` | Theme tuning |

## Demo

Live preview app: [sickmapsdemo](https://github.com/Cincinnatus101010/sickmapsdemo)

## License

MIT
