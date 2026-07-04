import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { uuid } from "@llm-space/core";
import { getSettingsDir } from "@llm-space/core/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  CompatibilityCallToolResultSchema,
  type CallToolResult,
  type Tool as SdkMcpTool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import {
  buildMcpToolName,
  normalizeMcpName,
  type McpCallToolResponse,
  type McpServerConfig,
  type McpServerDraft,
  type McpServersConfig,
  type McpServerToolsResponse,
  type McpServerView,
  type McpToolView,
} from "../../shared/mcp";

const CONNECT_TIMEOUT_MS = 10_000;
const LIST_TIMEOUT_MS = 10_000;
const CALL_TIMEOUT_MS = 60_000;
const MAX_OUTPUT_CHARS = 20_000;
const ENV_REFERENCE_PATTERN =
  /\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))/g;

const stringRecordSchema = z.record(z.string(), z.string());

const serverConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  serverName: z.string(),
  transport: z.union([
    z.literal("stdio"),
    z.literal("streamableHttp"),
    z.literal("sse"),
  ]),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  cwd: z.string().nullable().optional(),
  env: stringRecordSchema.optional(),
  url: z.string().optional(),
  headers: stringRecordSchema.optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

const serversConfigSchema = z.object({
  servers: z.array(serverConfigSchema),
});

interface McpClientEntry {
  client: Client;
  tools: SdkMcpTool[] | null;
}

interface McpServerRuntimeStatus {
  toolCount: number | null;
  lastError?: string;
}

/**
 * Owns `settings/mcp.json` plus live MCP client connections. The manager keeps
 * all process spawning, remote headers, and SDK transports in the Bun process so
 * the renderer only talks through typed RPC.
 */
export class McpManager {
  private _config: McpServersConfig;
  private readonly _clients = new Map<string, McpClientEntry>();
  private readonly _connecting = new Map<string, Promise<McpClientEntry>>();
  private readonly _status = new Map<string, McpServerRuntimeStatus>();

  constructor() {
    this._config = this._loadConfig();
  }

  listServers(): McpServerView[] {
    return this._config.servers.map((server) => this._toServerView(server));
  }

