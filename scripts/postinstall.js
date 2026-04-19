const fs = require("fs");
const path = require("path");
const os = require("os");

const PKG_ROOT = path.join(__dirname, "..");
const AGENTS_SOURCE = path.join(PKG_ROOT, "agents");
const SKILLS_SOURCE = path.join(PKG_ROOT, "skills");
const OPENCODE_CONFIG = path.join(os.homedir(), ".config", "opencode");
const AGENTS_TARGET_DIR = path.join(OPENCODE_CONFIG, "agents");
const SKILLS_TARGET = path.join(OPENCODE_CONFIG, "skills", "superpawers");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("Created: " + dir);
  }
}

function linkAgents() {
  ensureDir(AGENTS_TARGET_DIR);
  const agentFiles = fs.readdirSync(AGENTS_SOURCE).filter(function (f) {
    return f.endsWith(".md");
  });
  for (const file of agentFiles) {
    const source = path.join(AGENTS_SOURCE, file);
    const target = path.join(AGENTS_TARGET_DIR, file);
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    fs.copyFileSync(source, target);
    console.log("Copied: " + target + " <- " + source);
  }
}

function linkSkills() {
  ensureDir(path.dirname(SKILLS_TARGET));
  if (fs.existsSync(SKILLS_TARGET)) {
    fs.rmSync(SKILLS_TARGET, { recursive: true, force: true });
  }
  fs.cpSync(SKILLS_SOURCE, SKILLS_TARGET, { recursive: true });
  console.log("Copied: " + SKILLS_TARGET + " <- " + SKILLS_SOURCE);
}

linkAgents();
linkSkills();
console.log("Postinstall complete!");
