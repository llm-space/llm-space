"use client";

import { useI18n } from "@llm-space/ui/i18n";
import { Dialog, DialogContent } from "@llm-space/ui/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@llm-space/ui/ui/tabs";
import {
  Boxes,
  Cable,
  CircleUser,
  FlaskConical,
  Network,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import type { SettingsTab } from "@/shared/commands";

import { AccountPage } from "./account-page";
import { ExperimentalPage } from "./experimental-page";
import { GeneralPage } from "./general-page";
import { McpPage } from "./mcp-page";
import { ModelsPage } from "./models-page";
import { NetworkPage } from "./network-page";
import { SearchPage } from "./search-page";
import { SkillsPage } from "./skills-page";

const PAGES = [
  {
    value: "general",
    labelKey: "general",
    icon: SlidersHorizontal,
    Page: GeneralPage,
  },
  { value: "account", labelKey: "account", icon: CircleUser, Page: AccountPage },
  { value: "models", labelKey: "models", icon: Boxes, Page: ModelsPage },
  { value: "mcp", labelKey: "mcp", icon: Cable, Page: McpPage },
  { value: "network", labelKey: "network", icon: Network, Page: NetworkPage },
  { value: "search", labelKey: "search", icon: Search, Page: SearchPage },
  { value: "skills", labelKey: "skills", icon: Sparkles, Page: SkillsPage },
  {
    value: "experimental",
    labelKey: "experimental",
    icon: FlaskConical,
    Page: ExperimentalPage,
  },
] as const;

export function SettingsDialog({
  open,
  onOpenChange,
  tab,
  onTabChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl! gap-0 p-0"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
      >
        <Tabs
          className="h-[75vh] w-full gap-0"
          orientation="vertical"
          value={tab}
          onValueChange={(value) => onTabChange(value as SettingsTab)}
        >
          <aside className="bg-muted/30 flex w-50 shrink-0 flex-col gap-2 border-r p-3">
            <header>
              <div className="text-base font-medium">
                {t.settings.dialog.title}
              </div>
            </header>
            <TabsList className="h-fit w-full flex-col gap-0.5 bg-transparent p-0">
              {PAGES.map(({ value, labelKey, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="w-full">
                  <Icon />
                  {t.settings.dialog[labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
          </aside>
          <div className="min-w-0 grow">
            {PAGES.map(({ value, Page }) => (
              <TabsContent key={value} value={value} className="size-full">
                <Page />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