  addServer(draft: McpServerDraft): McpServerView[] {
    const now = Date.now();
    const server = this._normalizeServerDraft(draft, {
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
    this._assertUniqueServerName(server);
    this._config = { servers: [...this._config.servers, server] };
    this._saveConfig();
    return this.listServers();
  }

  async updateServer(
    serverId: string,
    draft: McpServerDraft
  ): Promise<McpServerView[]> {
    const current = this._getServer(serverId);
    const server = this._normalizeServerDraft(draft, {
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: Date.now(),
    });
    this._assertUniqueServerName(server, serverId);
    this._config = {
      servers: this._config.servers.map((item) =>
        item.id === serverId ? server : item
      ),
    };
    await this._closeServer(serverId);
    this._status.delete(serverId);
    this._saveConfig();
    return this.listServers();
  }

  async removeServer(serverId: string): Promise<McpServerView[]> {
    this._config = {
      servers: this._config.servers.filter((server) => server.id !== serverId),
    };
    await this._closeServer(serverId);
    this._status.delete(serverId);
    this._saveConfig();
    return this.listServers();
  }

  async listTools(serverId: string): Promise<McpServerToolsResponse> {
    const server = this._getServer(serverId);
    try {
      const entry = await this._connect(server);
      const tools = await this._fetchAllTools(entry.client);
      entry.tools = tools;
      this._status.set(serverId, { toolCount: tools.length });
      return {
        server: this._toServerView(server),
        tools: this._toToolViews(server, tools),
      };
    } catch (error) {
      const message = _errorMessage(error);
      this._status.set(serverId, { toolCount: null, lastError: message });
      await this._closeServer(serverId);
      throw new Error(message, { cause: error });
    }
  }

  async callTool({
    serverId,
    toolName,
    arguments: args,
  }: {
    serverId: string;
    toolName: string;
    arguments: Record<string, unknown>;
  }): Promise<McpCallToolResponse> {
    const server = this._getServer(serverId);
    try {
      const entry = await this._connect(server);
      const result = await entry.client.callTool(
        { name: toolName, arguments: args },
        CompatibilityCallToolResultSchema,
        { timeout: CALL_TIMEOUT_MS }
      );
      return _flattenToolResult(result as CallToolResult);
    } catch (error) {
      const message = _errorMessage(error);
      this._status.set(serverId, {
        toolCount: this._status.get(serverId)?.toolCount ?? null,
        lastError: message,
      });
      throw new Error(message, { cause: error });
    }
  }

  private async _connect(server: McpServerConfig): Promise<McpClientEntry> {
    const cached = this._clients.get(server.id);
    if (cached) {
      return cached;
    }
    const connecting = this._connecting.get(server.id);
    if (connecting) {
      return connecting;
    }
    const promise = this._openConnection(server);
    this._connecting.set(server.id, promise);
    try {
      return await promise;
    } finally {
      this._connecting.delete(server.id);
    }
  }

  private async _openConnection(
    server: McpServerConfig
  ): Promise<McpClientEntry> {
    const client = new Client({
      name: "llm-space",
      version: "1.0.0",
    });
    const transport = this._createTransport(server);
    try {
      await client.connect(transport, { timeout: CONNECT_TIMEOUT_MS });
    } catch (error) {
      try {
        await client.close();
      } catch {
        // Failed startup cleanup is best-effort.
      }
      throw error;
    }
    const entry: McpClientEntry = { client, tools: null };
    this._clients.set(server.id, entry);
    return entry;
  }

  private _createTransport(server: McpServerConfig) {
    if (server.transport === "stdio") {
      return new StdioClientTransport({
        command: server.command ?? "",
        args: server.args ?? [],
        cwd: server.cwd || undefined,
        env: {
          ...getDefaultEnvironment(),
          ...this._resolveValueMap(server.env ?? {}),
        },
        stderr: "ignore",
      });
    }

    const headers = this._resolveValueMap(server.headers ?? {});
    const requestInit =
      Object.keys(headers).length > 0 ? { headers } : undefined;
    const url = new URL(server.url ?? "");

    if (server.transport === "streamableHttp") {
      return new StreamableHTTPClientTransport(url, { requestInit });
    }

    const fetchWithHeaders =
      Object.keys(headers).length > 0
        ? (input: string | URL, init: RequestInit = {}) =>
            fetch(input, {
              ...init,
              headers: { ...headers, ..._headersToRecord(init.headers) },
            })
        : undefined;
    return new SSEClientTransport(url, {
      requestInit,
      eventSourceInit: fetchWithHeaders ? { fetch: fetchWithHeaders } : {},
    });
  }

  private async _fetchAllTools(client: Client): Promise<SdkMcpTool[]> {
    const tools: SdkMcpTool[] = [];
    let cursor: string | undefined;
    do {
      const response = await client.listTools(
        cursor ? { cursor } : undefined,
        { timeout: LIST_TIMEOUT_MS }
      );
      tools.push(...response.tools);
      cursor = response.nextCursor;
    } while (cursor);
    return tools;
  }

  private _toToolViews(
    server: McpServerConfig,
    tools: SdkMcpTool[]
  ): McpToolView[] {
    const normalizedCounts = new Map<string, number>();
    const normalizedNames = tools.map((tool) => normalizeMcpName(tool.name));
    for (const name of normalizedNames) {
      normalizedCounts.set(name, (normalizedCounts.get(name) ?? 0) + 1);
    }

    return tools.map((tool, index) => {
      const normalizedToolName = normalizedNames[index] ?? "";
      const collision = (normalizedCounts.get(normalizedToolName) ?? 0) > 1;
      const available = normalizedToolName !== "" && !collision;
      return {
        serverId: server.id,
        serverName: server.serverName,
        serverDisplayName: server.name,
        toolName: tool.name,
        normalizedToolName,
        directName: buildMcpToolName({
          serverName: server.serverName,
          toolName: normalizedToolName,
        }),
        description: tool.description ?? "",
        inputSchema: tool.inputSchema,
        available,
        disabledReason:
          normalizedToolName === ""
            ? "Tool name normalizes to an empty string"
            : collision
              ? "Tool name collides after normalization"
              : undefined,
      };
    });
  }

  private _toServerView(server: McpServerConfig): McpServerView {
    const status = this._status.get(server.id);
    return {
      ...server,
      connected: this._clients.has(server.id),
      toolCount: status?.toolCount ?? null,
      lastError: status?.lastError,
    };
  }

  private _normalizeServerDraft(
    draft: McpServerDraft,
    metadata: Pick<McpServerConfig, "id" | "createdAt" | "updatedAt">
  ): McpServerConfig {
    const name = draft.name.trim();
    if (!name) {
      throw new Error("MCP server name is required.");
    }
    const serverName = normalizeMcpName(name);
    if (!serverName) {
      throw new Error("MCP server name must contain letters or numbers.");
    }
    if (draft.transport === "stdio") {
      const command = draft.command?.trim();
      if (!command) {
        throw new Error("Stdio MCP servers require a command.");
      }
      return {
        ...metadata,
        name,
        serverName,
        transport: "stdio",
        command,
        args: (draft.args ?? []).map((arg) => arg.trim()).filter(Boolean),
        cwd: draft.cwd?.trim() || null,
        env: _cleanRecord(draft.env),
      };
    }

    const url = draft.url?.trim();
    if (!url) {
      throw new Error("Remote MCP servers require a URL.");
    }
    try {
      new URL(url);
    } catch {
      throw new Error("Remote MCP server URL is invalid.");
    }
    return {
      ...metadata,
      name,
      serverName,
      transport: draft.transport,
      url,
      headers: _cleanRecord(draft.headers),
    };
  }

  private _assertUniqueServerName(server: McpServerConfig, exceptId?: string) {
    const existing = this._config.servers.find(
      (item) => item.id !== exceptId && item.serverName === server.serverName
    );
    if (existing) {
      throw new Error(`MCP server name "${server.serverName}" already exists.`);
    }
  }

  private _getServer(serverId: string): McpServerConfig {
    const server = this._config.servers.find((item) => item.id === serverId);
    if (!server) {
      throw new Error(`MCP server not configured: ${serverId}`);
    }
    return server;
  }

  private async _closeServer(serverId: string): Promise<void> {
    const pending = this._connecting.get(serverId);
    this._connecting.delete(serverId);
    const cached = this._clients.get(serverId);
    this._clients.delete(serverId);
    const entries = new Set<McpClientEntry>();
    if (cached) {
      entries.add(cached);
    }
    if (pending) {
      try {
        entries.add(await pending);
      } catch {
        // A failed in-flight connection has no live client to close.
      }
      this._clients.delete(serverId);
    }
    for (const entry of entries) {
      try {
        await entry.client.close();
      } catch {
        // Closing is best-effort during config edits/removal.
      }
    }
  }

  private _resolveValueMap(values: Record<string, string>): Record<string, string> {
    const resolved: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      const trimmedKey = key.trim();
      if (!trimmedKey) {
        continue;
      }
      resolved[trimmedKey] = _resolveValue(value);
    }
    return resolved;
  }

  private get _configPath(): string {
    return path.join(getSettingsDir(), "mcp.json");
  }

  private _saveConfig(): void {
    mkdirSync(getSettingsDir(), { recursive: true });
    writeFileSync(
      this._configPath,
      `${JSON.stringify(this._config, null, 2)}\n`,
      "utf8"
    );
  }

  private _loadConfig(): McpServersConfig {
    try {
      const parsed = serversConfigSchema.parse(
        JSON.parse(readFileSync(this._configPath, "utf8"))
      );
      return {
        servers: parsed.servers.map((server) => ({
          ...server,
          createdAt: server.createdAt ?? Date.now(),
          updatedAt: server.updatedAt ?? Date.now(),
        })),
      };
    } catch (error) {
      if (
        !(
          error instanceof z.ZodError ||
          (error as NodeJS.ErrnoException).code === "ENOENT"
        )
      ) {
        throw error;
      }
      const empty: McpServersConfig = { servers: [] };
      if (!existsSync(this._configPath)) {
        mkdirSync(getSettingsDir(), { recursive: true });
        writeFileSync(
          this._configPath,
          `${JSON.stringify(empty, null, 2)}\n`,
          "utf8"
        );
      }
      return empty;
    }
  }
}

function _cleanRecord(
  value: Record<string, string> | undefined
): Record<string, string> | undefined {
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value ?? {})) {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      result[trimmedKey] = item;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function _resolveValue(value: string): string {
  return value.replace(
    ENV_REFERENCE_PATTERN,
    (_match: string, braced: string | undefined, bare: string | undefined) => {
      const name = braced ?? bare;
      if (!name) {
        return "";
      }
      const resolved = process.env[name];
      if (resolved === undefined) {
        throw new Error(`Environment variable ${name} is not set.`);
      }
      return resolved;
    }
  );
}

function _headersToRecord(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) {
    return {};
  }
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
}

