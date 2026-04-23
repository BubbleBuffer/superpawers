import { execFileSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { describe, expect, it } from "vitest";

function getNpmCommand(): string {
    return process.platform === "win32" ? "npm.cmd" : "npm";
}

describe("compiled CLI smoke test", () => {
    it(
        "installs agents and skills when run from dist output",
        () => {
            const repoRoot = process.cwd();
            const tempRoot = fs.mkdtempSync(
                path.join(os.tmpdir(), "superpawers-cli-smoke-")
            );
            const projectRoot = path.join(tempRoot, "project");
            fs.mkdirSync(projectRoot, { recursive: true });

            try {
                execFileSync(getNpmCommand(), ["run", "build"], {
                    cwd: repoRoot,
                    stdio: "pipe",
                });

                const cliResult = spawnSync(
                    process.execPath,
                    [path.join(repoRoot, "dist", "main.js"), "--yes", "--path", projectRoot],
                    {
                        cwd: repoRoot,
                        encoding: "utf-8",
                    }
                );

                if (cliResult.error) {
                    throw cliResult.error;
                }

                const output = [cliResult.stdout, cliResult.stderr]
                    .filter(Boolean)
                    .join("\n");

                expect(cliResult.status, output).toBe(0);
                expect(
                    fs.existsSync(
                        path.join(
                            projectRoot,
                            ".opencode",
                            "agents",
                            "superpawers-implementer.md"
                        )
                    )
                ).toBe(true);
                expect(
                    fs.existsSync(
                        path.join(
                            projectRoot,
                            ".opencode",
                            "skills",
                            "superpawers",
                            "systematic-debugging",
                            "SKILL.md"
                        )
                    )
                ).toBe(true);
            } finally {
                fs.rmSync(tempRoot, { recursive: true, force: true });
            }
        },
        120000
    );

    it(
        "excludes compiled test files from npm pack output",
        () => {
            const repoRoot = process.cwd();
            const staleTestPath = path.join(
                repoRoot,
                "dist",
                "__tests__",
                "should-not-ship.test.js"
            );

            fs.mkdirSync(path.dirname(staleTestPath), { recursive: true });
            fs.writeFileSync(staleTestPath, "// stale test artifact\n", "utf-8");

            try {
                const packResult = spawnSync(
                    getNpmCommand(),
                    ["pack", "--dry-run"],
                    {
                        cwd: repoRoot,
                        encoding: "utf-8",
                    }
                );

                if (packResult.error) {
                    throw packResult.error;
                }

                const output = [packResult.stdout, packResult.stderr]
                    .filter(Boolean)
                    .join("\n");

                expect(packResult.status, output).toBe(0);
                expect(output).not.toContain("dist/__tests__");
                expect(output).not.toContain("should-not-ship.test.js");
                expect(output).not.toMatch(/dist\/.*\.test\.(?:d\.ts|js)/);
            } finally {
                fs.rmSync(path.join(repoRoot, "dist"), {
                    recursive: true,
                    force: true,
                });
            }
        },
        120000
    );
});