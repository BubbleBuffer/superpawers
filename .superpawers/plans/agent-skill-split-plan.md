# Agent/Skill Split Implementation Plan

**Goal:** Split existing combined agent prompts into system prompts (agents/) and templates (skills/)

**Architecture:** Each agent has a `.system.md` file (the "you are a..." part) and a `.template.md` file (task-specific instructions with placeholders). Skills load the template and inject the system prompt.

**Problem:** Skills reference `agents/reviewer.md` but actual file is `agents/superpawers-reviewer.md`. Also, system prompt and template are combined in one file.

---

## File Structure

```
agents/
  superpawers-reviewer.system.md   # NEW - extracted system prompt
  superpawers-implementer.system.md
  superpawers-verifier.system.md
  superpawers-researcher.system.md

skills/
  requesting-code-review/
    SKILL.md
    reviewer.template.md           # NEW - extracted template
  subagent-driven-development/
    SKILL.md
    implementer.template.md        # NEW - extracted template
    verifier.template.md           # NEW - extracted template
```

**Skills with wrong references to fix:**
- `skills/requesting-code-review/SKILL.md` → references `agents/reviewer.md`
- `skills/subagent-driven-development/SKILL.md` → references `agents/implementer.md`, `agents/verifier.md`
- `skills/using-superpawers/SKILL.md` → references all four with wrong names

---

## Tasks

### Task 1: Extract reviewer system prompt

- **Create:** `agents/superpawers-reviewer.system.md`

```markdown
---
description: Reviews code quality, spec compliance, and production readiness
mode: subagent
permission:
  edit: deny
  bash: deny
---

You are a SuperPawers reviewer subagent. Your job is to review code quality, spec compliance, and production readiness.
```

---

### Task 2: Create reviewer.template.md

- **Create:** `skills/requesting-code-review/reviewer.template.md`

```markdown
## Review Focus Areas

### Spec Compliance
- Does the implementation match what was specified?
- Are all requirements met?
- Did the implementer miss anything or add extra functionality?

### Code Quality
- Is the code clean and maintainable?
- Are names clear and descriptive?
- Is the code well-organized?
- Are there obvious bugs or issues?

### Production Readiness
- Error handling
- Edge cases
- Performance considerations
- Security concerns

## Review Process

1. Read the relevant code files
2. Compare against the specification/plan
3. Check for spec compliance issues
4. Check for code quality issues
5. Report findings

## Report Format

When done, report:
- **Status:** APPROVED | ISSUES_FOUND
- **Spec Compliance:** PASS | FAIL (with details)
- **Code Quality:** PASS | FAIL (with details)
- **Production Readiness:** PASS | FAIL (with details)

If you find issues:
- List each issue clearly
- Specify whether it's critical, major, or minor
- Provide suggested fix if obvious

**Only report APPROVED if all areas pass.** If there are issues, report ISSUES_FOUND
and let the implementer fix them before re-review.
```

---

### Task 3: Update requesting-code-review SKILL.md

- **Modify:** `skills/requesting-code-review/SKILL.md`

Line 34: Change `agents/reviewer.md` to reference the template in same directory
Line 105: Same fix

---

### Task 4: Extract implementer system prompt

- **Create:** `agents/superpawers-implementer.system.md`

```markdown
---
description: Implements tasks following TDD with isolated context
mode: subagent
permission:
  edit: allow
  bash: allow
---

You are a SuperPawers implementer subagent. Use this template when implementing tasks.
```

---

### Task 5: Create implementer.template.md

- **Create:** `skills/subagent-driven-development/implementer.template.md`

Extract the section after the YAML frontmatter - the "## Before You Begin" through "## Report Format" content.

---

### Task 6: Extract verifier system prompt

- **Create:** `agents/superpawers-verifier.system.md`

```markdown
---
description: Runs tests, lint, and typecheck independently
mode: subagent
permission:
  edit: deny
  bash: allow
---

You are a SuperPawers verifier subagent. Your job is to run tests, lint, and typecheck independently to verify implementation correctness.
```

---

### Task 7: Create verifier.template.md

- **Create:** `skills/subagent-driven-development/verifier.template.md`

Extract the verification steps, commands, and report format sections.

---

### Task 8: Extract researcher system prompt

- **Create:** `agents/superpawers-researcher.system.md`

```markdown
---
description: Explores codebase, gathers context, reports findings
mode: subagent
permission:
  edit: deny
  bash: allow
---

You are a SuperPawers researcher subagent. Your job is to explore code, gather context, and report findings clearly and concisely.
```

---

### Task 9: Update subagent-driven-development SKILL.md

- **Modify:** `skills/subagent-driven-development/SKILL.md`

Fix references from `agents/implementer.md` → `agents/superpawers-implementer.system.md`
Fix references from `agents/verifier.md` → `agents/superpawers-verifier.system.md`

---

### Task 10: Update using-superpawers SKILL.md

- **Modify:** `skills/using-superpawers/SKILL.md`

Fix all four references to use correct filenames:
- `agents/researcher.md` → `agents/superpawers-researcher.system.md`
- `agents/implementer.md` → `agents/superpawers-implementer.system.md`
- `agents/reviewer.md` → `agents/superpawers-reviewer.system.md`
- `agents/verifier.md` → `agents/superpawers-verifier.system.md`

---

## Execution

Do you want me to execute this plan? I can dispatch subagents per task or do it inline.