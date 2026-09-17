import type { GeoJSONSource, Map } from "maplibre-gl";
import {
  MINECRAFT_TEXTURE_SPECS,
  createBlockImageData,
  type MinecraftTextureId,
} from "./textures.js";

const CHUNK_SOURCE = "sickmaps-mc-chunks";
const CHUNK_LAYER = "sickmaps-mc-chunk-lines";

function metersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

function chunkGridGeoJson(
  west: number,
  south: number,
  east: number,
  north: number,
  blockMeters: number,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const latMid = (south + north) / 2;
  const mPerDegLon = 111320 * Math.cos((latMid * Math.PI) / 180);
  const mPerDegLat = 110540;

  const westM = west * mPerDegLon;
  const eastM = east * mPerDegLon;
  const southM = south * mPerDegLat;
  const northM = north * mPerDegLat;

  const startX = Math.floor(westM / blockMeters) * blockMeters;
  const endX = Math.ceil(eastM / blockMeters) * blockMeters;
  const startY = Math.floor(southM / blockMeters) * blockMeters;
  const endY = Math.ceil(northM / blockMeters) * blockMeters;

  for (let x = startX; x <= endX; x += blockMeters) {
    const lon = x / mPerDegLon;
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [lon, south],
          [lon, north],
        ],
      },
    });
  }

  for (let y = startY; y <= endY; y += blockMeters) {
    const lat = y / mPerDegLat;
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [west, lat],
          [east, lat],
        ],
      },
    });
  }

  return { type: "FeatureCollection", features };
}

function registerTextures(map: Map): void {
  for (const [id, spec] of Object.entries(MINECRAFT_TEXTURE_SPECS) as [
    MinecraftTextureId,
    (typeof MINECRAFT_TEXTURE_SPECS)[MinecraftTextureId],
  ][]) {
    if (map.hasImage(id)) continue;
    const image = createBlockImageData(spec.base, spec.accent, spec.seed);
    map.addImage(id, image, { pixelRatio: 1 });
  }
}

function applyPatterns(map: Map): void {
  const patternLayers: Record<string, MinecraftTextureId> = {
    mc_grass_base: "mc_grass",
    landuse_park: "mc_grass",
    landcover_wood: "mc_grass",
    landuse_residential: "mc_dirt",
    water: "mc_water",
  };

  for (const [layerId, pattern] of Object.entries(patternLayers)) {
    if (!map.getLayer(layerId)) continue;
    try {
      map.setPaintProperty(layerId, "fill-pattern", pattern);
      map.setPaintProperty(layerId, "fill-antialias", false);
    } catch {
      // layer may not support pattern at this zoom
    }
  }
}

function syncChunkGrid(map: Map, blockMeters: number, minZoom: number): void {
  const zoom = map.getZoom();
  if (zoom < minZoom) {
    if (map.getLayer(CHUNK_LAYER)) {
      map.setLayoutProperty(CHUNK_LAYER, "visibility", "none");
    }
    return;
  }

  const bounds = map.getBounds();
  const data = chunkGridGeoJson(
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
    blockMeters,
  );

  const source = map.getSource(CHUNK_SOURCE) as GeoJSONSource | undefined;
  if (source) {
    source.setData(data);
  }

  if (map.getLayer(CHUNK_LAYER)) {
    map.setLayoutProperty(CHUNK_LAYER, "visibility", "visible");
    const mpp = metersPerPixel(bounds.getCenter().lat, zoom);
    const blockPx = blockMeters / mpp;
    const opacity = Math.min(0.35, Math.max(0.08, blockPx / 48));
    map.setPaintProperty(CHUNK_LAYER, "line-opacity", opacity);
  }
}

export type MinecraftEnhancementsOptions = {
  /** Meters per block (MC overworld ≈ 1m; chunk grid uses 16 blocks). */
  blockMeters?: number;
  /** Show 16×16 chunk lines at this zoom and above. */
  chunkGridMinZoom?: number;
};

export function getMinecraftPixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(1, window.devicePixelRatio || 1);
}

/** Runtime textures, fill-patterns, and chunk grid (call after map style loads). */
export function installMinecraftEnhancements(
  map: Map,
  options: MinecraftEnhancementsOptions = {},
): () => void {
  const blockMeters = options.blockMeters ?? 1;
  const chunkBlockSize = 16 * blockMeters;
  const chunkGridMinZoom = options.chunkGridMinZoom ?? 13.5;

  const onLoad = () => {
    registerTextures(map);
    applyPatterns(map);

    if (!map.getSource(CHUNK_SOURCE)) {
      map.addSource(CHUNK_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!map.getLayer(CHUNK_LAYER)) {
      map.addLayer({
        id: CHUNK_LAYER,
        type: "line",
        source: CHUNK_SOURCE,
        paint: {
          "line-color": "#000000",
          "line-width": 1,
          "line-opacity": 0.15,
        },
        layout: {
          "line-cap": "butt",
          "line-join": "miter",
        },
      });
    }

    syncChunkGrid(map, chunkBlockSize, chunkGridMinZoom);
  };

  if (map.isStyleLoaded()) {
    onLoad();
  } else {
    map.once("load", onLoad);
  }

  const onMoveEnd = () => syncChunkGrid(map, chunkBlockSize, chunkGridMinZoom);
  map.on("moveend", onMoveEnd);

  return () => {
    map.off("moveend", onMoveEnd);
    if (map.getLayer(CHUNK_LAYER)) map.removeLayer(CHUNK_LAYER);
    if (map.getSource(CHUNK_SOURCE)) map.removeSource(CHUNK_SOURCE);
  };
}
