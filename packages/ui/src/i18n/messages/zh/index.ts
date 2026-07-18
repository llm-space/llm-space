/**
 * 简体中文消息目录。每个区域文件声明为 `typeof enXxx`，因此 TypeScript 会
 * 强制 zh 与 en 的 schema 完全一致——缺键、多余键、或类型不符都会报错。
 * 新增区域时，先在 `en/index.ts` 加入，再在此处加对应的 zh 文件。
 */
import type { Messages } from "../en";

import { zhCommand } from "./command";
import { zhCommandMeta } from "./command-meta";
import { zhCommon } from "./common";
import { zhFileTree } from "./file-tree";
import { zhGithub } from "./github";
import { zhLanding } from "./landing";
import { zhMenu } from "./menu";
import { zhOnboard } from "./onboard";
import { zhSettings } from "./settings";
import { zhShare } from "./share";
import { zhTabs } from "./tabs";
import { zhThread } from "./thread";
import { zhTrace } from "./trace";
import { zhUpdate } from "./update";
import { zhViewer } from "./viewer";

export const zhMessages: Messages = {
  common: zhCommon,
  thread: zhThread,
  settings: zhSettings,
  onboard: zhOnboard,
  command: zhCommand,
  menu: zhMenu,
  commandMeta: zhCommandMeta,
  share: zhShare,
  github: zhGithub,
  update: zhUpdate,
  fileTree: zhFileTree,
  tabs: zhTabs,
  trace: zhTrace,
  landing: zhLanding,
  viewer: zhViewer,
};
