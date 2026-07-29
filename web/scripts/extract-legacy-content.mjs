import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const webRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(webRoot, "..");
const dataRoot = resolve(webRoot, "data");
mkdirSync(dataRoot, { recursive: true });

function read(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

function extractLiteral(source, marker, opener = "[", closer = "]") {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Marker not found: ${marker}`);
  const start = source.indexOf(opener, markerIndex + marker.length);
  if (start < 0) throw new Error(`Opening token not found for: ${marker}`);

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      quote = character;
      continue;
    }
    if (character === opener) depth += 1;
    if (character === closer) depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }

  throw new Error(`Unclosed literal for: ${marker}`);
}

function evaluateLiteral(source, marker, opener = "[", closer = "]") {
  const literal = extractLiteral(source, marker, opener, closer);
  return vm.runInNewContext(`(${literal})`, Object.create(null), {
    timeout: 1_000,
  });
}

function localTarotPath(file) {
  return `/v2/assets/tarot/${encodeURIComponent(file.replace(/\.[^.]+$/, ".webp"))}`;
}

function localWallpaperPath(remoteUrl) {
  const decoded = decodeURIComponent(remoteUrl);
  const marker = "/card/Picture/";
  const relative = decoded.slice(decoded.indexOf(marker) + marker.length);
  return `/v2/assets/wallpapers/${relative.replace(/\.[^.]+$/, ".webp")}`
    .split("/")
    .map((part, index) => (index < 4 ? part : encodeURIComponent(part)))
    .join("/");
}

const cardHome = read("card/home/index.html");
const tarotPage = read("NFCV.2/taro/1/index.html");
const seimseePage = read("NFCV.2/Seimsee/index.html");
const colorPage = read("Color2026/Index.html");
const luckyDayPage = read("NFCV.2/Lucky day/index.html");
const ponyConstants = read("pony/constants.tsx");

const oracleCards = evaluateLiteral(cardHome, "const CARDS=");
const tarotCards = evaluateLiteral(tarotPage, "const cardFaces =").map((card) => ({
  ...card,
  image: localTarotPath(card.file),
}));
const fortunes = evaluateLiteral(seimseePage, "const fortunes =");
const colors = evaluateLiteral(colorPage, "const daysData =", "{", "}");
const luckyDays = evaluateLiteral(luckyDayPage, "const DAYS =");
const thaksa = evaluateLiteral(
  luckyDayPage,
  "const THAKSA_ATTRIBUTES =",
  "{",
  "}",
);
const chants = evaluateLiteral(
  ponyConstants,
  "export const CHANTS: ChantContent[] =",
);
const wallpaperDays = evaluateLiteral(cardHome, "const DAYS=").map((day) => ({
  ...day,
  files: Object.fromEntries(
    Object.entries(day.files).map(([key, value]) => [
      key,
      localWallpaperPath(value),
    ]),
  ),
}));
const anyDayWallpapers = evaluateLiteral(cardHome, "const ANY=").map((item) => ({
  ...item,
  url: localWallpaperPath(item.url),
}));

const content = {
  oracleCards,
  tarotCards,
  fortunes,
  colors,
  luckyDays,
  thaksa,
  chants: chants.map((chant) => ({
    ...chant,
    image: `/v2/assets/horse/${chant.id}.webp`,
    iconUrl: undefined,
  })),
  wallpapers: {
    days: wallpaperDays,
    anyDay: anyDayWallpapers,
  },
};

writeFileSync(
  resolve(dataRoot, "legacy-content.json"),
  `${JSON.stringify(content, null, 2)}\n`,
);

process.stdout.write(
  `Extracted ${tarotCards.length} tarot cards, ${fortunes.length} seimsee fortunes, ${chants.length} chants, and ${wallpaperDays.length} birthday groups.\n`,
);
