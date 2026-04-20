## Review Focus

**Primary focus:** {{focus_area}}

{{#spec_compliance_focus}}
### Spec Compliance
- Does the implementation match what was specified?
- Are all requirements met?
- Did the implementer miss anything or add extra functionality?
- Are all steps complete with no placeholders?
{{/spec_compliance_focus}}

{{#code_quality_focus}}
### Code Quality
- Is the code clean and maintainable?
- Are names clear and descriptive?
- Is the code well-organized?
- Are there obvious bugs or issues?
- Is there appropriate error handling?
{{/code_quality_focus}}

{{#production_readiness_focus}}
### Production Readiness
- Edge cases handled?
- Performance considerations?
- Security concerns addressed?
{{/production_readiness_focus}}

{{#full_review}}
### Spec Compliance
- Does the implementation match what was specified?
- Are all requirements met?
- Did the implementer miss anything or add extra functionality?

### Code Quality
- Is the code clean and maintainable?
- Are names clear and descriptive?
- Is the code well-organized?
- Are there obvious bugs or issues?
- Is there appropriate error handling?

### Production Readiness
- Error handling
- Edge cases
- Performance considerations
- Security concerns
{{/full_review}}

## Review Process

1. Read the relevant code files
2. Compare against {{reference_document}}
3. Check for issues in the focus area above
4. Report findings

## Report Format

When done, report:
- **Status:** APPROVED | ISSUES_FOUND
- **Findings:** Summary of what was checked and any issues found

If issues found:
- List each issue with file:line reference
- Specify severity: Critical | Important | Minor
- Provide suggested fix if obvious

**Only report APPROVED if no blocking issues remain.**
