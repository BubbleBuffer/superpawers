# SuperPawers

Opinionated AI coding workflow system for OpenCode — subagent-driven development with fail-fast and human-in-the-loop recovery.

## What "Opinionated" Means

SuperPawers holds strong positions on how software development should work. These aren't suggestions — they're enforced rules:

### 1. Design Before Implementation
Every project goes through brainstorming, regardless of perceived simplicity. "This is too simple to need a design" is an anti-pattern. YAGNI ruthlessly — remove unnecessary features from all designs.

### 2. Test-Driven Development is Non-Negotiable
No production code without a failing test first. Write code before the test? Delete it and start over. The RED-GREEN-REFACTOR cycle is mandatory, not optional.

### 3. Evidence Over Claims
No completion claims without fresh verification output. "Should work", "probably fixed", "seems to pass" are prohibited. If you haven't run the verification command in this message, you cannot claim it passes.

### 4. Systematic Debugging Over Guess-and-Fix
No fixes without root cause investigation first. Random fixes waste time and create new bugs. Follow the 4-phase process: Root Cause → Pattern Analysis → Hypothesis → Implementation.

### 5. Subagent Isolation for Quality
Fresh subagent per task with isolated context. Two-stage review: spec compliance first, then code quality. Never inherit session history — construct exactly what each subagent needs.

### 6. Fail-Fast with Human Recovery
When blocked, stop immediately and present structured recovery options. Never fall back to inline execution when subagent fails. Human partner controls priority over skill rules.

### 7. Skill Invocation Protocol
Even a 1% chance a skill might apply means you should invoke it. Don't rationalize your way out of using a skill. "This is just a simple question" is a red flag.

### 8. Code Review as Verification, Not Performance
Review requires technical evaluation, not emotional agreement. "You're absolutely right!" is a red flag. Verify before implementing, push back when technically wrong.

## Quick Start

```bash
npm install superpawers
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
  "plugin": ["superpawers"]
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

## License

MIT