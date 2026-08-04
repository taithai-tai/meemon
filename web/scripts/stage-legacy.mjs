import { access, cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = dirname(webRoot);
const publicRoot = join(webRoot, "public");
const entries = [
  "Color2026",
  "Contact",
  "How to",
  "NFCV.2",
  "Picture",
  "app",
  "card",
  "home",
  "lucky draw",
  "meemon",
  "openday",
  "pony",
  "pony2",
  "test",
  "วันเปิดกระเป๋า",
  "พุททังนำมาเงิน.mp3",
];

await mkdir(publicRoot, { recursive: true });
let copied = 0;
for (const entry of entries) {
  const source = join(repositoryRoot, entry);
  const destination = join(publicRoot, entry);
  const sourceExists = await access(source).then(() => true).catch(() => false);
  if (!sourceExists) continue;
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
  });
  copied += 1;
}

const manifestSource = join(repositoryRoot, "legacy-routes.json");
if (await access(manifestSource).then(() => true).catch(() => false)) {
  await cp(
    manifestSource,
    join(webRoot, "data", "legacy-routes.json"),
    { force: true },
  );
}

console.log(
  copied
    ? `Staged ${copied} byte-preserving legacy entries.`
    : "Using the committed byte-preserving legacy package.",
);
