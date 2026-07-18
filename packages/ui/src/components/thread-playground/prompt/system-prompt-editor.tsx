import { uuid, type Message } from "@llm-space/core";
import { SYSTEM_PROMPT_PLACE_KEY } from "@llm-space/core/thread";
import { memo, useCallback, useEffect } from "react";

import { CodeEditor } from "@llm-space/ui/components/code-editor";
import { useHostServices } from "@llm-space/ui/host";
import { cn } from "@llm-space/ui/lib/utils";

import { useI18n } from "../../../i18n";
import metaPrompt from "../examples/meta-prompt.md?raw";
import { PROMPT_EXAMPLES, resolveSeed } from "../examples/prompts";
import { ExamplesMenu } from "../examples-menu";
import { GeneratePopoverButton } from "../generate-popover-button";
import { useThreadStore, useThreadStoreActions } from "../stores";
import { useStreamText } from "../use-stream-text";
import { usePromptVariableExtension } from "../variable/use-prompt-variable-extension";

interface SystemPromptEditorProps {
  className?: string;
  readonly?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
}

function _SystemPromptEditor({
  className,
  readonly,
  onStreamingChange,
}: SystemPromptEditorProps) {
  const systemPrompt = useThreadStore(
    (s) => s.thread.context?.systemPrompt ?? ""
  );
  const tools = useThreadStore((s) => s.thread.context?.tools);
  const threadModel = useThreadStore((s) => s.thread.model);
  const seedHost = useHostServices();
  const { presentational } = seedHost;
  const { updateSystemPrompt } = useThreadStoreActions();
  const { t } = useI18n();
  const variableExtension = usePromptVariableExtension(SYSTEM_PROMPT_PLACE_KEY);
  const handleChange = useCallback(
    (value: string) => {
      updateSystemPrompt(value);
    },
    [updateSystemPrompt]
  );

  const {
    text: generated,
    streaming,
    run: generate,
  } = useStreamText({
    systemPrompt: metaPrompt,
    reasoning: "off",
    // Use the thread's own model (id/provider only) when it has one.
    model: threadModel
      ? { id: threadModel.id, provider: threadModel.provider }
      : undefined,
  });

  // Stream the generated prompt straight into the editor.
  useEffect(() => {
    if (generated) {
      updateSystemPrompt(generated);
    }
  }, [generated, updateSystemPrompt]);

  useEffect(() => {
    onStreamingChange?.(streaming);
  }, [onStreamingChange, streaming]);

  useEffect(() => {
    return () => onStreamingChange?.(false);
  }, [onStreamingChange]);

  const handleExampleSelect = useCallback(
    (content: string) => {
      updateSystemPrompt(content);
    },
    [updateSystemPrompt]
  );

  const handleGenerate = useCallback(
    (prompt: string) => {
      // Feed the current prompt and tools (if any) as a prior assistant turn,
      // so the model refines them in response to the user's request.
      const trimmed = systemPrompt.trim();
      const parts: string[] = [];
      if (trimmed) {
        parts.push(`<system-prompt>\n${trimmed}\n</system-prompt>`);
      }
      if (tools && tools.length > 0) {
        parts.push(`<tools>\n${JSON.stringify(tools, null, 2)}\n</tools>`);
      }
      const messages: Message[] = parts.length
        ? [
            {
              id: uuid(),
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: `<original>\n${parts.join("\n")}\n</original>`,
                },
              ],
            },
          ]
        : [];
      void generate({
        messages,
        userPrompt: `<user-input>\n${prompt}\n</user-input>`,
      });
    },
    [generate, systemPrompt, tools]
  );

  return (
    <div className={cn("flex size-full flex-col", className)}>
      <div className="flex shrink-0 items-center justify-between py-2">
        <div className="text-muted-foreground text-sm">{t.thread.prompt.sectionLabel}</div>
        {!presentational && (
          <div className="flex items-center gap-2">
            <GeneratePopoverButton
              placeholder={t.thread.prompt.generateSystemHint}
              onGenerate={handleGenerate}
            />
            <ExamplesMenu
              items={PROMPT_EXAMPLES}
              labelResolver={(example) => {
                // prompts.ts is a data module (not React), so it carries
                // hardcoded English labels; resolve the localized label from
                // the catalog by the example's stable id, falling back to the
                // example's own label. Mirrors the start-from-example dialog.
                // `misc` is indexed dynamically (the `exampleLabel_*` keys are
                // an open set keyed by example id).
                const misc = t.thread.misc as unknown as Record<string, string>;
                const key = `exampleLabel_${example.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}`;
                return misc[key] ?? example.label;
              }}
              onSelect={(example) =>
                void resolveSeed(example.content, seedHost).then((content) => {
                  if (content !== undefined) handleExampleSelect(content);
                })
              }
            />
          </div>
        )}
      </div>
      <CodeEditor
        className="hover:border-accent-foreground/20 grow transition-[border-color]"
        value={systemPrompt ?? ""}
        language="markdown"
        readonly={readonly || streaming}
        placeholder={t.thread.prompt.editorPlaceholder}
        extraExtensions={variableExtension}
        onChange={handleChange}
      />
    </div>
  );
}

export const SystemPromptEditor = memo(_SystemPromptEditor);
