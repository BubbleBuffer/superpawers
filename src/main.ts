#!/usr/bin/env node

import * as path from "path";
import * as fs from "fs";
import { confirmPrompt, selectPrompt } from "./ui/prompts";
import * as output from "./ui/output";
import { readConfig } from "./io/config";
import { ensureDir, copyDir, removeDir, removeMatchingFiles } from "./io/fs";
import { discoverModelCandidates } from "./io/config";
import {
  detectWorkspaces,
  getTargetPaths,
  collectConfigPaths,
} from "./logic/workspace";
import type { CliOptions, WorkspaceInfo, TargetPaths } from "./logic/workspace";
import { installAgents, AGENT_IDS } from "./logic/agents";

// --- Argument Parsing ---

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    mode: null,
    path: null,
    yes: false,
    uninstall: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--global":
        options.mode = "global";
        break;
      case "--local":
        options.mode = "local";
        break;
      case "--path":
        options.path = args[++i] ?? null;
        options.mode = null; // custom path
        break;
      case "--yes":
      case "-y":
        options.yes = true;
        break;
      case "--uninstall":
        options.uninstall = true;
        break;
    }
  }

  return options;
}

// --- Workspace Selection ---

async function chooseWorkspace(
  options: CliOptions,
  available: WorkspaceInfo[]
): Promise<WorkspaceInfo> {
  if (options.mode === "global") {
    const global = available.find((w) => w.type === "global");
    if (global) return global;
    output.error("Global workspace not found. Run opencode first.");
    process.exit(1);
  }

  if (options.mode === "local") {
    const local = available.find((w) => w.type === "local");
    if (local) return local;
    output.error("Local workspace not found. Run opencode first.");
    process.exit(1);
  }

  if (options.path) {
    const root = path.join(options.path, ".opencode");
    return { type: "local", root, isGlobal: false };
  }

  if (available.length === 0) {
    output.error(
      "No opencode workspace found. Run opencode first or specify --global/--local/--path."
    );
    process.exit(1);
  }

  if (available.length === 1) {
    return available[0];
  }

  if (options.yes) {
    return available.find((w) => w.type === "local") ?? available[0];
  }

  const choice = await selectPrompt(
    "Install into which OpenCode workspace?",
    [
      { title: "Global (~/.config/opencode)", value: "global" },
      { title: "Local (.opencode in current project)", value: "local" },
    ],
    "local"
  );
  return available.find((w) => w.type === choice)!;
}

// --- Model Selection ---

async function chooseAgentModels(
  availableModels: string[],
  options: CliOptions
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};

  if (availableModels.length === 0) {
    if (!options.yes) {
      const proceed = await confirmPrompt(
        "No models found in config. Install without setting models?",
        true
      );
      if (!proceed) process.exit(0);
    }
    return result;
  }

  if (availableModels.length === 1) {
    if (!options.yes) {
      const apply = await confirmPrompt(
        `Found one model: ${availableModels[0]}. Apply to all agents?`,
        true
      );
      if (apply) {
        for (const id of AGENT_IDS) {
          result[id] = availableModels[0];
        }
      }
    }
    return result;
  }

  if (options.yes) return result;

  for (const agentId of AGENT_IDS) {
    const choices = [
      { title: "Leave unset (inherit caller)", value: "" },
      ...availableModels.map((m) => ({ title: m, value: m })),
    ];
    const selected = await selectPrompt(
      `Select model for ${agentId}`,
      choices,
      ""
    );
    result[agentId] = selected || null;
  }

  return result;
}

// --- Install/Uninstall ---

async function runInstall(options: CliOptions): Promise<void> {
  const available = detectWorkspaces();
  const workspace = await chooseWorkspace(options, available);
  const targets = getTargetPaths({
    ...options,
    mode: workspace.type === "global" ? "global" : "local",
  });

  output.log(`Installing to ${targets.root}...`);

  const configPaths = collectConfigPaths(targets.root, targets.isGlobal);
  const availableModels = discoverModelCandidates(configPaths);
  const selectedModels = await chooseAgentModels(availableModels, options);

  const agentsSource = path.join(__dirname, "..", "agents");
  installAgents(targets.agentsDir, agentsSource, selectedModels);
  output.log(`Installed agents: ${targets.agentsDir}`);

  const skillsSource = path.join(__dirname, "..", "skills");
  if (fs.existsSync(skillsSource)) {
    ensureDir(path.dirname(targets.skillsDir));
    if (fs.existsSync(targets.skillsDir)) {
      removeDir(targets.skillsDir);
    }
    copyDir(skillsSource, targets.skillsDir);
    output.log(`Installed skills: ${targets.skillsDir}`);
  }

  output.log("SuperPawers installed successfully!");
}

async function runUninstall(options: CliOptions): Promise<void> {
  const available = detectWorkspaces();
  const workspace = await chooseWorkspace(options, available);
  const targets = getTargetPaths({
    ...options,
    mode: workspace.type === "global" ? "global" : "local",
  });

  if (!options.yes) {
    const confirmed = await confirmPrompt(
      `Uninstall SuperPawers from ${targets.root}?`,
      false
    );
    if (!confirmed) process.exit(0);
  }

  if (fs.existsSync(targets.agentsDir)) {
    removeMatchingFiles(
      targets.agentsDir,
      (name) => name.startsWith("superpawers-") && name.endsWith(".md")
    );
  }

  if (fs.existsSync(targets.skillsDir)) {
    removeDir(targets.skillsDir);
  }

  output.log("SuperPawers uninstalled successfully!");
}

// --- Main ---

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.uninstall) {
    await runUninstall(options);
  } else {
    await runInstall(options);
  }
}

main().catch((err: Error) => {
  output.error(err.message);
  process.exit(1);
});
