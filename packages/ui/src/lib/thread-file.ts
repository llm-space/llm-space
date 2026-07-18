import { normalizeThread, type Thread } from "@llm-space/core";

const THREAD_FILE_EXTENSION = ".json";
const INVALID_FILE_STEM_CHARS = /[<>:"/\\|?*]/;
const RESERVED_WINDOWS_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/**
 * A stable identifier for each validation failure, so consumers can resolve a
 * localized message from the i18n catalog (`t.thread.errors.*`) instead of
 * showing the English {@link FileStemValidationResult.error} fallback.
 */
export type FileStemErrorCode =
  | "required"
  | "dotOrDotDot"
  | "reservedChar"
  | "reservedByWindows"
  | "trailingPeriodOrSpace";

export interface FileStemValidationResult {
  valid: boolean;
  value: string;
  /** English fallback message (non-React consumers). Prefer {@link errorCode} + i18n in React. */
  error?: string;
  /** Stable failure id — resolve via `t.thread.errors[errorCode]` in React UI. */
  errorCode?: FileStemErrorCode;
}

export function basename(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? path : path.slice(i + 1);
}

export function parentOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

export function joinPath(parent: string, name: string): string {
  return parent ? `${parent}/${name}` : name;
}

export function ensureJson(name: string): string {
  return name.endsWith(THREAD_FILE_EXTENSION)
    ? name
    : `${name}${THREAD_FILE_EXTENSION}`;
}

export function threadFileNameFromTitle(title: string): string {
  return `${title.trim()}${THREAD_FILE_EXTENSION}`;
}

export function stripThreadExtension(name: string): string {
  return name.endsWith(THREAD_FILE_EXTENSION)
    ? name.slice(0, -THREAD_FILE_EXTENSION.length)
    : name;
}

export function threadTitleFromPath(path: string): string {
  return stripThreadExtension(basename(path));
}

export function normalizeThreadForPath(thread: Thread, path: string): Thread {
  const normalizedThread = normalizeThread(thread);
  const title = threadTitleFromPath(path);
  return normalizedThread.title === title
    ? normalizedThread
    : { ...normalizedThread, title };
}

export function threadPathForTitle(currentPath: string, title: string): string {
  return joinPath(parentOf(currentPath), threadFileNameFromTitle(title));
}

/**
 * A collision-free `.json` file name for `stem` within a directory whose
 * existing names are `existing`: `stem.json`, then `stem-1.json`,
 * `stem-2.json`, … (mirrors the tree's `untitled` / `untitled-1` scheme, but
 * with a caller-supplied stem — used when importing files).
 */
export function uniqueThreadFileName(
  existing: Set<string>,
  stem: string
): string {
  const first = ensureJson(stem);
  if (!existing.has(first)) return first;
  let n = 1;
  while (existing.has(`${stem}-${n}${THREAD_FILE_EXTENSION}`)) n++;
  return `${stem}-${n}${THREAD_FILE_EXTENSION}`;
}

/**
 * Derive a thread-file stem from an imported file's name: the basename minus
 * its final extension, if it is a valid file stem; otherwise `"untitled"`.
 */
export function importStemFromFileName(fileName: string): string {
  const stem = basename(fileName).replace(/\.[^.]+$/, "");
  return validateThreadFileStem(stem).valid ? stem.trim() : "untitled";
}

export function validateThreadFileStem(
  value: string
): FileStemValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      valid: false,
      value: trimmed,
      error: "File name is required.",
      errorCode: "required",
    };
  }
  if (trimmed === "." || trimmed === "..") {
    return {
      valid: false,
      value: trimmed,
      error: "File name cannot be . or ..",
      errorCode: "dotOrDotDot",
    };
  }
  if (
    INVALID_FILE_STEM_CHARS.test(trimmed) ||
    [...trimmed].some((char) => char.charCodeAt(0) < 32)
  ) {
    return {
      valid: false,
      value: trimmed,
      error: "File name contains a reserved character.",
      errorCode: "reservedChar",
    };
  }
  if (RESERVED_WINDOWS_NAMES.test(trimmed)) {
    return {
      valid: false,
      value: trimmed,
      error: "File name is reserved by Windows.",
      errorCode: "reservedByWindows",
    };
  }
  if (trimmed.endsWith(".") || trimmed.endsWith(" ")) {
    return {
      valid: false,
      value: trimmed,
      error: "File name cannot end with a period or space.",
      errorCode: "trailingPeriodOrSpace",
    };
  }
  return { valid: true, value: trimmed };
}
