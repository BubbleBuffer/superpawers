import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { cleanupLegacyConfig, LEGACY_PLUGIN_PACKAGE, LEGACY_AGENT_IDS } from "../legacy";

describe("logic/legacy", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "superpawers-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("exports correct LEGACY_PLUGIN_PACKAGE", () => {
    expect(LEGACY_PLUGIN_PACKAGE).toBe("@bubblebuffer/superpawers-opencode");
  });

  it("exports LEGACY_AGENT_IDS with prefixed format", () => {
    expect(LEGACY_AGENT_IDS).toContain("superpawers:researcher");
    expect(LEGACY_AGENT_IDS).toContain("superpawers:implementer");
    expect(LEGACY_AGENT_IDS).toContain("superpawers:reviewer");
    expect(LEGACY_AGENT_IDS).toContain("superpawers:verifier");
    expect(LEGACY_AGENT_IDS).toContain("superpawers:planner");
  });

  it("removes legacy plugin package from config", () => {
    const configPath = path.join(tmpDir, "opencode.jsonc");
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          plugin: ["@bubblebuffer/superpawers-opencode", "other-plugin"],
        },
        null,
        2
      )
    );

    const changed = cleanupLegacyConfig(configPath);
    expect(changed).toBe(true);

    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.plugin).toEqual(["other-plugin"]);
  });

  it("removes legacy plugin with array config entry", () => {
    const configPath = path.join(tmpDir, "opencode.jsonc");
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          plugin: [
            ["@bubblebuffer/superpawers-opencode", { some: "config" }],
            "keep-me",
          ],
        },
        null,
        2
      )
    );

    const changed = cleanupLegacyConfig(configPath);
    expect(changed).toBe(true);

    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.plugin).toEqual(["keep-me"]);
  });

  it("removes agent overrides matching current and legacy agent IDs", () => {
    const configPath = path.join(tmpDir, "opencode.jsonc");
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          agent: {
            "superpawers-researcher": { model: "gpt-4" },
            "superpawers:researcher": { model: "claude-3" },
            "custom-agent": { model: "custom-model" },
          },
        },
        null,
        2
      )
    );

    const changed = cleanupLegacyConfig(configPath);
    expect(changed).toBe(true);

    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.agent).toEqual({ "custom-agent": { model: "custom-model" } });
  });

  it("leaves unrelated config entries untouched", () => {
    const configPath = path.join(tmpDir, "opencode.jsonc");
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          model: "gpt-4",
          theme: "dark",
          plugin: ["unrelated-plugin"],
          agent: { "my-agent": { model: "mine" } },
        },
        null,
        2
      )
    );

    const changed = cleanupLegacyConfig(configPath);
    expect(changed).toBe(false);

    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.model).toBe("gpt-4");
    expect(content.theme).toBe("dark");
    expect(content.plugin).toEqual(["unrelated-plugin"]);
    expect(content.agent).toEqual({ "my-agent": { model: "mine" } });
  });

  it("handles config with no legacy entries (no-op)", () => {
    const configPath = path.join(tmpDir, "opencode.jsonc");
    const original = JSON.stringify({ model: "gpt-4" }, null, 2);
    fs.writeFileSync(configPath, original);

    const changed = cleanupLegacyConfig(configPath);
    expect(changed).toBe(false);

    expect(fs.readFileSync(configPath, "utf-8")).toBe(original);
  });

  it("removes empty plugin array entirely", () => {
    const configPath = path.join(tmpDir, "opencode.jsonc");
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        { plugin: ["@bubblebuffer/superpawers-opencode"] },
        null,
        2
      )
    );

    cleanupLegacyConfig(configPath);

    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.plugin).toBeUndefined();
  });

  it("removes empty agent object entirely", () => {
    const configPath = path.join(tmpDir, "opencode.jsonc");
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          agent: {
            "superpawers-researcher": { model: "gpt-4" },
          },
        },
        null,
        2
      )
    );

    cleanupLegacyConfig(configPath);

    const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(content.agent).toBeUndefined();
  });
});
