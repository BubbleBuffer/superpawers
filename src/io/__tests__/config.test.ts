import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  readConfig,
  extractModels,
  discoverModelCandidates,
} from "../config";
import { modify } from "jsonc-parser";

describe("io/config", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "superpawers-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("readConfig", () => {
    it("reads valid JSONC config", () => {
      const configPath = path.join(tmpDir, "test.jsonc");
      fs.writeFileSync(configPath, '{ "model": "gpt-4" /* a comment */ }');
      const { config } = readConfig(configPath);
      expect(config.model).toBe("gpt-4");
    });

    it("reads config with trailing commas", () => {
      const configPath = path.join(tmpDir, "test.jsonc");
      fs.writeFileSync(configPath, '{ "model": "gpt-4", }');
      const { config } = readConfig(configPath);
      expect(config.model).toBe("gpt-4");
    });

    it("rejects invalid JSONC with clear error", () => {
      const configPath = path.join(tmpDir, "bad.jsonc");
      fs.writeFileSync(configPath, "{ invalid json }");
      expect(() => readConfig(configPath)).toThrow(/Failed to parse/);
    });

    it("returns both parsed config and raw text", () => {
      const configPath = path.join(tmpDir, "test.jsonc");
      const raw = '{\n  "model": "gpt-4"\n}\n';
      fs.writeFileSync(configPath, raw);
      const result = readConfig(configPath);
      expect(result.config.model).toBe("gpt-4");
      expect(result.text).toBe(raw);
    });
  });

  describe("extractModels", () => {
    it("discovers models from top-level model and small_model fields", () => {
      const config = { model: "gpt-4", small_model: "gpt-3.5-turbo" };
      const models = extractModels(config);
      expect(models).toContain("gpt-4");
      expect(models).toContain("gpt-3.5-turbo");
      expect(models).toHaveLength(2);
    });

    it("discovers models from agent.*.model fields", () => {
      const config = {
        agent: {
          "superpawers-researcher": { model: "claude-3-opus" },
          "my-agent": { model: "gpt-4o" },
        },
      };
      const models = extractModels(config);
      expect(models).toContain("claude-3-opus");
      expect(models).toContain("gpt-4o");
    });

    it("discovers models from provider.*.models.* keys", () => {
      const config = {
        provider: {
          openai: {
            models: {
              "gpt-4o": { contextLength: 128000 },
              "gpt-4o-mini": { contextLength: 128000 },
            },
          },
        },
      };
      const models = extractModels(config);
      expect(models).toContain("gpt-4o");
      expect(models).toContain("gpt-4o-mini");
    });

    it("returns deduplicated model list", () => {
      const config = {
        model: "gpt-4",
        agent: { "my-agent": { model: "gpt-4" } },
      };
      const models = extractModels(config);
      expect(models.filter((m) => m === "gpt-4")).toHaveLength(1);
    });

    it("returns empty array for config with no models", () => {
      const config = { theme: "dark" };
      const models = extractModels(config);
      expect(models).toEqual([]);
    });
  });

  describe("discoverModelCandidates", () => {
    it("collects models from multiple config paths", () => {
      const config1Path = path.join(tmpDir, "a.jsonc");
      fs.writeFileSync(config1Path, '{ "model": "gpt-4" }');
      const config2Path = path.join(tmpDir, "b.jsonc");
      fs.writeFileSync(config2Path, '{ "small_model": "claude-3" }');

      const models = discoverModelCandidates([config1Path, config2Path]);
      expect(models).toContain("gpt-4");
      expect(models).toContain("claude-3");
    });

    it("skips unreadable configs silently", () => {
      const configPath = path.join(tmpDir, "good.jsonc");
      fs.writeFileSync(configPath, '{ "model": "gpt-4" }');
      const badPath = path.join(tmpDir, "nonexistent.jsonc");

      const models = discoverModelCandidates([badPath, configPath]);
      expect(models).toEqual(["gpt-4"]);
    });
  });
});
