import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const sourceRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(sourceRoot, "../..");
const deployedV2Root = resolve(repositoryRoot, "v2");
const outputRoot = resolve(sourceRoot, "out");

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

rmSync(resolve(deployedV2Root, "_next"), { recursive: true, force: true });
cpSync(resolve(outputRoot, "_next"), resolve(deployedV2Root, "_next"), {
  recursive: true,
});
cpSync(resolve(outputRoot, "v2"), deployedV2Root, { recursive: true });
cpSync(resolve(outputRoot, "legacy"), resolve(repositoryRoot, "legacy"), {
  recursive: true,
});

if (existsSync(resolve(outputRoot, "og.png"))) {
  cpSync(resolve(outputRoot, "og.png"), resolve(repositoryRoot, "og.png"));
}

process.stdout.write("Updated the GitHub Pages files for Meemon V2.\n");
