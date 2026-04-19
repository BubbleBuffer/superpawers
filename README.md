# SuperPawers

Opinionated AI coding workflow Skills and Agent for OpenCode — subagent-driven development with fail-fast and human-in-the-loop recovery. Fork of [Superpowers](https://github.com/obra/superpowers).

## Quick Start

```bash
npm install @bubblebuffer/superpawers-opencode
```

Add to your `opencode.json` plugins:

```json
{
  "plugin": ["@bubblebuffer/superpawers-opencode"]
}
```

## Example Configuration

This setup uses MiniMax M2.7 for subagent coding tasks with zai-coding-plan for orchestration:

```json
{
  "agents": {
    "superpawers-build": {
      "mode": "subagent",
      "model": "minimax-anthropic/MiniMax-M2.7",
      "description": "Executes coding tasks and modifies files",
      "permission": { "edit": "allow", "bash": "allow" }
    },
    "superpawers-research": {
      "mode": "subagent",
      "model": "minimax-anthropic/MiniMax-M2.7",
      "description": "Explores codebase and gathers context",
      "permission": { "edit": "deny", "bash": { "*": "ask", "grep *": "allow", "find *": "allow", "cat *": "allow" } }
    },
    "superpawers-review": {
      "mode": "subagent",
      "model": "minimax-anthropic/MiniMax-M2.7",
      "description": "Reviews code and identifies issues",
      "permission": { "edit": "deny", "bash": { "*": "ask", "git diff": "allow", "git log*": "allow" } }
    },
    "superpawers-plan": {
      "mode": "subagent",
      "model": "zai-coding-plan/glm-5.1",
      "description": "Breaks down complex problems",
      "permission": { "edit": "deny", "bash": "ask" }
    }
  },
  "plugin": ["@bubblebuffer/superpawers-opencode"]
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

## Installation

The npm package automatically symlinks skills to `~/.config/opencode/skills/superpawers/`.

## License

MIT
