/**
 * The canonical English message catalog. `en` is the source of truth for the
 * schema — every other locale mirrors it exactly and is type-checked against
 * the {@link Messages} type derived here.
 *
 * Area files are split per surface so parallel translation work can target one
 * file at a time. Add a new area by creating `./<area>.ts`, importing it here,
 * and adding the matching `zh` file under `../zh/`.
 */
import { enCommand } from "./command";
import { enCommandMeta } from "./command-meta";
import { enCommon } from "./common";
import { enFileTree } from "./file-tree";
import { enGithub } from "./github";
import { enLanding } from "./landing";
import { enMenu } from "./menu";
import { enOnboard } from "./onboard";
import { enSettings } from "./settings";
import { enShare } from "./share";
import { enTabs } from "./tabs";
import { enThread } from "./thread";
import { enTrace } from "./trace";
import { enUpdate } from "./update";
import { enViewer } from "./viewer";

export const enMessages = {
  common: enCommon,
  thread: enThread,
  settings: enSettings,
  onboard: enOnboard,
  command: enCommand,
  menu: enMenu,
  commandMeta: enCommandMeta,
  share: enShare,
  github: enGithub,
  update: enUpdate,
  fileTree: enFileTree,
  tabs: enTabs,
  trace: enTrace,
  landing: enLanding,
  viewer: enViewer,
};

/** The full message-tree type — every locale must satisfy this shape. */
export type Messages = typeof enMessages;
