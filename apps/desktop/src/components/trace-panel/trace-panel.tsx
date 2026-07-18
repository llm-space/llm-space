"use client";



import { Tooltip } from "@llm-space/ui/components/tooltip";
import { useI18n } from "@llm-space/ui/i18n";
import { cn } from "@llm-space/ui/lib/utils";
import { Button } from "@llm-space/ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@llm-space/ui/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@llm-space/ui/ui/empty";
import { Input } from "@llm-space/ui/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@llm-space/ui/ui/select";
import { Spinner } from "@llm-space/ui/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@llm-space/ui/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronDownIcon,
  DatabaseIcon,
  FolderPlusIcon,
  ImportIcon,
  KeyRoundIcon,
  LinkIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { traceClient } from "@/client";
import { useCommands, useRegisterCommands } from "@/commands";
import type {
  TraceConnectedProjectInput,
  TraceImportFile,
  TraceLangfuseSearchInput,
  TraceProject,
  TraceRecord,
  TraceRemoteTraceSummary,
} from "@/shared/traces";

interface TracePanelProps {
  className?: string;
  headerStart?: ReactNode;
  onOpenTrace: (trace: TraceRecord) => void;
}

type ConnectedTraceProject = TraceProject & {
  source: Extract<TraceProject["source"], { mode: "connected" }>;
};

interface TraceSearchFormState {
  traceId: string;
  query: string;
  name: string;
  userId: string;
  sessionId: string;
  tags: string;
  version: string;
  release: string;
  environment: string;
  fromTimestamp: string;
  toTimestamp: string;
  orderBy: string;
  limit: string;
}

const DEFAULT_TRACE_SEARCH_FORM: TraceSearchFormState = {
  traceId: "",
  query: "",
  name: "",
  userId: "",
  sessionId: "",
  tags: "",
  version: "",
  release: "",
  environment: "",
  fromTimestamp: "",
  toTimestamp: "",
  orderBy: "timestamp.desc",
  limit: "25",
};

const TRACE_SEARCH_LIMIT_OPTIONS = ["25", "50", "100"];

function _traceSearchOrderOptions(t: ReturnType<typeof useI18n>["t"]) {
  return [
    { value: "timestamp.desc", label: t.trace.strings.newest },
    { value: "timestamp.asc", label: t.trace.strings.oldest },
    { value: "name.asc", label: t.trace.strings.nameAZ },
    { value: "userId.asc", label: t.trace.strings.userAZ },
    { value: "sessionId.asc", label: t.trace.strings.sessionAZ },
    { value: "id.asc", label: t.trace.strings.idAZ },
  ] satisfies {
    value: TraceSearchFormState["orderBy"];
    label: string;
  }[];
}

