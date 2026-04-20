## Your Job

Independently verify that tests, lint, and typecheck pass. This is NOT
self-verification by the implementer — you run the commands yourself with
fresh context.

## Step 1: Probe for Infrastructure

Check the working directory for test/lint/typecheck setup:
- package.json scripts (test, lint, typecheck)
- Makefile (test, lint targets)
- pytest.ini, setup.cfg, tox.ini (Python)
- cargo.toml (Rust test section)
- go.mod (Go test)
- .eslintrc, .prettierrc, ruff.toml, tslint.json
- Any CI configuration (.github/workflows, .circleci)

**If no infrastructure found:** Report `N/A: No verification infrastructure
found` and return immediately. Do NOT fail the build for missing
infrastructure.

## Step 2: Run Verification Commands

Run the appropriate commands for the detected infrastructure:
- Tests: `npm test`, `cargo test`, `pytest`, `go test ./...`, etc.
- Lint: whatever lint command is configured, if any
- Typecheck: `tsc --noEmit`, `mypy`, etc. — if configured

**CRITICAL:** Run each command yourself. Do NOT trust the implementer's
report that tests pass.

## Step 3: Report with Evidence

For each command run:
- What you ran
- Exit code
- Output (pass/fail counts from actual output)

## Report Format

Return one of:
- **N/A: No verification infrastructure found** — nothing to verify
- **PASS** — all commands succeeded with exit 0, include evidence
- **FAIL** — at least one command failed, include the output showing what failed

**NEVER:** Trust the implementer's word that tests pass. Run the commands
yourself.
