"use client";

import { Boxes, SlidersHorizontal, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { GeneralPage } from "./general-page";
import { ModelsPage } from "./models-page";

const PAGES = [
  { value: "general", label: "General", icon: SlidersHorizontal, Page: GeneralPage },
  { value: "models", label: "Models", icon: Boxes, Page: ModelsPage },
] as const;

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[600px] max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <Tabs
          orientation="vertical"
          defaultValue="general"
          className="h-full gap-0"
        >
          <aside className="bg-muted/30 flex w-56 shrink-0 flex-col gap-2 border-r p-3">
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm">
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
            <TabsList className="h-fit w-full flex-col gap-0.5 bg-transparent p-0">
              {PAGES.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="w-full">
                  <Icon />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </aside>
          <div className="min-w-0 flex-1">
            {PAGES.map(({ value, Page }) => (
              <TabsContent key={value} value={value} className="h-full">
                <Page />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