function _errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function _flattenToolResult(result: CallToolResult): McpCallToolResponse {
  const parts: string[] = [];
  for (const content of result.content ?? []) {
    if (content.type === "text") {
      parts.push(content.text);
    } else if (content.type === "image") {
      parts.push(`[image: ${content.mimeType}, ${content.data.length} bytes]`);
    } else if (content.type === "audio") {
      parts.push(`[audio: ${content.mimeType}, ${content.data.length} bytes]`);
    } else if (content.type === "resource") {
      if ("text" in content.resource) {
        parts.push(
          `[resource: ${content.resource.uri}]\n${content.resource.text}`
        );
      } else {
        parts.push(
          `[resource: ${content.resource.uri}, ${content.resource.mimeType ?? "unknown"}, ${content.resource.blob.length} bytes]`
        );
      }
    } else if (content.type === "resource_link") {
      parts.push(`[resource link: ${content.name}] ${content.uri}`);
    }
  }
  if (result.structuredContent) {
    parts.push(JSON.stringify(result.structuredContent, null, 2));
  }
  const text = parts.join("\n\n").trim();
  return {
    contentText:
      text.length > MAX_OUTPUT_CHARS
        ? `${text.slice(0, MAX_OUTPUT_CHARS)}\n\n[truncated]`
        : text,
    isError: result.isError,
  };
}

export const mcpManager = new McpManager();
