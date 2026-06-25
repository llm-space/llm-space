import { Type, type Static } from "typebox";

import { JSONSchema } from "../shared";

/**
 * The definition of a custom function tool.
 */
const FunctionTool = Type.Object({
  /**
   * The name of the tool.
   */
  name: Type.String(),

  /**
   * The description of the tool.
   */
  description: Type.String(),

  /**
   * A JSON schema represents the parameters of the function tool.
   */
  parameters: JSONSchema,
});
export type FunctionTool = Static<typeof FunctionTool>;

/**
 * The union type of the tools.
 */
export const Tool = Type.Union([FunctionTool]);
export type Tool = Static<typeof Tool>;
