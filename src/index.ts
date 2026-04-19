import type { Plugin, PluginInput } from "@opencode-ai/plugin";

export const SuperPawers: Plugin = async (_input: PluginInput) => {
  return {
    config: async (config) => {
      config.agent = {
        ...config.agent,
        "superpawers-researcher": {
          mode: "subagent" as const,
          description: "Explores codebase, gathers context, reports findings",
          permission: { edit: "deny", bash: "allow" },
        },
        "superpawers-implementer": {
          mode: "subagent" as const,
          description: "Implements tasks following TDD with isolated context",
          permission: { edit: "allow", bash: "allow" },
        },
        "superpawers-reviewer": {
          mode: "subagent" as const,
          description: "Reviews code quality, spec compliance, and production readiness",
          permission: { edit: "deny", bash: "deny" },
        },
        "superpawers-verifier": {
          mode: "subagent" as const,
          description: "Runs tests, lint, and typecheck independently",
          permission: { edit: "deny", bash: "allow" },
        },
      };
    },
  };
};

export default SuperPawers;
