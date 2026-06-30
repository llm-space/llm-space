"use client";

import type { FileNode } from "@llm-space/core";
import { MessagesSquare } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  TreeView,
  type TreeDataItem,
  type TreeRenderItemParams,
} from "@/components/tree-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { electrobun } from "@/lib/electrobun";
import { useFullScreen } from "@/lib/use-full-screen";
import { cn } from "@/lib/utils";

import { NodeActions, RootActions } from "./node-actions";
import {
  basename,
  ensureJson,
  parentOf,
  useFileSystemTree,
} from "./use-file-system-tree";

/** What the OS calls its trash, for the delete-confirmation copy. */
const TRASH_NAME =
  typeof navigator !== "undefined" && /Win/i.test(navigator.userAgent)
    ? "Recycle Bin"
    : "Trash";

export function FileSystemTreeView({
  className,
  onSelectFile,
  onRemove,
  onMove,
  onSettings = () => void 0,
  registerNewThread,
}: {
  className?: string;
  /** Fired with a file's path when it is selected (folders aren't selectable). */
  onSelectFile?: (path: string) => void;
  /** Fired with a path after it (file or directory) is successfully deleted. */
  onRemove?: (path: string) => void;
  /** Fired after a path changes via rename or move (`from` → `to`). */
  onMove?: (from: string, to: string) => void;
  onSettings?: () => void;
  /** Hand the parent the "new thread at root" trigger (e.g. for a toolbar button). */
  registerNewThread?: (fn: () => void) => void;
}) {
  const fullScreen = useFullScreen();
  const {
    nodesByPath,
    loadingByPath,
    isRootLoading,
    expanded,
    toggle,
    expand,
    refresh,
    createFolder,
    createFile,
    remove,
    duplicate,
    reveal,
    move,
    rename,
  } = useFileSystemTree();

  const [renaming, setRenaming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  // Path of a just-created node we want to expand-to, scroll to, and rename
  // once its parent's listing has loaded.
  const [pendingReveal, setPendingReveal] = useState<string | null>(null);
  // Path of a just-created *file* whose create flow ends with the in-place
  // rename. Once that rename concludes we open it in a tab (folders excluded).
  const [pendingOpen, setPendingOpen] = useState<string | null>(null);
  // Node to select in the tree, driven programmatically (e.g. revealing a
  // freshly created file once its rename completes).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Path of a thread created via the "New Thread" menu: revealed (selected +
  // opened + scrolled to) once its listing loads, but never renamed.
  const [pendingThread, setPendingThread] = useState<string | null>(null);
  // Path of a just-duplicated node: selected + scrolled to once its listing
  // loads (no rename, no tab — works for both files and folders).
  const [pendingDuplicate, setPendingDuplicate] = useState<string | null>(null);

  // Open a freshly created file in a tab and select its node in the tree.
  function revealCreatedFile(path: string) {
    setSelectedId(path);
    onSelectFile?.(path);
  }

  // "New Thread" menu command (over RPC from the bun process): create an
  // auto-named thread at the workspace root, no in-place rename.
  const createThread = useCallback(async () => {
    const path = await createFile("");
    if (path) setPendingThread(path);
  }, [createFile]);

  // Expose the trigger to the parent (the tab bar's "New file" button).
  useEffect(() => {
    registerNewThread?.(() => void createThread());
  }, [registerNewThread, createThread]);

  useEffect(() => {
    const rpc = electrobun.rpc;
    if (!rpc) return;
    const onNewThread = () => void createThread();
    rpc.addMessageListener("newThread", onNewThread);
    return () => rpc.removeMessageListener("newThread", onNewThread);
  }, [createThread]);

  // Once the new thread shows up in its parent's listing, reveal it (select +
  // open + scroll), skipping the rename step the tree's own create flow uses.
  useEffect(() => {
    if (!pendingThread) return;
    const siblings = nodesByPath.get(parentOf(pendingThread));
    if (!siblings?.some((n) => n.path === pendingThread)) return;
    const path = pendingThread;
    setSelectedId(path);
    onSelectFile?.(path);
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-tree-id="${CSS.escape(path)}"]`)
        ?.scrollIntoView({ block: "nearest" });
    });
    setPendingThread(null);
  }, [pendingThread, nodesByPath, onSelectFile]);

  async function duplicateNode(path: string) {
    const dest = await duplicate(path);
    if (!dest) return;
    const parent = parentOf(dest);
    if (parent !== "") expand(parent);
    setPendingDuplicate(dest);
  }

  // Once the copy shows up in its parent's listing, select + scroll to it.
  useEffect(() => {
    if (!pendingDuplicate) return;
    const siblings = nodesByPath.get(parentOf(pendingDuplicate));
    if (!siblings?.some((n) => n.path === pendingDuplicate)) return;
    const path = pendingDuplicate;
    setSelectedId(path);
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-tree-id="${CSS.escape(path)}"]`)
        ?.scrollIntoView({ block: "nearest" });
    });
    setPendingDuplicate(null);
  }, [pendingDuplicate, nodesByPath]);

  async function create(parent: string, kind: "file" | "folder") {
    const path =
      kind === "file" ? await createFile(parent) : await createFolder(parent);
    if (!path) return;
    if (parent !== "") expand(parent);
    setPendingReveal(path);
    if (kind === "file") setPendingOpen(path);
  }

  // When the new node's parent listing contains it, reveal + rename it.
  useEffect(() => {
    if (!pendingReveal) return;
    const siblings = nodesByPath.get(parentOf(pendingReveal));
    if (!siblings?.some((n) => n.path === pendingReveal)) return;
    setRenaming(pendingReveal);
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-tree-id="${CSS.escape(pendingReveal)}"]`)
        ?.scrollIntoView({ block: "nearest" });
    });
    setPendingReveal(null);
  }, [pendingReveal, nodesByPath]);

  const data = useMemo<TreeDataItem[]>(() => {
    const toItem = (node: FileNode): TreeDataItem => {
      const actions = (
        <NodeActions
          node={node}
          onNewFile={(n) => void create(n.path, "file")}
          onNewFolder={(n) => void create(n.path, "folder")}
          onReveal={(n) => void reveal(n.path)}
          onRename={(n) => startRename(n)}
          onDuplicate={(n) => void duplicateNode(n.path)}
          onDelete={(n) => setDeleting(n.path)}
        />
      );
      if (node.type === "directory") {
        const open = expanded.has(node.path);
        // Empty array stays truthy so the directory still renders an expand
        // chevron while its listing loads.
        const children =
          open && nodesByPath.has(node.path) ? build(node.path) : [];
        return {
          id: node.path,
          name: node.name,
          draggable: true,
          droppable: true,
          onClick: () => toggle(node.path),
          // While renaming, render as a leaf (a div) instead of an accordion
          // trigger (a button) so the input's keys (Space/Enter) don't toggle
          // the node. A renamed folder is always collapsed first (see
          // startRename), so there is nothing hidden by dropping its children.
          children: renaming === node.path ? undefined : children,
          actions,
          loading: open && loadingByPath.has(node.path),
        };
      }
      return {
        id: node.path,
        name: node.name.replace(/\.json$/, ""),
        icon: MessagesSquare,
        draggable: true,
        droppable: false,
        actions,
      };
    };

    // Only directories and *.json files are shown in the tree.
    const build = (dirPath: string): TreeDataItem[] =>
      (nodesByPath.get(dirPath) ?? [])
        .filter(
          (node) => node.type === "directory" || node.name.endsWith(".json")
        )
        .map(toItem);

    return build("");
  }, [
    nodesByPath,
    loadingByPath,
    expanded,
    toggle,
    remove,
    renaming,
    createFile,
    createFolder,
  ]);

  function startRename(node: FileNode) {
    // Collapse a folder before renaming so it remounts consistently afterwards
    // (the row is rendered as a leaf while editing).
    if (node.type === "directory" && expanded.has(node.path)) toggle(node.path);
    setRenaming(node.path);
  }

  function onDocumentDrag(source: TreeDataItem, target: TreeDataItem) {
    // Only directories and the root drop-zone are droppable, so the target is
    // always a directory ("" = root).
    void move(source.id, target.id).then((to) => {
      if (to) onMove?.(source.id, to);
    });
  }

  function renderItem(p: TreeRenderItemParams) {
    const isRenaming = renaming === p.item.id;
    // Files carry an icon; folders don't (chevron only). Keyed off the item, not
    // `isLeaf`, since a folder is rendered as a leaf while being renamed.
    const Icon = p.item.icon;
    return (
      <>
        {Icon && <Icon className="mr-2 h-4 w-4 shrink-0 text-[#64a4f2]" />}
        {isRenaming ? (
          <RenameInput
            initial={p.item.name}
            onCancel={() => {
              setRenaming(null);
              // Create flow cancelled: the file already exists at its untitled
              // path, so reveal it as-is.
              if (pendingOpen === p.item.id) {
                setPendingOpen(null);
                revealCreatedFile(p.item.id);
              }
            }}
            onConfirm={(value) => {
              const base = value.trim();
              setRenaming(null);
              const from = p.item.id;
              const openAfter = pendingOpen === from;
              if (openAfter) setPendingOpen(null);
              if (base && base !== p.item.name) {
                // `Icon` is only set on files, so it distinguishes file vs
                // folder even while the row is rendered as a leaf for renaming.
                void rename(from, Icon ? ensureJson(base) : base).then((to) => {
                  if (to) {
                    onMove?.(from, to);
                    if (openAfter) revealCreatedFile(to);
                  } else if (openAfter) {
                    // Rename was a no-op/failed; the file still lives at `from`.
                    revealCreatedFile(from);
                  }
                });
              } else if (openAfter) {
                // Name left unchanged: reveal the created file at its path.
                revealCreatedFile(from);
              }
            }}
          />
        ) : (
          <span className="min-w-0 grow truncate text-left text-sm">
            {p.item.name}
          </span>
        )}
        {!isRenaming && (
          <div className="ml-1 hidden shrink-0 group-hover:flex has-data-[state=open]:flex">
            {p.item.actions}
          </div>
        )}
      </>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <header className="text-muted-foreground electrobun-webkit-app-region-drag flex h-11.5 items-center justify-between px-3 text-xs font-medium">
        <span className={cn(fullScreen ? "opacity-100" : "opacity-0")}>
          LLM Space 4
        </span>
        <span>
          <RootActions
            onNewFile={() => void create("", "file")}
            onNewFolder={() => void create("", "folder")}
            onSettings={onSettings}
            onReveal={() => void reveal("")}
            onRefresh={refresh}
          />
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {isRootLoading ? (
          <div className="flex items-center justify-center p-4">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyTitle>No Threads Yet</EmptyTitle>
              <EmptyDescription>
                Create a thread to get started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <TreeView
            data={data}
            expandedIds={[...expanded]}
            selectedId={selectedId}
            renderItem={renderItem}
            onDocumentDrag={onDocumentDrag}
            onSelectChange={(item) => {
              if (item) onSelectFile?.(item.id);
            }}
          />
        )}
      </div>

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Move &ldquo;
              {deleting ? basename(deleting).replace(/\.json$/, "") : ""}
              &rdquo; to the {TRASH_NAME}?
            </DialogTitle>
            <DialogDescription>
              You can restore it from the {TRASH_NAME} later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const path = deleting;
                setDeleting(null);
                if (path)
                  void remove(path).then((ok) => {
                    if (ok) onRemove?.(path);
                  });
              }}
            >
              Move to {TRASH_NAME}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** In-place rename input: Enter confirms, Esc / blur cancels. */
function RenameInput({
  initial,
  onConfirm,
  onCancel,
}: {
  initial: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <input
      autoFocus
      value={value}
      className="ring-border bg-background text-foreground focus-visible:ring-ring/50 box-border h-5 w-full min-w-0 grow rounded px-1 text-sm leading-none ring-1 outline-none ring-inset focus-visible:ring-2"
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={onCancel}
      onKeyDown={(e) => {
        // Stop the accordion trigger (this input lives inside its button) from
        // reacting to keys like Space/Enter that would toggle the node.
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          onConfirm(value);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
    />
  );
}
