# Changelog

All notable changes to SuperPawers will be documented in this file.

## [0.2.0] - 2026-04-19

### Added
- Shared agent prompts in `skills/agents/` directory (researcher, implementer, reviewer, verifier)
- Researcher agent — read-only codebase explorer for pre-plan research and feasibility exploration
- Researcher dispatch integration in `writing-plans` and `brainstorming` skills
- 4 consolidated agent types in `src/index.ts` (replaces 5+ fragmented types)

### Changed
- Consolidated `spec-reviewer`, `code-quality-reviewer`, and `code-reviewer` into single `reviewer` agent
- `requesting-code-review` now uses shared `reviewer` agent prompt
- `subagent-driven-development` flowchart and templates updated for new agent types
- `writing-plans` paths updated to `docs/superpawers/plans/`
- `brainstorming` paths updated to `docs/superpawers/specs/`
- Brainstorming scripts rebranded from "Superpowers" to "SuperPawers"
- `writing-skills` stripped of Claude Code / Codex harness references
- `TodoWrite` → `todowrite` throughout (OpenCode's actual tool name)

### Removed
- Per-skill agent prompt files (consolidated into `skills/agents/`)
- Dangling reference to removed `executing-plans` skill in `requesting-code-review`

## [0.1.0] - 2026-04-19

### Added
- Initial fork from superpowers
- Removed `executing-plans` skill (no inline fallback)
- Added `verification-reviewer-prompt.md` for independent verification
- Added fail-fast behavior in `subagent-driven-development`
- Stripped verification from `finishing-a-development-branch` (pure git operations)
- Agent type definitions in `src/index.ts`
- Namespace changed from `superpowers:` to `superpawers:`

### Changed
- `finishing-a-development-branch` now only handles git operations (merge/PR/keep/discard)
- `subagent-driven-development` flowchart updated to show BLOCKED → human recovery path
- Verification step now runs AFTER final code reviewer, BEFORE finishing

### Fixed
- Worktree cleanup path now correctly defined for Option 1 and 4 only
- Quick Reference table contradictions resolved

## [Unreleased]

- Plugin package structure
- Dynamic skill loading
- Custom tools
- Event hooks
