import * as fs from "fs";
import {
  parse,
  printParseErrorCode,
  applyEdits,
} from "jsonc-parser";
import type { Edit, ParseError } from "jsonc-parser";

// --- Types ---

export interface ProviderConfig {
  models?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AgentConfig {
  model?: string;
  [key: string]: unknown;
}

export type PluginEntry = string | [string, ...unknown[]];

export interface OpenCodeConfig {
  model?: string;
  small_model?: string;
  provider?: Record<string, ProviderConfig>;
  agent?: Record<string, AgentConfig>;
  plugin?: PluginEntry[];
  [key: string]: unknown;
}

// --- Functions ---

/**
 * Read and parse a JSONC config file. Returns both the parsed config
 * and the raw text (needed for applying edits later).
 */
export function readConfig(configPath: string): {
  config: OpenCodeConfig;
  text: string;
} {
  const text = fs.readFileSync(configPath, "utf-8");
  const errors: ParseError[] = [];
  const config = parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false,
  }) as OpenCodeConfig | null;

  if (errors.length > 0 || config === null) {
    const errorMessages = errors
      .map((e) => printParseErrorCode(e.error))
      .join(", ");
    throw new Error(`Failed to parse ${configPath}: ${errorMessages}`);
  }

  return { config, text };
}

/**
 * Apply JSONC text edits and write back to file.
 * Returns true if the file was actually changed.
 */
export function writeConfigChanges(
  configPath: string,
  originalText: string,
  edits: Edit[]
): boolean {
  if (edits.length === 0) return false;
  const modifiedText = applyEdits(originalText, edits);
  if (modifiedText === originalText) return false;
  fs.writeFileSync(configPath, modifiedText, "utf-8");
  return true;
}

/**
 * Extract all model identifiers from a parsed config object.
 * Checks top-level model/small_model, agent.*.model, and
 * provider.*.models.* keys.
 */
export function extractModels(config: OpenCodeConfig): string[] {
  const models = new Set<string>();

  if (config.model) models.add(config.model);
  if (config.small_model) models.add(config.small_model);

  if (config.agent) {
    for (const agentConfig of Object.values(config.agent)) {
      if (agentConfig?.model) models.add(agentConfig.model);
    }
  }

  if (config.provider) {
    for (const providerConfig of Object.values(config.provider)) {
      if (providerConfig?.models) {
        for (const modelId of Object.keys(providerConfig.models)) {
          models.add(modelId);
        }
      }
    }
  }

  return [...models];
}

/**
 * Read multiple config files and collect all unique model identifiers.
 * Skips configs that cannot be read or parsed.
 */
export function discoverModelCandidates(configPaths: string[]): string[] {
  const allModels = new Set<string>();
  for (const configPath of configPaths) {
    try {
      const { config } = readConfig(configPath);
      for (const model of extractModels(config)) {
        allModels.add(model);
      }
    } catch {
      // Skip unreadable or invalid configs
    }
  }
  return [...allModels];
}
