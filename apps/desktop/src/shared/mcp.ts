import type { JSONSchema } from "@llm-space/core";

export type McpTransportType = "stdio" | "streamableHttp" | "sse";

export interface McpServerDraft {
  name: string;
  transport: McpTransportType;
  command?: string;
  args?: string[];
  cwd?: string | null;
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

export interface McpServerConfig extends McpServerDraft {
  id: string;
  serverName: string;
  createdAt: number;
  updatedAt: number;
}

export interface McpServerView extends McpServerConfig {
  connected: boolean;
  toolCount: number | null;
  lastError?: string;
}

export interface McpToolView {
  serverId: string;
  serverName: string;
  serverDisplayName: string;
  toolName: string;
  normalizedToolName: string;
  directName: string;
  description: string;
  inputSchema: JSONSchema;
  available: boolean;
  disabledReason?: string;
}

export interface McpServerToolsResponse {
  server: McpServerView;
  tools: McpToolView[];
}

export interface McpCallToolResponse {
  contentText: string;
  isError?: boolean;
}

export interface McpServersConfig {
  servers: McpServerConfig[];
}

const MCP_NAME_CHARS = /[^A-Za-z0-9_]+/g;
const MCP_UNDERSCORES = /_+/g;

export function normalizeMcpName(value: string): string {
  return value
    .trim()
    .replace(MCP_NAME_CHARS, "_")
    .replace(MCP_UNDERSCORES, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildMcpToolName({
  serverName,
  toolName,
}: {
  serverName: string;
  toolName: string;
}): string {
  return `mcp__${serverName}__${toolName}`;
}
