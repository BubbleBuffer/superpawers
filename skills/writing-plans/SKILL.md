---
name: writing-plans
description: Use when an approved design or clear requirements must be turned into a multi-step implementation plan on a feature branch
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** This runs on an isolated feature branch created by `using-git-branches`. If you are not on one, stop and invoke `using-git-branches` first.

**Save plans to:** `.superpawers/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override this default)

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem or recommend the User spend some more time brainstorming. Each plan should produce working, testable software on its own.

## Planner Dispatch

Dispatch the planner agent to investigate the codebase and produce the plan:

```
Task(
  "Create implementation plan for [feature name]",
  subagent_type="superpawers-planner",
  prompt=<rendered planner.template.md with spec path, scope, constraints>
)
```

The planner will:
1. Dispatch researcher subagents to explore the codebase
2. Write the plan file following the format below
3. Dispatch a reviewer subagent to check plan quality
4. Report back with status, plan path, and review result

### Prompt Templates

Templates live in this skill's directory:
- `planner.template.md` — context for planner dispatch
- `planner-reviewer.template.md` — context for the reviewer the planner dispatches

### Handling Planner Status

**DONE (review PASS):**
Present plan summary to user and offer execution choice. Do not read
the full plan — show the path, goal, task count, and key decisions.

**DONE (review FAIL, simple issues):**
Simple issues are: typos, naming inconsistencies, dead references,
missing specificity. Fix these directly in the plan file, then present
summary and offer execution choice.

**DONE (review FAIL, architectural/spec issues):**
Architectural issues indicate overscoping or unclear specs — things
that require design judgment. Present the findings to the user:

> "The plan reviewer found some issues that need your input:
> [List issues from the review section in the plan]
>
> These seem to stem from [ambiguous spec / scope overlap / unclear requirements].
> What are your thoughts?"

Discuss with the user, then either:
- Fix the plan directly based on their answers, or
- Re-dispatch the planner with clarified scope/constraints

**NEEDS_CONTEXT:**
The planner has specific questions. Ask the user, then re-dispatch
the planner with the answers.

**BLOCKED:**
The planner couldn't proceed. Present blocker to user with options:
1. **Re-scope:** Narrow the spec and re-dispatch
2. **Provide context:** Answer the blocker and re-dispatch
3. **Abandon:** Drop this approach

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpawers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## No Placeholders

Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — the engineer may be reading tasks out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task

## Remember
- Exact file paths always
- Complete code in every step — if a step changes code, show the code
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

## Execution Handoff

After the plan is approved (review PASS or issues resolved), hand off to execution.

**"Plan complete and saved to `.superpawers/plans/<filename>.md`. Next step: `subagent-driven-development`."**

- **REQUIRED SUB-SKILL:** Use `subagent-driven-development` to execute the plan.
- Fresh subagent per task, two-stage review (spec compliance then code quality), final reviewer, then verifier.
- If the user explicitly requests hands-on execution instead, pause and confirm — this library does not provide a manual execution skill, and inline execution bypasses the review gates.
