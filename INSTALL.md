# Installing SuperPawers for OpenCode

SuperPawers is an opinionated fork of [Superpowers](https://github.com/obra/superpowers) for OpenCode only.

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed
- Git installed

## Installation

Add `@bubblebuffer/superpawers-opencode` to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["@bubblebuffer/superpawers-opencode"]
}
```

Restart OpenCode. The plugin registers skills and agents automatically.

Verify by asking: "What superpowers do I have?"

## Usage

### Finding Skills

Use OpenCode's native `skill` tool to list all available skills:

```
use skill tool to list skills
```

### Loading a Skill

```
use skill tool to load superpawers/brainstorming
```

### Personal Skills

Create your own skills in `~/.config/opencode/skills/`:

```bash
mkdir -p ~/.config/opencode/skills/my-skill
```

Create `~/.config/opencode/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Use when [condition] - [what it does]
---

# My Skill

[Your skill content here]
```

**Skill Priority:** Project skills > Personal skills > Superpawers skills

## Skills

| Skill | Purpose |
|-------|---------|
| `brainstorming` | Explore requirements before building |
| `writing-plans` | Create implementation plans |
| `subagent-driven-development` | Execute plans via isolated subagents |
| `finishing-a-development-branch` | Git completion (merge/PR/keep/discard) |
| `verification-before-completion` | Evidence before completion claims |
| `systematic-debugging` | Bug investigation |
| `test-driven-development` | TDD discipline |
| `using-git-branches` | Isolated branches |
| `requesting-code-review` | Pre-review checklist |
| `receiving-code-review` | Responding to feedback |
| `dispatching-parallel-agents` | Concurrent subagent workflows |
| `writing-skills` | Create new skills |

## Agent Types

Plugin registers these subagent types:

| Agent | Purpose |
|-------|---------|
| `superpawers-researcher` | Codebase exploration and context gathering |
| `superpawers-implementer` | Task implementation with TDD |
| `superpawers-reviewer` | Spec compliance and code quality review |
| `superpawers-verifier` | Independent test/lint/typecheck verification |

## Tool Mapping

Skills written for Claude Code are automatically adapted for OpenCode:

- `TodoWrite` → `todowrite`
- `Task` with subagents → OpenCode's `@mention` system
- `Skill` tool → OpenCode's native `skill` tool
- File operations → Native OpenCode tools

## Updating

Superpawers updates automatically when OpenCode restarts.

## Getting Help

- Report issues: https://github.com/BubbleBuffer/superpawers/issues