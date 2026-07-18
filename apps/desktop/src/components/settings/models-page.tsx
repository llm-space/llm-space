"use client";

import type { CustomModel, ModelProviderGroup } from "@llm-space/core";
import { ConfirmDialog } from "@llm-space/ui/components/confirm-dialog";
import { Link } from "@llm-space/ui/components/link";
import {
  useAddCustomProvider,
  useAddProvider,
  useFetchBuiltinProviders,
  useModels,
  useRemoveCustomModel,
  useRemoveProvider,
  useSetAllModelsEnabled,
  useSetModelEnabled,
  useTestModelConnection,
  useUpdateProvider,
} from "@llm-space/ui/components/model-provider";
import { ModelAvatar } from "@llm-space/ui/components/thread-playground/model-avatar";
import { ProviderAvatar } from "@llm-space/ui/components/thread-playground/provider-avatar";
import { Tooltip } from "@llm-space/ui/components/tooltip";
import { useI18n } from "@llm-space/ui/i18n";
import { useAutoAnimation } from "@llm-space/ui/lib/use-auto-animation";
import { cn } from "@llm-space/ui/lib/utils";
import { Button } from "@llm-space/ui/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@llm-space/ui/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@llm-space/ui/ui/dropdown-menu";
import { Input } from "@llm-space/ui/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@llm-space/ui/ui/item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@llm-space/ui/ui/popover";
import { ScrollArea } from "@llm-space/ui/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@llm-space/ui/ui/select";
import { Switch } from "@llm-space/ui/ui/switch";
import {
  Ban,
  CableIcon,
  Check,
  CheckCheck,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


import { ApiKeyField } from "./api-key-field";
import {
  CUSTOM_PROVIDER_API_TYPES,
  DEFAULT_CUSTOM_PROVIDER_API,
  type CustomProviderApi,
} from "./custom-provider-api";
import { ModelEditorDialog } from "./model-editor-dialog";
import { SettingsPage } from "./settings-page";

/**
 * Base-URL guidance for the Anthropic Messages API. Its SDK appends `/v1/...`
 * to the base URL itself, so — unlike the OpenAI-style APIs, whose SDKs expect
 * the `/v1` to be part of the base URL — a `/v1` suffix here would double up
 * into `/v1/v1/...` on every request.
 */
function sortProviders(providers: ModelProviderGroup[]): ModelProviderGroup[] {
  return [...providers].sort((a, b) => a.name.localeCompare(b.name));
}

export function ModelsPage() {
  const providers = useModels();
  const { t } = useI18n();
  const firstProviderId = useMemo(
    () => sortProviders(providers)[0]?.id ?? null,
    [providers]
  );
  const [selectedId, setSelectedId] = useState<string | null>(firstProviderId);

  useEffect(() => {
    if (
      !selectedId ||
      !providers.some((provider) => provider.id === selectedId)
    ) {
      setSelectedId(firstProviderId);
    }
  }, [firstProviderId, providers, selectedId]);

  const selected =
    providers.find((provider) => provider.id === selectedId) ?? null;

  return (
    <SettingsPage
      className="flex size-full min-h-0"
      title={t.settings.models.title}
      description={t.settings.models.description}
    >
      <ProviderList
        providers={providers}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={setSelectedId}
      />
      <ProviderEditor key={selected?.id} provider={selected} />
    </SettingsPage>
  );
}

function ProviderList({
  providers,
  selectedId,
  onSelect,
  onAdd,
}: {
  providers: ModelProviderGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [listRef] = useAutoAnimation<HTMLDivElement>();
  const { t, fmt } = useI18n();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? providers.filter((provider) => provider.name.toLowerCase().includes(q))
      : providers;
    return sortProviders(matched);
  }, [providers, query]);

  return (
    <div className="flex w-64 shrink-0 flex-col gap-3 border-r pr-4">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
        <Input
          className="h-8 pl-7"
          aria-label={t.settings.models.searchProviders}
          placeholder={t.settings.models.searchProviders}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="min-h-0 grow">
        {providers.length === 0 ? (
          <div className="text-muted-foreground px-2 py-6 text-center text-xs text-balance">
            {t.settings.models.noProviders}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground px-2 py-6 text-center text-xs text-balance">
            {fmt(t.settings.models.noProviderMatches, {
              query: query.trim(),
            })}
          </div>
        ) : (
          <div ref={listRef} className="flex flex-col gap-1 pr-2">
            {filtered.map((provider) => (
              <ProviderListItem
                key={provider.id}
                provider={provider}
                selected={provider.id === selectedId}
                onSelect={() => onSelect(provider.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <AddProviderMenu onAdd={onAdd} />
    </div>
  );
}

/**
 * Recommended builtin providers, shown in their own menu group. The `google`
 * provider backs Gemini.
 */
const RECOMMENDED_PROVIDER_IDS = new Set([
  "ark",
  "ark-agent-plan",
  "ark-coding-plan",
  "openai",
  "anthropic",
  "google",
  "deepseek",
]);

/**
 * The "Add provider" upward menu. Lists every builtin provider, split into
 * priority groups: Discovered (an API key was detected and it isn't configured
 * yet), Recommended, then Built-in. Each provider lands in the highest group it
 * qualifies for; empty groups are omitted. Already-configured providers are
 * checked.
 */
function AddProviderMenu({ onAdd }: { onAdd: (id: string) => void }) {
  const configured = useModels();
  const addProvider = useAddProvider();
  const addCustomProvider = useAddCustomProvider();
  const fetchBuiltins = useFetchBuiltinProviders();
  const [open, setOpen] = useState(false);
  const [builtins, setBuiltins] = useState<ModelProviderGroup[] | null>(null);
  const { t, fmt, plural } = useI18n();

  const configuredIds = useMemo(
    () => new Set(configured.map((provider) => provider.id)),
    [configured]
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      void fetchBuiltins()
        .then(setBuiltins)
        .catch((error) => console.error("Failed to load providers", error));
    }
  };

  const groups = useMemo(() => {
    const discovered: ModelProviderGroup[] = [];
    const recommended: ModelProviderGroup[] = [];
    const rest: ModelProviderGroup[] = [];
    for (const provider of builtins ?? []) {
      // Only offer providers that haven't been added yet.
      if (configuredIds.has(provider.id)) {
        continue;
      }
      if (provider.apiKeyDetected) {
        discovered.push(provider);
      } else if (RECOMMENDED_PROVIDER_IDS.has(provider.id)) {
        recommended.push(provider);
      } else {
        rest.push(provider);
      }
    }
    const discoveredCount = discovered.length;
    const groups = [];
    if (discoveredCount > 0) {
      groups.push({
        id: "discovered",
        label: (
          <div className="flex flex-col gap-2">
            <div className="text-foreground text-xs font-medium">
              {t.settings.models.discovered}
            </div>
            <div className="flex gap-1 pl-1">
              {plural(
                discoveredCount,
                fmt(t.settings.models.providerDiscoveredOne, {
                  count: discoveredCount,
                }),
                fmt(t.settings.models.providerDiscoveredOther, {
                  count: discoveredCount,
                })
              )}
            </div>
          </div>
        ),
        items: discovered,
      });
    }
    if (recommended.length > 0) {
      groups.push({
        id: "recommended",
        label: t.settings.models.recommended,
        items: recommended,
      });
    }
    if (rest.length > 0) {
      groups.push({ id: "built-in", label: t.settings.models.builtIn, items: rest });
    }
    return groups;
  }, [builtins, configuredIds, fmt, plural, t]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus />
          {t.settings.models.addProvider}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder={t.settings.models.searchProvidersEllipsis} />
          <CommandList className="max-h-72">
            <CommandEmpty>{t.settings.models.noProvidersFound}</CommandEmpty>
            <CommandGroup heading={t.settings.models.customized}>
              <CommandItem
                value={t.settings.models.addCustomProvider}
                onSelect={() => {
                  setOpen(false);
                  void addCustomProvider(t.settings.models.customProvider, "").then(onAdd);
                }}
              >
                <ProviderAvatar id="custom-provider" name={t.settings.models.customProvider} />
                <span className="line-clamp-1 grow">
                  {t.settings.models.addCustomProvider}
                </span>
              </CommandItem>
            </CommandGroup>
            {groups.map((group) => (
              <Fragment key={group.id}>
                <CommandSeparator />
                <CommandGroup heading={group.label}>
                  {group.items.map((provider) => (
                    <CommandItem
                      key={provider.id}
                      value={`${provider.name} ${provider.id}`}
                      onSelect={() => {
                        setOpen(false);
                        void addProvider(provider.id).then(() =>
                          onAdd(provider.id)
                        );
                      }}
                    >
                      <ProviderAvatar
                        id={provider.id}
                        name={provider.name}
                        icon={provider.icon}
                      />
                      <span className="line-clamp-1 grow">{provider.name}</span>
                      {provider.websiteURL && (
                        <Link
                          href={provider.websiteURL}
                          aria-label={fmt(t.settings.models.openProviderWebsite, {
                            name: provider.name,
                          })}
                          className="text-muted-foreground/80 hover:text-foreground shrink-0"
                          onClick={(event) => event.stopPropagation()}
                          onMouseDown={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <ExternalLink className="size-2.5" />
                        </Link>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ProviderListItem({
  provider,
  selected,
  onSelect,
}: {
  provider: ModelProviderGroup;
  selected: boolean;
  onSelect: () => void;
}) {
  const removeProvider = useRemoveProvider();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { t, fmt } = useI18n();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={fmt(t.settings.models.selectProvider, {
        name: provider.name,
      })}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
        selected ? "bg-muted font-medium" : "hover:bg-muted/50"
      )}
    >
      <ProviderAvatar
        id={provider.id}
        name={provider.name}
        icon={provider.icon}
      />
      <span className="line-clamp-1 grow">{provider.name}</span>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            aria-label={fmt(t.settings.models.providerActions, {
              name: provider.name,
            })}
            title={fmt(t.settings.models.providerActions, {
              name: provider.name,
            })}
            className={cn(
              "text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-5 shrink-0 items-center justify-center rounded",
              menuOpen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 />
            {fmt(t.settings.models.removeProvider, { name: provider.name })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={fmt(t.settings.models.removeProviderTitle, {
          name: provider.name,
        })}
        description={fmt(t.settings.models.removeProviderDescription, {
          name: provider.name,
        })}
        confirmLabel={t.common.remove}
        dimBackground={false}
        onConfirm={() => {
          setConfirmOpen(false);
          void removeProvider(provider.id);
        }}
      />
    </div>
  );
}

function ProviderEditor({ provider }: { provider: ModelProviderGroup | null }) {
  const updateProvider = useUpdateProvider();
  const setModelEnabled = useSetModelEnabled();
  const setAllModelsEnabled = useSetAllModelsEnabled();
  const { t, fmt } = useI18n();
  const [iconDraft, setIconDraft] = useState(provider?.icon ?? "");
  const [baseUrlEnabled, setBaseUrlEnabled] = useState(
    Boolean(provider?.baseUrl)
  );
  const [modelView, setModelView] = useState<"all" | "enabled" | "disabled">(
    "all"
  );
  const [apiValue, setApiValue] = useState<CustomProviderApi>(
    DEFAULT_CUSTOM_PROVIDER_API
  );
  const [modelListRef] = useAutoAnimation<HTMLDivElement>();
  const [editorOpen, setEditorOpen] = useState(false);
  // The custom model being edited, or `null` for a fresh create.
  const [editingModel, setEditingModel] = useState<CustomModel | null>(null);

  const openCreateModel = () => {
    setEditingModel(null);
    setEditorOpen(true);
  };

  const openEditModel = (model: CustomModel) => {
    setEditingModel(model);
    setEditorOpen(true);
  };

  const disabledModels = useMemo(
    () => new Set(provider?.disabledModels ?? []),
    [provider]
  );

  const customModels = useMemo(
    () => new Set(provider?.customModels ?? []),
    [provider]
  );

  useEffect(() => {
    setApiValue(provider?.api ?? DEFAULT_CUSTOM_PROVIDER_API);
  }, [provider?.api, provider?.id]);

  // Persist on blur, but only when the value actually changed. An empty field
  // clears the key (stored as `null`).
  const handleApiKeyBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!provider) return;
    const value = event.target.value.trim();
    const next = value === "" ? null : value;
    const current = provider.apiKey ?? null;
    if (next !== current) {
      void updateProvider(provider.id, { apiKey: next });
    }
  };

  const handleNameBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!provider) return;
    const value = event.target.value.trim();
    if (value === "" || value === provider.name) {
      return;
    }
    void updateProvider(provider.id, { name: value });
  };

  const handleApiChange = (api: CustomProviderApi) => {
    if (!provider) {
      return;
    }
    const previous = apiValue;
    setApiValue(api);
    if (api === previous) {
      return;
    }
    void updateProvider(provider.id, { api }).catch((error) => {
      setApiValue(previous);
      toast.error(t.settings.models.failedToUpdateApiType, {
        description:
          error instanceof Error ? error.message : t.common.toasts.tryAgain,
      });
    });
  };

  // Persist the icon override on blur when changed. Empty ⇒ auto-resolve.
  const handleIconBlur = () => {
    if (!provider) return;
    const value = iconDraft.trim();
    const next = value === "" ? null : value;
    const current = provider.icon ?? null;
    if (next !== current) {
      void updateProvider(provider.id, { icon: next });
    }
  };

  // Persist the custom base URL on blur when changed. Empty ⇒ use the default.
  const handleBaseUrlBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!provider) return;
    const value = event.target.value.trim();
    const next = value === "" ? null : value;
    const current = provider.baseUrl ?? null;
    if (next !== current) {
      void updateProvider(provider.id, { baseUrl: next });
    }
  };

  // The switch reveals/hides the base URL input; turning it off clears the
  // stored value (⇒ use the provider default).
  const handleBaseUrlToggle = (enabled: boolean) => {
    setBaseUrlEnabled(enabled);
    if (!enabled && provider) {
      void updateProvider(provider.id, { baseUrl: null });
    }
  };

  if (!provider) {
    return (
      <div className="text-muted-foreground flex min-w-0 grow items-center justify-center text-sm">
        {t.settings.models.selectOrAddProvider}
      </div>
    );
  }

  const totalModels = provider.models.length;
  const enabledModels = provider.models.filter(
    (model) => !disabledModels.has(model.id)
  ).length;

  const visibleModels = provider.models.filter((model) => {
    if (modelView === "enabled") return !disabledModels.has(model.id);
    if (modelView === "disabled") return disabledModels.has(model.id);
    return true;
  });
  const isBuiltin = provider.builtin === true;

  // Which base-URL convention applies (see ANTHROPIC_BASE_URL_HINT): builtin
  // providers are recognized by their models' API; custom providers follow the
  // live API type selection.
  const usesAnthropicApi = isBuiltin
    ? provider.models.some((model) => model.api === "anthropic-messages")
    : apiValue === "anthropic-messages";
  const baseUrlPlaceholder = usesAnthropicApi
    ? "https://api.example.com"
    : "https://api.example.com/v1";

  return (
    <div className="flex min-w-0 grow flex-col">
      <ScrollArea className="min-h-0 grow">
        <div className="flex flex-col gap-6 pr-4 pl-6">
          <div className="flex items-center gap-2">
            {isBuiltin && provider.websiteLink ? (
              <Tooltip
                content={fmt(t.settings.models.learnMoreProvider, {
                  name: provider.name,
                })}
              >
                <Link
                  href={provider.websiteLink}
                  aria-label={fmt(t.settings.models.openProviderWebsite, {
                    name: provider.name,
                  })}
                  className="group/provider-link text-foreground hover:text-foreground flex items-center gap-2"
                >
                  <h3 className="font-heading text-lg font-medium">
                    {provider.name}
                  </h3>
                  <ExternalLink className="text-muted-foreground group-hover/provider-link:text-foreground size-4 transition-colors" />
                </Link>
              </Tooltip>
            ) : (
              <h3 className="font-heading text-lg font-medium">
                {provider.name}
              </h3>
            )}
          </div>

          {!isBuiltin && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  {t.settings.models.name}
                </span>
                <Input
                  defaultValue={provider.name}
                  placeholder={t.settings.models.customProvider}
                  aria-label={t.settings.models.customProviderName}
                  onBlur={handleNameBlur}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  {t.settings.models.apiType}
                </span>
                <Select
                  value={apiValue}
                  onValueChange={(value) =>
                    handleApiChange(value as CustomProviderApi)
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label={fmt(t.settings.models.apiType)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOM_PROVIDER_API_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {!isBuiltin && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {t.settings.models.icon}
              </span>
              <div className="flex items-center gap-2">
                <ProviderAvatar
                  id={provider.id}
                  name={provider.name}
                  icon={iconDraft.trim() || undefined}
                />
                <Input
                  value={iconDraft}
                  placeholder={t.settings.models.iconPlaceholder}
                  aria-label={fmt(t.settings.models.providerIconAria, {
                    name: provider.name,
                  })}
                  onChange={(e) => setIconDraft(e.target.value)}
                  onBlur={handleIconBlur}
                />
              </div>
              <div className="text-muted-foreground text-xs">
                {t.settings.models.iconDescriptionPrefix
                  ? `${t.settings.models.iconDescriptionPrefix} `
                  : ""}
                <Link
                  href="https://icons.lobehub.com"
                  className="underline underline-offset-2"
                >
                  @lobehub/icons
                </Link>{" "}
                {t.settings.models.iconDescription}
              </div>
            </div>
          )}

          {provider.id !== "openai-codex" && (
            <ApiKeyField
              label={t.settings.models.apiKey}
              getKeyUrl={provider.websiteLink}
              defaultValue={provider.apiKey ?? ""}
              placeholder={fmt(t.settings.models.apiKeyPlaceholder, {
                name: provider.name,
              })}
              aria-label={fmt(t.settings.models.apiKeyAria, {
                name: provider.name,
              })}
              onBlur={handleApiKeyBlur}
              description={
                <div className="text-muted-foreground pl-5 text-xs">
                  <div className="list-item">
                    {t.settings.models.envVarHint}
                  </div>
                  <div className="list-item">
                    {fmt(t.settings.models.officialEnvHint, {
                      name: provider.name,
                    })}
                  </div>
                </div>
              }
            />
          )}

          {isBuiltin ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t.settings.models.customBaseUrl}
                </span>
                <Switch
                  aria-label={
                    baseUrlEnabled
                      ? fmt(t.settings.models.disableCustomBaseUrl, {
                          name: provider.name,
                        })
                      : fmt(t.settings.models.enableCustomBaseUrl, {
                          name: provider.name,
                        })
                  }
                  checked={baseUrlEnabled}
                  onCheckedChange={handleBaseUrlToggle}
                />
              </div>
              {baseUrlEnabled && (
                <>
                  <Input
                    defaultValue={provider.baseUrl ?? ""}
                    placeholder={baseUrlPlaceholder}
                    aria-label={fmt(t.settings.models.customBaseUrlAria, {
                      name: provider.name,
                    })}
                    onBlur={handleBaseUrlBlur}
                  />
                  <div className="text-muted-foreground text-xs">
                    {t.settings.models.defaultEndpointHint}
                    {usesAnthropicApi
                      ? ` ${t.settings.models.anthropicBaseUrlHint}`
                      : null}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {t.settings.models.baseUrl}
              </span>
              <Input
                required
                defaultValue={provider.baseUrl ?? ""}
                placeholder={baseUrlPlaceholder}
                aria-label={fmt(t.settings.models.baseUrlAria, {
                  name: provider.name,
                })}
                onBlur={handleBaseUrlBlur}
              />
              {usesAnthropicApi && (
                <div className="text-muted-foreground text-xs">
                  {t.settings.models.anthropicBaseUrlHint}
                </div>
              )}
            </div>
          )}

          {!isBuiltin && <ProviderHeadersEditor provider={provider} />}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t.settings.models.models}
              </span>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                {enabledModels === totalModels
                  ? totalModels
                  : `${enabledModels}/${totalModels}`}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Tooltip content={t.settings.models.addCustomModel}>
                  <button
                    type="button"
                    aria-label={t.settings.models.addCustomModel}
                    onClick={openCreateModel}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors"
                  >
                    <Plus className="size-4" />
                  </button>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={fmt(t.settings.models.modelListActions, {
                        name: provider.name,
                      })}
                      className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onSelect={() =>
                        void setAllModelsEnabled(provider.id, false)
                      }
                    >
                      <Ban />
                      {t.settings.models.disableAll}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        void setAllModelsEnabled(provider.id, true)
                      }
                    >
                      <CheckCheck />
                      {t.settings.models.enableAll}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(
                      [
                        ["enabled", t.settings.models.showEnabledOnly],
                        ["disabled", t.settings.models.showDisabledOnly],
                        ["all", t.settings.models.showAll],
                      ] as const
                    ).map(([value, label]) => (
                      <DropdownMenuItem
                        key={value}
                        onSelect={() => setModelView(value)}
                      >
                        <Check
                          className={cn(
                            "size-3.5",
                            modelView !== value && "invisible"
                          )}
                        />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div ref={modelListRef} className="flex flex-col gap-1.5">
              {visibleModels.length === 0 ? (
                <div className="text-muted-foreground px-1 py-2 text-xs">
                  {t.settings.models.noModelsToShow}
                </div>
              ) : (
                visibleModels.map((model) => (
                  <ModelListItem
                    key={model.id}
                    providerId={provider.id}
                    providerName={provider.name}
                    model={model}
                    enabled={!disabledModels.has(model.id)}
                    isCustom={customModels.has(model.id)}
                    onToggle={(next) =>
                      void setModelEnabled(provider.id, model.id, next)
                    }
                    onEdit={() => openEditModel(model)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <ModelEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        providerId={provider.id}
        providerApi={isBuiltin ? undefined : apiValue}
        model={editingModel}
      />
    </div>
  );
}

/**
 * Key-value editor for a custom provider's extra HTTP headers. Rows live in
 * local state so half-typed entries survive re-renders; only rows with a
 * non-empty name are persisted, on blur or row removal.
 */
function ProviderHeadersEditor({ provider }: { provider: ModelProviderGroup }) {
  const updateProvider = useUpdateProvider();
  const [rows, setRows] = useState<{ key: string; value: string }[]>(() =>
    Object.entries(provider.headers ?? {}).map(([key, value]) => ({
      key,
      value,
    }))
  );
  const { t, fmt } = useI18n();

  const setRow = (index: number, row: { key: string; value: string }) => {
    setRows((prev) => prev.map((r, i) => (i === index ? row : r)));
  };

  // Persist the named rows when they differ from the stored headers. An empty
  // set clears the field (stored as `null`).
  const persist = (nextRows: { key: string; value: string }[]) => {
    const headers: Record<string, string> = {};
    for (const row of nextRows) {
      const key = row.key.trim();
      if (key !== "") headers[key] = row.value;
    }
    const current = provider.headers ?? {};
    const currentKeys = Object.keys(current);
    const same =
      Object.keys(headers).length === currentKeys.length &&
      currentKeys.every((key) => headers[key] === current[key]);
    if (same) return;
    void updateProvider(provider.id, {
      headers: Object.keys(headers).length > 0 ? headers : null,
    });
  };

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    setRows(next);
    persist(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {t.settings.models.customHeaders}
      </span>
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={row.key}
            placeholder="X-Header-Name"
            aria-label={fmt(t.settings.models.headerNameAria, {
              name: provider.name,
              index: index + 1,
            })}
            onChange={(e) => setRow(index, { ...row, key: e.target.value })}
            onBlur={() => persist(rows)}
          />
          <Input
            value={row.value}
            placeholder={t.settings.models.headerValuePlaceholder}
            aria-label={fmt(t.settings.models.headerValueAria, {
              name: provider.name,
              index: index + 1,
            })}
            onChange={(e) => setRow(index, { ...row, value: e.target.value })}
            onBlur={() => persist(rows)}
          />
          <Tooltip content={t.settings.models.removeHeader}>
            <button
              type="button"
              aria-label={fmt(t.settings.models.removeHeaderAria, {
                index: index + 1,
              })}
              onClick={() => removeRow(index)}
              className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 shrink-0 items-center justify-center rounded transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          </Tooltip>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => setRows((prev) => [...prev, { key: "", value: "" }])}
      >
        <Plus /> {t.settings.models.addHeader}
      </Button>
      <div className="text-muted-foreground text-xs">
        {t.settings.models.headersDescription}
      </div>
    </div>
  );
}

/**
 * A single model row. Custom (user-added) models get a hover-revealed action
 * cluster — edit and delete — to the left of the enable switch. Delete is gated
 * behind a confirmation.
 */
function ModelListItem({
  providerId,
  providerName,
  model,
  enabled,
  isCustom,
  onToggle,
  onEdit,
}: {
  providerId: string;
  providerName: string;
  model: ModelProviderGroup["models"][number];
  enabled: boolean;
  isCustom: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
}) {
  const removeCustomModel = useRemoveCustomModel();
  const testModelConnection = useTestModelConnection();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const { t, fmt } = useI18n();

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await testModelConnection(providerId, model.id);
      toast.success(t.settings.models.modelConnected, {
        description: model.name,
      });
    } catch (error) {
      toast.error(t.settings.models.modelConnectFailed, {
        description:
          error instanceof Error ? error.message : t.common.toasts.tryAgain,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Item variant="muted" size="sm" className="group">
      <ItemMedia>
        <ModelAvatar
          id={model.id}
          name={model.name}
          icon={model.icon}
          size={20}
        />
      </ItemMedia>
      <ItemContent className={cn(!enabled && "opacity-50")}>
        <ItemTitle className="font-mono">{model.name}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <Tooltip content={t.settings.models.testConnection}>
            <button
              type="button"
              aria-label={fmt(t.settings.models.testConnectionAria, {
                name: model.name,
              })}
              disabled={testing}
              onClick={() => void handleTestConnection()}
              className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors"
            >
              {testing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CableIcon className="size-3.5" />
              )}
            </button>
          </Tooltip>
          {isCustom && (
            <>
              <button
                type="button"
                aria-label={fmt(t.settings.models.editModelAria, {
                  name: model.name,
                })}
                onClick={onEdit}
                className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={fmt(t.settings.models.deleteModelAria, {
                  name: model.name,
                })}
                onClick={() => setConfirmOpen(true)}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive inline-flex size-6 items-center justify-center rounded transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
        </div>
        <Switch
          size="sm"
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label={
            enabled
              ? fmt(t.settings.models.disableModelAria, { name: model.name })
              : fmt(t.settings.models.enableModelAria, { name: model.name })
          }
        />
      </ItemActions>
      {isCustom && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={fmt(t.settings.models.deleteModelTitle, {
            name: model.name,
          })}
          description={fmt(t.settings.models.deleteModelDescription, {
            name: model.name,
            providerName,
          })}
          confirmLabel={t.common.delete}
          dimBackground={false}
          onConfirm={() => {
            setConfirmOpen(false);
            void removeCustomModel(providerId, model.id);
          }}
        />
      )}
    </Item>
  );
}
