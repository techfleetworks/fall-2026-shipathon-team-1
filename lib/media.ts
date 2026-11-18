import type { Category } from "./types";

// ------------------------------------------------------------
// Lightweight, dependency-free placeholder media.
// We generate warm, on-brand SVG data URIs so every screen is
// populated and renders identically offline (no external image
// host, no next/image remote config). Swap `item.photos` for real
// Supabase Storage URLs when wired up.
// ------------------------------------------------------------

const CATEGORY_PALETTE: Record<Category | "default", [string, string]> = {
  clothing: ["#fde7c6", "#f2c879"],
  shoes: ["#ffe0cf", "#ff9358"],
  toys: ["#ece0c4", "#e8c05a"],
  default: ["#fde7c6", "#eeaf1b"],
};

const CATEGORY_GLYPH: Record<Category, string> = {
  // simple, rounded outline marks — decorative only
  clothing:
    "M30 18l-8 6-10-8-10 8 6 8 6-4v28h20V36l6 4 6-8z",
  shoes:
    "M8 40c0-10 6-16 6-24l10 2c2 8 10 12 26 14 4 1 6 4 6 8v4H8z",
  toys: "",
};

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Deterministic warm placeholder for an item photo. */
export function itemPhoto(seed: string, category: Category = "clothing"): string {
  const [a, b] = CATEGORY_PALETTE[category] ?? CATEGORY_PALETTE.default;
  const h = hash(seed);
  const cx = 120 + (h % 160);
  const cy = 120 + ((h >> 3) % 160);
  const glyph = CATEGORY_GLYPH[category];
  const glyphMarkup = glyph
    ? `<g transform="translate(168,150) scale(2.1)" fill="rgba(41,37,28,0.14)"><path d="${glyph}"/></g>`
    : `<g fill="rgba(41,37,28,0.14)"><circle cx="200" cy="200" r="44"/><circle cx="200" cy="140" r="20"/><rect x="150" y="236" width="100" height="26" rx="13"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="90" fill="rgba(255,255,255,0.22)"/>
  <circle cx="${400 - cx}" cy="${400 - cy}" r="60" fill="rgba(255,255,255,0.14)"/>
  ${glyphMarkup}
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const AVATAR_COLORS = [
  "#eeaf1b",
  "#ff9358",
  "#6f6651",
  "#be8b13",
  "#8a6d3b",
  "#c08457",
];

/** Deterministic initials avatar. */
export function avatar(name: string): string {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = AVATAR_COLORS[hash(name) % AVATAR_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="48" fill="${color}"/>
  <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" font-family="Kumbh Sans, system-ui, sans-serif" font-size="36" font-weight="600" fill="#29251c">${initials}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
