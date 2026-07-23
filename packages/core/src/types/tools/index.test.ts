import { describe, expect, test } from "bun:test";

import type { BuiltinTool } from "./index";
import { isExecutableTool, normalizeTool } from "./index";

const ASK_USER_QUESTION_TOOL: BuiltinTool = {
  type: "builtin",
  name: "ask_user_question",
  description: "Ask the user a question.",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};

describe("ask_user_question termination", () => {
  test("restores terminate=true on legacy persisted definitions", () => {
    expect(normalizeTool(ASK_USER_QUESTION_TOOL)).toEqual({
      ...ASK_USER_QUESTION_TOOL,
      terminate: true,
    });
  });

  test("is never executable automatically even before normalization", () => {
    expect(isExecutableTool(ASK_USER_QUESTION_TOOL)).toBe(false);
  });
});
