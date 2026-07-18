/**
 * Thread Playground strings (`packages/ui/src/components/thread-playground/**`).
 *
 * POPULATED BY THE i18n MIGRATION WORKFLOW — area agents fill this in per the
 * string catalog produced by the Explore pass. Keep the top-level group keys
 * stable as agents add nested entries.
 */
export const enThread = {
  toolbar: {
    // thread-playground.tsx — header icon buttons
    undoLastEdit: "Undo last edit",
    redoLastEdit: "Redo last edit",
    viewRunHistory: "View run history",
    hideRunHistory: "Hide run history",
    shareThread: "Share thread",
    // run / stop button (tooltip content + button label + aria, conditional on status)
    runThisThread: "Run this thread",
    stopRunning: "Stop running",
    runThreadAria: "Run thread",
    stopRunningThreadAria: "Stop running thread",
    run: "Run",
    stop: "Stop",
    // run settings dropdown
    runSettings: "Run settings",
    enableReactLoop: "Enable ReAct loop",
    autoRunTools: "Auto run tools",
    // configuration section labels
    models: "Models",
    tools: "Tools",
    variables: "Variables",
    // examples-menu.tsx
    examples: "Examples",
  },
  store: {
    duplicateVariableTitle: "Variable name already exists",
    duplicateVariableDescription:
      '"{name}" is already used by another variable.',
    errorTitle: "Error",
    runLastMessageError:
      "The last message must be a user message or a tool call result.",
    invalidToolDescription: "Invalid tool",
    toolAlreadyExistsDescription: 'Tool "{name}" already exists',
    riskyAutoRunTitle: "Auto-run paused for a risky command",
    riskyAutoRunDescription:
      "A bash command looked destructive, so it wasn't run automatically. Review it and run it by hand if it's safe.",
    toolCallFailedFallback: "Tool call failed",
    selectModelToRun: "Select a model to run",
    renderVariablesFailedTitle: "Unable to render prompt variables",
    renderVariablesFallback: "Please check the system prompt variables.",
  },
  message: {
    // message-list-view.tsx
    addMessage: "Add message",

    // message-list-item.tsx
    insertMessageHere: "Insert Message Here",
    insertMessageBeforeAria: "Insert message before this message",
    enterUserMessageHere: "Enter user message here",
    enterAssistantMessageHere: "Enter assistant message here",
    callTools: "Call tools",
    callToolsAria: "Call available MCP and built-in tools",
    continue: "Continue",
    runFromThisMessage: "Run from this message",
    someToolCallsFailed: "Some tool calls failed",
    toolCallFailedCount: "{errorCount}/{total} tool call failed",
    toolCallsFailedCount: "{errorCount}/{total} tool calls failed",
    toolCallMarkerOne: "{count} tool call",
    toolCallMarkerOther: "{count} tool calls",

    // message-list-item-header.tsx
    dragToReorder: "Drag to reorder",
    messageDragHandleAria: "{role} message drag handle",
    toggleRole: "Toggle role",
    changeMessageRoleAria: "Change message role from {role}",
    roleUser: "User",
    roleAssistant: "Assistant",
    previewTextContent: "Preview text content",
    noTextContent: "No text content",
    noRunnableContent: "No runnable content",
    cannotRunFromThisMessage: "Cannot run from this message",
    removeMessage: "Remove message",
    expandMessage: "Expand message",
    collapseMessage: "Collapse message",
    userMessageText: "User message text",
    assistantMessageText: "Assistant message text",

    // thinking-view.tsx
    thinking: "Thinking",

    // todo-write-view.tsx
    viewArguments: "View arguments",
    argumentsOfTodoWrite: "Arguments of todo_write()",

    // token-usage-summary.tsx
    tokenUsage: "Token Usage",
    tokenUsageAria: "Token usage: {label}",

    // tool-call-input-view.tsx
    openInBrowser: "Open in Browser",
    revealInFileManager: "Reveal in File Manager",
    collapse: "Collapse",
    expand: "Expand",
    copyTextContent: "Copy Text Content",
    copyValueAsJson: "Copy Value as JSON",
    textContentLabel: "Text content",
    valueJsonLabel: "Value JSON",
    previewValue: "Preview Value...",
    viewJson: "View JSON...",
    openInBrowserTitle: "Open in browser",
    revealInFileManagerTitle: "Reveal in file manager",
    viewValueOfArgument: "View value of {argumentKey}",
    clickToCollapse: "Click to collapse",
    clickToExpand: "Click to expand",
    openActionsForArgumentAria: "Open actions for {argumentKey}",
    labelCopied: "{label} copied",
    failedToCopyLabel: "Failed to copy {label}",
    skillNotFound: "Skill not found: {value}",
    notFoundValue: "Not found: {value}",
    failedToRevealInFileManager: "Failed to reveal in file manager",

    // tool-call-list-item.tsx
    addToolResponsesBeforeContinuing: "Add tool responses before continuing",
    failedToCallTool: "Failed to call {toolName}()",
    argumentsCopied: "Arguments copied",
    failedToCopyArguments: "Failed to copy arguments",
    copyArguments: "Copy arguments",
    callThisTool: "Call this tool",
    response: "Response",
    previewResponse: "Preview response",
    clearError: "Clear error",
    markAsError: "Mark as error",
    responseOfTool: "Response of {toolName}()",
    enterResponseOfTool: "Enter the response of {name}()",
    other: "Other",
    typeYourAnswer: "Type your answer…",
    otherAnswerForQuestionAria: "Other answer for {question}",

    // image-content-view.tsx
    openImagePreviewAria: "Open image preview",
    removeImage: "Remove image",
    imagePreviewTitle: "Image preview",

    // add-images-menu.tsx
    imageFilesAria: "Image files",
    addImageToMessageAria: "Add image to message",
    addImages: "Add Images",
    fromFiles: "From Files",
    fromClipboard: "From Clipboard",

    // use-tool-call-runner.ts
    toolCallFailedFallback: "Tool call failed",
  },
  model: {
    // model-selector.tsx
    noModelSelectedPlaceholder: "(No model selected)",
    noModelsFound: "No models found.",
    modelSelectorAria: "Model selector",
    openModelSelectorAria: "Open model selector",
    configureModels: "Configure models...",
    // model-config-editor.tsx
    noModelFallback: "(No model)",
    // model-card.tsx
    supported: "Supported",
    notSupported: "Not supported",
    modelLabel: "Model",
    providerLabel: "Provider",
    apiTypeLabel: "API type",
    baseUrlLabel: "Base URL",
    contextWindowLabel: "Context window",
    maxTokensLabel: "Max tokens",
    reasoningLabel: "Reasoning",
    imageInputLabel: "Image input",
    inputCostLabel: "Input cost",
    outputCostLabel: "Output cost",
    // model-params-popover.tsx
    showModelDetailsAria: "Show model details",
    configureModelSettings: "Configure model settings",
    configureModelParametersAria: "Configure model parameters",
    openModelProviderSettingsAria: "Open model provider settings",
    modelSettingsTitle: "Model settings",
    temperatureLabel: "Temperature",
    thinkingEffortLabel: "Thinking effort",
    responseFormatLabel: "Response format",
    jsonObject: "JSON object",
    jsonSchema: "JSON schema",
    editSchema: "Edit schema",
    reasoningOff: "Off",
    reasoningMinimal: "Minimal",
    reasoningLow: "Low",
    reasoningMedium: "Medium",
    reasoningHigh: "High",
    reasoningXHigh: "X-High",
    disableAria: "Disable {label}",
    enableAria: "Enable {label}",
    // json-schema-dialog.tsx
    editResponseSchemaTitle: "Edit response schema",
    editResponseSchemaDescription:
      "The model constrains its response to this JSON Schema. Support and strictness vary by provider.",
    cancel: "Cancel",
    save: "Save",
    errorToastTitle: "Error",
    invalidJsonToast: "Invalid JSON",
    schemaMustBeObjectToast: "Schema must be a JSON object",
  },
  tool: {
    // tool-list-view.tsx — "Add" dropdown trigger + items
    add: "Add",
    addBuiltInTools: "Add Built-in Tools",
    addMcpTools: "Add MCP Tools",
    addCustomFunctionTool: "Add Custom Function Tool",

    // tool-list-item.tsx — tooltips + aria labels
    removeTool: "Remove tool",
    editToolAria: "Edit {name} tool",
    manageToolAria: "Manage {name} {type} tool",
    removeToolAria: "Remove {name} tool",
    typeMcp: "MCP",
    typeBuiltin: "built-in",

    // tool-editor-dialog.tsx
    editToolTitle: "Edit tool",
    addFunctionToolTitle: "Add function tool",
    editorDescription:
      "A function tool consists of a name, description, and parameters. Parameters are defined using JSON Schema. Since the tool is customized, you need to provide a response at runtime.",
    definition: "Definition",
    create: "Create",
    generatePlaceholder:
      "Describe what your function does (or paste your function declaration code), and we'll generate a definition.",
    mcpNotEditableToast: "MCP tools cannot be edited as function tools",
    invalidJsonToast: "Invalid JSON",

    // tool-import-sidebar-actions.tsx
    toolActionsAria: "Tool actions",
    enableAllTools: "Enable all tools",
    disableAllTools: "Disable all tools",

    // built-in-tool-import-dialog.tsx
    addBuiltInToolsTitle: "Add built-in tools",
    addBuiltInToolsDescription:
      "Choose built-in tools to make available in this thread.",
    searchTools: "Search tools",
    categoryFileSystem: "File system",
    categoryWeb: "Web",
    categoryMisc: "Misc",
    noToolsMatchSearch: "No tools match your search.",
    noBuiltInToolsInCategory: "No built-in tools in this category.",
    addToolAria: "Add {name}",
    removeToolAriaBuiltIn: "Remove {name}",
    failedToLoadBuiltInTools: "Failed to load built-in tools",

    // mcp-tool-import-popover.tsx
    addMcpToolsTitle: "Add MCP tools",
    addMcpToolsDescription:
      "Choose a server, then add one or more MCP tools to this thread.",
    noServers: "No servers",
    noMcpServersConfigured: "No MCP servers configured.",
    openSettings: "Open settings",
    testServer: "Test server",
    configureMcp: "Configure MCP",
    untested: "Untested",
    testedPrefix: "tested",
    noToolsLoaded: "no tools loaded",
    addToolAriaMcp: "Add {name}",
    removeToolAriaMcp: "Remove {name}",
    failedToLoadMcpServers: "Failed to load MCP servers",
    failedToLoadMcpTools: "Failed to load MCP tools",
  },
  variable: {
    // prompt-variables-dialog.tsx
    dialogTitle: "Variables",
    dialogDescription:
      "Use `{{variable_name}}` as placeholder in your prompt, messages and tool results to reference the variable. e.g. `{{current_date}}` will be replaced with the current date.",
    // prompt-variables-list-view.tsx — chip list "Add" button
    add: "Add",
    // prompt-variables-panel.tsx — "Add variable" button
    addVariable: "Add variable",
    // built-in skills variable statuses
    allSkills: "All skills",
    allSkillsDefault: "All skills (default)",
    selectedCount: "Selected {count}",
    missingCount: "{count} missing",
    countSelected: "{count} selected",
    // custom variable empty value
    emptyValue: "(empty)",
    // section group headers
    builtIn: "Built-in",
    custom: "Custom",
    noCustomVariables: "No custom variables.",
    // detail shell titles
    currentDate: "Current date",
    availableSkills: "Available skills",
    userDefinedVariable: "User defined variable",
    // field labels
    name: "Name",
    format: "Format",
    value: "Value",
    indent: "Indent",
    variableValuePlaceholder: "Variable value",
    // name validation feedback
    nameInvalid:
      "Use letters, numbers, and underscores; start with a letter or underscore.",
    nameExists: "Name already exists.",
    // skills selection
    selectSkills: "Select skills",
    selectSkillsTitle: "Select skills",
    selectSkillsDescription:
      "All enabled skills are included by default. Pick specific skills to narrow it to only those.",
    searchSkills: "Search skills",
    clear: "Clear",
    noMatchingSkills: "No matching skills.",
    loadingSkills: "Loading skills...",
    someSkillsNoLongerEnabled: "Some selected skills are no longer enabled.",
    failedToLoadSkills: "Failed to load skills.",
    // empty / placeholder detail states
    addCustomHint: "Add a custom variable to provide a reusable value.",
    selectVariableToEdit: "Select a variable to edit.",
    // delete custom variable confirm
    deleteCustomTitle: "Delete custom variable?",
    deleteVariable: "Delete variable",
    deleteReferencedDesc:
      "This thread references `{{name}}`. Deleting this variable will leave unresolved placeholders.",
    deleteRemoveDesc:
      "This removes `{{name}}` and its value from this thread.",
    // indent option labels
    indentDefault: "Default",
    indentSpaces: "{count} spaces",
    // chip copy affordance
    ariaManageVariable: "Manage {name} variable",
    ariaCopyToken: "Copy {token}",
    tooltipCopyHeading: "Copy",
    toastCopiedToken: "Copied {token}",
    toastPasteHint:
      "Paste it into your prompt, messages, or tool results to reference this variable.",
    // CodeMirror hover tooltip (prompt-variable-extension.ts)
    viewVariableDetails: "View variable details",
    warningNoValue: "This variable has no value yet.",
    warningInvalidName: "Invalid variable name.",
    warningUnknown: "Unknown variable — not defined in this thread.",
    // date format option labels (prompt-variable-options.ts)
    formatReadableDate: "Readable date",
    formatIsoDate: "ISO date",
    formatLocalDateTime: "Local date and time",
    // skills format option labels (prompt-variable-options.ts)
    formatXml: "XML",
    formatMarkdownList: "Markdown list",
    // select aria-labels
    ariaCurrentDateFormat: "Current date format",
    ariaSkillsFormat: "Skills format",
    ariaSkillsIndentation: "Skills indentation",
    ariaDeleteCustomVariable: "Delete custom variable",
  },
  prompt: {
    sectionLabel: "System prompt",
    editorPlaceholder: "Enter system prompt here",
    generateSystemHint:
      "Describe the assistant you want (its role, tone, and rules), and we'll generate a system prompt.",
    generateFunctionHint:
      "Describe what your function does (or paste your code), and we'll generate a definition.",
    generate: "Generate",
  },
  runHistory: {
    // Titles & section headers
    title: "Run history",
    inspectRunTitle: "Inspect Run",
    compareRuns: "Compare Runs",
    evaluations: "Evaluations",
    // Buttons
    back: "Back",
    compare: "Compare",
    // Tooltips
    previousRun: "Previous run",
    nextRun: "Next run",
    removeRun: "Remove run",
    inspectRun: "Inspect run",
    restoreRun: "Restore run",
    selectRun: "Select run",
    removeFromComparison: "Remove from comparison",
    removeEvaluation: "Remove evaluation",
    // Empty states & fallbacks
    noRunsYet: "No runs yet",
    selectRunToInspect: "Select a saved run to inspect.",
    systemPrompt: "System Prompt",
    noSystemPrompt: "No system prompt",
    // Counts & positions
    selectedCount: "{count}/2 selected",
    positionOfTotal: "{index} of {total}",
    // aria-labels
    ariaBackToRunHistory: "Back to run history",
    ariaCloseRunHistory: "Close run history",
    ariaInspectPreviousRun: "Inspect previous run",
    ariaInspectNextRun: "Inspect next run",
    ariaInspectRun: "Inspect run from {time}: {summary}",
    ariaRemoveRun: "Remove run from {time}",
    ariaRemoveFromComparison: "Remove run from comparison: {summary}",
    ariaSelectRunForComparison: "Select run for comparison: {summary}",
    ariaInspectRunDetailed:
      "Inspect run from {time}: {summary}. {modelLabel}. {messageCountLabel}",
    ariaRestoreRun:
      "Restore run from {time}: {summary}. {modelLabel}. {messageCountLabel}",
    ariaOpenEvaluation: "Open saved evaluation: {verdict}",
    ariaRemoveEvaluation: "Remove evaluation: {verdict}",
    // Confirm dialogs
    confirmRemoveRunTitle: "Remove Run?",
    confirmRemoveRunDescription:
      "This removes the saved run from this thread and removes any evaluations that reference it.",
    confirmRemoveEvaluationTitle: "Remove Evaluation?",
    confirmRemoveEvaluationDescription:
      "This removes the saved evaluation from this thread. The compared runs are kept.",
    remove: "Remove",
    // Comparison summary & scoring
    runLabelA: "A: {summary}",
    runLabelB: "B: {summary}",
    rubricRevision: "{name} · v{revision}",
    scoreDelta: "A {aAvg} · B {bAvg} · Δ {delta}",
    // Verdict labels (shared with the evaluation group)
    verdictRunABetter: "Run A Better",
    verdictRunBBetter: "Run B Better",
    verdictTie: "Tie",
    verdictPass: "Pass",
    verdictFail: "Fail",
  },
  evaluation: {
    // run-evaluation-dialog.tsx — conditional dialog titles
    compareRunsTitle: "Compare Runs",
    inspectRunTitle: "Inspect Run",
    editRubricTitle: "Edit rubric",
    createRubricTitle: "Create rubric",
    evaluateRunsTitle: "Evaluate Runs",
    // run-evaluation-dialog.tsx — conditional dialog descriptions
    inspectRunDescription: "Saved run evidence from this comparison.",
    editRubricDescription:
      "Create reusable criteria for manual run comparison in this thread.",
    compareRunsDescription:
      "Compare two durable runs and save a structured evaluation with this thread.",
    // run-evaluation-dialog.tsx — comparison panels
    runLabelA: "Run A",
    runLabelB: "Run B",
    inspectButton: "Inspect",
    inspectAria: "Inspect {label}: {summary}",
    lastSaved: "Last saved {time}",
    compareTimestampsTitle: "{left} vs {right}",
    // run-evaluation-dialog.tsx — meta labels
    metaModel: "Model",
    metaMessages: "Messages",
    metaCaptured: "Captured",
    systemPromptLabel: "System Prompt",
    lastUserMessageLabel: "Last User Message",
    resultLabel: "Result",
    // run-evaluation-dialog.tsx — verdict section + note
    verdictLabel: "Verdict",
    evaluationNoteLabel: "Evaluation Note",
    evaluationNotePlaceholder:
      "Why did this run pass, fail, or beat the other one?",
    // run-evaluation-dialog.tsx — footer buttons
    close: "Close",
    saveEvaluation: "Save Evaluation",
    backToEvaluation: "Back to Evaluation",
    // run-evaluation-dialog.tsx — empty state
    selectTwoRuns: "Select two runs to compare.",
    // run-evaluation-dialog.tsx — remove-scores confirm dialog
    confirmRemoveScoresTitle: "Remove rubric scores?",
    confirmRemoveScoresDescription:
      "Saving without a rubric permanently removes the saved rubric snapshot and all criterion scores from this evaluation. This cannot be undone.",
    confirmRemoveScoresAction: "Remove scores and save",
    // run-evaluation-dialog.tsx — toasts
    saveEvaluationErrorToast: "Unable to save evaluation",
    saveEvaluationErrorToastDescription:
      "Check the selected runs and rubric scores.",
    saveEvaluationSuccessToast: "Evaluation saved",
    // run-evaluation-scorecard.tsx
    rubricLabel: "Rubric",
    rubricHint:
      "Score each run consistently, or keep the legacy verdict-only flow.",
    rubricAria: "Evaluation rubric",
    noRubricOption: "No rubric",
    savedRubricOption: "{name} (saved v{revision})",
    definitionRubricOption: "{name} · v{revision}",
    useCurrentVersion: "Use current v{revision}",
    editRubricTooltip: "Edit rubric",
    createRubricTooltip: "Create rubric",
    editRubricAria: "Edit rubric {name}",
    maxRubricsTooltip: "Maximum {max} rubrics per thread",
    maxRubricsAria: "Maximum {max} rubrics per thread",
    createRubricAria: "Create rubric",
    // run-evaluation-scorecard.tsx — rubric grid headers + legend
    criterionHeader: "Criterion",
    scoreLegend: "1 = poor · 5 = excellent",
    scoresRemainingOne: "{count} score remaining",
    scoresRemainingOther: "{count} scores remaining",
    scoreAria: "{label}, {criterionName}, score {score} of 5",
    scoreRadiogroupAria: "{label}, {criterionName}",
    // run-evaluation-rubric-editor.tsx
    rubricNameLabel: "Rubric name",
    rubricNamePlaceholder: "Answer quality",
    criteriaLabel: "Criteria",
    criteriaHint:
      "Use 2–6 dimensions. Every score uses 1 = poor and 5 = excellent.",
    addCriterionButton: "Add criterion",
    criterionIndex: "Criterion {index}",
    criterionNamePlaceholder: "Correctness",
    criterionNameDuplicate: "Criterion names must be unique.",
    criterionDescriptionLabel: "Description (optional)",
    criterionDescriptionPlaceholder: "What should a reviewer look for?",
    moveCriterionUpTooltip: "Move criterion up",
    moveCriterionDownTooltip: "Move criterion down",
    removeCriterionTooltip: "Remove criterion",
    moveCriterionUpAria: "Move {name} up",
    moveCriterionDownAria: "Move {name} down",
    removeCriterionAria: "Remove {name}",
    deleteRubricButton: "Delete rubric",
    // run-evaluation-rubric-editor.tsx — footer
    backButton: "Back",
    saveRubricButton: "Save rubric",
    createRubricButton: "Create rubric",
    // run-evaluation-rubric-editor.tsx — delete confirm dialog
    confirmDeleteRubricTitle: "Delete rubric?",
    confirmDeleteRubricDescription:
      "The reusable definition will be removed. Saved evaluations keep their immutable rubric snapshots and scores.",
    confirmDeleteRubricAction: "Delete",
    // run-evaluation-rubric-editor.tsx — toast
    saveRubricErrorToast: "Unable to save rubric",
    saveRubricErrorToastDescription:
      "Check the rubric fields or the thread rubric limit.",
  },
  misc: {
    // skeleton.tsx
    loadingThreadPlaygroundAria: "Loading thread playground",
    modelsLabel: "Models",
    toolsLabel: "Tools",
    systemPromptLabel: "System prompt",
    // title-editor.tsx
    threadTitleAria: "Thread title",
    editThreadTitleAria: "Edit thread title",
    untitledPlaceholder: "untitled",
    clickToEditTitle: "Click to edit title",
    editTitle: "Edit title",
    // examples/prompts.ts — label/description for each selectable prompt example,
    // keyed by the example's stable `id`. The prompts.ts data module is not a
    // React component, so it can't call useI18n; consumers resolve by id.
    exampleLabel_blank: "Blank - Create from scratch",
    exampleLabel_generalAgent: "General Agent",
    exampleLabel_deepResearch: "Deep Research",
    exampleLabel_translation: "Translation",
    exampleLabel_deepWiki: "Deep Wiki",
    exampleLabel_compactMemory: "Compact Memory",
    exampleLabel_metaPrompt: "Meta Prompt",
    exampleLabel_metaImagePrompt: "Meta Image Prompt",
    exampleDescription_blank: "",
    exampleDescription_generalAgent:
      "A [DeerFlow-like](https://github.com/bytedance/deer-flow) assistant for coding, deep-research and more.",
    exampleDescription_deepResearch:
      "A structured investigator that plans and researches a topic in depth.",
    exampleDescription_translation:
      "Translator prompt focused on preserving meaning and style.",
    exampleDescription_deepWiki:
      "Long-form knowledge-base answer prompt with sources.",
    exampleDescription_compactMemory:
      "Memory compaction prompt for keeping useful context concise.",
    exampleDescription_metaPrompt:
      "Prompt-writing assistant that improves instructions.",
    exampleDescription_metaImagePrompt:
      "Prompt builder for structured image-generation briefs.",
  },
  errors: {
    // thread-file.ts — validateThreadFileStem error strings. The validator is a
    // pure module used outside React (import-threads.ts), so it cannot call
    // useI18n; consumers map these by matching the English source. Kept here as
    // the canonical translations.
    fileNameRequired: "File name is required.",
    fileNameCannotBeDotOrDotDot: "File name cannot be . or ..",
    fileNameContainsReservedChar: "File name contains a reserved character.",
    fileNameReservedByWindows: "File name is reserved by Windows.",
    fileNameCannotEndWithPeriodOrSpace:
      "File name cannot end with a period or space.",
    // title-editor.tsx — fallback when validateTitle returns no error message
    invalidFileName: "Invalid file name.",
    // use-stream-text.ts
    noModelAvailable: "No model available",
    textGenerationNotAvailable: "Text generation is not available here.",
  },};