export function TracePanel({ className, onOpenTrace }: TracePanelProps) {
  const { executeCommand } = useCommands();
  const qc = useQueryClient();
  const { t, fmt, plural } = useI18n();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [connectionPending, setConnectionPending] = useState(false);
  const [importProjectId, setImportProjectId] = useState<string | null>(null);
  const [syncProjectId, setSyncProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [importing, setImporting] = useState(false);
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["trace", "projects"],
    queryFn: () => traceClient.listProjects(),
  });
  const selectedProject = useMemo(
    () =>
      projects.find((project) => project.id === selectedProjectId) ??
      projects[0] ??
      null,
    [projects, selectedProjectId]
  );
  const syncProject = useMemo(() => {
    const project =
      projects.find((project) => project.id === syncProjectId) ?? null;
    return project?.source.mode === "connected"
      ? (project as ConnectedTraceProject)
      : null;
  }, [projects, syncProjectId]);
  const importProject = useMemo(() => {
    const project =
      projects.find((project) => project.id === importProjectId) ?? null;
    return project?.source.mode === "manual" ? project : null;
  }, [importProjectId, projects]);

  useEffect(() => {
    if (!selectedProjectId && projects[0]) {
      setSelectedProjectId(projects[0].id);
    }
    if (
      selectedProjectId &&
      projects.length > 0 &&
      !projects.some((project) => project.id === selectedProjectId)
    ) {
      setSelectedProjectId(projects[0]?.id ?? null);
    }
  }, [projects, selectedProjectId]);

  const createProject = useCallback(
    async (name: string) => {
      try {
        const project = await traceClient.createProject(name);
        setProjectName("");
        setProjectDialogOpen(false);
        setSelectedProjectId(project.id);
        await qc.invalidateQueries({ queryKey: ["trace", "projects"] });
      } catch (error) {
        toast.error(t.trace.strings.createProjectFailed, {
          description:
            error instanceof Error
              ? error.message
              : t.trace.strings.projectCreationFailed,
        });
      }
    },
    [qc, t]
  );

  const createConnectedProject = useCallback(
    async (input: TraceConnectedProjectInput) => {
      setConnectionPending(true);
      try {
        const project = await traceClient.createConnectedProject(input);
        setProjectDialogOpen(false);
        setSelectedProjectId(project.id);
        await qc.invalidateQueries({ queryKey: ["trace", "projects"] });
        toast.success(t.trace.strings.connectedProject, {
          description: project.source.langfuseProjectName ?? project.name,
        });
      } catch (error) {
        toast.error(t.trace.strings.connectLangfuseFailed, {
          description:
            error instanceof Error ? error.message : t.trace.strings.connectionFailed,
        });
      } finally {
        setConnectionPending(false);
      }
    },
    [qc, t]
  );

  const importLangfuseFiles = useCallback(
    async (projectId: string, files: TraceImportFile[]) => {
      setImporting(true);
      try {
        const result = await traceClient.importLangfuseJson(projectId, files);
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["trace", "projects"] }),
          qc.invalidateQueries({
            queryKey: ["trace", "traces", projectId],
          }),
        ]);
        if (result.imported.length > 0) {
          setImportProjectId(null);
          toast.success(
            plural(
              result.imported.length,
              fmt(t.trace.strings.importedTraceOne, {
                count: result.imported.length,
              }),
              fmt(t.trace.strings.importedTraceOther, {
                count: result.imported.length,
              })
            ),
            result.warnings.length > 0
              ? { description: result.warnings[0] }
              : undefined
          );
        } else {
          toast.error(t.trace.strings.noLangfuseTracesImported, {
            description:
              result.warnings[0] ?? t.trace.strings.selectLangfuseExport,
          });
        }
      } catch (error) {
        toast.error(t.trace.strings.importFailed, {
          description:
            error instanceof Error ? error.message : t.trace.strings.couldNotImportTraces,
        });
      } finally {
        setImporting(false);
      }
    },
    [fmt, plural, qc, t]
  );

  const syncLangfuseTraceIds = useCallback(
    async (projectId: string, traceIds: string[]) => {
      setSyncingProjectId(projectId);
      try {
        const result = await traceClient.syncLangfuseTraces(
          projectId,
          traceIds
        );
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["trace", "projects"] }),
          qc.invalidateQueries({
            queryKey: ["trace", "traces", projectId],
          }),
        ]);
        if (result.imported.length > 0) {
          toast.success(
            plural(
              result.imported.length,
              fmt(t.trace.strings.syncedTraceOne, {
                count: result.imported.length,
              }),
              fmt(t.trace.strings.syncedTraceOther, {
                count: result.imported.length,
              })
            ),
            result.warnings.length > 0
              ? { description: result.warnings[0] }
              : undefined
          );
        } else {
          toast.error(t.trace.strings.noTracesSynced, {
            description:
              result.warnings[0] ?? t.trace.strings.selectTraceToSync,
          });
        }
      } catch (error) {
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["trace", "projects"] }),
          qc.invalidateQueries({
            queryKey: ["trace", "traces", projectId],
          }),
        ]);
        toast.error(t.trace.strings.syncFailed, {
          description:
            error instanceof Error ? error.message : t.trace.strings.couldNotSyncTraces,
        });
      } finally {
        setSyncingProjectId(null);
      }
    },
    [fmt, plural, qc, t]
  );

  useRegisterCommands({
    createTraceProject: ({ name }) => void createProject(name),
    createConnectedTraceProject: (input) => void createConnectedProject(input),
    importLangfuseTraceFiles: ({ projectId, files }) =>
      void importLangfuseFiles(projectId, files),
    syncLangfuseTraceIds: ({ projectId, traceIds }) =>
      void syncLangfuseTraceIds(projectId, traceIds),
  });

  const requestCreateProject = useCallback(() => {
    const name = projectName.trim();
    if (!name) {
      return;
    }
    executeCommand({ type: "createTraceProject", args: { name } });
  }, [executeCommand, projectName]);

  const importFilesIntoProject = useCallback(
    (projectId: string, files: TraceImportFile[]) => {
      executeCommand({
        type: "importLangfuseTraceFiles",
        args: { projectId, files },
      });
    },
    [executeCommand]
  );

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);
  const cancelCreateProject = useCallback(() => {
    setProjectDialogOpen(false);
    setProjectName("");
  }, []);
  const openProjectDialog = useCallback(() => {
    setProjectDialogOpen(true);
  }, []);
  const setSyncDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      setSyncProjectId(null);
    }
  }, []);

  const handleCreateConnectedProject = useCallback(
    (input: TraceConnectedProjectInput) => {
      executeCommand({
        type: "createConnectedTraceProject",
        args: input,
      });
    },
    [executeCommand]
  );

  const handleSyncTraceIds = useCallback(
    (projectId: string, traceIds: string[]) => {
      executeCommand({
        type: "syncLangfuseTraceIds",
        args: { projectId, traceIds },
      });
    },
    [executeCommand]
  );

  const addTraceToProject = useCallback((project: TraceProject) => {
    setSelectedProjectId(project.id);
    if (project.source.mode === "connected") {
      setSyncProjectId(project.id);
      return;
    }
    setImportProjectId(project.id);
  }, []);

  return (
    <div className={cn("bg-sidebar flex h-full flex-col", className)}>
      <header className="electrobun-webkit-app-region-drag flex h-11.5 items-center justify-between px-3">
        <span className="ml-auto flex items-center gap-0.5">
          <Tooltip content={t.trace.strings.addTraceProject}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t.trace.strings.addTraceProject}
              onClick={openProjectDialog}
            >
              <PlusIcon className="size-4" />
            </Button>
          </Tooltip>
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
        {projectsLoading ? (
          <div className="flex items-center justify-center p-4">
            <Spinner />
          </div>
        ) : projects.length === 0 ? (
          <_EmptyProjects onAddProject={openProjectDialog} />
        ) : (
          <div className="flex flex-col gap-2">
            {projects.map((project) => (
              <TraceProjectGroup
                key={project.id}
                project={project}
                selected={project.id === selectedProject?.id}
                adding={importing || syncingProjectId === project.id}
                onSelectProject={selectProject}
                onAddTrace={addTraceToProject}
                onOpenTrace={onOpenTrace}
              />
            ))}
          </div>
        )}
      </div>
      <_TraceProjectDialog
        open={projectDialogOpen}
        pending={connectionPending}
        onOpenChange={(open) => {
          if (!connectionPending) {
            setProjectDialogOpen(open);
          }
        }}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onCreateManual={requestCreateProject}
        onCancelManual={cancelCreateProject}
        onCreate={handleCreateConnectedProject}
      />
      <_ImportLangfuseDialog
        open={Boolean(importProject)}
        project={importProject}
        importing={importing}
        onOpenChange={(open) => {
          if (!open && !importing) {
            setImportProjectId(null);
          }
        }}
        onImport={importFilesIntoProject}
      />
      <_SyncProjectDialog
        open={Boolean(syncProject)}
        project={syncProject}
        syncing={syncProject ? syncingProjectId === syncProject.id : false}
        onOpenChange={setSyncDialogOpen}
        onSyncTraceIds={handleSyncTraceIds}
      />
    </div>
  );
}

