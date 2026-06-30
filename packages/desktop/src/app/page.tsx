import { useCallback, useEffect, useRef, useState } from "react";
import { usePanelRef } from "react-resizable-panels";

import { FileSystemTreeView } from "@/components/file-system-tree-view";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { ThreadTabs, useThreadTabs } from "@/components/thread-tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Welcome } from "@/components/welcome";
import { electrobun } from "@/lib/electrobun";
import { useFullScreen } from "@/lib/use-full-screen";

export function Page() {
  const tabs = useThreadTabs();

  // Bridge the native File-menu commands (sent over RPC from the bun process)
  // into the tab state. `close`/`closeAll` are stable; the latest active tab is
  // read through a ref so the listener never goes stale.
  const activePathRef = useRef(tabs.activePath);
  activePathRef.current = tabs.activePath;
  const { close, closeOthers, closeAll, reopenClosed } = tabs;
  useEffect(() => {
    const rpc = electrobun.rpc;
    if (!rpc) return;
    const onCloseActiveTab = () => {
      if (activePathRef.current) close(activePathRef.current);
    };
    const onCloseOtherTabs = () => {
      if (activePathRef.current) closeOthers(activePathRef.current);
    };
    const onCloseAllTabs = () => closeAll();
    const onReopenClosedTabs = () => void reopenClosed();
    rpc.addMessageListener("closeActiveTab", onCloseActiveTab);
    rpc.addMessageListener("closeOtherTabs", onCloseOtherTabs);
    rpc.addMessageListener("closeAllTabs", onCloseAllTabs);
    rpc.addMessageListener("reopenClosedTabs", onReopenClosedTabs);
    return () => {
      rpc.removeMessageListener("closeActiveTab", onCloseActiveTab);
      rpc.removeMessageListener("closeOtherTabs", onCloseOtherTabs);
      rpc.removeMessageListener("closeAllTabs", onCloseAllTabs);
      rpc.removeMessageListener("reopenClosedTabs", onReopenClosedTabs);
    };
  }, [close, closeOthers, closeAll, reopenClosed]);

  // The "New file" tab button reuses the tree's create-thread flow: the tree
  // registers it here, and the button (and ⌘N menu) trigger the same handler.
  const newThreadRef = useRef<(() => void) | null>(null);
  const registerNewThread = useCallback((fn: () => void) => {
    newThreadRef.current = fn;
  }, []);
  const handleNewFile = useCallback(() => newThreadRef.current?.(), []);

  // Collapse / expand the left side panel from the title-bar button.
  const sidebarPanelRef = usePanelRef();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => {
    const panel = sidebarPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, [sidebarPanelRef]);

  // The View > Toggle Sidebar menu (⌘B) drives the same toggle over RPC.
  useEffect(() => {
    const rpc = electrobun.rpc;
    if (!rpc) return;
    rpc.addMessageListener("toggleSidebar", toggleSidebar);
    return () => rpc.removeMessageListener("toggleSidebar", toggleSidebar);
  }, [toggleSidebar]);

  const fullScreen = useFullScreen();

  // The app-menu "Settings..." command opens the Settings dialog over RPC.
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    const rpc = electrobun.rpc;
    if (!rpc) return;
    const onOpenSettings = () => setSettingsOpen(true);
    rpc.addMessageListener("openSettings", onOpenSettings);
    return () => rpc.removeMessageListener("openSettings", onOpenSettings);
  }, []);

  return (
    <div className="flex size-full flex-col">
      <main className="min-h-0 grow">
        <ResizablePanelGroup>
          <ResizablePanel
            panelRef={sidebarPanelRef}
            collapsible
            collapsedSize={0}
            defaultSize="16.7%"
            minSize={200}
            onResize={(size) => setSidebarOpen(size.inPixels > 0)}
          >
            <FileSystemTreeView
              className="size-full"
              registerNewThread={registerNewThread}
              onSelectFile={tabs.open}
              onRemove={tabs.handleRemove}
              onMove={tabs.handleMove}
              onSettings={() => setSettingsOpen(true)}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={640}>
            {tabs.tabs.length === 0 ? (
              <Welcome onNewFile={handleNewFile} />
            ) : (
              <ThreadTabs
                tabs={tabs.tabs}
                activePath={tabs.activePath}
                activate={tabs.activate}
                sidebarOpen={sidebarOpen}
                fullScreen={fullScreen}
                close={tabs.close}
                reorder={tabs.reorder}
                onNewFile={handleNewFile}
                onToggleSidebar={toggleSidebar}
              />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
