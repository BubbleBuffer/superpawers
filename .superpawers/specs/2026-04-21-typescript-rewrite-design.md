# SuperPawers CLI TypeScript Rewrite

## Problem

The `superpawers` CLI script is a 534-line CommonJS JavaScript file with all concerns mixed together: argument parsing, filesystem operations, JSONC config manipulation, interactive prompts, frontmatter parsing, and CLI orchestration. There is no type safety, no test coverage, and several redundant patterns (manual recursive directory copy instead of `fs.cpSync`, existence checks before `mkdirSync` with `recursive: true`, etc.).

## Goal

Rewrite the script as a layered TypeScript codebase with the same feature set, adding types, tests, and clean module boundaries.

## Requirements

1. **Same features**: install, uninstall, workspace detection, model selection prompts, legacy config cleanup
2. **TypeScript**: strict mode, proper interfaces for config shapes and CLI options
3. **Layered architecture**: `io/`, `logic/`, `ui/` layers under `src/`
4. **Tests**: unit tests for config parsing, model discovery, agent rendering, workspace detection, legacy cleanup
5. **Build**: compile to `dist/`, wire `package.json` bin to compiled output

## Architecture

```
src/
  main.ts                 — entry point, arg parsing, orchestration
  io/
    config.ts             — JSONC read/write/modify, model discovery
    fs.ts                 — directory operations (ensureDir, copyDir, removeDir)
  logic/
    workspace.ts          — workspace detection, path resolution
    agents.ts             — agent frontmatter rendering, model injection
    legacy.ts             — legacy plugin/agent config cleanup
  ui/
    prompts.ts            — interactive prompt wrappers (confirm, select)
    output.ts             — console logging helpers
```

**Dependency direction**: `main` → `ui` + `logic` → `io`. The `io` layer has no knowledge of CLI concerns. The `logic` layer handles business rules but delegates filesystem operations to `io`. The `ui` layer handles user interaction. `main.ts` wires them together.

## Module Details

### `main.ts`
- Parse CLI args (`--global`, `--local`, `--path`, `--yes`, `--uninstall`) into a typed `CliOptions` interface
- Dispatch to `runInstall()` or `runUninstall()` based on options
- Each runner: detect workspaces → prompt workspace choice → resolve targets → prompt model selection → execute operations → report results

### `io/config.ts`
- `readConfig(path)` → parsed JSONC with error handling
- `writeConfigChanges(path, changes)` → apply jsonc-parser modifications
- `discoverModelCandidates(configPaths)` → collect model IDs from config
- Typed interfaces: `OpenCodeConfig`, `ProviderConfig`, `AgentConfig`

### `io/fs.ts`
- `ensureDir(path)` — `fs.mkdirSync` with `recursive: true` (no redundant existence check)
- `copyDir(source, target)` — `fs.cpSync` with `recursive: true`
- `removeDir(path)` — `fs.rmSync` with `recursive: true, force: true`
- `removeMatchingFiles(dir, predicate)` — remove files matching a predicate

### `logic/workspace.ts`
- `detectWorkspaces()` → detect available global/local workspaces
- `resolveExistingConfigPath(root)` → find opencode.jsonc or opencode.json
- `getTargetPaths(options)` → resolve agents dir, skills dir, config paths for the chosen target
- `workspaceExists(root, isGlobal)` → check if a workspace is present

### `logic/agents.ts`
- `renderAgentMarkdown(content, model?)` — parse YAML frontmatter, inject/replace model line
- `installAgents(targetDir, sourceDir, selectedModels)` — render and write agent files

### `logic/legacy.ts`
- `cleanupLegacyConfig(configPath)` — remove legacy plugin entries and agent overrides from config
- Constants: `LEGACY_PLUGIN_PACKAGE`, `AGENT_IDS`, `LEGACY_AGENT_IDS`

### `ui/prompts.ts`
- `confirmPrompt(message, initial)` — wrapped `prompts` confirm with cancel handling
- `selectPrompt(message, choices, initial)` — wrapped `prompts` select with cancel handling
- `cancelPrompt()` — log and exit

### `ui/output.ts`
- `log(message)` — info output
- `warn(message)` — warning output
- `error(message)` — error output

## Specific Cleanups

| Current pattern | Replacement |
|----------------|-------------|
| `existsSync` before `mkdirSync({ recursive: true })` | Just call `mkdirSync` directly |
| Manual recursive `copyDir` closure | `fs.cpSync(src, dest, { recursive: true })` |
| Ad-hoc options object | Typed `CliOptions` interface |
| Untyped config access | `OpenCodeConfig` interface with typed fields |
| String-based frontmatter manipulation | Cleaner parsing with explicit structure |
| Top-level constants computed from `AGENT_FILES` | Colocated in relevant modules |

## Build & Package Changes

### `tsconfig.json`
- `module: "commonjs"`, `target: "ES2020"`
- `outDir: "./dist"`, `rootDir: "./src"`
- `strict: true`

### `package.json`
- `"bin": { "superpawers": "./dist/main.js" }`
- `"main": "./dist/main.js"`
- `"scripts": { "build": "tsc", "test": "vitest run", "prepublishOnly": "npm run build" }`
- `"files": ["dist/", "agents/", "skills/"]`
- Dev dependencies: `typescript`, `vitest`

## Test Plan

### `src/io/__tests__/config.test.ts`
- Read valid JSONC config
- Reject invalid JSONC with clear error
- Discover models from top-level `model` and `small_model` fields
- Discover models from `agent.*.model` fields
- Discover models from `provider.*.models.*` keys
- Apply config modifications via jsonc-parser

### `src/logic/__tests__/agents.test.ts`
- Render markdown without model (pass through)
- Render markdown with model injection (insert after `mode:` line)
- Render markdown with model replacement (replace existing `model:` line)
- Handle missing closing frontmatter delimiter gracefully
- Handle file without frontmatter

### `src/logic/__tests__/workspace.test.ts`
- Detect global workspace when config exists
- Detect local workspace when `.opencode` dir exists
- Detect both when both exist
- Detect neither when neither exists
- Resolve target paths for global mode
- Resolve target paths for local mode
- Resolve target paths for custom path mode

### `src/logic/__tests__/legacy.test.ts`
- Remove legacy plugin package from config
- Remove agent overrides matching current and legacy agent IDs
- Leave unrelated config entries untouched
- Handle config with no legacy entries (no-op)

## Out of Scope

- New features beyond current functionality
- Changes to agent markdown files or skill content
- ESM module format (staying CommonJS for Node compatibility)
- CI/CD pipeline setup
