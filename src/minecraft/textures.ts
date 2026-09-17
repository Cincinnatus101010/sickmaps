type Rgb = readonly [number, number, number];

function hexRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function noise(x: number, y: number, seed: number): number {
  const v = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return v - Math.floor(v);
}

/** 16×16 block texture for MapLibre `addImage` (browser only). */
export function createBlockImageData(
  base: string,
  accent: string,
  seed = 1,
): { width: number; height: number; data: Uint8ClampedArray } {
  const [br, bg, bb] = hexRgb(base);
  const [ar, ag, ab] = hexRgb(accent);
  const data = new Uint8ClampedArray(16 * 16 * 4);

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const i = (y * 16 + x) * 4;
      const n = noise(x, y, seed);
      const pickAccent = n > 0.72 || (x % 4 === 0 && y % 4 === 0 && n > 0.35);
      data[i] = pickAccent ? ar : br;
      data[i + 1] = pickAccent ? ag : bg;
      data[i + 2] = pickAccent ? ab : bb;
      data[i + 3] = 255;
    }
  }

  return { width: 16, height: 16, data };
}

export const MINECRAFT_TEXTURE_SPECS = {
  mc_grass: { base: "#79c05a", accent: "#6aab4e", seed: 1 },
  mc_dirt: { base: "#866526", accent: "#755622", seed: 2 },
  mc_sand: { base: "#dbcb92", accent: "#c9b882", seed: 3 },
  mc_stone: { base: "#7d7d7d", accent: "#6a6a6a", seed: 4 },
  mc_water: { base: "#3f76e4", accent: "#2f66d4", seed: 5 },
  mc_planks: { base: "#9f824c", accent: "#8a7040", seed: 6 },
} as const;

export type MinecraftTextureId = keyof typeof MINECRAFT_TEXTURE_SPECS;
