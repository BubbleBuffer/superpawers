---
name: using-git-branches
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated branch with smart base branch detection
---

# Using Git Branches

## Overview

Git branches provide lightweight isolation for feature work within the same repository. Creating a new branch keeps changes separate from main until ready to integrate.

**Core principle:** Simple branch creation + clean baseline verification = reliable isolation.

**Announce at start:** "I'm using the using-git-branches skill to set up an isolated branch."

## Base Branch Detection

### 1. Try Common Base Branches

```bash
git merge-base HEAD main 2>/dev/null && echo "main" || echo "master"
```

### 2. Ask if Ambiguous

If the repo has multiple potential base branches, ask:
```
Which branch should be the base for this feature?
1. main
2. master
3. Other (specify)
```

## Creation Steps

### 1. Create Feature Branch

```bash
git checkout -b "$FEATURE_BRANCH"
```

Where `$FEATURE_BRANCH` follows the pattern `feature/<name>` or `fix/<name>`.

### 2. Run Project Setup

Auto-detect and run appropriate setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 3. Verify Clean Baseline

Run tests to ensure branch starts clean:

```bash
# Examples - use project-appropriate command
npm test
cargo test
pytest
go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

**If tests pass:** Report ready.

### 4. Report Status

```
Branch ready: <branch-name>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| On main/master | Create feature branch directly |
| On feature branch | Already isolated, verify tests pass |
| Tests fail during baseline | Report failures + ask |
| No package.json/Cargo.toml | Skip dependency install |

## When NOT to Use

- Already working on an isolated feature branch from a prior session
- Docs-only or scratch work the user has explicitly asked to perform on the current branch
- Inside a subagent that inherits the controller's branch context
- When the user has pinned the working branch for the session

In those cases, verify the baseline instead of creating a new branch.

## Common Mistakes

### Working on main/master

- **Problem:** Changes mix with main history
- **Fix:** Always create a feature branch first

### Skipping baseline tests

- **Problem:** Can't distinguish new bugs from pre-existing issues
- **Fix:** Report failures, get explicit permission to proceed

## Example Workflow

```
You: I'm using the using-git-branches skill to set up an isolated branch.

[Detect base branch: main]
[Create branch: git checkout -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Branch ready: feature/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

## Red Flags

**Never:**
- Start implementation on main/master without explicit user consent
- Skip baseline test verification
- Proceed with failing tests without asking

**Always:**
- Create feature branch first
- Verify clean test baseline
- Auto-detect and run project setup

## Integration

**Use after:**
- **brainstorming** — once the design is approved and you are about to commit the spec or any planning artifact

**Prerequisite for:**
- **writing-plans** — plans must be authored on the feature branch
- **subagent-driven-development** — tasks execute on the feature branch created here
- Any skill that produces committed artifacts

**Pairs with:**
- **finishing-a-development-branch** — handles the branch once work is complete
