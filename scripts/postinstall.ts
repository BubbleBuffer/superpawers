import fs from "fs";
import path from "path";
import os from "os";

const PKG_ROOT = path.join(__dirname, "..");
const AGENTS_SOURCE = path.join(PKG_ROOT, "agents");
const SKILLS_SOURCE = path.join(PKG_ROOT, "skills");
const OPENCODE_CONFIG = path.join(os.homedir(), ".config", "opencode");
const AGENTS_TARGET_DIR = path.join(OPENCODE_CONFIG, "agents");
const SKILLS_TARGET = path.join(OPENCODE_CONFIG, "skills", "superpawers");

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  }
}

function removeExisting(target: string): void {
  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(target);
      console.log(`Removed old symlink: ${target}`);
    } else if (stat.isDirectory()) {
      fs.rmSync(target, { recursive: true });
      console.log(`Removed old directory: ${target}`);
    } else {
      fs.unlinkSync(target);
      console.log(`Removed old file: ${target}`);
    }
  }
}

function linkAgents(): void {
  ensureDir(AGENTS_TARGET_DIR);

  const agentFiles = fs.readdirSync(AGENTS_SOURCE).filter((f) => f.endsWith(".md"));

  for (const file of agentFiles) {
    const source = path.join(AGENTS_SOURCE, file);
    const target = path.join(AGENTS_TARGET_DIR, file);
    removeExisting(target);
    fs.symlinkSync(source, target, "junction");
    console.log(`Symlinked: ${target} -> ${source}`);
  }
}

function linkSkills(): void {
  ensureDir(path.dirname(SKILLS_TARGET));
  removeExisting(SKILLS_TARGET);
  fs.symlinkSync(SKILLS_SOURCE, SKILLS_TARGET, "junction");
  console.log(`Symlinked: ${SKILLS_TARGET} -> ${SKILLS_SOURCE}`);
}

linkAgents();
linkSkills();
console.log("Postinstall complete!");