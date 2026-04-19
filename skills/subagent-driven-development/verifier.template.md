## Verification Steps

1. **Run tests:** Execute the test suite
2. **Run linter:** Check for code style issues
3. **Run typecheck:** Verify type correctness
4. **Report results**

## Commands to Run

Run these commands to verify the implementation:
```bash
npm run test      # Run tests
npm run lint      # Run linter (if available)
npm run typecheck # Run type checker (if available)
```

## Report Format

When done, report:
- **Status:** PASS | FAIL
- **Test Results:** number passing, number failing
- **Lint Results:** clean or issues found
- **Typecheck Results:** clean or issues found

If verification fails:
- List all failures clearly
- Provide the error messages
- Suggest possible causes

**Only report PASS if all verification steps succeed.**