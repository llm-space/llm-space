"use client";

import {
  Check,
  CircleAlert,
  CircleDot,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  addMcpServer,
  listMcpServers,
  listMcpTools,
  removeMcpServer,
  updateMcpServer,
} from "@/client/mcp";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  normalizeMcpName,
  type McpServerDraft,
  type McpServerView,
  type McpToolView,
  type McpTransportType,
} from "@/shared/mcp";

import { SettingsPage } from "./settings-page";

interface Row {
  key: string;
  value: string;
}

interface ServerForm {
  name: string;
  transport: McpTransportType;
  command: string;
  argsText: string;
  cwd: string;
  env: Row[];
  url: string;
  headers: Row[];
}

const EMPTY_FORM: ServerForm = {
  name: "",
  transport: "stdio",
  command: "",
  argsText: "",
  cwd: "",
  env: [],
  url: "",
  headers: [],
};

function _formFromServer(server: McpServerView | null): ServerForm {
  if (!server) {
    return { ...EMPTY_FORM };
  }
  return {
    name: server.name,
    transport: server.transport,
    command: server.command ?? "",
    argsText: (server.args ?? []).join("\n"),
    cwd: server.cwd ?? "",
    env: _rowsFromRecord(server.env),
    url: server.url ?? "",
    headers: _rowsFromRecord(server.headers),
  };
}

function _draftFromForm(form: ServerForm): McpServerDraft {
  if (form.transport === "stdio") {
    return {
      name: form.name,
      transport: "stdio",
      command: form.command,
      args: form.argsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      cwd: form.cwd.trim() || null,
      env: _recordFromRows(form.env),
    };
  }
  return {
    name: form.name,
    transport: form.transport,
    url: form.url,
    headers: _recordFromRows(form.headers),
  };
}

function _rowsFromRecord(record: Record<string, string> | undefined): Row[] {
  return Object.entries(record ?? {}).map(([key, value]) => ({ key, value }));
}

