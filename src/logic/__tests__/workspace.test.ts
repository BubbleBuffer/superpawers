import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  detectWorkspaces,
  getTargetPaths,
  resolveExistingConfigPath,
  workspaceExists,
} from "../workspace";

describe("logic/workspace", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "superpawers-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("detectWorkspaces", () => {
    it("detects global workspace when config exists", () => {
      const fakeHome = path.join(tmpDir, "home");
      const globalRoot = path.join(fakeHome, ".config", "opencode");
      fs.mkdirSync(globalRoot, { recursive: true });
      fs.writeFileSync(path.join(globalRoot, "opencode.jsonc"), "{}");

      const workspaces = detectWorkspaces({
        homeDir: fakeHome,
        cwd: tmpDir,
      });
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].type).toBe("global");
      expect(workspaces[0].isGlobal).toBe(true);
    });

    it("detects local workspace when .opencode dir exists", () => {
      const fakeProject = path.join(tmpDir, "project");
      const localDir = path.join(fakeProject, ".opencode");
      fs.mkdirSync(localDir, { recursive: true });

      const fakeHome = path.join(tmpDir, "home");
      fs.mkdirSync(fakeHome, { recursive: true });

      const workspaces = detectWorkspaces({
        homeDir: fakeHome,
        cwd: fakeProject,
      });
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].type).toBe("local");
      expect(workspaces[0].isGlobal).toBe(false);
    });

    it("detects both when both exist", () => {
      const fakeHome = path.join(tmpDir, "home");
      const globalRoot = path.join(fakeHome, ".config", "opencode");
      fs.mkdirSync(globalRoot, { recursive: true });
      fs.writeFileSync(path.join(globalRoot, "opencode.json"), "{}");

      const fakeProject = path.join(tmpDir, "project");
      const localDir = path.join(fakeProject, ".opencode");
      fs.mkdirSync(localDir, { recursive: true });

      const workspaces = detectWorkspaces({
        homeDir: fakeHome,
        cwd: fakeProject,
      });
      expect(workspaces).toHaveLength(2);
      const types = workspaces.map((w) => w.type);
      expect(types).toContain("global");
      expect(types).toContain("local");
    });

    it("detects neither when neither exists", () => {
      const fakeHome = path.join(tmpDir, "home");
      fs.mkdirSync(fakeHome, { recursive: true });

      const workspaces = detectWorkspaces({
        homeDir: fakeHome,
        cwd: tmpDir,
      });
      expect(workspaces).toEqual([]);
    });
  });

  describe("resolveExistingConfigPath", () => {
    it("finds opencode.jsonc", () => {
      const configPath = path.join(tmpDir, "opencode.jsonc");
      fs.writeFileSync(configPath, "{}");
      expect(resolveExistingConfigPath(tmpDir)).toBe(configPath);
    });

    it("finds opencode.json", () => {
      const configPath = path.join(tmpDir, "opencode.json");
      fs.writeFileSync(configPath, "{}");
      expect(resolveExistingConfigPath(tmpDir)).toBe(configPath);
    });

    it("prefers opencode.jsonc over opencode.json", () => {
      fs.writeFileSync(path.join(tmpDir, "opencode.jsonc"), "{}");
      fs.writeFileSync(path.join(tmpDir, "opencode.json"), "{}");
      const result = resolveExistingConfigPath(tmpDir);
      expect(result).toBe(path.join(tmpDir, "opencode.jsonc"));
    });

    it("returns null when no config file exists", () => {
      expect(resolveExistingConfigPath(tmpDir)).toBeNull();
    });
  });

  describe("workspaceExists", () => {
    it("returns true when config file exists", () => {
      fs.writeFileSync(path.join(tmpDir, "opencode.jsonc"), "{}");
      expect(workspaceExists(tmpDir, true)).toBe(true);
    });

    it("returns true for local when directory exists without config", () => {
      expect(workspaceExists(tmpDir, false)).toBe(true);
    });

    it("returns false for global when no config and directory exists", () => {
      const emptyDir = path.join(tmpDir, "empty");
      fs.mkdirSync(emptyDir, { recursive: true });
      expect(workspaceExists(emptyDir, true)).toBe(false);
    });

    it("returns false when nothing exists", () => {
      const nowhere = path.join(tmpDir, "nowhere");
      expect(workspaceExists(nowhere, false)).toBe(false);
    });
  });

  describe("getTargetPaths", () => {
    it("resolves target paths for global mode", () => {
      const fakeHome = path.join(tmpDir, "home");
      fs.mkdirSync(path.join(fakeHome, ".config", "opencode"), {
        recursive: true,
      });

      const options = {
        mode: "global" as const,
        path: null,
        yes: false,
        uninstall: false,
      };
      const targets = getTargetPaths(options, { homeDir: fakeHome });

      expect(targets.root).toBe(
        path.join(fakeHome, ".config", "opencode")
      );
      expect(targets.agentsDir).toBe(
        path.join(fakeHome, ".config", "opencode", "agents")
      );
      expect(targets.skillsDir).toBe(
        path.join(fakeHome, ".config", "opencode", "skills", "superpawers")
      );
      expect(targets.isGlobal).toBe(true);
    });

    it("resolves target paths for local mode", () => {
      const fakeProject = path.join(tmpDir, "project");
      fs.mkdirSync(path.join(fakeProject, ".opencode"), { recursive: true });

      const options = {
        mode: "local" as const,
        path: null,
        yes: false,
        uninstall: false,
      };
      const targets = getTargetPaths(options, { cwd: fakeProject });

      expect(targets.root).toBe(path.join(fakeProject, ".opencode"));
      expect(targets.agentsDir).toBe(
        path.join(fakeProject, ".opencode", "agents")
      );
      expect(targets.skillsDir).toBe(
        path.join(fakeProject, ".opencode", "skills", "superpawers")
      );
      expect(targets.isGlobal).toBe(false);
    });

    it("resolves target paths for custom path mode", () => {
      const customRoot = path.join(tmpDir, "my-custom");
      fs.mkdirSync(path.join(customRoot, ".opencode"), { recursive: true });

      const options = {
        mode: null,
        path: customRoot,
        yes: false,
        uninstall: false,
      };
      const targets = getTargetPaths(options, { cwd: tmpDir });

      expect(targets.root).toBe(path.join(customRoot, ".opencode"));
      expect(targets.isGlobal).toBe(false);
    });
  });
});