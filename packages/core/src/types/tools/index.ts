import { Type, type Static } from "typebox";

import { JSONSchema } from "../shared";

const McpToolSource = Type.Object({
  type: Type.Literal("mcp"),
  /**
   * The configured MCP server id that owns the raw MCP tool.
   */
  serverId: Type.String(),
  /**
   * The normalized server segment used in `mcp__{serverName}__{toolName}`.
   */
  serverName: Type.String(),
  /**
   * The raw MCP tool name sent back to the server during `tools/call`.
   */
  toolName: Type.String(),
});
export type McpToolSource = Static<typeof McpToolSource>;

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

  strict: Type.Optional(Type.Boolean()),

  /**
   * Optional provenance for tools backed by an external runtime.
   */
  source: Type.Optional(Type.Union([McpToolSource])),
});
export type FunctionTool = Static<typeof FunctionTool>;

/**
 * The union type of the tools.
 */
export const Tool = Type.Union([FunctionTool]);
export type Tool = Static<typeof Tool>;