function _recordFromRows(rows: Row[]): Record<string, string> | undefined {
  const result: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (key) {
      result[key] = row.value;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function McpPage() {
  const [servers, setServers] = useState<McpServerView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ServerForm>(EMPTY_FORM);
  const [tools, setTools] = useState<McpToolView[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedId) ?? null,
    [selectedId, servers]
  );
  const normalizedName = normalizeMcpName(form.name);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await listMcpServers();
      setServers(next);
      setSelectedId((current) => {
        if (creating) {
          return current;
        }
        if (current && next.some((server) => server.id === current)) {
          return current;
        }
        return next[0]?.id ?? null;
      });
    } catch (error) {
      toast.error("Failed to load MCP servers", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [creating]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!creating) {
      setForm(_formFromServer(selectedServer));
      setTools([]);
    }
  }, [creating, selectedServer?.id]);

  const createServer = () => {
    setCreating(true);
    setSelectedId(null);
    setForm({ ...EMPTY_FORM, name: "New MCP Server" });
    setTools([]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const draft = _draftFromForm(form);
      const next =
        creating || !selectedId
          ? await addMcpServer(draft)
          : await updateMcpServer(selectedId, draft);
      setServers(next);
      const saved =
        creating || !selectedId
          ? [...next]
              .reverse()
              .find((server) => server.serverName === normalizeMcpName(form.name))
          : next.find((server) => server.id === selectedId);
      setCreating(false);
      setSelectedId(saved?.id ?? next[0]?.id ?? null);
      toast.success("MCP server saved");
    } catch (error) {
      toast.error("Failed to save MCP server", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const testServer = async () => {
    if (!selectedServer) {
      return;
    }
    setTesting(true);
    try {
      const response = await listMcpTools(selectedServer.id);
      setTools(response.tools);
      setServers((current) =>
        current.map((server) =>
          server.id === response.server.id ? response.server : server
        )
      );
      toast.success("MCP server connected", {
        description: `${response.tools.length} tool${response.tools.length === 1 ? "" : "s"} discovered`,
      });
    } catch (error) {
      await refresh();
      toast.error("Failed to connect MCP server", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setTesting(false);
    }
  };

  const confirmRemove = async () => {
    if (!selectedServer) {
      return;
    }
    setRemoveOpen(false);
    try {
      const next = await removeMcpServer(selectedServer.id);
      setServers(next);
      setSelectedId(next[0]?.id ?? null);
      toast.success("MCP server removed");
    } catch (error) {
      toast.error("Failed to remove MCP server", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <SettingsPage title="MCP">
      <div className="flex h-full min-h-0 gap-6">
        <aside className="flex w-58 shrink-0 flex-col gap-3 border-r pr-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Servers
            </span>
            <div className="flex items-center gap-1">
              <Tooltip content="Refresh servers">
                <button
                  type="button"
                  aria-label="Refresh MCP servers"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors"
                  onClick={() => void refresh()}
                >
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3.5" />
                  )}
                </button>
              </Tooltip>
              <Tooltip content="Add MCP server">
                <button
                  type="button"
                  aria-label="Add MCP server"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors"
                  onClick={createServer}
                >
                  <Plus className="size-4" />
                </button>
              </Tooltip>
            </div>
          </div>
          <ScrollArea className="min-h-0 grow">
            <div className="flex flex-col gap-1 pr-2">
              {servers.map((server) => (
                <button
                  key={server.id}
                  type="button"
                  className={cn(
                    "hover:bg-accent flex min-w-0 flex-col gap-1 rounded-md px-2 py-2 text-left transition-colors",
                    selectedId === server.id && "bg-accent"
                  )}
                  onClick={() => {
                    setCreating(false);
                    setSelectedId(server.id);
                  }}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <StatusDot server={server} />
                    <span className="truncate text-sm font-medium">
                      {server.name}
                    </span>
                  </span>
                  <span className="text-muted-foreground truncate pl-4 font-mono text-xs">
                    {server.transport}
                  </span>
                </button>
              ))}
              {creating ? (
                <button
                  type="button"
                  className="bg-accent flex min-w-0 flex-col gap-1 rounded-md px-2 py-2 text-left"
                >
                  <span className="truncate text-sm font-medium">
                    Unsaved server
                  </span>
                </button>
              ) : null}
              {servers.length === 0 && !creating ? (
                <div className="text-muted-foreground px-1 py-2 text-xs">
                  No MCP servers.
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </aside>

        <main className="min-w-0 grow">
          {creating || selectedId ? (
            <ServerEditor
              form={form}
              normalizedName={normalizedName}
              server={selectedServer}
              saving={saving}
              testing={testing}
              tools={tools}
              onFormChange={setForm}
              onSave={() => void save()}
              onTest={() => void testServer()}
              onRemove={() => setRemoveOpen(true)}
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              Select or add an MCP server
            </div>
          )}
        </main>
      </div>
      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Remove MCP Server"
        description={
          selectedServer
            ? `Remove ${selectedServer.name} from local MCP settings?`
            : undefined
        }
        confirmLabel="Remove"
        dimBackground={false}
        onConfirm={() => void confirmRemove()}
      />
    </SettingsPage>
  );
}

function ServerEditor({
  form,
  normalizedName,
  server,
  saving,
  testing,
  tools,
  onFormChange,
  onSave,
  onTest,
  onRemove,
}: {
  form: ServerForm;
  normalizedName: string;
  server: McpServerView | null;
  saving: boolean;
  testing: boolean;
  tools: McpToolView[];
  onFormChange: (form: ServerForm) => void;
  onSave: () => void;
  onTest: () => void;
  onRemove: () => void;
}) {
  const patch = (partial: Partial<ServerForm>) =>
    onFormChange({ ...form, ...partial });

  return (
    <ScrollArea className="h-full">
      <div className="flex max-w-2xl flex-col gap-6 pb-6">
        <div className="flex items-center gap-2">
          <div className="min-w-0 grow">
            <h3 className="font-heading truncate text-lg font-medium">
              {form.name || "MCP Server"}
            </h3>
            <div className="text-muted-foreground font-mono text-xs">
              {normalizedName ? `mcp__${normalizedName}__tool` : "mcp__server__tool"}
            </div>
          </div>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Check />}
            Save
          </Button>
          {server ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={onTest}
                disabled={testing}
              >
                {testing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                Test
              </Button>
              <Tooltip content="Remove MCP server">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove MCP server"
                  onClick={onRemove}
                >
                  <Trash2 className="size-4" />
                </Button>
              </Tooltip>
            </>
          ) : null}
        </div>

        {server?.lastError ? (
          <div className="border-destructive/40 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 break-words">{server.lastError}</span>
          </div>
        ) : null}

        <Field label="Name">
          <Input
            value={form.name}
            aria-label="MCP server name"
            onChange={(event) => patch({ name: event.target.value })}
          />
        </Field>

        <Field label="Transport">
          <Select
            value={form.transport}
            onValueChange={(value) =>
              patch({ transport: value as McpTransportType })
            }
          >
            <SelectTrigger className="w-full" aria-label="MCP transport">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stdio">stdio</SelectItem>
              <SelectItem value="streamableHttp">Streamable HTTP</SelectItem>
              <SelectItem value="sse">SSE</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {form.transport === "stdio" ? (
          <>
            <Field label="Command">
              <Input
                value={form.command}
                aria-label="MCP stdio command"
                placeholder="npx"
                onChange={(event) => patch({ command: event.target.value })}
              />
            </Field>
            <Field label="Args">
              <Textarea
                className="min-h-18"
                value={form.argsText}
                aria-label="MCP stdio args"
                placeholder={"-y\n@modelcontextprotocol/server-filesystem"}
                onChange={(event) => patch({ argsText: event.target.value })}
              />
            </Field>
            <Field label="Working directory">
              <Input
                value={form.cwd}
                aria-label="MCP stdio working directory"
                onChange={(event) => patch({ cwd: event.target.value })}
              />
            </Field>
            <KeyValueRows
              label="Environment"
              rows={form.env}
              valueType="password"
              namePlaceholder="KEY"
              valuePlaceholder="$TOKEN"
              onChange={(env) => patch({ env })}
            />
          </>
        ) : (
          <>
            <Field label="URL">
              <Input
                value={form.url}
                aria-label="MCP remote URL"
                placeholder="https://example.com/mcp"
                onChange={(event) => patch({ url: event.target.value })}
              />
            </Field>
            <KeyValueRows
              label="Headers"
              rows={form.headers}
              valueType="password"
              namePlaceholder="Authorization"
              valuePlaceholder="Bearer $TOKEN"
              onChange={(headers) => patch({ headers })}
            />
          </>
        )}

        {server ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tools</span>
              {server.toolCount !== null ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {server.toolCount}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              {tools.length === 0 ? (
                <div className="text-muted-foreground px-1 py-2 text-xs">
                  No tools loaded.
                </div>
              ) : (
                tools.map((tool) => (
                  <div
                    key={tool.toolName}
                    className="bg-muted/40 flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        tool.available ? "bg-emerald-500" : "bg-destructive"
                      )}
                    />
                    <div className="min-w-0 grow">
                      <div className="truncate font-mono text-xs">
                        {tool.directName}
                      </div>
                      {tool.disabledReason ? (
                        <div className="text-destructive text-xs">
                          {tool.disabledReason}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ScrollArea>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function KeyValueRows({
  label,
  rows,
  valueType = "text",
  namePlaceholder,
  valuePlaceholder,
  onChange,
}: {
  label: string;
  rows: Row[];
  valueType?: "text" | "password";
  namePlaceholder: string;
  valuePlaceholder: string;
  onChange: (rows: Row[]) => void;
}) {
  const setRow = (index: number, row: Row) =>
    onChange(rows.map((item, itemIndex) => (itemIndex === index ? row : item)));
  const removeRow = (index: number) =>
    onChange(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={row.key}
            placeholder={namePlaceholder}
            aria-label={`${label} ${index + 1} name`}
            onChange={(event) =>
              setRow(index, { ...row, key: event.target.value })
            }
          />
          <Input
            type={valueType}
            value={row.value}
            placeholder={valuePlaceholder}
            aria-label={`${label} ${index + 1} value`}
            onChange={(event) =>
              setRow(index, { ...row, value: event.target.value })
            }
          />
          <Tooltip content={`Remove ${label.toLowerCase()} row`}>
            <button
              type="button"
              aria-label={`Remove ${label} row ${index + 1}`}
              className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 shrink-0 items-center justify-center rounded transition-colors"
              onClick={() => removeRow(index)}
            >
              <Trash2 className="size-4" />
            </button>
          </Tooltip>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
      >
        <Plus /> Add {label.toLowerCase()}
      </Button>
    </div>
  );
}

function StatusDot({ server }: { server: McpServerView }) {
  if (server.lastError) {
    return <CircleAlert className="text-destructive size-3.5 shrink-0" />;
  }
  if (server.connected) {
    return <CircleDot className="text-emerald-500 size-3.5 shrink-0" />;
  }
  return <CircleDot className="text-muted-foreground size-3.5 shrink-0" />;
}
