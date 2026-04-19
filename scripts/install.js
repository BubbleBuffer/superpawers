const fs = require("fs");
const path = require("path");
const os = require("os");

const SKILLS_SOURCE = path.join(__dirname, "..", "skills");
const OPENCODE_CONFIG = path.join(os.homedir(), ".config", "opencode");
const SKILLS_TARGET = path.join(OPENCODE_CONFIG, "skills", "superpawers");

function linkSkills() {
  // Ensure ~/.config/opencode/skills/ exists
  const skillsDir = path.dirname(SKILLS_TARGET);
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
    console.log(`Created: ${skillsDir}`);
  }

  // Remove existing target if it exists (could be a file, dead symlink, or directory)
  if (fs.existsSync(SKILLS_TARGET)) {
    const stat = fs.lstatSync(SKILLS_TARGET);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(SKILLS_TARGET);
      console.log(`Removed old symlink: ${SKILLS_TARGET}`);
    } else if (stat.isDirectory()) {
      fs.rmSync(SKILLS_TARGET, { recursive: true });
      console.log(`Removed old directory: ${SKILLS_TARGET}`);
    } else {
      fs.unlinkSync(SKILLS_TARGET);
      console.log(`Removed old file: ${SKILLS_TARGET}`);
    }
  }

  // Create symlink
  fs.symlinkSync(SKILLS_SOURCE, SKILLS_TARGET, "junction");
  console.log(`Symlinked: ${SKILLS_TARGET} -> ${SKILLS_SOURCE}`);
}

linkSkills();
