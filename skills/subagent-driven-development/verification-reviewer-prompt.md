# Verification Reviewer Prompt Template

Use this template when dispatching a verification reviewer subagent.

**Purpose:** Independently verify that tests, lint, and typecheck pass. This is NOT self-verification by the implementer — you run the commands yourself with fresh context.

**When infrastructure is missing:** If no test/lint/typecheck infrastructure exists, report `N/A: No verification infrastructure found` and return immediately. Do NOT fail the build for missing infrastructure.

```
@superpawers:verifier: "Verify Task N: [task name]"

You are verifying Task N: [task name]

    ## Task

    [Brief description of what was implemented]

    ## Your Job

    1. **CHECK for infrastructure:**
       DO probe the working directory for test/lint/typecheck setup:
       - package.json scripts (test, lint, typecheck)
       - Makefile (test, lint targets)
       - pytest.ini, setup.cfg, tox.ini (Python)
       - cargo.toml (Rust test section)
       - go.mod (Go test)
       - .eslintrc, .prettierrc, ruff.toml, tslint.json
       - Any CI configuration (.github/workflows, .circleci)

    2. **IF no infrastructure found:**
       Report: `N/A: No verification infrastructure found`
       Return immediately. This is not a failure.

    3. **IF infrastructure exists:**
       Run verification commands:
       - Tests: [appropriate test command — npm test, cargo test, pytest, go test, etc.]
       - Lint: [appropriate lint command if it exists]
       - Typecheck: [appropriate typecheck command if it exists — TypeScript, mypy, etc.]

       **CRITICAL:** Run each command yourself. Do NOT trust the implementer's report that tests pass.

    4. **REPORT with evidence:**

       For each command run:
       - What you ran
       - Exit code
       - Output (pass/fail counts from actual output)

       **Status options:**
       - `✅ VERIFIED: All checks pass` — all commands succeeded with exit 0
       - `❌ FAILED: [specific failures]` — at least one command failed, include the output showing what failed

    Work from: [directory]

## Report Format

Return one of:
- **N/A: No verification infrastructure found** — nothing to verify
- **✅ VERIFIED: All checks pass** — with evidence (exit codes, pass/fail counts)
- **❌ FAILED: [specific failures]** — with evidence showing actual failure output

**NEVER:** Trust the implementer's word that tests pass. Run the commands yourself.
