"use client";

import { Boxes, SlidersHorizontal, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { GeneralPage } from "./general-page";
import { ModelsPage } from "./models-page";

const PAGES = [
  {
    value: "general",
    label: "General",
    icon: SlidersHorizontal,
    Page: GeneralPage,
  },
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
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-3xl">
        <Tabs
          className="h-[600px] gap-0"
          orientation="vertical"
          defaultValue="general"
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
