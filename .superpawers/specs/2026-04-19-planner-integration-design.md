# Planner Agent Integration Design

## Overview

Integrate the planner agent into the `writing-plans` skill. The writing-plans skill dispatches the planner as a subagent, which dispatches researchers and a reviewer as sub-subagents. The planner is **fire-and-forget**: research → write plan → review → report back. The main agent owns all judgment, correction, and human interaction.

## Dispatch Chain

```
main agent (using writing-plans skill)
  → dispatches planner agent (superpawers-planner)
      → planner dispatches researcher agents (superpawers-researcher) [parallel]
      → planner writes plan file
      → planner dispatches reviewer agent (superpawers-reviewer) [sub-subagent]
          → reviewer runs plan quality checklist
          → reviewer writes detailed ## Review section into plan file
          ← reviewer returns quick handoff: PASS/FAIL + one-line summary
      ← planner reports back (always, regardless of review result):
          DONE + plan path + review pass/fail + brief summary
  ← main agent reads review result from planner's report:
      PASS → present plan summary + path + execution choice
      FAIL + simple issues → main agent fixes plan directly
      FAIL + architectural/spec issues → human in the loop:
          - Present findings to user
          - Discuss / clarify (like brainstorming, but plan refinement)
          - Main agent fixes plan, or dispatches new planner with clarified scope
      Plan approved → handoff to subagent-driven-development (existing)
```

## Key Design Decisions

1. **Planner never loops.** It dispatches reviewer, gets result, reports to main agent. No retry.
2. **Reviewer writes detailed findings into plan file.** Gives planner only a quick pass/fail handoff.
3. **Main agent owns correction.** Simple fixes done directly. Complex issues escalated to user.
4. **Human loop mirrors brainstorming.** Discussion, clarification, refinement — but for the plan, not the spec.
5. **Main agent can re-dispatch planner.** If scope changes significantly after human discussion.

## Changes

### 1. `writing-plans/SKILL.md` — Refactor

**Remove:**
- "Pre-Plan Research" section (planner handles research)
- "Self-Review" section (reviewer sub-subagent handles this)

**Add:**
- Dispatch planner agent section (scope check → dispatch → handle status)
- Review result handling:
  - PASS → present plan summary + path, offer execution choice
  - FAIL + simple (typos, naming, dead refs) → fix plan directly
  - FAIL + architectural/spec → present findings to user, discuss, refine
  - Option to re-dispatch planner after scope changes
- Human-in-the-loop plan refinement pattern (like brainstorming's Q&A, but for plan correction)
- Summary presentation: path + brief summary, not full plan text

**Keep:**
- Plan document header format (referenced by planner via skill)
- Task structure
- No placeholders rules
- File structure guidance
- Bite-sized granularity
- Execution handoff

### 2. `writing-plans/planner.template.md` — New

Template for planner dispatch. Contains:
- Spec file path
- Scope summary
- Plan filename to write to
- User constraints from brainstorming
- Reference to writing-plans skill for format details

### 3. `writing-plans/planner-reviewer.template.md` — New

Template for reviewer dispatch (from planner). Instructs reviewer to:
- Read plan at given path
- Run plan quality checklist:
  - **Dead references:** Types/functions used in later tasks but never defined in earlier ones
  - **Inconsistent wording:** Same concept referenced with different names across tasks
  - **Unclear goals:** Steps that lack specificity or are ambiguous
  - **Spec coverage:** Spec requirements with no corresponding task
  - **Structural issues:** Tasks depending on outputs not produced by prior tasks
- Write detailed `## Review` section into plan file
- Return to planner: quick handoff with PASS/FAIL + one-line summary

### 4. `superpawers-planner.system.md` — Update

- Add `superpawers-reviewer: allow` to `permission.task`
- Add section about dispatching reviewer after writing plan
- No retry loop. Report review result as-is to main agent.
- Status codes stay the same (DONE / NEEDS_CONTEXT / BLOCKED)
- Planner includes review pass/fail + brief findings in its DONE report

### 5. `superpawers-reviewer.system.md` — No changes

Already works as sub-subagent. Template provides context.

### 6. No other files change

- `using-superpawers/SKILL.md` already has planner in agent table
- `brainstorming/SKILL.md` already hands off to writing-plans
- `subagent-driven-development/SKILL.md` already references writing-plans

## Review Section Format

The reviewer writes a detailed `## Review` section at the top of the plan file (after the header):

**Pass:**
```markdown
## Review

- **Status:** PASS
- **Reviewer:** superpawers-reviewer
- **Date:** 2026-04-19
- **Findings:**
  - Spec coverage: All requirements mapped to tasks
  - Placeholders: None found
  - Type consistency: All signatures consistent across tasks
  - Dead references: None
  - Structural flow: All task dependencies satisfied
```

**Fail:**
```markdown
## Review

- **Status:** FAIL
- **Reviewer:** superpawers-reviewer
- **Date:** 2026-04-19
- **Findings:**
  - Spec coverage: GAP — "error handling for X" has no task
  - Dead references: Task 5 references `validateInput()` not defined in any task
  - Type consistency: Task 3 uses `clearLayers()`, Task 7 uses `clearFullLayers()`
  - Unclear goals: Task 4 Step 2 says "add validation" without specifying what
  - Structural issues: Task 6 depends on Task 8 output (ordering problem)
```

The reviewer gives the planner a quick handoff:
- **PASS** — "Plan review passed. No issues found."
- **FAIL** — "Plan review failed. N issues found: [one-line-per-issue summary]."

The planner includes this in its report to the main agent. The main agent reads the detailed findings from the plan file if needed.

## Status Handling

### Planner status → main agent (via writing-plans skill):

- **DONE** (review PASS) → Present plan summary + path, offer execution choice
- **DONE** (review FAIL, simple) → Main agent reads review from plan, fixes directly, offers execution choice
- **DONE** (review FAIL, architectural) → Present findings to user for discussion and plan refinement
- **NEEDS_CONTEXT** → Ask user the planner's questions, re-dispatch planner with answers
- **BLOCKED** → Present blocker to user, offer recovery options (re-scope, re-dispatch, abandon)

### Reviewer → planner → main agent handoff:

- Reviewer writes detailed findings → plan file
- Reviewer gives planner: PASS/FAIL + one-line summary
- Planner gives main agent: status + plan path + review pass/fail + brief summary
- Main agent decides: fix, discuss with user, or re-dispatch
