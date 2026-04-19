# SuperPawers Quick Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpawers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace complex npm plugin install with simple `npx @bubblebuffer/superpawers` command for workspace setup.

**Architecture:** Single `setup.js` entry point handles workspace detection, file copying, symlinking, and config updates. No plugin required - agents and skills are pure content files.

**Tech Stack:** Node.js (pure JavaScript, no build step)

---

## File Structure

```
superpawers/
├── agents/                          # Already exists, renamed to .system.md
│   ├── superpawers-researcher.system.md
│   ├── superpawers-implementer.system.md
│   ├── superpawers-reviewer.system.md
│   └── superpawers-verifier.system.md
├── skills/                          # Already exists
├── setup.js                         # NEW - main entry point
├── package.json                     # MODIFY - remove plugin deps, add bin
└── README.md                        # MODIFY - update install instructions
```

**Files to DELETE:**
- `src/index.ts`
- `dist/` (entire directory)
- `scripts/postinstall.js`
- `scripts/install.js`
- `.gitignore` (will be recreated without .superpawers exclusion)

**Config paths:**
- Global: `~/.config/opencode/opencode.json`
- Local: `./.opencode/config.json`
- Agents target: `~/.config/opencode/agents/superpawers/`
- Skills symlink: `~/.config/opencode/skills/superpawers`

---

## Task 1: Create setup.js Entry Point

**Files:**
- Create: `setup.js`

- [ ] **Step 1: Write setup.js with full implementation**

```javascript
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
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x setup.js`

- [ ] **Step 3: Test help output**

Run: `node setup.js --help` or `node setup.js` with no args (should show workspace detection)

Expected: No errors, console output showing detected workspaces or usage info

- [ ] **Step 4: Commit**

```bash
git add setup.js
git commit -m "feat: add setup.js npx entry point for quick setup"
```

---

## Task 2: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Read current package.json**

- [ ] **Step 2: Write new package.json**

```json
{
  "name": "@bubblebuffer/superpawers",
  "version": "0.3.0",
  "description": "Quick setup for SuperPawers skills and agents - subagent-driven development workflow",
  "bin": {
    "superpawers": "./setup.js"
  },
  "files": [
    "agents/",
    "skills/",
    "setup.js"
  ],
  "scripts": {},
  "keywords": [
    "opencode",
    "skills",
    "agents",
    "subagents",
    "coding-workflow"
  ],
  "author": "",
  "license": "MIT"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "refactor: remove plugin, add bin entry for npx setup"
```

---

## Task 3: Delete Old Plugin Files

**Files to DELETE:**
- `src/index.ts`
- `dist/` directory
- `scripts/postinstall.js`
- `scripts/install.js`

- [ ] **Step 1: Delete plugin files**

```bash
rm -rf src/ dist/ scripts/postinstall.js scripts/install.js
```

- [ ] **Step 2: Verify deletion**

Run: `ls src/ dist/ scripts/` (each should return "No such file")

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove plugin code, now using setup.js only"
```

---

## Task 4: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Remove .superpawers/ from gitignore**

Old: `.superpawers/`
New: (remove line)

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: track .superpawers/ directory"
```

---

## Task 5: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update install section with new setup**

Replace old npm install instructions with:

```markdown
## Quick Setup

```bash
npx @bubblebuffer/superpawers
```

This will:
1. Detect global (`~/.config/opencode/`) and local (`./.opencode/config.json`) workspaces
2. Copy agents to `~/.config/opencode/agents/superpawers/`
3. Create skills symlink at `~/.config/opencode/skills/superpawers`
4. Prompt to add agent definitions to your opencode.json

### Options

- `--global` - Use global workspace
- `--local` - Use local workspace (current directory)
- `--path <path>` - Use custom workspace path
- `--yes` - Skip prompts (use defaults)
- `--uninstall` - Remove installed files and config entries
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update install instructions for npx setup"
```

---

## Task 6: Integration Test

- [ ] **Step 1: Test global install flow**

```bash
# Create temp test directory
mkdir -p /tmp/superpawers-test
cd /tmp/superpawers-test
# Clone repo
git clone https://github.com/BubbleBuffer/superpawers.git .
# Run setup (should use global by default or prompt)
node setup.js --global --yes
# Verify agents copied
ls ~/.config/opencode/agents/superpawers/
# Verify symlink
ls -la ~/.config/opencode/skills/superpawers
```

Expected: All 4 agent files present, skills symlink valid

- [ ] **Step 2: Test uninstall flow**

```bash
node setup.js --uninstall --yes
# Verify cleanup
ls ~/.config/opencode/agents/superpawers/  # should not exist
```

- [ ] **Step 3: Publish to npm (as bubblebuffer user)**

```bash
npm whoami  # confirm logged in
npm publish --access public
```

---

## Verification Checklist

- [ ] `node setup.js` detects global workspace when `~/.config/opencode/opencode.json` exists
- [ ] `node setup.js --local` uses current directory workspace
- [ ] `node setup.js --path <path>` validates and uses custom path
- [ ] Agents copied to `~/.config/opencode/agents/superpawers/`
- [ ] Skills symlink created and readable
- [ ] Config merge adds agents without overwriting existing
- [ ] `--yes` flag skips prompts
- [ ] Error when workspace has no skills directory
- [ ] `--uninstall` removes agents directory
- [ ] `--uninstall` removes skills symlink
- [ ] `--uninstall` auto-removes superpawers:* from config
- [ ] Works on Windows (junction symlinks)
- [ ] Published to npm as @bubblebuffer/superpawers

---

## Spec Coverage

- [x] Replace plugin with npx setup
- [x] Autodetect global (`.config/opencode`) and local (`.opencode/config.json`) workspaces
- [x] Agents in dedicated subdir (`agents/superpawers/`)
- [x] `--uninstall` reverses setup with confirmation
- [x] Auto-remove agents from config on uninstall
- [x] `.system.md` extension for agent files
- [x] Works on Windows

## Status

Ready for implementation.
