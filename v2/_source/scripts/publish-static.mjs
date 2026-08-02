import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const sourceRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(sourceRoot, "../..");
const deployedV2Root = resolve(repositoryRoot, "v2");
const outputRoot = resolve(sourceRoot, "out");
const outputV2Root = resolve(outputRoot, "v2");

const requiredOutputs = [
  resolve(outputRoot, "v2/index.html"),
  resolve(outputRoot, "_next"),
  resolve(outputRoot, "legacy/index.html"),
];

for (const requiredOutput of requiredOutputs) {
  if (!existsSync(requiredOutput)) {
    throw new Error(`Static build output is missing: ${requiredOutput}`);
  }
}

function removeDuplicateCopies(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);

    if (/ \(\d+\)(?=\.|$)/.test(entry.name)) {
      rmSync(entryPath, { recursive: true, force: true });
      continue;
    }

    if (entry.isDirectory()) {
      removeDuplicateCopies(entryPath);
    }
  }
}

// Finder can create numbered copies inside an existing export. They are never
// valid Next.js output and can retain references to chunks from an older build.
removeDuplicateCopies(outputV2Root);

rmSync(resolve(deployedV2Root, "_next"), { recursive: true, force: true });
cpSync(resolve(outputRoot, "_next"), resolve(deployedV2Root, "_next"), {
  recursive: true,
});

// Remove every generated V2 route before publishing the new export. A plain
// overlay copy leaves deleted routes and browser-created duplicates such as
// `index (1).html` behind, and those stale pages can reference missing chunks.
// `_source` and `apps` are not part of the export, so they remain untouched.
for (const generatedEntry of readdirSync(outputV2Root)) {
  rmSync(resolve(deployedV2Root, generatedEntry), {
    recursive: true,
    force: true,
  });
}

cpSync(outputV2Root, deployedV2Root, { recursive: true });
cpSync(resolve(outputRoot, "legacy"), resolve(repositoryRoot, "legacy"), {
  recursive: true,
});

if (existsSync(resolve(outputRoot, "og.png"))) {
  cpSync(resolve(outputRoot, "og.png"), resolve(repositoryRoot, "og.png"));
}

process.stdout.write("Updated the GitHub Pages files for Meemon V2.\n");
