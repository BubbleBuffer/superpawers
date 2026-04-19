# Parallel Investigation Agent Prompt Template

Use this template when dispatching a parallel investigation subagent.

```
@superpawers:implementer: "Investigate [problem domain]"

You are investigating failures in [specific scope: one test file, subsystem, or problem area].

## What You Need to Fix

[Failing tests or issues - be specific]

1. "[test name]" - [what it expects vs what happens]
2. "[test name]" - [what it expects vs what happens]
3. ...

## Root Cause Analysis

1. Read the failing test(s) and understand what they verify
2. Read the related production code
3. Identify the root cause - is it:
   - A bug in the production code?
   - A timing/race condition issue?
   - A test that needs adjustment because behavior changed?
   - Something else?

## Your Constraints

- Fix the root cause, not just symptoms
- Do NOT change code outside [specific scope]
- Do NOT increase arbitrary timeouts - find the real issue
- If behavior changed legitimately, adjust tests to match new behavior

## When You Find the Problem

**If it's a production bug:**
- Fix it
- Verify tests pass
- Report what was wrong and what you changed

**If it's a test issue:**
- Adjust the test to be correct
- Verify it passes with the fix
- Report what was wrong with the test

**If you're unsure:**
- Do NOT guess
- Report BLOCKED with what you tried and what you need

## Return Format

Report:
- **Status:** DONE | BLOCKED
- Root cause you identified
- What you changed (if anything)
- Test results after your fix
- Any concerns or observations