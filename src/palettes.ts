import type { GameMapTheme } from "./types.js";

export type ThemePalette = {
  background: string;
  water: string;
  waterway: string;
  grass: string;
  forest: string;
  sand: string;
  urban: string;
  building: string;
  buildingOutline: string;
  roadMinor: string;
  roadMajor: string;
  roadMotorway: string;
  roadCasing: string;
  pier: string;
};

export const PALETTES: Record<GameMapTheme, ThemePalette> = {
  minecraft: {
    background: "#1a3324",
    water: "#3f76e4",
    waterway: "#2d5bb8",
    grass: "#5a9c44",
    forest: "#3d7a32",
    sand: "#dbc67a",
    urban: "#6b6b55",
    building: "#9a9a9a",
    buildingOutline: "#5c5c5c",
    roadMinor: "#8b6914",
    roadMajor: "#c4a035",
    roadMotorway: "#e8d48b",
    roadCasing: "#5c4a1a",
    pier: "#6b6b55",
  },
  "gta-sa": {
    background: "#1c2418",
    water: "#142a38",
    waterway: "#0f2230",
    grass: "#2f3d28",
    forest: "#253320",
    sand: "#4a4538",
    urban: "#3a4034",
    building: "#2a3028",
    buildingOutline: "#1a2018",
    roadMinor: "#c8c0b0",
    roadMajor: "#ebe4d4",
    roadMotorway: "#f5f0e6",
    roadCasing: "#3a3830",
    pier: "#2f3d28",
  },
  "gta-v": {
    background: "#252820",
    water: "#1a3045",
    waterway: "#152838",
    grass: "#3a4532",
    forest: "#2e3828",
    sand: "#524c42",
    urban: "#454a40",
    building: "#363c34",
    buildingOutline: "#252a22",
    roadMinor: "#d0ccc4",
    roadMajor: "#ece8e0",
    roadMotorway: "#faf8f4",
    roadCasing: "#484440",
    pier: "#3a4532",
  },
};

export const THEME_DEFAULTS: Record<
  GameMapTheme,
  { pitch: number; bearing: number; maxPitch: number; antialias: boolean; cssClass: string }
> = {
  minecraft: {
    pitch: 45,
    bearing: 0,
    maxPitch: 60,
    antialias: false,
    cssClass: "sickmaps--minecraft",
  },
  "gta-sa": {
    pitch: 0,
    bearing: 0,
    maxPitch: 0,
    antialias: true,
    cssClass: "sickmaps--gta-sa",
  },
  "gta-v": {
    pitch: 0,
    bearing: 0,
    maxPitch: 0,
    antialias: true,
    cssClass: "sickmaps--gta-v",
  },
};

export const DEFAULT_BASE_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";
