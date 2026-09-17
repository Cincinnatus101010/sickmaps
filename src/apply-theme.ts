import type { LayerSpecification, StyleSpecification } from "maplibre-gl";
import { applyMinecraftStyle } from "./minecraft/style.js";
import { PALETTES, type ThemePalette } from "./palettes.js";
import type { GameMapTheme } from "./types.js";

function cloneStyle(style: StyleSpecification): StyleSpecification {
  return structuredClone(style);
}

function setLayerVisibility(layer: LayerSpecification, visible: boolean): void {
  layer.layout ??= {};
  layer.layout.visibility = visible ? "visible" : "none";
}

function paintFill(layer: LayerSpecification, props: Record<string, unknown>): void {
  if (layer.type !== "fill") return;
  layer.paint ??= {};
  Object.assign(layer.paint, props);
}

function paintLine(
  layer: LayerSpecification,
  paint: Record<string, unknown>,
  layout?: Record<string, unknown>,
): void {
  if (layer.type !== "line") return;
  layer.paint ??= {};
  Object.assign(layer.paint, paint);
  if (layout) {
    layer.layout ??= {};
    Object.assign(layer.layout, layout);
  }
}

const BLOCKY_LINE_LAYOUT = { "line-cap": "butt", "line-join": "miter" } as const;

function paintBackground(layer: LayerSpecification, color: string): void {
  if (layer.type !== "background") return;
  layer.paint ??= {};
  layer.paint["background-color"] = color;
}

function applyPaletteToLayer(layer: LayerSpecification, palette: ThemePalette): void {
  const id = layer.id;

  if (layer.type === "background") {
    paintBackground(layer, palette.background);
    return;
  }

  if ((id === "water" || id.startsWith("water_")) && layer.type === "fill") {
    paintFill(layer, { "fill-color": palette.water, "fill-antialias": false });
    return;
  }

  if (id === "waterway" || id.includes("waterway")) {
    paintLine(layer, { "line-color": palette.waterway }, BLOCKY_LINE_LAYOUT);
    return;
  }

  if (
    id.includes("landcover_wood") ||
    id.includes("landuse_park") ||
    id.includes("park") ||
    id.includes("grass")
  ) {
    const color = id.includes("wood") || id.includes("forest") ? palette.forest : palette.grass;
    paintFill(layer, {
      "fill-color": color,
      "fill-antialias": false,
      "fill-opacity": 1,
    });
    if (layer.paint && "fill-pattern" in layer.paint) {
      delete layer.paint["fill-pattern"];
    }
    return;
  }

  if (id.includes("sand") || id.includes("beach")) {
    paintFill(layer, { "fill-color": palette.sand, "fill-antialias": false });
    return;
  }

  if (id.includes("landuse_residential") || id.includes("landuse_commercial")) {
    paintFill(layer, { "fill-color": palette.urban, "fill-antialias": false, "fill-opacity": 0.85 });
    return;
  }

  if (id === "building" || id.startsWith("building")) {
    paintFill(layer, {
      "fill-color": palette.building,
      "fill-outline-color": palette.buildingOutline,
      "fill-antialias": false,
    });
    return;
  }

  if (id.includes("road_area") || id.includes("pier")) {
    paintFill(layer, { "fill-color": palette.pier, "fill-antialias": false });
    return;
  }

  if (id.includes("highway_motorway")) {
    const isCasing = id.includes("casing");
    paintLine(
      layer,
      { "line-color": isCasing ? palette.roadCasing : palette.roadMotorway },
      BLOCKY_LINE_LAYOUT,
    );
    return;
  }

  if (id.includes("highway_major") || id.includes("highway_trunk") || id.includes("highway_primary")) {
    const isCasing = id.includes("casing");
    paintLine(
      layer,
      { "line-color": isCasing ? palette.roadCasing : palette.roadMajor },
      BLOCKY_LINE_LAYOUT,
    );
    return;
  }

  if (id.includes("highway") || id.includes("road_")) {
    paintLine(layer, { "line-color": palette.roadMinor }, BLOCKY_LINE_LAYOUT);
  }
}

export function applyGameMapTheme(
  style: StyleSpecification,
  theme: GameMapTheme,
  options: { hideLabels?: boolean } = {},
): StyleSpecification {
  const hideLabels = options.hideLabels !== false;
  const next = cloneStyle(style);

  if (theme === "minecraft") {
    return applyMinecraftStyle(next);
  }

  const palette = PALETTES[theme];

  for (const layer of next.layers) {
    applyPaletteToLayer(layer, palette);

    if (hideLabels && layer.type === "symbol") {
      setLayerVisibility(layer, false);
    }
  }

  return next;
}
