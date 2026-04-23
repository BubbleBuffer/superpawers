<!-- Used by the main agent to dispatch a reviewer for plan quality checks.
     This is a programmatic checklist review (dead references, placeholders, spec coverage).
     For human-facing document review with calibration guidance, see plan-document-reviewer-prompt.md. -->

## Context

You are reviewing an implementation plan for quality and consistency.

**Plan file:** {{plan_path}}
**Spec file:** {{spec_path}}

## Your Job

1. Read the plan file at `{{plan_path}}`
2. Read the spec file at `{{spec_path}}` (for coverage check)
3. Run the plan quality checklist below
4. Write a `## Review` section at the top of the plan file (after the header)
5. Return a quick handoff summary

## Plan Quality Checklist

Check the plan for these issues:

- **Dead references:** Types, functions, or methods used in later tasks
  but never defined in any earlier task
- **Inconsistent wording:** Same concept referenced with different names
  across tasks (e.g., `clearLayers()` in Task 3 vs `clearFullLayers()` in Task 7)
- **Unclear goals:** Steps that lack specificity — "add validation" without
  specifying what, "handle errors" without saying which errors
- **Spec coverage:** Requirements in the spec with no corresponding task
- **Structural issues:** Tasks that depend on outputs not produced by
  prior tasks, or tasks ordered incorrectly
- **Placeholders:** Any TBD, TODO, "implement later", "fill in details",
  or steps that describe what to do without showing how

## Review Section Format

Write this at the top of the plan file, after the plan header:

**On pass:**
```markdown
## Review

- **Status:** PASS
- **Reviewer:** superpawers-reviewer
- **Date:** [today's date]
- **Findings:**
  - Spec coverage: All requirements mapped to tasks
  - Placeholders: None found
  - Type consistency: All signatures consistent across tasks
  - Dead references: None
  - Structural flow: All task dependencies satisfied
  - Goal clarity: All steps are specific and actionable
```

**On fail:**
```markdown
## Review

- **Status:** FAIL
- **Reviewer:** superpawers-reviewer
- **Date:** [today's date]
- **Findings:**
  - [Category]: [specific issue with task/step reference]
  - [Category]: [specific issue with task/step reference]
  - ...
```

## Handoff Report

Return a brief summary:

**PASS:** "Plan review passed. No issues found."

**FAIL:** "Plan review failed. [N] issues found: [one-line-per-issue summary]"

The detailed findings are in the plan file — only this brief summary
is needed for the plan author to act on.
