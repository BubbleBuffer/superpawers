## Context

You are creating an implementation plan for the following spec:

**Spec file:** {{spec_path}}
**Spec summary:** {{scope_summary}}
**Plan filename:** {{plan_filename}}

{{#user_constraints}}
## User Constraints

{{user_constraints}}
{{/user_constraints}}

## Your Job

1. Load the **superpawers:writing-plans** skill for plan format and structure
2. Dispatch researcher subagents to explore the codebase as needed
3. Write the plan to the specified path following the skill's format
4. Dispatch a reviewer subagent to check plan quality
5. Report back with results

## Key Reminders

- Use exact file paths in every task
- Include complete code in every step
- Include exact commands with expected output
- Follow DRY, YAGNI, TDD, frequent commits
- No placeholders (TBD, TODO, "implement later", etc.)
