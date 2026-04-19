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