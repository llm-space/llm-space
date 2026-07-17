import {
  normalizeThread,
  type ReadableThreadStorage,
  type SharedThread,
  type SharedThreadSource,
  type Thread,
  type ThreadConnector,
  type ThreadLocator,
} from "@llm-space/core";

import sampleThreadRaw from "./sample-thread.json?raw";

/**
 * Dev-only offline fixture. Visiting `#/shared/gist/threads/mock` serves this
 * bundled sample thread with **no** GitHub API call — handy for developing the
 * viewer while rate-limited or offline. Wired in `app.tsx` only under
 * `import.meta.env.DEV`, so it never ships to production.
 */
export const MOCK_THREAD_ID = "mock";

const FILENAME = "general-agent-with-vision.json";

function mockShared(connectorId: string): SharedThread {
  const thread = normalizeThread(JSON.parse(sampleThreadRaw) as Thread);
  return {
    thread,
    meta: {
      connectorId,
      threadId: MOCK_THREAD_ID,
      filename: FILENAME,
      title: thread.title,
      description: "General Agent with Vision",
      author: {
        name: "MagicCube",
        avatarUrl: "https://avatars.githubusercontent.com/u/1003147?v=4",
        profileUrl: "https://github.com/MagicCube",
      },
      createdAt: "2026-07-17T09:04:14Z",
      updatedAt: "2026-07-17T10:00:00Z",
    },
  };
}

/**
 * Wrap a connector so threadId `"mock"` resolves to the bundled fixture, while
 * every other id delegates to the real storage.
 */
export function withMockThread(connector: ThreadConnector): ThreadConnector {
  const base = connector.storage;
  const storage: ReadableThreadStorage & SharedThreadSource = {
    resolveLatest: (id: string): Promise<ThreadLocator> =>
      id === MOCK_THREAD_ID
        ? Promise.resolve({ id, filename: FILENAME })
        : base.resolveLatest(id),
    read: (locator: ThreadLocator): Promise<Thread> =>
      locator.id === MOCK_THREAD_ID
        ? Promise.resolve(mockShared(connector.connectorId).thread)
        : base.read(locator),
    readShared: (threadId: string): Promise<SharedThread> =>
      threadId === MOCK_THREAD_ID
        ? Promise.resolve(mockShared(connector.connectorId))
        : (base as unknown as SharedThreadSource).readShared(threadId),
  };
  return { connectorId: connector.connectorId, storage };
}
