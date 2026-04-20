# SuperPawers

Opinionated AI coding workflow Skills and Agent for OpenCode — subagent-driven development with fail-fast and human-in-the-loop recovery. Fork of [Superpowers](https://github.com/obra/superpowers).

## Quick Setup

```bash
npx @bubblebuffer/superpawers
```

This will:
1. Detect global (`~/.config/opencode/`) and local (`./.opencode/config.json`) workspaces
2. Copy agents to `~/.config/opencode/agents/superpawers/`
3. Copy skills to `~/.config/opencode/skills/superpawers/`
4. Prompt to add agent definitions to your opencode.json

### Options

- `--global` - Use global workspace
- `--local` - Use local workspace (current directory)
- `--path <path>` - Use custom workspace path
- `--yes` - Skip prompts (use defaults)
- `--uninstall` - Remove installed files and config entries

## Example Configuration

This setup uses MiniMax M2.7 for subagent coding tasks with zai-coding-plan for orchestration:

```json
{
    "$schema": "https://opencode.ai/config.json",
    "agent": {
        "superpawers:researcher": {
            "mode": "subagent",
            "model": "minimax-anthropic/MiniMax-M2.7"
        },
        "superpawers:implementer": {
            "mode": "subagent",
            "model": "zai-coding-plan/glm-5.1"
        },
        "superpawers:reviewer": {
            "mode": "subagent",
            "model": "minimax-anthropic/MiniMax-M2.7"
        },
        "superpawers:verifier": {
            "mode": "subagent",
            "model": "minimax-anthropic/MiniMax-M2.7"
        }
    },
    "plugin": [
        "@bubblebuffer/superpawers-opencode"
    ],
}
```

## Agent Types

SuperPawers uses `-` separator (not `:`) for agent names:

| Agent | Purpose |
|-------|---------|
| `superpawers-researcher` | Codebase exploration and context gathering |
| `superpawers-implementer` | Task implementation with TDD |
| `superpawers-reviewer` | Spec compliance and code quality review |
| `superpawers-verifier` | Independent test/lint/typecheck verification |
| `superpawers-planner` | Breaks down complex problems into tasks |

## The Workflow

The canonical order for any new feature or change:

| # | Skill | Trigger | Input | Output | Next skill |
|---|-------|---------|-------|--------|------------|
| 1 | `brainstorming` | New feature, behavior change, or unclear request | User intent | Approved design (discussed, not yet committed) | `using-git-branches` |
| 2 | `using-git-branches` | Design approved, about to produce tracked artifacts | Approved design | Isolated feature branch, clean baseline | `writing-plans` |
| 3 | `writing-plans` | On a feature branch with an approved design | Design doc | Bite-sized implementation plan | `subagent-driven-development` |
| 4 | `subagent-driven-development` | Plan approved, ready to execute | Plan file | Implemented, reviewed, verified work | `finishing-a-development-branch` |
| 5 | `finishing-a-development-branch` | All tasks complete and verified | Feature branch with passing work | Merge, PR, kept branch, or discarded branch | — |

Supporting skills activate inside this flow:

| Skill | Role |
|-------|------|
| `test-driven-development` | Discipline enforced by implementer subagents during step 4 |
| `verification-before-completion` | Gate applied before any completion claim, commit, or handoff |
| `systematic-debugging` | Entry point when a bug, failure, or regression interrupts the flow |
| `requesting-code-review` | Ad-hoc or milestone review outside the automated two-stage review |
| `receiving-code-review` | Handling incoming human or external review feedback |
| `dispatching-parallel-agents` | Parallel research or investigation across independent domains |
| `using-superpawers` | Router for picking the right entry skill for a new request |
| `writing-skills` | Authoring standard for adding or editing skills |

## License

MIT
