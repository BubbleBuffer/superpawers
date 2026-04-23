# SuperPawers

Opinionated AI coding workflow skills and subagents for OpenCode. SuperPawers installs markdown-discovered agents plus a namespaced skill library for subagent-driven development with fail-fast and human-in-the-loop recovery. Fork of [Superpowers](https://github.com/obra/superpowers).
This removes some of Superpowers' "generalist"-focused implementations and narrows the context to a strict, human-in-the-loop, feature-by-feature implementation strategy. Worktrees have been replaced with branches, since branches are easier for agents to track and conceptualize. For planning, a new dedicated "planning" subagent has been added; you can configure it to a larger model to allow a small-to-medium model to orchestrate. I'm still experimenting with this approach, and the prompt modifications haven't been fully tested yet. This project exists purely to set up a skill tailored to my general workflow.

## Quick Setup

```bash
npx @bubblebuffer/superpawers
```

If you are working from a local checkout of this repository, use the local CLI script instead of `npx`:

```bash
npm run cli:local -- --yes --path /path/to/project
```

Running `npx @bubblebuffer/superpawers` from inside this repository does not exercise the published npm package path and is not the supported local-development flow.

This will:
1. Detect a global OpenCode workspace in `~/.config/opencode/` or a project workspace in the current repository
2. Install markdown agents into `~/.config/opencode/agents/` or `./.opencode/agents/`
3. Install skills into `~/.config/opencode/skills/superpawers/` or `./.opencode/skills/superpawers/`
4. Read available model candidates from your OpenCode config and let you choose a model per agent when more than one is available

Project config is read from `opencode.json` or `opencode.jsonc` in the project root. Agent files are installed into `.opencode/agents/` using OpenCode's markdown agent discovery.

### Options

- `--global` - Use global workspace
- `--local` - Use local workspace (current directory)
- `--path <path>` - Use custom workspace path
- `--yes` - Skip prompts and use safe defaults (leave models unset)
- `--uninstall` - Remove installed files and legacy config entries

## Release Verification

Before publishing a release, run:

```bash
npm test
npm run smoke:package
npm pack --dry-run
```

## Model Selection

SuperPawers reads model candidates from the selected OpenCode config using these sources:

- `provider.*.models`
- top-level `model`
- top-level `small_model`
- any existing `agent.*.model` values

Install behavior:

- If more than one model is available, the installer prompts for a model per agent with a `Leave unset` option.
- If exactly one model is available, the installer asks whether to apply it.
- If no models are found, the installer warns and asks whether to install with no `model:` field.

Leaving `model` unset is valid: OpenCode will let subagents inherit the caller's model.

## Example Configuration

```md
---
description: Implements tasks following TDD with isolated context
mode: subagent
model: openai/gpt-5.1-codex
permission:
    edit: allow
    bash: allow
---

You are a SuperPawers implementer subagent.
```

## Agent Names

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
| `root-cause-tracing` | Trace bugs backward through call stack to find the original trigger |
| `defense-in-depth` | Add validation at every layer after fixing a bug |
| `condition-based-waiting` | Replace arbitrary timeouts with condition polling for flaky tests |
| `requesting-code-review` | Ad-hoc or milestone review outside the automated two-stage review |
| `receiving-code-review` | Handling incoming human or external review feedback |
| `dispatching-parallel-agents` | Parallel research or investigation across independent domains |
| `using-superpawers` | Router for picking the right entry skill for a new request |
| `writing-skills` | Authoring standard for adding or editing skills |

## License

MIT
