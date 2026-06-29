import type { Thread } from "@llm-space/core";

/** Maximum number of snapshots retained, including the current state. */
export const MAX_HISTORY = 100;

/**
 * Soft ceiling on the extra image payload that undo history may pin in memory:
 * base64 bytes of `image_data` that are no longer in the current thread but are
 * still referenced by an older snapshot. When exceeded, the oldest steps are
 * dropped until the retained payload is back under budget. Text-only editing
 * never approaches this — only heavy add/remove of large images does.
 *
 * Measured on base64 string length, which slightly over-estimates the decoded
 * image size (~1.33x), so the real retained bytes stay under this number.
 */
export const MAX_HISTORY_IMAGE_BYTES = 64 * 1024 * 1024;

/** Maximum number of run snapshots retained in `runHistory`. */
export const MAX_RUN_HISTORY = 20;

/**
 * Undo/redo history for a thread, kept separate from the thread object itself.
 *
 * `snapshots` holds successive thread *references* (not deep copies). Because the
 * store mutates the thread immutably (copy-on-write), unchanged substructure —
 * including base64 image content — is shared across snapshots, so the history
 * stays memory-cheap. Undo/redo is an O(1) pointer move.
 *
 * Invariant: `snapshots[index]` is always the current `state.thread`.
 */
export interface ChangeHistory {
  snapshots: Thread[];
  index: number;
}

export interface UndoRedoResult {
  history: ChangeHistory;
  thread: Thread;
}

export function createInitialHistory(thread: Thread): ChangeHistory {
  return { snapshots: [thread], index: 0 };
}

export function canUndo(history: ChangeHistory): boolean {
  return history.index > 0;
}

export function canRedo(history: ChangeHistory): boolean {
  return history.index < history.snapshots.length - 1;
}

/** The `image_data` content objects in a thread's user messages. */
function _imageContents(thread: Thread): { data: string }[] {
  const result: { data: string }[] = [];
  const messages = thread.context?.messages;
  if (!messages) {
    return result;
  }
  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }
    for (const content of message.content) {
      if (content.type === "image_data") {
        result.push(content);
      }
    }
  }
  return result;
}

/**
 * Approximate base64 bytes of image payloads referenced by an older snapshot but
 * no longer present in the current (newest) one — the extra memory the history
 * pins beyond what the live thread already holds. Images shared with the current
 * thread, or shared across snapshots, are counted at most once (by reference).
 */
function _retainedImageBytes(snapshots: Thread[]): number {
  const current = snapshots[snapshots.length - 1];
  if (current === undefined) {
    return 0;
  }
  const live = new Set<unknown>(_imageContents(current));

  const counted = new Set<unknown>();
  let bytes = 0;
  for (let i = 0; i < snapshots.length - 1; i++) {
    const snapshot = snapshots[i];
    if (snapshot === undefined) {
      continue;
    }
    for (const content of _imageContents(snapshot)) {
      if (!live.has(content) && !counted.has(content)) {
        counted.add(content);
        bytes += content.data.length;
      }
    }
  }
  return bytes;
}

/**
 * Record a new thread snapshot at the history tip, discarding any redo entries.
 * Trims the oldest steps to stay within {@link MAX_HISTORY} steps and, when
 * images are involved, within {@link MAX_HISTORY_IMAGE_BYTES} of pinned image
 * memory. No-ops when the thread is unchanged (same reference).
 */
export function recordSnapshot(
  history: ChangeHistory,
  next: Thread
): ChangeHistory {
  if (next === history.snapshots[history.index]) {
    return history;
  }
  const snapshots = history.snapshots.slice(0, history.index + 1);
  snapshots.push(next);
  // Cap by number of steps.
  if (snapshots.length > MAX_HISTORY) {
    snapshots.splice(0, snapshots.length - MAX_HISTORY);
  }
  // Cap the extra image memory pinned by history. Only runs while over budget
  // (i.e. heavy image churn); always keeps the current state + one undo step.
  while (
    snapshots.length > 2 &&
    _retainedImageBytes(snapshots) > MAX_HISTORY_IMAGE_BYTES
  ) {
    snapshots.shift();
  }
  return { snapshots, index: snapshots.length - 1 };
}

/** A snapshot of the thread captured when a run completed. */
export interface RunSnapshot {
  thread: Thread;
  /** Epoch milliseconds (`Date.now()`) when the run completed. */
  timestamp: number;
}

/**
 * Append a snapshot of a completed run, keeping only the most recent
 * {@link MAX_RUN_HISTORY}. The thread is stored by reference and shares unchanged
 * substructure with the live thread, so this stays cheap.
 */
export function recordRun(
  runHistory: RunSnapshot[],
  thread: Thread,
  timestamp: number
): RunSnapshot[] {
  const next = [...runHistory, { thread, timestamp }];
  return next.length > MAX_RUN_HISTORY
    ? next.slice(next.length - MAX_RUN_HISTORY)
    : next;
}

export function undo(history: ChangeHistory): UndoRedoResult | null {
  if (!canUndo(history)) {
    return null;
  }
  const index = history.index - 1;
  const thread = history.snapshots[index];
  if (thread === undefined) {
    return null;
  }
  return { history: { ...history, index }, thread };
}

export function redo(history: ChangeHistory): UndoRedoResult | null {
  if (!canRedo(history)) {
    return null;
  }
  const index = history.index + 1;
  const thread = history.snapshots[index];
  if (thread === undefined) {
    return null;
  }
  return { history: { ...history, index }, thread };
}