function _EmptyProjects({ onAddProject }: { onAddProject: () => void }) {
  const { t } = useI18n();
  return (
    <Empty className="h-full border-0 px-3">
      <EmptyHeader>
        <EmptyTitle>{t.trace.strings.noTraceProjects}</EmptyTitle>
        <EmptyDescription>
          {t.trace.strings.noTraceProjectsDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button className="w-full py-4" size="lg" onClick={onAddProject}>
          <PlusIcon className="size-3" />
          {t.trace.strings.addTraceProjectButton}
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function _TraceProjectDialog({
  open,
  pending,
  onOpenChange,
  projectName,
  onProjectNameChange,
  onCreateManual,
  onCancelManual,
  onCreate,
}: {
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onCreateManual: () => void;
  onCancelManual: () => void;
  onCreate: (input: TraceConnectedProjectInput) => void;
}) {
  const [tab, setTab] = useState<"langfuse" | "manual">("langfuse");
  const { t } = useI18n();

  useEffect(() => {
    if (open) {
      setTab("langfuse");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-xl"
        onInteractOutside={(event) => {
          if (pending) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (pending) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t.trace.strings.addTraceProject}</DialogTitle>
          <DialogDescription>
            {t.trace.strings.addProjectDescription}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "langfuse" | "manual")}
          className="gap-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="langfuse" disabled={pending}>
              <LinkIcon className="size-3.5" />
              {t.trace.strings.langfuse}
            </TabsTrigger>
            <TabsTrigger value="manual" disabled={pending}>
              <FolderPlusIcon className="size-3.5" />
              {t.trace.strings.manual}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="langfuse" className="mt-0">
            <_ConnectProjectForm
              onCreate={onCreate}
              onCancel={() => onOpenChange(false)}
              pending={pending}
            />
          </TabsContent>
          <TabsContent value="manual" className="mt-0">
            <_ManualProjectForm
              projectName={projectName}
              onNameChange={onProjectNameChange}
              onCreate={onCreateManual}
              onCancel={onCancelManual}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function _ManualProjectForm({
  projectName,
  onNameChange,
  onCreate,
  onCancel,
}: {
  projectName: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex w-full flex-col gap-4">
      <_Field label={t.trace.strings.projectName}>
        <Input
          placeholder={t.trace.strings.projectNamePlaceholder}
          aria-label={t.trace.strings.traceProjectNameAria}
          value={projectName}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onCreate();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
        />
      </_Field>
      <div className="text-muted-foreground bg-muted/30 flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
        <FolderPlusIcon className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {t.trace.strings.manualProjectHint}
        </span>
      </div>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t.trace.strings.cancel}
        </Button>
        <Button size="sm" disabled={!projectName.trim()} onClick={onCreate}>
          {t.trace.strings.create}
        </Button>
      </DialogFooter>
    </div>
  );
}

function _ConnectProjectForm({
  onCreate,
  onCancel,
  pending = false,
}: {
  onCreate: (input: TraceConnectedProjectInput) => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  const { t } = useI18n();
  const [baseUrl, setBaseUrl] = useState("https://cloud.langfuse.com");
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const canCreate = Boolean(
    baseUrl.trim() && publicKey.trim() && secretKey.trim()
  );
  const submit = useCallback(() => {
    if (!canCreate || pending) {
      return;
    }
    onCreate({
      baseUrl: baseUrl.trim(),
      publicKey: publicKey.trim(),
      secretKey: secretKey.trim(),
    });
  }, [baseUrl, canCreate, onCreate, pending, publicKey, secretKey]);
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <_Field label={t.trace.strings.langfuseBaseUrl} className="sm:col-span-2">
          <Input
            autoFocus
            placeholder="https://cloud.langfuse.com"
            aria-label={t.trace.strings.langfuseBaseUrlAria}
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
          />
        </_Field>
        <_Field label={t.trace.strings.publicKey}>
          <Input
            placeholder="pk-lf-..."
            aria-label={t.trace.strings.publicKeyAria}
            value={publicKey}
            onChange={(event) => setPublicKey(event.target.value)}
          />
        </_Field>
        <_Field label={t.trace.strings.secretKey}>
          <Input
            type="password"
            placeholder="sk-lf-..."
            aria-label={t.trace.strings.secretKeyAria}
            value={secretKey}
            onChange={(event) => setSecretKey(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
          />
        </_Field>
      </div>
      <div className="text-muted-foreground bg-muted/30 flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
        <KeyRoundIcon className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {t.trace.strings.connectionHint}
        </span>
      </div>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t.trace.strings.cancel}
        </Button>
        <Button size="sm" disabled={!canCreate || pending} onClick={submit}>
          {pending && <Spinner className="size-3" />}
          {t.trace.strings.connectProject}
        </Button>
      </DialogFooter>
    </div>
  );
}

function _Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

function _TraceProjectGroup({
  project,
  selected,
  adding,
  onSelectProject,
  onAddTrace,
  onOpenTrace,
}: {
  project: TraceProject;
  selected: boolean;
  adding: boolean;
  onSelectProject: (projectId: string) => void;
  onAddTrace: (project: TraceProject) => void;
  onOpenTrace: (trace: TraceRecord) => void;
}) {
  const { t } = useI18n();
  const { data: traces = [], isLoading } = useQuery({
    queryKey: ["trace", "traces", project.id],
    queryFn: () => traceClient.listTraces(project.id),
    enabled: selected,
  });
  const addLabel =
    project.source.mode === "connected"
      ? t.trace.strings.syncLangfuseTraces
      : t.trace.strings.importLangfuseExport;

  return (
    <section className="flex flex-col gap-1">
      <div
        className={cn(
          "hover:bg-muted/70 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
          selected && "bg-muted/70"
        )}
      >
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => onSelectProject(project.id)}
        >
          <span className="bg-primary/10 flex size-6 shrink-0 items-center justify-center rounded-md">
            <DatabaseIcon className="text-primary size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {project.name}
            </span>
            <span className="text-muted-foreground block truncate text-[0.625rem]">
              {_projectSourceSummary(project, t)}
            </span>
          </span>
        </button>
        <Tooltip content={addLabel}>
          <Button
            className="size-7 shrink-0"
            variant="secondary"
            size="icon-sm"
            aria-label={addLabel}
            disabled={adding}
            onClick={() => onAddTrace(project)}
          >
            {adding ? (
              <Spinner className="size-3" />
            ) : (
              <PlusIcon className="size-3.5" />
            )}
          </Button>
        </Tooltip>
      </div>
      {selected && (
        <div className="flex flex-col gap-1.5 pl-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-3">
              <Spinner className="size-3.5" />
            </div>
          ) : traces.length === 0 ? (
            <div className="text-muted-foreground bg-muted/20 rounded-md border border-dashed px-3 py-4 text-xs">
              {project.source.mode === "connected"
                ? t.trace.strings.noSyncedTraces
                : t.trace.strings.noImportedTraces}
            </div>
          ) : (
            traces.map((trace) => (
              <TraceRow key={trace.key} trace={trace} onOpen={onOpenTrace} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

const TraceProjectGroup = memo(_TraceProjectGroup);

function _ImportLangfuseDialog({
  open,
  project,
  importing,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  project: TraceProject | null;
  importing: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (projectId: string, files: TraceImportFile[]) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [reading, setReading] = useState(false);
  const pending = importing || reading;

  useEffect(() => {
    if (open) {
      setSelectedFiles([]);
      setReading(false);
    }
  }, [open, project?.id]);

  const selectFiles = useCallback((files: FileList | null) => {
    setSelectedFiles(files ? [...files] : []);
  }, []);

  const submit = useCallback(async () => {
    if (!project || selectedFiles.length === 0 || pending) {
      return;
    }
    setReading(true);
    try {
      const records = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          text: await file.text(),
        }))
      );
      onImport(project.id, records);
    } catch (error) {
      toast.error(t.trace.strings.importFailed, {
        description:
          error instanceof Error ? error.message : t.trace.strings.couldNotReadFiles,
      });
    } finally {
      setReading(false);
    }
  }, [
    onImport,
    pending,
    project,
    selectedFiles,
    t.trace.strings.couldNotReadFiles,
    t.trace.strings.importFailed,
  ]);

  return (
    <Dialog open={open && project !== null} onOpenChange={onOpenChange}>
      {project && (
        <DialogContent
          className="max-h-[85vh] overflow-y-auto sm:max-w-xl"
          onInteractOutside={(event) => {
            if (pending) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (pending) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{t.trace.strings.importLangfuseExport}</DialogTitle>
            <DialogDescription>
              {t.trace.strings.importDialogDescription.replace(
                "{project}",
                project.name
              )}
            </DialogDescription>
          </DialogHeader>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".json,application/json"
            aria-label={t.trace.strings.chooseJsonFilesAria}
            className="hidden"
            onChange={(event) => {
              selectFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <div className="flex flex-col gap-3">
            <Button
              className="justify-start"
              variant="secondary"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              <ImportIcon className="size-4" />
              {t.trace.strings.chooseJsonFiles}
            </Button>
            <div className="bg-muted/30 border-border/70 min-h-24 rounded-md border p-3">
              {selectedFiles.length === 0 ? (
                <div className="text-muted-foreground flex h-20 items-center justify-center text-center text-xs">
                  {t.trace.strings.selectJsonExports}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {selectedFiles.map((file) => (
                    <div
                      key={`${file.name}:${file.size}:${file.lastModified}`}
                      className="flex min-w-0 items-center justify-between gap-3 text-xs"
                    >
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {_formatBytes(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {t.trace.strings.cancel}
            </Button>
            <Button
              size="sm"
              disabled={selectedFiles.length === 0 || pending}
              onClick={() => void submit()}
            >
              {pending && <Spinner className="size-3" />}
              {t.trace.strings.import}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

function _SyncProjectDialog({
  open,
  project,
  syncing,
  onOpenChange,
  onSyncTraceIds,
}: {
  open: boolean;
  project: ConnectedTraceProject | null;
  syncing: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncTraceIds: (projectId: string, traceIds: string[]) => void;
}) {
  const { t, fmt } = useI18n();
  const [form, setForm] = useState<TraceSearchFormState>(
    DEFAULT_TRACE_SEARCH_FORM
  );
  const [remoteTraces, setRemoteTraces] = useState<TraceRemoteTraceSummary[]>(
    []
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const selectedIds = useMemo(() => [...selected], [selected]);
  const searchFilters = useMemo(
    () => _traceSearchFiltersFromForm(form),
    [form]
  );

  useEffect(() => {
    if (open) {
      setForm(DEFAULT_TRACE_SEARCH_FORM);
      setRemoteTraces([]);
      setSelected(new Set());
      setAdvancedFiltersOpen(false);
    }
  }, [open, project?.id]);

  const setFormValue = useCallback(
    (key: keyof TraceSearchFormState, value: string) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const search = useCallback(async () => {
    if (!project) {
      return;
    }
    setSearching(true);
    try {
      const rows = await traceClient.searchLangfuseTraces(
        project.id,
        searchFilters
      );
      setRemoteTraces(rows);
      setSelected(new Set());
    } catch (error) {
      toast.error(t.trace.strings.searchFailed, {
        description:
          error instanceof Error
            ? error.message
            : t.trace.strings.couldNotSearchTraces,
      });
    } finally {
      setSearching(false);
    }
  }, [
    project,
    searchFilters,
    t.trace.strings.couldNotSearchTraces,
    t.trace.strings.searchFailed,
  ]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAdvancedFilters = useCallback(() => {
    setAdvancedFiltersOpen((current) => !current);
  }, []);

  const syncSelected = useCallback(() => {
    if (!project || selectedIds.length === 0) {
      return;
    }
    onSyncTraceIds(project.id, selectedIds);
  }, [onSyncTraceIds, project, selectedIds]);

  const searchSummary =
    remoteTraces.length > 0
      ? fmt(t.trace.strings.shownSelected, {
          shown: remoteTraces.length,
          selected: selectedIds.length,
        })
      : t.trace.strings.searchRemoteHint;
  const orderOptions = _traceSearchOrderOptions(t);

  return (
    <Dialog open={open && project !== null} onOpenChange={onOpenChange}>
      {project && (
        <DialogContent
          className="flex max-h-[85vh] w-[min(920px,calc(100vw-2rem))] max-w-none! flex-col gap-0 overflow-hidden p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>{t.trace.strings.syncLangfuseTraces}</DialogTitle>
            <DialogDescription>
              {project.name}
              {project.source.langfuseProjectName
                ? ` · ${project.source.langfuseProjectName}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {t.trace.strings.searchRemoteTraces}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {searchSummary}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_7rem_auto]">
                  <_Field label={t.trace.strings.search}>
                    <Input
                      placeholder={t.trace.strings.searchPlaceholder}
                      aria-label={t.trace.strings.searchRemoteAria}
                      value={form.query}
                      onChange={(event) =>
                        setFormValue("query", event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void search();
                        }
                      }}
                    />
                  </_Field>
                  <_Field label={t.trace.strings.sort}>
                    <Select
                      value={form.orderBy}
                      onValueChange={(value) => setFormValue("orderBy", value)}
                    >
                      <SelectTrigger aria-label={t.trace.strings.sortRemoteAria}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </_Field>
                  <_Field label={t.trace.strings.limit}>
                    <Select
                      value={form.limit}
                      onValueChange={(value) => setFormValue("limit", value)}
                    >
                      <SelectTrigger aria-label={t.trace.strings.limitRemoteAria}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRACE_SEARCH_LIMIT_OPTIONS.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </_Field>
                  <Button
                    className="mt-5 shrink-0 justify-center"
                    variant="secondary"
                    disabled={searching}
                    onClick={() => void search()}
                  >
                    {searching ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <SearchIcon className="size-4" />
                    )}
                    {t.trace.strings.search}
                  </Button>
                </div>
                {advancedFiltersOpen && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <_Field label={t.trace.strings.traceId}>
                      <Input
                        placeholder={t.trace.strings.exactTraceId}
                        value={form.traceId}
                        onChange={(event) =>
                          setFormValue("traceId", event.target.value)
                        }
                      />
                    </_Field>
                    <_Field label={t.trace.strings.name}>
                      <Input
                        placeholder={t.trace.strings.traceName}
                        value={form.name}
                        onChange={(event) =>
                          setFormValue("name", event.target.value)
                        }
                      />
                    </_Field>
                    <_Field label={t.trace.strings.userId}>
                      <Input
                        placeholder={t.trace.strings.userIdPlaceholder}
                        value={form.userId}
                        onChange={(event) =>
                          setFormValue("userId", event.target.value)
                        }
                      />
                    </_Field>
                    <_Field label={t.trace.strings.sessionId}>
                      <Input
                        placeholder={t.trace.strings.sessionIdPlaceholder}
                        value={form.sessionId}
                        onChange={(event) =>
                          setFormValue("sessionId", event.target.value)
                        }
                      />
                    </_Field>
                    <_Field label={t.trace.strings.tags}>
                      <Input
                        placeholder={t.trace.strings.tagsPlaceholder}
                        value={form.tags}
                        onChange={(event) =>
                          setFormValue("tags", event.target.value)
                        }
                      />
                    </_Field>
                    <_Field label={t.trace.strings.environment}>
                      <Input
                        placeholder={t.trace.strings.environmentPlaceholder}
                        value={form.environment}
                        onChange={(event) =>
                          setFormValue("environment", event.target.value)
                        }
                      />
                    </_Field>
                    <_Field label={t.trace.strings.version}>
                      <Input
                        placeholder={t.trace.strings.versionPlaceholder}
                        value={form.version}
                        onChange={(event) =>
                          setFormValue("version", event.target.value)
                        }
                      />
                    </_Field>
                    <_Field label={t.trace.strings.release}>
                      <Input
                        placeholder={t.trace.strings.releasePlaceholder}
                        value={form.release}
                        onChange={(event) =>
                          setFormValue("release", event.target.value)
                        }
                      />
                    </_Field>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,12rem)_minmax(0,12rem)_auto]">
                  <_Field label={t.trace.strings.from}>
                    <Input
                      type="datetime-local"
                      value={form.fromTimestamp}
                      onChange={(event) =>
                        setFormValue("fromTimestamp", event.target.value)
                      }
                    />
                  </_Field>
                  <_Field label={t.trace.strings.to}>
                    <Input
                      type="datetime-local"
                      value={form.toTimestamp}
                      onChange={(event) =>
                        setFormValue("toTimestamp", event.target.value)
                      }
                    />
                  </_Field>
                  <div className="flex items-end">
                    <Button
                      className="mt-5 min-w-28 justify-between"
                      variant="link"
                      aria-expanded={advancedFiltersOpen}
                      onClick={toggleAdvancedFilters}
                    >
                      <ChevronDownIcon
                        className={cn(
                          "size-3.5 transition-transform",
                          advancedFiltersOpen && "rotate-180"
                        )}
                      />
                      {advancedFiltersOpen
                        ? t.trace.strings.hideFilters
                        : t.trace.strings.moreFilters}
                    </Button>
                  </div>
                </div>
                <div className="border-border/70 max-h-80 min-h-65 overflow-auto rounded-md border bg-[#141414]">
                  {remoteTraces.length === 0 ? (
                    <div className="flex h-60 flex-col items-center justify-center px-6 text-center">
                      <SearchIcon className="text-muted-foreground/70 mb-2 size-5" />
                      <div className="text-sm font-medium">
                        {t.trace.strings.noRemoteTracesLoaded}
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {t.trace.strings.runSearchThenSelect}
                      </div>
                    </div>
                  ) : (
                    remoteTraces.map((trace) => (
                      <RemoteTraceRow
                        key={trace.id}
                        trace={trace}
                        selected={selected.has(trace.id)}
                        onToggle={toggle}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
          <DialogFooter className="border-t px-4 py-3">
            <Button
              variant="ghost"
              disabled={syncing}
              onClick={() => onOpenChange(false)}
            >
              {t.trace.strings.close}
            </Button>
            <Button
              disabled={syncing || selectedIds.length === 0}
              onClick={syncSelected}
            >
              {syncing ? (
                <Spinner className="size-3.5" />
              ) : (
                <RefreshCwIcon className="size-4" />
              )}
              {selectedIds.length > 0
                ? fmt(t.trace.strings.syncSelectedCount, {
                    count: selectedIds.length,
                  })
                : t.trace.strings.syncSelected}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

function _projectSourceSummary(
  project: TraceProject,
  t: ReturnType<typeof useI18n>["t"]
): string {
  if (project.source.mode === "connected") {
    return project.source.langfuseProjectName
      ? `${t.trace.strings.connectedLangfuse} · ${project.source.langfuseProjectName}`
      : t.trace.strings.connectedLangfuse;
  }
  return project.source.langfuseProjectName
    ? `${t.trace.strings.manualImport} · ${project.source.langfuseProjectName}`
    : t.trace.strings.manualImport;
}

function _traceSearchFiltersFromForm(
  form: TraceSearchFormState
): TraceLangfuseSearchInput {
  return {
    ...(_trimmed(form.traceId) ? { id: _trimmed(form.traceId) } : {}),
    ...(_trimmed(form.query) ? { query: _trimmed(form.query) } : {}),
    ...(_trimmed(form.name) ? { name: _trimmed(form.name) } : {}),
    ...(_trimmed(form.userId) ? { userId: _trimmed(form.userId) } : {}),
    ...(_trimmed(form.sessionId)
      ? { sessionId: _trimmed(form.sessionId) }
      : {}),
    ...(_csv(form.tags).length > 0 ? { tags: _csv(form.tags) } : {}),
    ...(_trimmed(form.version) ? { version: _trimmed(form.version) } : {}),
    ...(_trimmed(form.release) ? { release: _trimmed(form.release) } : {}),
    ...(_csv(form.environment).length > 0
      ? { environment: _csv(form.environment) }
      : {}),
    ...(_datetimeLocalToIso(form.fromTimestamp)
      ? { fromTimestamp: _datetimeLocalToIso(form.fromTimestamp) }
      : {}),
    ...(_datetimeLocalToIso(form.toTimestamp)
      ? { toTimestamp: _datetimeLocalToIso(form.toTimestamp) }
      : {}),
    orderBy: form.orderBy,
    limit: Number(form.limit),
  };
}

function _trimmed(value: string): string | undefined {
  return value.trim() || undefined;
}

function _csv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function _datetimeLocalToIso(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function _RemoteTraceRow({
  trace,
  selected,
  onToggle,
}: {
  trace: TraceRemoteTraceSummary;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const meta = _remoteTraceMeta(trace);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={cn(
        "hover:bg-muted/70 flex w-full min-w-0 items-start gap-3 border-b px-3 py-2.5 text-left last:border-b-0",
        selected && "bg-muted"
      )}
      onClick={() => onToggle(trace.id)}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border",
          selected ? "border-primary bg-primary text-primary-foreground" : ""
        )}
      >
        {selected ? <CheckIcon className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {trace.name || trace.id}
        </span>
        <span className="text-muted-foreground mt-0.5 block truncate text-xs">
          {meta || trace.id}
        </span>
      </span>
    </button>
  );
}

const RemoteTraceRow = memo(_RemoteTraceRow);

function _remoteTraceMeta(trace: TraceRemoteTraceSummary): string {
  return [
    trace.timestamp ? _formatDateTime(trace.timestamp) : null,
    trace.userId,
    trace.sessionId,
    trace.environment,
    trace.release,
    trace.version,
    trace.tags && trace.tags.length > 0 ? trace.tags.join(", ") : null,
    trace.observationCount ? `${trace.observationCount} obs` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function _formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function _formatDateTime(value: string | number): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function _TraceRow({
  trace,
  onOpen,
}: {
  trace: TraceRecord;
  onOpen: (trace: TraceRecord) => void;
}) {
  const subtitle = [
    trace.startedAt ? _formatDateTime(trace.startedAt) : null,
    trace.model,
    `${trace.observationCount} obs`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <button
      type="button"
      className="hover:bg-muted/70 focus-visible:ring-ring/50 flex w-full min-w-0 items-start gap-2 rounded-md border border-transparent px-2 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
      onClick={() => onOpen(trace)}
    >
      <span
        className={cn(
          "mt-1 size-1.5 shrink-0 rounded-full",
          trace.status === "error" ? "bg-destructive" : "bg-primary/70"
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">
          {trace.title}
        </span>
        <span className="text-muted-foreground mt-0.5 block truncate text-[0.625rem]">
          {subtitle || trace.source.traceId}
        </span>
      </span>
      {trace.status === "error" && (
        <span className="bg-destructive/10 text-destructive shrink-0 rounded px-1.5 py-0.5 text-[0.5625rem]">
          Error
        </span>
      )}
    </button>
  );
}

const TraceRow = memo(_TraceRow);
