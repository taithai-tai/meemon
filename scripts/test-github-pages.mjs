import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, "legacy-routes.json"), "utf8"),
);

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

const mismatchedLegacyFiles = [];
for (const route of manifest.routes) {
  const path =
    route.path === "index.html" ? route.archivedPath : route.path;
  const absolutePath = resolve(repositoryRoot, path);
  if (
    !existsSync(absolutePath) ||
    sha256(readFileSync(absolutePath)) !== route.sha256
  ) {
    mismatchedLegacyFiles.push(path);
  }
}

if (mismatchedLegacyFiles.length > 0) {
  throw new Error(
    `Legacy contract mismatch:\n${mismatchedLegacyFiles.join("\n")}`,
  );
}

const requiredPages = [
  "v2/index.html",
  "v2/shop/index.html",
  "v2/cart/index.html",
  "v2/checkout/index.html",
  "v2/fortune/oracle/index.html",
  "v2/fortune/tarot/index.html",
  "v2/fortune/seimsee/index.html",
  "v2/fortune/jiaobei/index.html",
  "v2/fortune/lucky-number/index.html",
  "v2/fortune/daily/index.html",
  "v2/fortune/colors-2026/index.html",
  "v2/rituals/incense/index.html",
  "v2/rituals/wallet-opening/index.html",
  "v2/rituals/wallet-guide/index.html",
  "v2/rituals/horse-chant/index.html",
  "v2/rituals/money-chant/index.html",
  "v2/wallpapers/index.html",
  "v2/contact/index.html",
  "v2/apps/home/index.html",
  "v2/apps/NFCV.2/home/token.html",
  "v2/apps/NFCV.2/home/index.html",
  "v2/apps/NFCV.2/taro/1/index.html",
  "v2/apps/NFCV.2/taro/3/index.html",
  "v2/apps/NFCV.2/taro/10/index.html",
  "v2/apps/NFCV.2/Seimsee/index.html",
  "v2/apps/NFCV.2/Wood/index.html",
  "v2/apps/NFCV.2/number/index.html",
  "v2/apps/NFCV.2/Lucky day/index.html",
  "v2/apps/app/test1.html",
  "v2/apps/openday/index.html",
  "v2/apps/How to/index.html",
  "v2/apps/pony/index.html",
  "v2/apps/card/Wallpaper/index.html",
  "v2/apps/Color2026/Index.html",
  "v2/apps/Contact/index.html",
  "legacy/index.html",
];

for (const page of requiredPages) {
  if (!existsSync(resolve(repositoryRoot, page))) {
    throw new Error(`Required GitHub Pages route is missing: ${page}`);
  }
}

const rootIndex = readFileSync(resolve(repositoryRoot, "index.html"), "utf8");
if (!rootIndex.includes('window.location.replace("/v2/"')) {
  throw new Error("The root index does not redirect to /v2/.");
}

const homeIndex = readFileSync(resolve(repositoryRoot, "v2/index.html"), "utf8");
const requiredCopiedHomeLinks = [
  "/v2/apps/home/",
  "/v2/apps/NFCV.2/home/token.html",
  "/v2/apps/NFCV.2/Seimsee/token.html",
  "/v2/apps/NFCV.2/Wood/token.html",
  "/v2/apps/NFCV.2/number/token.html",
  "/v2/apps/app/test1.html",
  "/v2/apps/openday/",
  "/v2/apps/card/Wallpaper/",
];

for (const href of requiredCopiedHomeLinks) {
  if (!homeIndex.includes(`href="${href}"`)) {
    throw new Error(`V2 Home is missing copied app link: ${href}`);
  }
}

