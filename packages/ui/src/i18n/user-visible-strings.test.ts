import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../../../..");

const FORBIDDEN_STRINGS = [
  {
    file: "packages/ui/src/components/firecrawl-limit-dialog.tsx",
    strings: [
      "Firecrawl daily limit reached",
      "Configure API key",
      "Not now",
    ],
  },
  {
    file: "packages/ui/src/components/thread-playground/stores/thread-store.ts",
    strings: [
      "Auto-run paused for a risky command",
      "A bash command looked destructive, so it wasn't run automatically.",
      "Select a model to run",
      "Variable name already exists",
      "Unable to render prompt variables",
    ],
  },
  {
    file: "apps/web/src/landing/components/ui/screenshot-carousel.tsx",
    strings: [
      "LLM Space product screenshots",
      "Show slide",
      "Previous screenshot",
      "Next screenshot",
    ],
  },
  {
    file: "apps/desktop/src/components/settings/settings-dialog.tsx",
    strings: ["Settings", "General", "Account", "Models", "Network"],
  },
  {
    file: "apps/desktop/src/components/settings/general-page.tsx",
    strings: [
      "Appearance",
      "Theme",
      "Primary color",
      "Rendering",
      "Default model",
      "Data & privacy",
      "Software updates",
      "Check now",
    ],
  },
  {
    file: "apps/desktop/src/components/settings/account-page.tsx",
    strings: [
      "Sign in with GitHub",
      "Not signed in",
      "Waiting for GitHub authorization",
      "Sign out",
    ],
  },
  {
    file: "apps/desktop/src/components/settings/network-page.tsx",
    strings: [
      "Enable proxy",
      "Use system proxy",
      "Bypass list",
      "No system proxy detected",
    ],
  },
  {
    file: "apps/desktop/src/components/settings/search-page.tsx",
    strings: [
      "Search provider",
      "Failed to save search settings",
      "Values starting with",
    ],
  },
  {
    file: "apps/desktop/src/components/settings/skills-page.tsx",
    strings: [
      "Add folder",
      "No folders yet",
      "Enable all skills",
      "Disable all skills",
      "Remove folder?",
      "Loading skills",
    ],
  },
  {
    file: "apps/desktop/src/components/settings/experimental-page.tsx",
    strings: ["Experimental", "Tracing", "Reload to apply?", "Later"],
  },
] as const;

describe("user-visible i18n coverage", () => {
  for (const target of FORBIDDEN_STRINGS) {
    test(`${target.file} does not keep audited English UI strings inline`, () => {
      const source = readFileSync(join(ROOT, target.file), "utf8");
      const searchableText = _extractUserVisibleText(source).join("\n");
      for (const text of target.strings) {
        expect(searchableText).not.toContain(text);
      }
    });
  }
});

function _extractUserVisibleText(source: string): string[] {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  const strings = [
    ...withoutComments.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g),
  ].map((match) => match[2] ?? "");
  const jsxText = [...withoutComments.matchAll(/>([^<>{}][^<>{}]*)</g)].map(
    (match) => (match[1] ?? "").replace(/\s+/g, " ").trim()
  );
  return [...strings, ...jsxText].filter(Boolean);
}
