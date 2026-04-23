#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd) {
    const result = spawnSync(command, args, {
        cwd,
        encoding: "utf-8",
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
        throw new Error(output || `${command} ${args.join(" ")} failed`);
    }

    return result;
}

function assertExists(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Expected file to exist: ${filePath}`);
    }
}

function assertMissing(filePath) {
    if (fs.existsSync(filePath)) {
        throw new Error(`Expected file to be absent: ${filePath}`);
    }
}

function main() {
    const distDir = path.join(repoRoot, "dist");
    const tempRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "superpawers-package-smoke-")
    );
    const installRoot = path.join(tempRoot, "install-root");
    const projectRoot = path.join(tempRoot, "project-root");
    let tarballPath = null;

    fs.mkdirSync(installRoot, { recursive: true });
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.writeFileSync(
        path.join(installRoot, "package.json"),
        '{"private":true}\n',
        "utf-8"
    );

    try {
        fs.rmSync(distDir, { recursive: true, force: true });

        const packResult = run(npmCommand, ["pack", "--silent"], repoRoot);
        const tarballName = packResult.stdout.trim().split(/\r?\n/).pop();

        if (!tarballName) {
            throw new Error("npm pack did not report a tarball name");
        }

        tarballPath = path.join(repoRoot, tarballName);
        assertExists(tarballPath);

        run(npmCommand, ["install", "--silent", tarballPath], installRoot);

        const packagedEntry = path.join(
            installRoot,
            "node_modules",
            "@bubblebuffer",
            "superpawers",
            "dist",
            "main.js"
        );
        assertExists(packagedEntry);
        assertMissing(
            path.join(
                installRoot,
                "node_modules",
                "@bubblebuffer",
                "superpawers",
                "dist",
                "__tests__"
            )
        );

        run(
            process.execPath,
            [packagedEntry, "--yes", "--path", projectRoot],
            installRoot
        );

        assertExists(
            path.join(
                projectRoot,
                ".opencode",
                "agents",
                "superpawers-implementer.md"
            )
        );
        assertExists(
            path.join(
                projectRoot,
                ".opencode",
                "skills",
                "superpawers",
                "systematic-debugging",
                "SKILL.md"
            )
        );
    } finally {
        if (tarballPath && fs.existsSync(tarballPath)) {
            fs.rmSync(tarballPath, { force: true });
        }

        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
}

main();