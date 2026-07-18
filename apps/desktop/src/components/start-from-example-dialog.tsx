"use client";


import { Markdown } from "@llm-space/ui/components/markdown";
import {
  PROMPT_EXAMPLES,
  isPromptExample,
  type PromptExample,
} from "@llm-space/ui/components/thread-playground/examples/prompts";
import { useI18n } from "@llm-space/ui/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@llm-space/ui/ui/dialog";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@llm-space/ui/ui/item";
import { ScrollArea } from "@llm-space/ui/ui/scroll-area";
import { SparklesIcon } from "lucide-react";



export function StartFromExampleDialog({
  open,
  onOpenChange,
  onSelectExample,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExample: (example: PromptExample) => void;
}) {
  const { t } = useI18n();
  const selectExample = (example: PromptExample) => {
    onOpenChange(false);
    onSelectExample(example);
  };

  // Resolve a prompt example's localized label/description from the i18n catalog
  // by its stable `id` (kebab-case → camelCase suffix). `prompts.ts` is a data
  // module (not React), so it can't call useI18n — the catalog holds the
  // translations keyed by id. Falls back to the example's own English fields.
  // The `misc` subtree is indexed dynamically (the `exampleLabel_*` /
  // `exampleDescription_*` keys are an open set keyed by example id), so a
  // `Record<string, string>` view is the correct access shape here.
  const misc = t.thread.misc as unknown as Record<string, string>;
  const labelFor = (example: PromptExample): string => {
    const key = `exampleLabel_${_kebabToCamel(example.id)}`;
    return misc[key] ?? example.label;
  };
  const descriptionFor = (example: PromptExample): string => {
    const key = `exampleDescription_${_kebabToCamel(example.id)}`;
    return misc[key] ?? example.description;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl! overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-3.5" /> {t.tabs.startExample.title}
          </DialogTitle>
          <DialogDescription className="pl-5.5">
            {t.tabs.startExample.description}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <ItemGroup className="gap-1 pr-3">
            {PROMPT_EXAMPLES.map((item, index) => {
              if (!isPromptExample(item)) {
                return <ItemSeparator key={`sep-${index}`} className="my-1" />;
              }
              const Icon = item.icon;
              return (
                <Item
                  key={item.id}
                  asChild
                  variant="default"
                  className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <button type="button" onClick={() => selectExample(item)}>
                    <ItemMedia variant="icon">
                      <Icon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{labelFor(item)}</ItemTitle>
                      <ItemDescription>
                        <Markdown>{descriptionFor(item)}</Markdown>
                      </ItemDescription>
                    </ItemContent>
                  </button>
                </Item>
              );
            })}
          </ItemGroup>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/** `general-agent` → `generalAgent`. Empty/dynamic ids fall through unchanged. */
function _kebabToCamel(id: string): string {
  return id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
