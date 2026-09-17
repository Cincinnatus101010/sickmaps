import type { LayerSpecification, StyleSpecification } from "maplibre-gl";
import { LANDCOVER_CLASS_COLOR, LANDUSE_CLASS_COLOR, MC } from "./blocks.js";

function hideLayer(layer: LayerSpecification): void {
  layer.layout ??= {};
  layer.layout.visibility = "none";
}

function isLayer(style: StyleSpecification, id: string): LayerSpecification | undefined {
  return style.layers.find((l) => l.id === id);
}

function insertLayerBefore(
  style: StyleSpecification,
  layer: LayerSpecification,
  beforeId: string,
): void {
  const idx = style.layers.findIndex((l) => l.id === beforeId);
  if (idx === -1) {
    style.layers.push(layer);
    return;
  }
  style.layers.splice(idx, 0, layer);
}

function convertBuildingToExtrusion(layer: LayerSpecification): void {
  if (layer.id !== "building" || layer.type !== "fill") {
    return;
  }

  const extrusion = layer as unknown as LayerSpecification & {
    type: "fill-extrusion";
    paint: Record<string, unknown>;
  };
  extrusion.type = "fill-extrusion";
  extrusion.paint = {
    "fill-extrusion-color": MC.building,
    "fill-extrusion-height": [
      "coalesce",
      ["get", "render_height"],
      ["*", ["get", "height"], 3],
      8,
    ],
    "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
    "fill-extrusion-opacity": 1,
  };
}

function applyLandcoverPaint(layer: LayerSpecification): void {
  if (layer.type !== "fill") return;
  layer.paint ??= {};
  layer.paint["fill-color"] = LANDCOVER_CLASS_COLOR;
  layer.paint["fill-antialias"] = false;
  layer.paint["fill-opacity"] = 1;
  if ("fill-pattern" in layer.paint) {
    delete layer.paint["fill-pattern"];
  }
}

function applyLandusePaint(layer: LayerSpecification): void {
  if (layer.type !== "fill") return;
  layer.paint ??= {};
  layer.paint["fill-color"] = LANDUSE_CLASS_COLOR;
  layer.paint["fill-antialias"] = false;
  layer.paint["fill-opacity"] = 1;
}

function applyRoadPaint(layer: LayerSpecification, inner: string, casing: string): void {
  if (layer.type !== "line") return;
  const isCasing = layer.id.includes("casing");
  layer.paint ??= {};
  layer.paint["line-color"] = isCasing ? casing : inner;
  layer.paint["line-opacity"] = 1;
  layer.layout ??= {};
  layer.layout["line-cap"] = "butt";
  layer.layout["line-join"] = "miter";
}

export function applyMinecraftStyle(style: StyleSpecification): StyleSpecification {
  const next = structuredClone(style) as StyleSpecification;

  for (const layer of next.layers) {
    if (layer.type === "symbol") {
      hideLayer(layer);
    }
    if (layer.type === "raster") {
      hideLayer(layer);
    }
    if (layer.id.startsWith("boundary_")) {
      hideLayer(layer);
    }
    if (layer.id.startsWith("railway")) {
      hideLayer(layer);
    }
    if (layer.id.startsWith("aeroway")) {
      hideLayer(layer);
    }
  }

  const background = isLayer(next, "background");
  if (background?.type === "background") {
    background.paint ??= {};
    background.paint["background-color"] = MC.bedrock;
  }

  if (!isLayer(next, "mc_grass_base")) {
    insertLayerBefore(next, {
      id: "mc_grass_base",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      minzoom: 0,
      filter: ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false],
      paint: {
        "fill-color": LANDCOVER_CLASS_COLOR,
        "fill-antialias": false,
        "fill-opacity": 1,
      },
    }, "water");
  }

  for (const layer of next.layers) {
    if (layer.id === "water" && layer.type === "fill") {
      layer.paint ??= {};
      layer.paint["fill-color"] = MC.water;
      layer.paint["fill-antialias"] = false;
    }

    if (layer.id === "waterway" && layer.type === "line") {
      layer.paint ??= {};
      layer.paint["line-color"] = MC.waterDeep;
      layer.layout ??= {};
      layer.layout["line-cap"] = "butt";
    }

    if (layer.id.startsWith("landcover_") && layer.type === "fill") {
      applyLandcoverPaint(layer);
    }

    if (layer.id.startsWith("landuse_") && layer.type === "fill") {
      applyLandusePaint(layer);
    }

    if (layer.id === "building") {
      convertBuildingToExtrusion(layer);
    }

    if (layer.id.includes("highway_motorway")) {
      applyRoadPaint(layer, MC.planks, MC.dirt);
    } else if (layer.id.includes("highway_major") || layer.id.includes("highway_trunk")) {
      applyRoadPaint(layer, MC.planks, MC.dirt);
    } else if (layer.id.includes("highway_path") || layer.id.includes("highway_minor")) {
      applyRoadPaint(layer, MC.dirt, MC.farmland);
    } else if (layer.id.includes("road_pier") || layer.id.includes("road_area")) {
      if (layer.type === "fill") {
        layer.paint ??= {};
        layer.paint["fill-color"] = MC.planks;
        layer.paint["fill-antialias"] = false;
      }
    }
  }

  for (const layer of next.layers) {
    if (layer.type === "fill") {
      layer.paint ??= {};
      layer.paint["fill-antialias"] = false;
    }
    if (layer.type === "line") {
      layer.layout ??= {};
      layer.layout["line-cap"] = "butt";
      layer.layout["line-join"] = "miter";
    }
  }

  return next;
}
