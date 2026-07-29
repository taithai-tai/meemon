import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, posix, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const baselineCommit = git(["rev-parse", "HEAD"]).trim();
const rootIndexPath = "index.html";
const archivedRootIndexPath = "legacy-snapshots/root-index.html";

function git(args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: options.encoding ?? "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed:\n${String(result.stderr).trim()}`,
    );
  }

  return result.stdout;
}

function latestCommitContaining(path) {
  const commits = git(["rev-list", "--all", "--", path])
    .split("\n")
    .filter(Boolean);

  for (const commit of commits) {
    const result = spawnSync("git", ["cat-file", "-e", `${commit}:${path}`], {
      cwd: repositoryRoot,
    });
    if (result.status === 0) return commit;
  }

  throw new Error(`No historical blob found for ${path}`);
}

function readHistoricalFile(commit, path) {
  return git(["show", `${commit}:${path}`], { encoding: "buffer" });
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function encodePath(path) {
  return `/${path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function extractDependencies(html) {
  const values = [];
  const attributePattern = /\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi;
  let match;

  while ((match = attributePattern.exec(html)) !== null) {
    const value = match[2].trim();
    if (
      !value ||
      value.startsWith("#") ||
      value.startsWith("data:") ||
      value.startsWith("javascript:") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:")
    ) {
      continue;
    }
    values.push(value);
  }

  const unique = [...new Set(values)].sort();
  return {
    assets: unique.filter(
      (value) => !/^https?:\/\//i.test(value) && !value.startsWith("//"),
    ),
    externalDependencies: unique.filter(
      (value) => /^https?:\/\//i.test(value) || value.startsWith("//"),
    ),
  };
}

const historyOutput = git([
  "-c",
  "core.quotePath=false",
  "log",
  "--all",
  "--name-only",
  "--pretty=format:",
]);

const historicalPaths = [
  ...new Set(
    historyOutput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.toLowerCase().endsWith(".html")),
  ),
].sort((left, right) => left.localeCompare(right, "th"));

if (!existsSync(resolve(repositoryRoot, archivedRootIndexPath))) {
  mkdirSync(dirname(resolve(repositoryRoot, archivedRootIndexPath)), {
    recursive: true,
  });
  writeFileSync(
    resolve(repositoryRoot, archivedRootIndexPath),
    readFileSync(resolve(repositoryRoot, rootIndexPath)),
  );
}

const restoredPaths = [];

for (const path of historicalPaths) {
  if (path === rootIndexPath || existsSync(resolve(repositoryRoot, path))) {
    continue;
  }

  const sourceCommit = latestCommitContaining(path);
  const destination = resolve(repositoryRoot, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, readHistoricalFile(sourceCommit, path));
  restoredPaths.push(path);
}

const routes = historicalPaths.map((path) => {
  const effectivePath =
    path === rootIndexPath ? archivedRootIndexPath : path;
  const sourceCommit = latestCommitContaining(path);
  const contents = readFileSync(resolve(repositoryRoot, effectivePath));
  const html = contents.toString("utf8");
  const dependencies = extractDependencies(html);
  const directoryUrl =
    posix.basename(path).toLowerCase() === "index.html"
      ? encodePath(posix.dirname(path) === "." ? "" : `${posix.dirname(path)}/`)
      : null;

  return {
    path,
    fileUrl: encodePath(path),
    directoryUrl: path === rootIndexPath ? null : directoryUrl,
    sourceCommit,
    sha256: sha256(contents),
    bytes: contents.byteLength,
    restoredFromHistory: restoredPaths.includes(path),
    replacedByHome: path === rootIndexPath,
    archivedPath: path === rootIndexPath ? archivedRootIndexPath : null,
    ...dependencies,
  };
});

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  baselineCommit,
  baselineTag: "legacy-before-v2-2026-07-29",
  rootException: {
    path: rootIndexPath,
    archivedPath: archivedRootIndexPath,
    reason: "The original file was blank and is replaced by Meemon Home.",
  },
  totals: {
    historicalHtmlPaths: routes.length,
    restoredHtmlPaths: restoredPaths.length,
    preservedHtmlPaths: routes.length - 1,
  },
  routes,
};

writeFileSync(
  resolve(repositoryRoot, "legacy-routes.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

process.stdout.write(
  `Recorded ${routes.length} historical HTML routes; restored ${restoredPaths.length} missing files.\n`,
);
