import { type ToolCallInput } from "@llm-space/core";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";

import { PreviewDialog } from "@llm-space/ui/components/preview-dialog-lazy";
import { Tooltip } from "@llm-space/ui/components/tooltip";
import { useHostServices, type BuiltinToolsHost } from "@llm-space/ui/host";
import { cn } from "@llm-space/ui/lib/utils";
import { Button } from "@llm-space/ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@llm-space/ui/ui/dropdown-menu";

import { useI18n } from "../../../i18n";

import { parseTodoWriteInput, TodoWriteView } from "./todo-write-view";

/**
 * Built-in `fs` tools whose `path` argument is an absolute on-disk path worth
 * making click-to-reveal in the OS file manager. Kept in sync with the tools in
 * `bun/tools/built-in/fs.ts` that take a `path` parameter.
 */
const FS_TOOLS_WITH_PATH = new Set([
  "read",
  "write",
  "edit",
  "ls",
  "tree",
  "grep",
]);

/**
 * What a clickable argument value points at: an absolute filesystem `path`
 * (reveal), a `skill` name resolved to its `SKILL.md` (reveal), or a `url`
 * (open in the default browser). Drives the row's click action.
 */
type LinkKind = "path" | "skill" | "url";

/** Translated labels passed to {@link _reveal} for its toast messages. */
interface RevealLabels {
  skillNotFound: string;
  notFoundValue: string;
  failedToReveal: string;
}

/** Reveal a path/skill value in the OS file manager, toasting on a miss/failure. */
async function _reveal(
  builtinTools: BuiltinToolsHost,
  kind: "path" | "skill",
  value: string,
  labels: RevealLabels
): Promise<void> {
  try {
    const existed =
      kind === "skill"
        ? await builtinTools.revealSkill(value)
        : await builtinTools.revealAbsolutePath(value);
    if (!existed) {
      toast.error(
        kind === "skill" ? labels.skillNotFound : labels.notFoundValue
      );
    }
  } catch {
    toast.error(labels.failedToReveal);
  }
}

function _isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

/**
 * Which argument values are clickable: `fs` tools' `path` and the `skill`
 * tool's `name` reveal in the file manager; `web_fetch`'s `url` opens in the
 * browser. Everything else is plain.
 */
function _linkKindFor(
  toolName: string,
  isFsTool: boolean,
  key: string,
  value: unknown
): LinkKind | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  if (isFsTool && key === "path") {
    return "path";
  }
  if (toolName === "skill" && key === "name") {
    return "skill";
  }
  if (toolName === "web_fetch" && key === "url") {
    return "url";
  }
  return undefined;
}

