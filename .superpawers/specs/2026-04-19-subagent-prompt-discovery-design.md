# Subagent Prompt Auto-Discovery Design

## Problem

1. **Model inheritance**: The plugin registers `superpawers:*` agent types without models, causing subagents to inherit the caller's model regardless of task complexity.

2. **Prompt not auto-injected**: Without `prompt` config pointing to a file, OpenCode cannot auto-inject the agent's system prompt. The model outputs the prompt content in its response, wasting tokens.

3. **User must manually configure agents**: Users must manually create agent definitions matching the plugin's expected names.

## Solution

Ship agent prompt files with the npm package and use a postinstall hook to symlink them into OpenCode's auto-discovery directory.

### Directory Structure

```
SuperPawers/
├── agents/
│   ├── superpawers-researcher.md    # Agent prompt
│   ├── superpawers-implementer.md
│   ├── superpawers-reviewer.md
│   └── superpawers-verifier.md
├── src/
│   └── index.ts                     # Plugin entry
├── scripts/
│   └── postinstall.ts               # Symlink creation
└── package.json
```

### Naming Convention

Use `-` separator instead of `:` to avoid filesystem and config ambiguity:
- Files become agents: `superpawers-researcher`, `superpawers-implementer`, etc.
- Users reference via `@superpawers-researcher` in prompts

### Postinstall Flow

1. User runs `npm install superpawers`
2. `postinstall` script executes
3. Creates symlinks in `~/.config/opencode/agents/`:

```bash
~/.config/opencode/agents/
├── superpawers-researcher.md   → {pkg}/agents/superpawers-researcher.md
├── superpawers-implementer.md → {pkg}/agents/superpawers-implementer.md
├── superpawers-reviewer.md      → {pkg}/agents/superpawers-reviewer.md
├── superpawers-verifier.md     → {pkg}/agents/superpawers-verifier.md
└── (user's own agents - untouched)

~/.config/opencode/skills/superpawers/ → {pkg}/skills/
# (entire skills directory symlinked, preserving existing user skills)
```

### OpenCode Auto-Discovery

OpenCode automatically discovers agents from:
- `~/.config/opencode/agents/` (global)
- `.opencode/agents/` (project-level)

The filename (minus `.md`) becomes the agent name. No plugin registration needed for prompts to load.

### Plugin Responsibilities

The plugin (`src/index.ts`) remains minimal:

1. **Optional**: Register additional agent metadata (permissions override, descriptions)
2. **Optional**: Validate that discovered agents have corresponding prompt files

The postinstall hook is the critical piece that enables auto-discovery.

### Agent Prompt File Format

```markdown
---
description: Explores codebase, gathers context, reports findings
mode: subagent
permission:
  edit: deny
  bash: allow
---

You are a SuperPawers researcher subagent...

[Full system prompt content]
```

Frontmatter provides OpenCode metadata; content provides the agent's instructions.

## What This Solves

| Problem | Solution |
|---------|----------|
| Model inheritance | Users configure models in their `opencode.json` for each discovered agent |
| Prompt auto-injection | OpenCode discovers prompt files, injects content automatically |
| Manual agent setup | Postinstall symlinks eliminate user configuration |

## Out of Scope

- **Model routing**: Users configure which model each agent uses in their `opencode.json`
- **Dynamic model selection**: Plugin does not select models at runtime (KISS)

## Implementation Steps

1. Create `agents/` directory with prompt files
2. Create `scripts/postinstall.ts` to symlink both agents and skills
3. Update `package.json` with `postinstall` script
4. Optionally update `src/index.ts` to add metadata
5. Document agent names and how to configure models in `README.md`

## Postinstall Symlink Details

**Agents** (individual files):
```bash
~/.config/opencode/agents/superpawers-{agent}.md → {pkg}/agents/superpawers-{agent}.md
```

**Skills** (entire directory):
```bash
~/.config/opencode/skills/superpawers/ → {pkg}/skills/
```

This allows:
- Skills to be auto-discovered by OpenCode
- Users can invoke skills normally via the skill tool
- Existing user skills in `~/.config/opencode/skills/` are preserved (symlink only overwrites if target exists)

## Example User Configuration

After install, user adds to `opencode.json`:

```json
{
  "agent": {
    "superpawers-researcher": {
      "model": "glm-4",
      "description": "Lightweight codebase exploration"
    },
    "superpawers-implementer": {
      "model": "glm-5.1",
      "description": "Full implementation with code changes"
    }
  }
}
```

Without explicit model config, subagents inherit the caller's model (OpenCode default behavior).
