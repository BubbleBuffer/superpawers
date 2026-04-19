const fs = require("fs");
const path = require("path");
const os = require("os");

const PKG_ROOT = path.join(__dirname, "..");
const AGENTS_SOURCE = path.join(PKG_ROOT, "agents");
const SKILLS_SOURCE = path.join(PKG_ROOT, "skills");
const OPENCODE_CONFIG = path.join(os.homedir(), ".config", "opencode");
const AGENTS_TARGET_DIR = path.join(OPENCODE_CONFIG, "agents");
const SKILLS_TARGET = path.join(OPENCODE_CONFIG, "skills", "superpawers");

console.log("[DEBUG] PKG_ROOT:", PKG_ROOT);
console.log("[DEBUG] AGENTS_SOURCE:", AGENTS_SOURCE, "exists:", fs.existsSync(AGENTS_SOURCE));
console.log("[DEBUG] SKILLS_SOURCE:", SKILLS_SOURCE, "exists:", fs.existsSync(SKILLS_SOURCE));
console.log("[DEBUG] OPENCODE_CONFIG:", OPENCODE_CONFIG, "exists:", fs.existsSync(OPENCODE_CONFIG));
console.log("[DEBUG] AGENTS_TARGET_DIR:", AGENTS_TARGET_DIR);
console.log("[DEBUG] SKILLS_TARGET:", SKILLS_TARGET);

function ensureDir(dir) {
  console.log("[DEBUG] ensureDir:", dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("Created: " + dir);
  } else {
    console.log("[DEBUG] Dir already exists:", dir);
  }
}

function linkAgents() {
  console.log("[DEBUG] linkAgents() starting...");
  ensureDir(AGENTS_TARGET_DIR);
  const agentFiles = fs.readdirSync(AGENTS_SOURCE).filter(function (f) {
    return f.endsWith(".md");
  });
  console.log("[DEBUG] Found agent files:", agentFiles);
  for (const file of agentFiles) {
    const source = path.join(AGENTS_SOURCE, file);
    const target = path.join(AGENTS_TARGET_DIR, file);
    console.log("[DEBUG] Copying agent:", source, "->", target);
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    fs.copyFileSync(source, target);
    console.log("Copied: " + target + " <- " + source);
  }
}

function linkSkills() {
  console.log("[DEBUG] linkSkills() starting...");
  console.log("[DEBUG] SKILLS_TARGET parent dir:", path.dirname(SKILLS_TARGET));
  ensureDir(path.dirname(SKILLS_TARGET));
  console.log("[DEBUG] Checking if SKILLS_TARGET exists:", SKILLS_TARGET, fs.existsSync(SKILLS_TARGET));
  if (fs.existsSync(SKILLS_TARGET)) {
    const stat = fs.lstatSync(SKILLS_TARGET);
    console.log("[DEBUG] SKILLS_TARGET stat:", { isSymbolicLink: stat.isSymbolicLink(), isDirectory: stat.isDirectory() });
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(SKILLS_TARGET);
      console.log("[DEBUG] Unlinked existing symlink");
    } else if (stat.isDirectory()) {
      fs.rmSync(SKILLS_TARGET, { recursive: true });
      console.log("[DEBUG] Removed existing directory");
    } else {
      fs.unlinkSync(SKILLS_TARGET);
      console.log("[DEBUG] Unlinked existing file");
    }
  }
  fs.symlinkSync(SKILLS_SOURCE, SKILLS_TARGET, "junction");
  console.log("Symlinked: " + SKILLS_TARGET + " -> " + SKILLS_SOURCE);
}

linkAgents();
linkSkills();
console.log("Postinstall complete!");
