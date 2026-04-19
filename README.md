# SuperPawers

Opinionated AI coding workflow Skills and Agent for OpenCode — subagent-driven development with fail-fast and human-in-the-loop recovery. Fork of [Superpowers](https://github.com/obra/superpowers).

## Quick Start

```bash
npm install @bubblebuffer/superpawers-opencode
```

Then configure models per agent in your `~/.config/opencode/opencode.json`:

```json
{
  "agent": {
    "superpawers-researcher": { "model": "minimax-anthropic/MiniMax-M2.7" },
    "superpawers-implementer": { "model": "zai-coding-plan/glm-5.1" },
    "superpawers-reviewer": { "model": "minimax-anthropic/MiniMax-M2.7" },
    "superpawers-verifier": { "model": "minimax-anthropic/MiniMax-M2.7" }
  },
  "plugin": ["@bubblebuffer/superpawers-opencode"]
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

## The Basic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation.

2. **using-git-branches** - Activates after design approval. Creates isolated branch, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each) with exact file paths and verification steps.

4. **subagent-driven-development** - Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality).

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR cycle.

6. **verification-before-completion** - Evidence before completion claims. Run verification, read output, THEN claim result.

7. **finishing-a-development-branch** - Activates when tasks complete. Presents merge/PR/keep/discard options.

## Skills Library

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

## Installation

The npm package automatically:
- Symlinks agent prompts to `~/.config/opencode/agents/` for OpenCode auto-discovery
- Symlinks skills to `~/.config/opencode/skills/superpawers/`

See [INSTALL.md](INSTALL.md) for detailed setup instructions.

## Model Configuration

Without explicit model config, subagents inherit the caller's model. Configure models in `opencode.json` to optimize cost:

```json
{
  "agent": {
    "superpawers-researcher": {
      "model": "minimax-anthropic/MiniMax-M2.7",
      "description": "Lightweight exploration"
    },
    "superpawers-implementer": {
      "model": "zai-coding-plan/glm-5.1",
      "description": "Full implementation"
    }
  }
}
```

## Differences from Superpowers

SuperPawers is an OpenCode-focused fork with these key changes:

| Feature | Superpowers | SuperPawers |
|---------|-------------|-------------|
| **Git isolation** | Worktrees (filesystem isolation) | Branches (lightweight) |
| **Execution** | Subagent-driven OR inline execution | Subagent-driven only |
| **Verification** | Blocking gate before merge | Distributed throughout workflow |
| **Platform** | Multi-platform (Claude, Codex, Cursor, Copilot, Gemini) | OpenCode only |
| **Skills** | `superpowers:skill-name` namespace | `superpawers:skill-name` namespace |

**Removed:**
- `executing-plans` skill (inline execution)
- `using-git-worktrees` skill (worktree awareness)
- Multi-platform tool references and adaptations

**Added:**
- OpenCode-specific agent types (`superpawers-researcher`, `superpawers-implementer`, `superpawers-reviewer`, `superpawers-verifier`)
- `using-git-branches` skill (branch-based isolation)
- Researcher subagent dispatch in brainstorming

## License

MIT