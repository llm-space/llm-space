import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { LocalFileSystem } from "@llm-space/core/server";

import { env } from "@/env";

const home = env.LLM_SPACE_HOME ?? path.join(os.homedir(), ".llm-space");
const root = path.join(home, "workspace");

// Ensure the storage root exists so a fresh install works out of the box.
mkdirSync(root, { recursive: true });

/** The shared local storage backend behind `/api/fs/local/*`. */
export const localFs = new LocalFileSystem(root);
