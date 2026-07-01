import { mkdirSync } from "node:fs";
import path from "node:path";

import { getLlmSpaceRoot, LocalFileSystem } from "@llm-space/core/server";

const root = path.join(getLlmSpaceRoot(), "workspace");

// Ensure the storage root exists so a fresh install works out of the box.
mkdirSync(root, { recursive: true });

/** The shared local storage backend behind the `fs*` RPC requests. */
export const localFs = new LocalFileSystem(root);
