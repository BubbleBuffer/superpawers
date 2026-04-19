# SuperPawers Quick Setup - Design Spec

## Context

Current installation requires:
1. npm install the plugin package
2. postinstall creates symlinks to skills/agents
3. User manually adds plugin to opencode.json

This is error-prone and confusing. Users see "no skills or agents dir" errors during startup.

## Goal

Replace complex install with a simple `npx @bubblebuffer/superpawers` command that:
- Autodetects workspace locations
- Sets up agents and skills symlinks
- Optionally adds agent definitions to opencode.json
- Requires no plugin npm package

## Architecture

### No Plugin
The current plugin (`src/index.ts`) only registers 4 agents with mode/description/permissions/prompt. This is pure configuration - no runtime logic. The plugin can be eliminated entirely.

### Repository Structure
```
superpawers/
├── agents/
│   ├── superpawers-researcher.system.md
│   ├── superpawers-implementer.system.md
│   ├── superpawers-reviewer.system.md
│   └── superpawers-verifier.system.md
├── skills/
│   ├── brainstorming/
│   ├── systematic-debugging/
│   └── ... (existing skills)
├── setup.js          # npx entry point
└── package.json      # for npx resolution
```

### Setup Command Flow

```
npx @bubblebuffer/superpawers
    │
    ├─ Autodetect workspaces
    │   ├─ Global: ~/.config/opencode/opencode.json
    │   ├─ Local: ./.opencode/config.json (in current directory)
    │   └─ Custom: user input path
    │
    ├─ Show detected options to user
    │   "Detected: global, local, custom"
    │   User selects or confirms
    │
    ├─ Copy agents (*.system.md) to ~/.config/opencode/agents/superpawers/
    │   └─ Overwrite if exists (always fresh)
    │
    ├─ Symlink skills
    │   └─ ~/.config/opencode/skills/superpawers → <workspace>/skills
    │
    ├─ Prompt: "Add superpawers agents to <config>?"
    │   └─ If yes: append agent definitions to selected config
    │
    └─ Done

npx @bubblebuffer/superpawers --uninstall
    │
    ├─ Prompt: "Delete agents/superpawers/ and skills/superpawers? [y/N]"
    │
    ├─ Remove ~/.config/opencode/agents/superpawers/ (recursive)
    │
    ├─ Remove ~/.config/opencode/skills/superpawers (symlink)
    │
    ├─ Auto-remove superpawers:* agents from config (no prompt)
    │
    └─ Done
```

## Component: setup.js

### Inputs
- `--global` flag → force global workspace
- `--local` flag → force local workspace
- `--path <path>` → custom workspace path
- `--yes` flag → skip all prompts (use defaults)
- `--uninstall` flag → reverse setup (remove agents, skills, config entries)

### Autodetection Logic
1. Check `~/.config/opencode/opencode.json` exists → global available
2. Check `./.opencode/config.json` exists in current directory → local available
3. Build options list: [available workspaces] + ["custom"]

### Workspace Actions

#### Global Workspace
- Agents target: `~/.config/opencode/agents/superpawers/`
- Skills symlink: `~/.config/opencode/skills/superpawers`

#### Local Workspace
- Agents target: `~/.config/opencode/agents/superpawers/`
- Skills symlink: `~/.config/opencode/skills/superpawers`
- Config target: `./.opencode/config.json`

#### Custom Workspace
- User provides path
- Validate: path exists, has `skills/` directory
- Same target actions as above

### Agent Definitions to Add

```json
"superpawers:researcher": {
    "mode": "subagent",
    "description": "Explores codebase, gathers context, reports findings",
    "prompt": "{file:./agents/superpawers/superpawers-researcher.system.md}",
    "permission": { "edit": "deny", "bash": "allow" }
},
"superpawers:implementer": {
    "mode": "subagent",
    "description": "Implements tasks following TDD with isolated context",
    "prompt": "{file:./agents/superpawers/superpawers-implementer.system.md}",
    "permission": { "edit": "allow", "bash": "allow" }
},
"superpawers:reviewer": {
    "mode": "subagent",
    "description": "Reviews code quality, spec compliance, and production readiness",
    "prompt": "{file:./agents/superpawers/superpawers-reviewer.system.md}",
    "permission": { "edit": "deny", "bash": "deny" }
},
"superpawers:verifier": {
    "mode": "subagent",
    "description": "Runs tests, lint, and typecheck independently",
    "prompt": "{file:./agents/superpawers/superpawers-verifier.system.md}",
    "permission": { "edit": "deny", "bash": "allow" }
}
```

### Config Merge Strategy
- Read existing `opencode.json`
- Merge `agent` section (don't overwrite existing agents, only add missing `superpawers:*`)
- Write back preserving formatting/comments

## User Experience

### Happy Path (interactive)
```
$ npx @bubblebuffer/superpawers
Detected workspaces: global, local
Using workspace: ~/Documents/SuperPawers
Copying agents to ~/.config/opencode/agents/superpawers/... done
Creating skills symlink... done
Add superpawers agents to opencode.json? [Y/n] y
Agents added! Restart opencode to use.
```

### Non-Interactive
```
$ npx @bubblebuffer/superpawers --local --yes
```

### Uninstall
```
$ npx @bubblebuffer/superpawers --uninstall
Delete agents/superpawers/ and skills/superpawers? [y/N] y
Removing agents... done
Removing skills symlink... done
Removing superpawers agents from config... done
```

## File: setup.js Entry Point

```javascript
#!/usr/bin/env node
// Entry point for npx
// Handles workspace detection, file copying, symlinking, config updates
```

## Dependency Changes

### Removed
- `src/index.ts` (plugin)
- `dist/` (build output)
- `postinstall.js` (no longer needed)
- `@opencode-ai/plugin` peer dependency

### package.json (simplified)
```json
{
  "name": "@bubblebuffer/superpawers",
  "version": "0.3.0",
  "description": "Quick setup for SuperPawers skills and agents",
  "bin": {
    "superpawers": "./setup.js"
  },
  "files": ["agents/", "skills/"],
  "scripts": {
    "postinstall": "node setup.js"
  }
}
```

## Testing Checklist

- [ ] `npx @bubblebuffer/superpawers` detects global workspace
- [ ] `npx @bubblebuffer/superpawers --local` uses current directory
- [ ] `npx @bubblebuffer/superpawers --path /custom/path` validates path
- [ ] Agents copied correctly to `~/.config/opencode/agents/superpawers/`
- [ ] Skills symlink created and readable
- [ ] Config merge adds agents without overwriting existing
- [ ] `--yes` flag skips prompts
- [ ] Error when no skills directory in workspace
- [ ] Works on Windows (junction symlinks)
- [ ] `--uninstall` removes agents/superpawers/ directory
- [ ] `--uninstall` removes skills/superpawers symlink
- [ ] `--uninstall` auto-removes superpawers:* from config

## Open Questions

None. All resolved:
1. ~~Verify opencode installed?~~ No
2. ~~Offer to remove plugin?~~ No
3. ~~Uninstall flag?~~ Yes - reversed flow with auto config cleanup
