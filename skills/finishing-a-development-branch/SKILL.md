---
name: finishing-a-development-branch
description: Use when implementation is complete and you need to handle git operations - merge, PR, keep, or discard
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Determine Base Branch

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or ask: "This branch split from main - is that correct?"

### Present Options

Present exactly these 4 options, each with one line of guidance:

```
Implementation complete and verified. What would you like to do?

1. Merge back to <base-branch> locally — solo or local workflows; requires fresh verification on the base branch after merge
2. Push and create a Pull Request — default for shared repos or when review/CI is required
3. Keep the branch as-is — pause work; resume later without merging or discarding
4. Discard this work — only if the user has explicitly abandoned the branch

Which option?
```

One line per option is allowed. Do not add longer explanations or recommendations — the user decides.

### Execute Choice

#### Option 1: Merge Locally

```bash
# Switch to base branch
git checkout <base-branch>

# Pull latest
git pull

# Merge feature branch
git merge <feature-branch>

git branch -d <feature-branch>
```

#### Option 2: Push and Create PR

```bash
# Push branch
git push -u origin <feature-branch>

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

#### Option 3: Keep As-Is

Report: "Keeping branch <name>."

#### Option 4: Discard

**Confirm first:**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>

Type 'discard' to confirm.
```

Wait for exact confirmation.

If confirmed:
```bash
git checkout <base-branch>
git branch -D <feature-branch>
```

## Quick Reference

| Option | Merge | Push | Keep Branch | Cleanup Branch |
|--------|-------|------|-------------|----------------|
| 1. Merge locally | ✓ | - | - | ✓ |
| 2. Create PR | - | ✓ | ✓ | - |
| 3. Keep as-is | - | - | ✓ | - |
| 4. Discard | - | - | - | ✓ (force) |

## Common Mistakes

**Open-ended questions**
- **Problem:** "What should I do next?" → ambiguous
- **Fix:** Present exactly 4 structured options

**No confirmation for discard**
- **Problem:** Accidentally delete work
- **Fix:** Require typed "discard" confirmation

## Red Flags

**Never:**
- Merge without verifying tests on result
- Delete work without confirmation
- Force-push without explicit request

**Always:**
- Present exactly 4 options
- Get typed confirmation for Option 4

## Integration

**Use after:**
- `subagent-driven-development` — all tasks complete, final reviewer and verifier have passed.
- `verification-before-completion` — completion claims must be backed by fresh verification evidence before this skill runs.

**Pairs with:**
- `using-git-branches` — created the branch this skill finishes.
