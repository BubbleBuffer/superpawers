import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// --- Types ---

export interface CliOptions {
  mode: null | "global" | "local";
  path: string | null;
  yes: boolean;
  uninstall: boolean;
}

export interface WorkspaceInfo {
  type: "global" | "local";
  root: string;
  isGlobal: boolean;
}

export interface TargetPaths {
  agentsDir: string;
  skillsDir: string;
  configPaths: string[];
  root: string;
  isGlobal: boolean;
}

// --- Constants ---

export const CONFIG_CANDIDATES = ["opencode.jsonc", "opencode.json"];

export function getGlobalRoot(homeDir?: string): string {
  return path.join(homeDir ?? os.homedir(), ".config", "opencode");
}

// --- Functions ---

/**
 * Find the first existing config file in a root directory.
 * Returns the full path or null if none found.
 */
export function resolveExistingConfigPath(root: string): string | null {
  for (const candidate of CONFIG_CANDIDATES) {
    const fullPath = path.join(root, candidate);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return null;
}

/**
 * Check whether a workspace exists at the given root.
 * For global: requires a config file.
 * For local: requires a config file OR the directory itself existing.
 */
export function workspaceExists(root: string, isGlobal: boolean): boolean {
  if (resolveExistingConfigPath(root)) return true;
  if (!isGlobal) return fs.existsSync(root);
  return false;
}

/**
 * Detect all available workspaces (global and/or local).
 * Accepts optional overrides for homeDir and cwd for testability.
 */
export function detectWorkspaces(overrides?: {
  homeDir?: string;
  cwd?: string;
}): WorkspaceInfo[] {
  const home = overrides?.homeDir ?? os.homedir();
  const cwd = overrides?.cwd ?? process.cwd();
  const result: WorkspaceInfo[] = [];

  const globalRoot = getGlobalRoot(home);
  if (workspaceExists(globalRoot, true)) {
    result.push({ type: "global", root: globalRoot, isGlobal: true });
  }

  const localRoot = path.join(cwd, ".opencode");
  if (workspaceExists(localRoot, false)) {
    result.push({ type: "local", root: localRoot, isGlobal: false });
  }

  return result;
}

/**
 * Collect all config file paths for a workspace root.
 * For local workspaces, also checks for legacy config.json.
 */
export function collectConfigPaths(root: string, isGlobal: boolean): string[] {
  const paths: string[] = [];

  for (const candidate of CONFIG_CANDIDATES) {
    const fullPath = path.join(root, candidate);
    if (fs.existsSync(fullPath)) paths.push(fullPath);
  }

  // For local workspaces, also check legacy config.json
  if (!isGlobal) {
    const legacyPath = path.join(root, "config.json");
    if (fs.existsSync(legacyPath)) paths.push(legacyPath);
  }

  return [...new Set(paths)];
}

/**
 * Resolve the target paths (agents dir, skills dir, config paths)
 * for the given CLI options.
 */
export function getTargetPaths(
  options: CliOptions,
  overrides?: { cwd?: string; homeDir?: string }
): TargetPaths {
  const cwd = overrides?.cwd ?? process.cwd();
  const home = overrides?.homeDir ?? os.homedir();
  let root: string;
  let isGlobal: boolean;

  if (options.mode === "global") {
    root = getGlobalRoot(home);
    isGlobal = true;
  } else if (options.mode === "local") {
    root = path.join(cwd, ".opencode");
    isGlobal = false;
  } else {
    // custom path — options.path is the project root
    root = path.join(options.path!, ".opencode");
    isGlobal = false;
  }

  return {
    agentsDir: path.join(root, "agents"),
    skillsDir: path.join(root, "skills", "superpawers"),
    configPaths: collectConfigPaths(root, isGlobal),
    root,
    isGlobal,
  };
}
