# SuperPawers

Opinionated AI coding workflow Skills and Agent for OpenCode — subagent-driven development with fail-fast and human-in-the-loop recovery. Fork of [Superpowers](https://github.com/obra/superpowers).

## Quick Setup

```bash
npx @bubblebuffer/superpawers
```

This will:
1. Detect global (`~/.config/opencode/`) and local (`./.opencode/config.json`) workspaces
2. Copy agents to `~/.config/opencode/agents/superpawers/`
3. Create skills symlink at `~/.config/opencode/skills/superpawers`
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
| `superpawers-research` | Codebase exploration and context gathering |
| `superpawers-build` | Task implementation with TDD |
| `superpawers-review` | Spec compliance and code quality review |
| `superpawers-plan` | Breaks down complex problems into tasks |

## The Workflow

1. **brainstorming** - Activates before writing code. Refines ideas through questions, explores alternatives.

2. **using-git-branches** - Activates after design approval. Creates isolated branch.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks.

4. **subagent-driven-development** - Activates with plan. Dispatches subagent per task.

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR.

6. **verification-before-completion** - Evidence before completion claims.

7. **finishing-a-development-branch** - Presents merge/PR/keep/discard options.

## Skills Library

| Skill | Purpose |
|-------|---------|
| `brainstorming` | Explore requirements before building |
| `writing-plans` | Create implementation plans |
| `subagent-driven-development` | Execute plans via subagents |
| `verification-before-completion` | Evidence before completion claims |
| `systematic-debugging` | Bug investigation |
| `test-driven-development` | TDD discipline |
| `using-git-branches` | Branch-based isolation |
| `dispatching-parallel-agents` | Concurrent subagent workflows |

## License

MIT
