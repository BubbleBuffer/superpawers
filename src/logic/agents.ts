import * as fs from "fs";
import * as path from "path";
import { ensureDir, removeDir, removeMatchingFiles } from "../io/fs";

// --- Constants ---

export const AGENT_FILES = [
  "superpawers-researcher.system.md",
  "superpawers-implementer.system.md",
  "superpawers-reviewer.system.md",
  "superpawers-verifier.system.md",
  "superpawers-planner.system.md",
];

export const AGENT_IDS = AGENT_FILES.map((file) =>
  file.replace(".system.md", "")
);

// --- Functions ---

/**
 * Render agent markdown content with optional model injection.
 * Normalizes CRLF to LF. If a model is provided, removes any
 * existing model: line and inserts the new one after mode: line.
 * If no model is provided, strips any existing model: line.
 * Returns content unchanged if no valid frontmatter is found.
 */
export function renderAgentMarkdown(
  content: string,
  model?: string
): string {
  // Normalize CRLF to LF
  let text = content.replace(/\r\n/g, "\n");

  // Must start with opening delimiter
  if (!text.startsWith("---\n")) return text;

  // Find closing delimiter (a line that is just ---)
  const closeOffset = text.indexOf("\n---", 3);
  if (closeOffset === -1) return text;

  // Extract frontmatter (between opening ---\n and \n---)
  // Include the trailing \n of the last frontmatter line
  const frontmatter = text.slice(4, closeOffset + 1);
  const body = text.slice(closeOffset + 5); // after \n---\n

  // Remove existing model: lines
  let cleaned = frontmatter.replace(/^model:.*\n?/gm, "");
  // Clean up any double newlines left by removal
  cleaned = cleaned.replace(/\n\n+/g, "\n");

  // Inject new model if provided
  if (model) {
    const modeLineMatch = cleaned.match(/^mode:.*$/m);
    if (modeLineMatch && modeLineMatch.index !== undefined) {
      const lineEnd = cleaned.indexOf("\n", modeLineMatch.index);
      if (lineEnd !== -1) {
        cleaned =
          cleaned.slice(0, lineEnd + 1) +
          `model: ${model}\n` +
          cleaned.slice(lineEnd + 1);
      } else {
        cleaned += `model: ${model}\n`;
      }
    } else {
      // No mode: line — append before closing
      cleaned += `model: ${model}\n`;
    }
  }

  return `---\n${cleaned}---\n${body}`;
}

/**
 * Remove previously installed agent files from a target directory.
 * Removes the superpawers subdirectory and any superpawers-*.md files.
 */
function removeInstalledAgents(targetDir: string): void {
  if (!fs.existsSync(targetDir)) return;
  const subDir = path.join(targetDir, "superpawers");
  if (fs.existsSync(subDir)) {
    removeDir(subDir);
  }
  removeMatchingFiles(
    targetDir,
    (name) => name.startsWith("superpawers-") && name.endsWith(".md")
  );
}

/**
 * Install agent files from sourceDir to targetDir.
 * Each agent is rendered through renderAgentMarkdown with the
 * selected model (if any). Existing superpawers agents are removed first.
 */
export function installAgents(
  targetDir: string,
  sourceDir: string,
  selectedModels: Record<string, string | null>
): void {
  ensureDir(targetDir);
  removeInstalledAgents(targetDir);

  for (const file of AGENT_FILES) {
    const sourcePath = path.join(sourceDir, file);
    const content = fs.readFileSync(sourcePath, "utf-8");
    const agentId = file.replace(".system.md", "");
    const model = selectedModels[agentId];
    const rendered = renderAgentMarkdown(content, model ?? undefined);
    const targetPath = path.join(targetDir, `${agentId}.md`);
    fs.writeFileSync(targetPath, rendered, "utf-8");
  }
}
