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

function copyFileOrDir(source: string, target: string): void {
    const stat = fs.statSync(source);
    if (stat.isDirectory()) {
        fs.cpSync(source, target, { recursive: true });
    } else {
        fs.copyFileSync(source, target);
    }
    console.log(`Copied: ${target} <- ${source}`);
}

function removeExisting(target: string): void {
    if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`Removed: ${target}`);
    }
}

function linkAgents(): void {
    ensureDir(AGENTS_TARGET_DIR);

    const agentFiles = fs.readdirSync(AGENTS_SOURCE).filter((f) => f.endsWith(".md"));

    for (const file of agentFiles) {
        const source = path.join(AGENTS_SOURCE, file);
        const target = path.join(AGENTS_TARGET_DIR, file);
        removeExisting(target);
        copyFileOrDir(source, target);
    }
}

function linkSkills(): void {
    ensureDir(path.dirname(SKILLS_TARGET));
    removeExisting(SKILLS_TARGET);
    fs.cpSync(SKILLS_SOURCE, SKILLS_TARGET, { recursive: true });
    console.log(`Copied: ${SKILLS_TARGET} <- ${SKILLS_SOURCE}`);
}

linkAgents();
linkSkills();
console.log("Postinstall complete!");