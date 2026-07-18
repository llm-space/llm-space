"use client";

import type { FileNode } from "@llm-space/core";
import { useI18n } from "@llm-space/ui/i18n";
import { cn } from "@llm-space/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@llm-space/ui/ui/dropdown-menu";
import {
  ClipboardCopy,
  ClipboardPaste,
  FilePlus,
  FilesIcon,
  FolderOpen,
  FolderPlus,
  FoldersIcon,
  Import,
  MoreHorizontal,
  RefreshCw,
  SettingsIcon,
  Share2,
  TextCursorInput,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { localFs } from "@/client";
import { useCommands } from "@/commands";

const _isWindows =
  typeof navigator !== "undefined" && /Win/i.test(navigator.userAgent);

/** Shared styling for the small square hover-action triggers. */
const actionClass = cn(
  "text-muted-foreground hover:bg-accent hover:text-foreground",
  "inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded"
);

/**
 * A small clickable icon. Rendered as a `<span role="button">` rather than a
 * real `<button>` because directory rows place actions inside the accordion
 * trigger button, and nesting `<button>` elements is invalid HTML. Pointer and
 * click events are stopped so using an action never drags, toggles, or selects
 * the row.
 */
function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={label}
      title={label}
      className={actionClass}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </span>
  );
}

/**
 * The "..." overflow menu trigger. Like {@link IconAction} it renders as a
 * non-button element (`asChild`) so it can live inside the directory accordion
 * trigger, and stops pointer/click propagation so opening the menu doesn't drag
 * or toggle the row. Default behavior is left intact so Radix can open the menu.
 */
function MoreActionsTrigger({ label }: { label: string }) {
  return (
    <DropdownMenuTrigger asChild>
      <span
        role="button"
        tabIndex={0}
        aria-label={label}
        title={label}
        className={actionClass}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="size-4" />
      </span>
    </DropdownMenuTrigger>
  );
}

/**
 * Per-row hover actions. Shown inline: new file / new folder (directories
 * only). Everything else (reveal, rename, duplicate, delete) lives behind the
 * "..." overflow menu. Every action dispatches a command via {@link useCommands}.
 */
export function NodeActions({
  node,
  menuOpen,
  onMenuOpenChange,
}: {
  node: FileNode;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const { executeCommand } = useCommands();
  const { t, fmt } = useI18n();
  const isDir = node.type === "directory";
  // OS-conditional labels reuse t.common.os (Finder/Explorer, Trash/Recycle Bin)
  // rather than local constants, so all surfaces stay in sync.
  const revealLabel = _isWindows
    ? t.common.os.revealExplorer
    : t.common.os.revealLabel;
  const moveToTrashLabel = _isWindows
    ? t.common.os.moveToRecycleBinLabel
    : t.common.os.moveToTrashLabel;
  // Copy the file to the OS clipboard as a file reference. The bun-side command
  // takes an absolute path, so resolve the workspace-relative node path first.
  const copyToClipboard = async () => {
    try {
      const path = await localFs.realpath(node.path);
      executeCommand({ type: "copyFile", args: { path } });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };
  return (
    <span className="flex items-center gap-0.5">
      {isDir && (
        <>
          <IconAction
            label={fmt(t.fileTree.nodeActions.newFromExamplesIn, {
              name: node.name,
            })}
            onClick={() =>
              executeCommand({
                type: "openStartFromExample",
                args: { parent: node.path },
              })
            }
          >
            <FilePlus className="size-4" />
          </IconAction>
          <IconAction
            label={fmt(t.fileTree.nodeActions.newFolderIn, {
              name: node.name,
            })}
            onClick={() =>
              executeCommand({
                type: "newFolder",
                args: { parent: node.path },
              })
            }
          >
            <FolderPlus className="size-4" />
          </IconAction>
        </>
      )}
      <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
        <MoreActionsTrigger
          label={fmt(t.fileTree.nodeActions.moreActionsFor, {
            name: node.name,
          })}
        />
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onSelect={() =>
              executeCommand({ type: "revealFile", args: { path: node.path } })
            }
          >
            <FolderOpen />
            {revealLabel}
          </DropdownMenuItem>
          {!isDir && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() =>
                  executeCommand({
                    type: "shareThread",
                    args: { path: node.path },
                  })
                }
              >
                <Share2 />
                {t.fileTree.nodeActions.share}
              </DropdownMenuItem>
            </>
          )}
          {isDir && (
            <>
              <DropdownMenuItem
                onSelect={() =>
                  executeCommand({
                    type: "importFiles",
                    args: { parent: node.path },
                  })
                }
              >
                <Import />
                {t.fileTree.nodeActions.importFromFiles}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  executeCommand({
                    type: "importFromClipboard",
                    args: { parent: node.path },
                  })
                }
              >
                <ClipboardPaste />
                {t.fileTree.nodeActions.importFromClipboard}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          {!isDir && (
            <DropdownMenuItem onSelect={() => void copyToClipboard()}>
              <ClipboardCopy />
              {t.fileTree.nodeActions.copy}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() =>
              executeCommand({
                type: "duplicateFile",
                args: { path: node.path },
              })
            }
          >
            {isDir ? <FoldersIcon /> : <FilesIcon />}
            {t.fileTree.nodeActions.duplicate}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              executeCommand({ type: "renameFile", args: { path: node.path } })
            }
          >
            <TextCursorInput />
            {t.fileTree.nodeActions.rename}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() =>
              executeCommand({ type: "deleteFile", args: { path: node.path } })
            }
          >
            <Trash2 />
            {moveToTrashLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

/**
 * New file / new folder actions for the (row-less) storage root, with reveal
 * and refresh behind the "..." overflow menu. Every action dispatches a command
 * via {@link useCommands}.
 */
export function RootActions({
  menuOpen,
  onMenuOpenChange,
}: {
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const { executeCommand } = useCommands();
  const { t } = useI18n();
  const revealLabel = _isWindows
    ? t.common.os.revealExplorer
    : t.common.os.revealLabel;
  return (
    <span className="flex items-center gap-1">
      <IconAction
        label={t.fileTree.rootActions.newFromExamples}
        onClick={() =>
          executeCommand({
            type: "openStartFromExample",
            args: { parent: "" },
          })
        }
      >
        <FilePlus className="size-4" />
      </IconAction>
      <IconAction
        label={t.fileTree.rootActions.newFolderInRoot}
        onClick={() =>
          executeCommand({ type: "newFolder", args: { parent: "" } })
        }
      >
        <FolderPlus className="size-4" />
      </IconAction>
      <IconAction
        label={t.fileTree.rootActions.settings}
        onClick={() => executeCommand({ type: "openSettings", args: {} })}
      >
        <SettingsIcon className="size-4" />
      </IconAction>
      <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
        <MoreActionsTrigger label={t.fileTree.rootActions.moreActionsForRoot} />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() =>
              executeCommand({ type: "revealFile", args: { path: "" } })
            }
          >
            <FolderOpen />
            {revealLabel}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              executeCommand({ type: "importFiles", args: { parent: "" } })
            }
          >
            <Import />
            {t.fileTree.nodeActions.importFromFiles}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              executeCommand({
                type: "importFromClipboard",
                args: { parent: "" },
              })
            }
          >
            <ClipboardPaste />
            {t.fileTree.nodeActions.importFromClipboard}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => executeCommand({ type: "refreshTree", args: {} })}
          >
            <RefreshCw />
            {t.fileTree.rootActions.refresh}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
