
import { ChevronDown, type LucideIcon } from "lucide-react";

import { Button } from "@llm-space/ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@llm-space/ui/ui/dropdown-menu";

import { useI18n } from "../../i18n";

/** An entry that renders as a plain divider in the menu. */
interface SeparatorItem { type: "separator" }

/** The minimum shape a selectable example item must provide to be rendered. */
interface ExampleItem { type: string; label: string; icon: LucideIcon }

/**
 * The shared "Examples ▾" dropdown used by the system-prompt and tool editors.
 * Given a catalog of items (each either a `{ type: "separator" }` divider or an
 * object carrying a `label`/`icon`), it renders the trigger and menu and calls
 * `onSelect` with the picked (non-separator) item.
 *
 * `labelResolver` (optional) overrides each item's display label — e.g. to
 * localize a hardcoded English `label` from a non-React data module via the
 * i18n catalog. When omitted, the item's own `label` is shown verbatim.
 */
export function ExamplesMenu<T extends ExampleItem>({
  items,
  onSelect,
  align = "end",
  labelResolver,
}: {
  items: readonly (T | SeparatorItem)[];
  onSelect: (item: T) => void;
  align?: "start" | "end";
  labelResolver?: (item: T) => string;
}) {
  const { t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {t.thread.toolbar.examples}
          <ChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {items.map((item, index) => {
          if (item.type === "separator") {
            return <DropdownMenuSeparator key={`sep-${index}`} />;
          }
          const example = item as T;
          const Icon = example.icon;
          const label = labelResolver ? labelResolver(example) : example.label;
          return (
            <DropdownMenuItem key={label} onSelect={() => onSelect(example)}>
              <Icon />
              {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