const copiedAppForwardContracts = [
  ["v2/shop/index.html", "/v2/apps/home/"],
  ["v2/shop/77-50712224947/index.html", "/v2/apps/home/"],
  ["v2/cart/index.html", "/v2/apps/home/"],
  ["v2/checkout/index.html", "/v2/apps/home/"],
  ["v2/fortune/index.html", "/v2/apps/NFCV.2/home/token.html"],
  ["v2/fortune/oracle/index.html", "/v2/apps/NFCV.2/home/token.html"],
  ["v2/fortune/tarot/index.html", "/v2/apps/NFCV.2/home/token.html"],
  ["v2/fortune/seimsee/index.html", "/v2/apps/NFCV.2/Seimsee/token.html"],
  ["v2/fortune/jiaobei/index.html", "/v2/apps/NFCV.2/Wood/token.html"],
  ["v2/fortune/lucky-number/index.html", "/v2/apps/NFCV.2/number/token.html"],
  ["v2/fortune/daily/index.html", "/v2/apps/NFCV.2/Lucky%20day/"],
  ["v2/fortune/colors-2026/index.html", "/v2/apps/Color2026/Index.html"],
  ["v2/rituals/index.html", "/v2/apps/How%20to/"],
  ["v2/rituals/incense/index.html", "/v2/apps/app/test1.html"],
  ["v2/rituals/wallet-opening/index.html", "/v2/apps/openday/"],
  ["v2/rituals/wallet-guide/index.html", "/v2/apps/How%20to/"],
  ["v2/rituals/horse-chant/index.html", "/v2/apps/pony/"],
  ["v2/rituals/money-chant/index.html", "/v2/apps/How%20to/"],
  ["v2/wallpapers/index.html", "/v2/apps/card/Wallpaper/"],
  ["v2/contact/index.html", "/v2/apps/Contact/"],
];

for (const [page, href] of copiedAppForwardContracts) {
  const html = readFileSync(resolve(repositoryRoot, page), "utf8");
  if (
    !html.includes(`href="${href}"`) ||
    !html.includes("สำเนาแอปเดิมที่เก็บอยู่ภายในโฟลเดอร์ V2")
  ) {
    throw new Error(`V2 route does not forward to its copied app: ${page}`);
  }
}

const copiedAppsManifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, "v2/apps/copied-apps.json"), "utf8"),
);
if (
  copiedAppsManifest.copiedFolders.length !== 10 ||
  copiedAppsManifest.copiedFiles.length !== 1 ||
  copiedAppsManifest.copiedDependencies.length !== 1 ||
  copiedAppsManifest.routeMap.fortune !==
    "/v2/apps/NFCV.2/home/token.html"
) {
  throw new Error("The copied app manifest is incomplete.");
}

const copiedFortuneHome = readFileSync(
  resolve(repositoryRoot, "v2/apps/NFCV.2/home/index.html"),
  "utf8",
);
if (
  !copiedFortuneHome.includes("/v2/apps/NFCV.2/Seimsee/token.html") ||
  !copiedFortuneHome.includes("/v2/apps/shared/token.js") ||
  copiedFortuneHome.includes("taithai-tai.github.io/meemon/NFCV.2/") ||
  copiedFortuneHome.includes("taithai-tai.github.io/app/token.js")
) {
  throw new Error("The copied fortune hub still points to the original app URL.");
}

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

const v2HtmlFiles = listHtmlFiles(resolve(repositoryRoot, "v2"));
const assetPaths = v2HtmlFiles.flatMap((htmlFile) => {
  const html = readFileSync(htmlFile, "utf8");
  return [...html.matchAll(/(?:src|href)="(\/v2\/[^"]+)"/g)].map(
    (match) => match[1],
  );
});

for (const assetPath of assetPaths) {
  const cleanPath = assetPath.split(/[?#]/, 1)[0];
  const candidate = resolve(
    repositoryRoot,
    decodeURIComponent(cleanPath.slice(1)),
  );
  const routeIndex = resolve(candidate, "index.html");
  if (!existsSync(candidate) && !existsSync(routeIndex)) {
    throw new Error(`V2 reference is missing: ${assetPath}`);
  }
}

const serviceWorker = readFileSync(
  resolve(repositoryRoot, "v2/sw.js"),
  "utf8",
);
if (
  !serviceWorker.includes('url.pathname.startsWith("/v2/_next/")') ||
  !serviceWorker.includes('url.pathname.startsWith("/v2/assets/")') ||
  serviceWorker.includes('url.pathname.startsWith("/v2/apps/")') ||
  serviceWorker.includes("localStorage")
) {
  throw new Error("The V2 service worker contract is invalid.");
}

const cartSource = readFileSync(
  resolve(repositoryRoot, "v2/_source/app/components/CartProvider.tsx"),
  "utf8",
);
if (!cartSource.includes('"meemon:v2:cart"')) {
  throw new Error("The V2 cart does not use its isolated storage namespace.");
}

process.stdout.write(
  `GitHub Pages contract passed: ${manifest.totals.preservedHtmlPaths} legacy pages and ${v2HtmlFiles.length} generated V2 pages.\n`,
);
