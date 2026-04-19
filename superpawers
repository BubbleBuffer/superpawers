#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

const HOME = os.homedir();
const GLOBAL_CONFIG = path.join(HOME, ".config", "opencode", "opencode.json");
const LOCAL_CONFIG = path.join(process.cwd(), ".opencode", "config.json");
const GLOBAL_AGENTS = path.join(HOME, ".config", "opencode", "agents", "superpawers");
const LOCAL_AGENTS = path.join(process.cwd(), ".opencode", "agents", "superpawers");
const GLOBAL_SKILLS = path.join(HOME, ".config", "opencode", "skills", "superpawers");
const LOCAL_SKILLS = path.join(process.cwd(), ".opencode", "skills", "superpawers");

const AGENTS_SOURCE = path.join(__dirname, "agents");

const AGENT_DEFINITIONS = {
  "superpawers:researcher": {
    mode: "subagent",
    description: "Explores codebase, gathers context, reports findings",
    prompt: "{file:./agents/superpawers/superpawers-researcher.system.md}",
    permission: { edit: "deny", bash: "allow" }
  },
  "superpawers:implementer": {
    mode: "subagent",
    description: "Implements tasks following TDD with isolated context",
    prompt: "{file:./agents/superpawers/superpawers-implementer.system.md}",
    permission: { edit: "allow", bash: "allow" }
  },
  "superpawers:reviewer": {
    mode: "subagent",
    description: "Reviews code quality, spec compliance, and production readiness",
    prompt: "{file:./agents/superpawers/superpawers-reviewer.system.md}",
    permission: { edit: "deny", bash: "deny" }
  },
  "superpawers:verifier": {
    mode: "subagent",
    description: "Runs tests, lint, and typecheck independently",
    prompt: "{file:./agents/superpawers/superpawers-verifier.system.md}",
    permission: { edit: "deny", bash: "allow" }
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { mode: null, path: null, yes: false, uninstall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--global") options.mode = "global";
    else if (args[i] === "--local") options.mode = "local";
    else if (args[i] === "--path" && args[i + 1]) options.path = args[++i];
    else if (args[i] === "--yes") options.yes = true;
    else if (args[i] === "--uninstall") options.uninstall = true;
  }
  return options;
}

function detectWorkspaces() {
  const detected = [];
  if (fs.existsSync(GLOBAL_CONFIG)) detected.push("global");
  if (fs.existsSync(LOCAL_CONFIG)) detected.push("local");
  return detected;
}

function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(question + " ");
    process.stdin.once("data", (d) => {
      resolve(d.toString().trim());
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyAgents(targetDir) {
  ensureDir(targetDir);
  const files = fs.readdirSync(AGENTS_SOURCE).filter(f => f.endsWith(".system.md"));
  for (const file of files) {
    const src = path.join(AGENTS_SOURCE, file);
    const dst = path.join(targetDir, file);
    fs.copyFileSync(src, dst);
    console.log(`Copied: ${file}`);
  }
}

function symlinkSkills(target, sourceDir) {
  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) fs.unlinkSync(target);
    else if (stat.isDirectory()) fs.rmSync(target, { recursive: true });
    else fs.unlinkSync(target);
  }
  fs.symlinkSync(sourceDir, target, "junction");
  console.log(`Symlinked: ${target} -> ${sourceDir}`);
}

function removeAgents(targetDir) {
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`Removed: ${targetDir}`);
  }
}

function removeSkillsSymlink(target) {
  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(target);
      console.log(`Removed symlink: ${target}`);
    }
  }
}

function readConfig(configPath) {
  const content = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(content);
}

function writeConfig(configPath, config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
}

function addAgentsToConfig(configPath) {
  const config = readConfig(configPath);
  if (!config.agent) config.agent = {};
  for (const [key, value] of Object.entries(AGENT_DEFINITIONS)) {
    if (!config.agent[key]) {
      config.agent[key] = value;
      console.log(`Added agent: ${key}`);
    }
  }
  writeConfig(configPath, config);
}

