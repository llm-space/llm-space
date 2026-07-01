"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";

import { useModels, useRemoveProvider } from "../model-provider";
import { ScrollArea } from "../ui/scroll-area";

import { SettingsPage } from "./settings-page";

export function ModelsPage() {
  const providers = useModels();
  const removeProvider = useRemoveProvider();
  const [providerToRemove, setProviderToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <SettingsPage className="flex size-full" title="Models">
      <div className="flex size-full flex-col">
        <div></div>
        <ScrollArea className="flex h-full min-h-0 grow scroll-auto rounded-xl border">
          <Accordion
            className="w-full px-4"
            type="multiple"
            defaultValue={providers.map((provider) => provider.id)}
          >
            {providers.map((provider) => (
              <AccordionItem key={provider.id} value={provider.id}>
                <AccordionTrigger chevronPosition="left">
                  <div className="flex size-full justify-between">
                    <div>{provider.name}</div>
                    <div className="pr-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span aria-label="More actions">
                              <MoreHorizontal className="size-4" />
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem>Enable All Models</DropdownMenuItem>
                          <DropdownMenuItem>
                            Disable All Models
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => {
                              setProviderToRemove({
                                id: provider.id,
                                name: provider.name,
                              });
                            }}
                          >
                            Remove {`"` + provider.name + `"`}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1">
                  {provider.models.map((model) => (
                    <Item key={model.id} variant="muted" size="sm">
                      <ItemContent>
                        <ItemTitle className="font-mono">
                          {model.name}
                        </ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <Switch defaultChecked />
                      </ItemActions>
                    </Item>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>

      <ConfirmDialog
        open={!!providerToRemove}
        onOpenChange={(open) => {
          if (!open) setProviderToRemove(null);
        }}
        title={
          <>
            Remove &ldquo;{providerToRemove?.name}&rdquo;?
          </>
        }
        description="This provider will be removed from your configured models."
        confirmLabel="Remove"
        onConfirm={() => {
          const target = providerToRemove;
          setProviderToRemove(null);
          if (target) {
            void removeProvider(target.id);
          }
        }}
      />
    </SettingsPage>
  );
}
