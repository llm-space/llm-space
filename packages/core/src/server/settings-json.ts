import {
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
  type PathLike,
} from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

export async function readJsonFileWithRecovery<T>(
  filePath: string,
  fallback: T
): Promise<T> {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text) as T;
  } catch (error) {
    if (_isMissingFile(error)) {
      await _writeJsonFile(filePath, fallback);
      return fallback;
    }
    if (error instanceof SyntaxError) {
      await _backupInvalidFile(filePath);
      await _writeJsonFile(filePath, fallback);
      return fallback;
    }
    throw error;
  }
}

export function readJsonFileWithRecoverySync<T>(
  filePath: string,
  fallback: T
): T {
  try {
    const text = readFileSync(filePath, "utf8");
    return JSON.parse(text) as T;
  } catch (error) {
    if (_isMissingFile(error)) {
      _writeJsonFileSync(filePath, fallback);
      return fallback;
    }
    if (error instanceof SyntaxError) {
      _backupInvalidFileSync(filePath);
      _writeJsonFileSync(filePath, fallback);
      return fallback;
    }
    throw error;
  }
}

async function _writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function _writeJsonFileSync<T>(filePath: string, data: T): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function _backupInvalidFile(filePath: string): Promise<void> {
  await fs.rename(filePath, _invalidBackupPath(filePath));
}

function _backupInvalidFileSync(filePath: string): void {
  renameSync(filePath, _invalidBackupPath(filePath));
}

function _invalidBackupPath(filePath: string): PathLike {
  return `${filePath}.invalid-${Date.now()}`;
}

function _isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
