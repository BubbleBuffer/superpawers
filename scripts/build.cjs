#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");

fs.rmSync(distDir, { recursive: true, force: true });

const tscEntry = require.resolve("typescript/bin/tsc");
const buildResult = spawnSync(process.execPath, [tscEntry, "-p", "tsconfig.json"], {
    cwd: repoRoot,
    stdio: "inherit",
});

if (buildResult.error) {
    throw buildResult.error;
}

process.exit(buildResult.status ?? 1);