function _ToolCallInputView({ input }: { input: ToolCallInput }) {
  const todos = parseTodoWriteInput(input);
  if (todos) {
    return <TodoWriteView todos={todos} input={input} />;
  }

  const args = input.arguments as Record<string, unknown>;
  const entries = Object.entries(args);
  const isFsTool = FS_TOOLS_WITH_PATH.has(input.name);
  return (
    // `overflow-x-auto` so an expanded object row can scroll horizontally;
    // collapsed rows truncate within the width and never overflow.
    <div className="block w-full overflow-x-auto font-mono text-sm select-auto">
      <div>
        <span className="text-primary">{input.name}</span>
        <span className="text-muted-foreground">(</span>
        {entries.length > 0 ? (
          <span className="text-muted-foreground">{"{"}</span>
        ) : null}
      </div>
      {entries.map(([key, value], index) => {
        const trailingComma = index < entries.length - 1;
        if (
          input.name === "present_files" &&
          key === "paths" &&
          _isStringArray(value)
        ) {
          return (
            <PathArrayArgumentRow
              key={key}
              paths={value}
              trailingComma={trailingComma}
            />
          );
        }
        return (
          <ToolCallArgumentRow
            key={key}
            argumentKey={key}
            value={value}
            trailingComma={trailingComma}
            linkKind={_linkKindFor(input.name, isFsTool, key, value)}
          />
        );
      })}
      <div>
        <span className="text-muted-foreground">
          {entries.length > 0 ? "})" : ")"}
        </span>
      </div>
    </div>
  );
}
export const ToolCallInputView = memo(_ToolCallInputView);

function _ToolCallArgumentRow({
  argumentKey,
  value,
  trailingComma,
  linkKind,
}: {
  argumentKey: string;
  value: unknown;
  trailingComma: boolean;
  linkKind?: LinkKind;
}) {
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { actions, builtinTools } = useHostServices();
  const { t, fmt } = useI18n();
  const valueText = formatJson(value);
  const isObject = typeof value === "object" && value !== null;
  // Only object values can expand into their full, pretty-printed form; strings
  // and primitives always stay on their single truncated line.
  const toggleExpanded = useCallback(() => {
    if (isObject) {
      setExpanded((prev) => !prev);
    }
  }, [isObject]);
  const copyText = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(fmt(t.thread.message.labelCopied, { label }));
      } catch {
        toast.error(
          fmt(t.thread.message.failedToCopyLabel, {
            label: label.toLowerCase(),
          })
        );
      }
    },
    [fmt, t]
  );
  const copyTextContent = useCallback(() => {
    if (typeof value !== "string") {
      return;
    }
    void copyText(value, t.thread.message.textContentLabel);
  }, [copyText, t, value]);
  const copyValueJson = useCallback(() => {
    void copyText(formatJson(value), t.thread.message.valueJsonLabel);
  }, [copyText, t, value]);
  const openPreview = useCallback(() => {
    setPreviewOpen(true);
  }, []);
  const handleActivate = useCallback(() => {
    if (!linkKind || typeof value !== "string") {
      return;
    }
    if (linkKind === "url") {
      actions.openLink(value);
      return;
    }
    void _reveal(builtinTools, linkKind, value, {
      skillNotFound: fmt(t.thread.message.skillNotFound, { value }),
      notFoundValue: fmt(t.thread.message.notFoundValue, { value }),
      failedToReveal: t.thread.message.failedToRevealInFileManager,
    });
  }, [actions, builtinTools, fmt, linkKind, t, value]);
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  }, []);

  return (
    <div
      className="group/argument relative flex w-full min-w-0 items-baseline py-0.5 pl-1.5"
      onContextMenu={handleContextMenu}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={fmt(t.thread.message.openActionsForArgumentAria, {
              argumentKey,
            })}
            className={cn(
              "text-muted-foreground absolute top-0.5 left-0 size-5 aria-expanded:visible",
              // Object rows always show their expand/collapse chevron; other
              // rows only reveal the actions button on hover.
              isObject
                ? "visible"
                : "invisible group-hover/argument:visible",
              open && "visible"
            )}
            size="icon-xs"
            variant="ghost"
            onClick={(event) => event.stopPropagation()}
          >
            {isObject ? (
              <>
                {/* Chevron by default, swapped for the `...` actions icon while
                    the row is hovered (or the menu is open). */}
                {expanded ? (
                  <ChevronDown className="size-3.5 group-hover/argument:hidden group-aria-expanded/button:hidden" />
                ) : (
                  <ChevronRight className="size-3.5 group-hover/argument:hidden group-aria-expanded/button:hidden" />
                )}
                <MoreHorizontal className="hidden size-3.5 group-hover/argument:block group-aria-expanded/button:block" />
              </>
            ) : (
              <MoreHorizontal className="size-3.5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          {linkKind ? (
            <>
              <DropdownMenuItem onSelect={handleActivate}>
                {linkKind === "url"
                  ? t.thread.message.openInBrowser
                  : t.thread.message.revealInFileManager}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {isObject ? (
            <>
              <DropdownMenuItem onSelect={toggleExpanded}>
                {expanded ? t.thread.message.collapse : t.thread.message.expand}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {typeof value === "string" ? (
            <DropdownMenuItem onSelect={copyTextContent}>
              {t.thread.message.copyTextContent}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={copyValueJson}>
            {t.thread.message.copyValueAsJson}
          </DropdownMenuItem>
          {typeof value === "string" ? (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onSelect={openPreview}>
                {t.thread.message.previewValue}
              </DropdownMenuItem>
            </>
          ) : null}
          {isObject ? (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onSelect={openPreview}>
                {t.thread.message.viewJson}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <ArgumentLine
        argumentKey={argumentKey}
        valueText={valueText}
        trailingComma={trailingComma}
        expandable={isObject}
        expanded={expanded}
        onToggle={toggleExpanded}
        onActivate={linkKind ? handleActivate : undefined}
        activateTitle={
          linkKind === "url"
            ? t.thread.message.openInBrowserTitle
            : t.thread.message.revealInFileManagerTitle
        }
      />
      {typeof value === "string" ? (
        <PreviewDialog
          open={previewOpen}
          title={fmt(t.thread.message.viewValueOfArgument, { argumentKey })}
          value={value}
          onOpenChange={setPreviewOpen}
        />
      ) : null}
      {isObject ? (
        <PreviewDialog
          open={previewOpen}
          title={fmt(t.thread.message.viewValueOfArgument, { argumentKey })}
          type="json"
          value={valueText}
          onOpenChange={setPreviewOpen}
        />
      ) : null}
    </div>
  );
}
const ToolCallArgumentRow = memo(_ToolCallArgumentRow);

/**
 * A specialized row for `present_files`' `paths` array: renders the array
 * inline (code-style) with each element as its own click-to-reveal link, rather
 * than as a single opaque JSON blob.
 */
function _PathArrayArgumentRow({
  paths,
  trailingComma,
}: {
  paths: string[];
  trailingComma: boolean;
}) {
  const { builtinTools } = useHostServices();
  const { t, fmt } = useI18n();
  const revealLabels = {
    skillNotFound: t.thread.message.skillNotFound,
    notFoundValue: t.thread.message.notFoundValue,
    failedToReveal: t.thread.message.failedToRevealInFileManager,
  };
  return (
    <div className="w-full min-w-0 py-0.5 pl-1.5">
      <div className="whitespace-pre">
        <span>{"  "}</span>
        <span className="text-foreground">paths</span>
        <span className="text-muted-foreground">: [</span>
      </div>
      {paths.map((p, index) => (
        <div
          key={index}
          className="flex min-w-0 items-baseline whitespace-pre"
        >
          <span className="shrink-0">{"    "}</span>
          <button
            type="button"
            title={t.thread.message.revealInFileManagerTitle}
            className="hover:text-primary min-w-0 cursor-pointer truncate underline-offset-2 hover:underline"
            onClick={() =>
              void _reveal(builtinTools, "path", p, {
                skillNotFound: fmt(revealLabels.skillNotFound, { value: p }),
                notFoundValue: fmt(revealLabels.notFoundValue, { value: p }),
                failedToReveal: revealLabels.failedToReveal,
              })
            }
          >
            {formatJson(p)}
          </button>
          <span className="shrink-0">{index < paths.length - 1 ? "," : ""}</span>
        </div>
      ))}
      <div className="whitespace-pre">
        <span>{"  ]"}</span>
        {trailingComma ? "," : ""}
      </div>
    </div>
  );
}
const PathArrayArgumentRow = memo(_PathArrayArgumentRow);

/**
 * One `key: value` line. Non-expandable lines (strings, primitives) render a
 * single truncated line. Expandable lines (objects) are click-to-toggle with a
 * pointer cursor and tooltip, and expand into the value's full pretty-printed
 * form — a single `whitespace-pre` block so only the first line is indented by
 * the key and the JSON's continuation lines wrap flush to the left.
 */
function ArgumentLine({
  argumentKey,
  valueText,
  trailingComma,
  expandable,
  expanded,
  onToggle,
  onActivate,
  activateTitle,
}: {
  argumentKey: string;
  valueText: string;
  trailingComma: boolean;
  expandable: boolean;
  expanded: boolean;
  onToggle: () => void;
  onActivate?: () => void;
  activateTitle?: string;
}) {
  const { t } = useI18n();
  const line =
    expandable && expanded ? (
      <div
        className="min-w-max flex-1 cursor-pointer whitespace-pre"
        onClick={onToggle}
      >
        {"  "}
        <span className="text-foreground">{argumentKey}</span>
        <span className="text-muted-foreground">: </span>
        {valueText}
        {trailingComma ? "," : ""}
      </div>
    ) : (
      <span
        className={cn(
          "flex min-w-0 flex-1 items-baseline whitespace-pre",
          expandable && "cursor-pointer"
        )}
        onClick={expandable ? onToggle : undefined}
      >
        <span className="shrink-0">{"  "}</span>
        <span className="text-foreground shrink-0">{argumentKey}</span>
        <span className="text-muted-foreground shrink-0">: </span>
        {onActivate ? (
          <button
            type="button"
            title={activateTitle}
            className="hover:text-primary min-w-0 cursor-pointer truncate underline-offset-2 hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onActivate();
            }}
          >
            {valueText}
          </button>
        ) : (
          <span className="truncate">{valueText}</span>
        )}
        <span className="shrink-0">{trailingComma ? "," : ""}</span>
      </span>
    );

  if (!expandable) {
    return line;
  }
  return (
    // The click handler lives on `line` itself; the wrapping span here is only
    // the tooltip trigger. Adding another onClick would fire onToggle twice as
    // the event bubbles, cancelling the toggle out.
    <Tooltip
      content={
        expanded
          ? t.thread.message.clickToCollapse
          : t.thread.message.clickToExpand
      }
    >
      <span>{line}</span>
    </Tooltip>
  );
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? String(value);
}