function removeAgentsFromConfig(configPath) {
  if (!fs.existsSync(configPath)) return;
  const config = readConfig(configPath);
  if (!config.agent) return;
  let removed = false;
  for (const key of Object.keys(AGENT_DEFINITIONS)) {
    if (config.agent[key]) {
      delete config.agent[key];
      removed = true;
    }
  }
  if (removed) {
    writeConfig(configPath, config);
    console.log(`Removed superpawers agents from: ${configPath}`);
  }
}

async function runInstall(options) {
  const available = detectWorkspaces();

  let targetConfig, agentsTarget, skillsTarget, skillsSource;

  if (options.mode === "global") {
    targetConfig = GLOBAL_CONFIG;
    agentsTarget = GLOBAL_AGENTS;
    skillsTarget = GLOBAL_SKILLS;
    skillsSource = __dirname + "/skills";
  } else if (options.mode === "local") {
    targetConfig = LOCAL_CONFIG;
    agentsTarget = LOCAL_AGENTS;
    skillsTarget = LOCAL_SKILLS;
    skillsSource = path.join(process.cwd(), "skills");
  } else if (options.path) {
    targetConfig = path.join(options.path, ".opencode", "config.json");
    agentsTarget = path.join(options.path, ".opencode", "agents", "superpawers");
    skillsTarget = path.join(options.path, ".opencode", "skills", "superpawers");
    skillsSource = path.join(options.path, "skills");
  } else {
    console.log(`Detected workspaces: ${available.join(", ")}`);

    if (available.length === 0) {
      console.error("No workspace detected. Run with --global, --local, or --path <path>");
      process.exit(1);
    }

    if (available.includes("global") && available.includes("local")) {
      const answer = options.yes ? "local" : (await prompt("Use global or local? [local]")) || "local";
      options.mode = answer;
    } else {
      options.mode = available[0];
    }

    return runInstall(options);
  }

  console.log(`Installing to: ${options.mode}`);
  console.log(`Agents: ${agentsTarget}`);
  console.log(`Skills: ${skillsTarget}`);

  copyAgents(agentsTarget);
  symlinkSkills(skillsTarget, skillsSource);

  const addAgents = options.yes || (await prompt("Add superpawers agents to config? [Y/n]")) !== "n";
  if (addAgents) {
    if (fs.existsSync(targetConfig)) {
      addAgentsToConfig(targetConfig);
    } else {
      console.log(`Config not found: ${targetConfig} - skipping agent config`);
    }
  }

  console.log("Setup complete!");
}

async function runUninstall(options) {
  const available = detectWorkspaces();

  let agentsTarget, skillsTarget;

  if (options.mode === "global") {
    agentsTarget = GLOBAL_AGENTS;
    skillsTarget = GLOBAL_SKILLS;
  } else if (options.mode === "local") {
    agentsTarget = LOCAL_AGENTS;
    skillsTarget = LOCAL_SKILLS;
  } else if (options.path) {
    agentsTarget = path.join(options.path, ".opencode", "agents", "superpawers");
    skillsTarget = path.join(options.path, ".opencode", "skills", "superpawers");
  } else {
    console.log(`Detected workspaces: ${available.join(", ")}`);

    if (available.length === 0) {
      console.error("No workspace detected.");
      process.exit(1);
    }

    options.mode = available[0];
    return runUninstall(options);
  }

  const confirm = options.yes || (await prompt("Delete agents/superpawers/ and skills/superpawers? [y/N]")) === "y";
  if (!confirm) {
    console.log("Cancelled.");
    return;
  }

  removeAgents(agentsTarget);
  removeSkillsSymlink(skillsTarget);

  const configPath = options.mode === "global" ? GLOBAL_CONFIG : LOCAL_CONFIG;
  removeAgentsFromConfig(configPath);

  console.log("Uninstall complete!");
}

async function main() {
  const options = parseArgs();

  if (options.uninstall) {
    await runUninstall(options);
  } else {
    await runInstall(options);
  }
}

main().catch(console.error);
