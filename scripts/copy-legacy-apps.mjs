import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, relative, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const destinationRoot = resolve(repositoryRoot, "v2/apps");

const copiedFolders = [
  "home",
  "NFCV.2",
  "app",
  "openday",
  "How to",
  "pony",
  "card",
  "Color2026",
  "Contact",
  "Picture",
];

const copiedFiles = ["พุททังนำมาเงิน.mp3"];
const copiedDependencies = [
  {
    source: "v2/_source/copied-dependencies/token.js",
    destination: "shared/token.js",
  },
];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
]);

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function copyFresh(sourcePath, destinationPath) {
  if (existsSync(destinationPath)) {
    rmSync(destinationPath, { force: true, recursive: true });
  }
  cpSync(sourcePath, destinationPath, {
    recursive: statSync(sourcePath).isDirectory(),
    filter: (path) => basename(path) !== ".DS_Store",
  });
}

function copiedUrlFor(originalUrl, sourcePath) {
  const decodedSourcePath = decodeURIComponent(sourcePath);
  return existsSync(resolve(repositoryRoot, decodedSourcePath))
    ? `/v2/apps/${sourcePath}`
    : originalUrl;
}

function localizeLegacyReferences(contents) {
  return contents
    .replaceAll(
      "https://taithai-tai.github.io/app/token.js",
      "/v2/apps/shared/token.js",
    )
    .replace(
      /https:\/\/github\.com\/taithai-tai\/meemon\/blob\/main\/([^"'?]+)\?raw=true/g,
      (url, sourcePath) => copiedUrlFor(url, sourcePath),
    )
    .replace(
      /https:\/\/raw\.githubusercontent\.com\/taithai-tai\/meemon\/(?:refs\/heads\/)?main\/([^"')\s]+)/g,
      (url, sourcePath) => copiedUrlFor(url, sourcePath),
    )
    .replace(
      /https:\/\/taithai-tai\.github\.io\/meemon\/([^"')\s]+)/g,
      (url, sourcePath) => copiedUrlFor(url, sourcePath),
    )
    .replace(
      /https:\/\/meemon\.net\/(NFCV\.2|app|openday|How%20to|pony|card|Color2026|Contact)\//g,
      "/v2/apps/$1/",
    )
    .replace(/(["'(])\/meemon\/NFCV\.2\//g, "$1/v2/apps/NFCV.2/")
    .replace(
      /(["'(])\/(home|NFCV\.2|app|openday|How%20to|pony|card|Color2026|Contact)\//g,
      "$1/v2/apps/$2/",
    );
}

mkdirSync(destinationRoot, { recursive: true });

for (const folder of copiedFolders) {
  copyFresh(
    resolve(repositoryRoot, folder),
    resolve(destinationRoot, folder),
  );
}

for (const file of copiedFiles) {
  copyFresh(resolve(repositoryRoot, file), resolve(destinationRoot, file));
}

for (const dependency of copiedDependencies) {
  const destination = resolve(destinationRoot, dependency.destination);
  mkdirSync(resolve(destination, ".."), { recursive: true });
  copyFresh(resolve(repositoryRoot, dependency.source), destination);
}

let localizedFileCount = 0;
for (const file of listFiles(destinationRoot)) {
  if (!textExtensions.has(extname(file).toLowerCase())) continue;
  const original = readFileSync(file, "utf8");
  const localized = localizeLegacyReferences(original);
  if (localized === original) continue;
  writeFileSync(file, localized);
  localizedFileCount += 1;
}

const routeMap = {
  shop: "/v2/apps/home/",
  fortune: "/v2/apps/NFCV.2/home/token.html",
  tarot1: "/v2/apps/NFCV.2/taro/1/token.html",
  tarot3: "/v2/apps/NFCV.2/taro/3/token.html",
  tarot10: "/v2/apps/NFCV.2/taro/10/token.html",
  seimsee: "/v2/apps/NFCV.2/Seimsee/token.html",
  jiaobei: "/v2/apps/NFCV.2/Wood/token.html",
  luckyNumber: "/v2/apps/NFCV.2/number/token.html",
  daily: "/v2/apps/NFCV.2/Lucky%20day/",
  incense: "/v2/apps/app/test1.html",
  walletOpening: "/v2/apps/openday/",
  walletGuide: "/v2/apps/How%20to/",
  horseChant: "/v2/apps/pony/",
  wallpapers: "/v2/apps/card/Wallpaper/",
  colors2026: "/v2/apps/Color2026/Index.html",
  contact: "/v2/apps/Contact/",
};

const manifest = {
  schemaVersion: 1,
  description:
    "Copies of the original Meemon apps used by V2 Home. Original routes remain untouched.",
  copiedFolders,
  copiedFiles,
  copiedDependencies,
  localizedFileCount,
  copiedFileCount:
    listFiles(destinationRoot).filter(
      (file) => basename(file) !== "copied-apps.json",
    ).length + 1,
  routeMap,
};

writeFileSync(
  resolve(destinationRoot, "copied-apps.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

process.stdout.write(
  `Copied ${copiedFolders.length} folders, ${copiedFiles.length} shared file, and ${copiedDependencies.length} dependency into ${relative(repositoryRoot, destinationRoot)}; localized ${localizedFileCount} files.\n`,
);
