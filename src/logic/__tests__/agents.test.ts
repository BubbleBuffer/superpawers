import { describe, it, expect } from "vitest";
import { renderAgentMarkdown } from "../agents";

describe("logic/agents", () => {
  describe("renderAgentMarkdown", () => {
    it("renders markdown without model (pass through)", () => {
      const input = "---\ndescription: Test\nmode: subagent\n---\nBody text";
      const result = renderAgentMarkdown(input);
      expect(result).toBe(input);
    });

    it("renders markdown with model injection (insert after mode: line)", () => {
      const input = "---\ndescription: Test\nmode: subagent\n---\nBody text";
      const result = renderAgentMarkdown(input, "gpt-4");
      expect(result).toContain("model: gpt-4");
      expect(result).toMatch(/mode: subagent\nmodel: gpt-4/);
    });

    it("renders markdown with model replacement (replace existing model: line)", () => {
      const input =
        "---\ndescription: Test\nmode: subagent\nmodel: old-model\n---\nBody text";
      const result = renderAgentMarkdown(input, "gpt-4");
      expect(result).toContain("model: gpt-4");
      expect(result).not.toContain("old-model");
      // model: gpt-4 should appear after mode: subagent
      expect(result).toMatch(/mode: subagent\nmodel: gpt-4/);
    });

    it("handles file without frontmatter", () => {
      const input = "Just some regular markdown\nNo frontmatter here";
      const result = renderAgentMarkdown(input);
      expect(result).toBe(input);
    });

    it("handles file without frontmatter when model given", () => {
      const input = "Just some regular markdown\nNo frontmatter here";
      const result = renderAgentMarkdown(input, "gpt-4");
      expect(result).toBe(input);
    });

    it("handles missing closing frontmatter delimiter gracefully", () => {
      const input = "---\ndescription: Test\nmode: subagent\nNo closing";
      const result = renderAgentMarkdown(input, "gpt-4");
      // No closing delimiter means no valid frontmatter — return as-is
      expect(result).toBe(input);
    });

    it("handles CRLF line endings", () => {
      const input =
        "---\r\ndescription: Test\r\nmode: subagent\r\n---\r\nBody text";
      const result = renderAgentMarkdown(input, "gpt-4");
      expect(result).toContain("model: gpt-4");
      // Output should have LF endings (normalized)
      expect(result).not.toContain("\r\n");
    });

    it("strips existing model line when no new model provided", () => {
      const input =
        "---\ndescription: Test\nmode: subagent\nmodel: old-model\n---\nBody";
      const result = renderAgentMarkdown(input);
      expect(result).not.toContain("old-model");
      expect(result).not.toContain("model:");
    });

    it("injects model at end of frontmatter when no mode: line", () => {
      const input = "---\ndescription: Test\n---\nBody text";
      const result = renderAgentMarkdown(input, "gpt-4");
      expect(result).toContain("model: gpt-4");
    });
  });
});
