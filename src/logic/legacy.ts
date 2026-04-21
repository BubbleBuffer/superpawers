import * as fs from "fs";
import { modify, applyEdits } from "jsonc-parser";
import { readConfig } from "../io/config";
import { AGENT_IDS } from "./agents";
import type { PluginEntry } from "../io/config";

// --- Constants ---

export const LEGACY_PLUGIN_PACKAGE = "@bubblebuffer/superpawers-opencode";

export const LEGACY_AGENT_IDS = AGENT_IDS.map((id) =>
  id.replace("superpawers-", "superpawers:")
);

// All agent IDs to remove (both current and legacy formats)
const ALL_AGENT_IDS_TO_REMOVE = [...AGENT_IDS, ...LEGACY_AGENT_IDS];

// --- Functions ---

/**
 * Remove legacy plugin entries and agent overrides from an opencode config file.
 * Returns true if any changes were made, false if the config was already clean.
 */
export function cleanupLegacyConfig(configPath: string): boolean {
  const { config, text } = readConfig(configPath);
  const formattingOptions = {
    formattingOptions: { tabSize: 2, insertSpaces: true, eol: "\n" },
  };

  let workingText = text;
  let changed = false;

  // --- Plugin cleanup ---
  if (Array.isArray(config.plugin)) {
    const newPlugins = config.plugin.filter((entry: PluginEntry) => {
      if (typeof entry === "string") return entry !== LEGACY_PLUGIN_PACKAGE;
      if (Array.isArray(entry)) return entry[0] !== LEGACY_PLUGIN_PACKAGE;
      return true;
    });

    if (newPlugins.length === 0) {
      const edits = modify(workingText, ["plugin"], undefined, formattingOptions);
      workingText = applyEdits(workingText, edits);
      changed = true;
    } else if (newPlugins.length !== config.plugin.length) {
      const edits = modify(workingText, ["plugin"], newPlugins, formattingOptions);
      workingText = applyEdits(workingText, edits);
      changed = true;
    }
  }

  // --- Agent overrides cleanup ---
  if (config.agent && typeof config.agent === "object") {
    const agentKeysToRemove = ALL_AGENT_IDS_TO_REMOVE.filter(
      (id) => id in config.agent!
    );

    if (agentKeysToRemove.length > 0) {
      const remainingAgentKeys = Object.keys(config.agent).filter(
        (key) => !agentKeysToRemove.includes(key)
      );

      if (remainingAgentKeys.length === 0) {
        const edits = modify(workingText, ["agent"], undefined, formattingOptions);
        workingText = applyEdits(workingText, edits);
        changed = true;
      } else {
        // Remove individual keys one at a time to avoid overlapping edits.
        // jsonc-parser modify() returns edits with offsets relative to the
        // original text, so batching independent removes causes collisions.
        for (const agentId of agentKeysToRemove) {
          const edits = modify(workingText, ["agent", agentId], undefined, formattingOptions);
          workingText = applyEdits(workingText, edits);
        }
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(configPath, workingText, "utf-8");
  }
  return changed;
}