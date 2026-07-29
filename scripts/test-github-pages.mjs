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
  !serviceWorker.includes('url.pathname.startsWith("/v2/")') ||
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
