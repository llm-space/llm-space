import type { enThread } from "../en/thread";

// POPULATED BY THE i18n MIGRATION WORKFLOW — mirrors enThread's schema.
export const zhThread: typeof enThread = {
  toolbar: {
    // thread-playground.tsx — header icon buttons
    undoLastEdit: "撤销上次编辑",
    redoLastEdit: "重做上次编辑",
    viewRunHistory: "查看运行历史",
    hideRunHistory: "隐藏运行历史",
    shareThread: "分享对话",
    // run / stop button (tooltip content + button label + aria, conditional on status)
    runThisThread: "运行此对话",
    stopRunning: "停止运行",
    runThreadAria: "运行对话",
    stopRunningThreadAria: "停止运行对话",
    run: "运行",
    stop: "停止",
    // run settings dropdown
    runSettings: "运行设置",
    enableReactLoop: "启用 ReAct 循环",
    autoRunTools: "自动运行工具",
    // configuration section labels
    models: "模型",
    tools: "工具",
    variables: "变量",
    // examples-menu.tsx
    examples: "示例",
  },
  store: {
    duplicateVariableTitle: "变量名已存在",
    duplicateVariableDescription: "“{name}” 已被另一个变量使用。",
    errorTitle: "错误",
    runLastMessageError: "最后一条消息必须是用户消息或工具调用结果。",
    invalidToolDescription: "无效工具",
    toolAlreadyExistsDescription: "工具“{name}”已存在",
    riskyAutoRunTitle: "已暂停自动运行风险命令",
    riskyAutoRunDescription:
      "某个 bash 命令看起来具有破坏性，因此没有自动运行。请先检查，确认安全后再手动运行。",
    toolCallFailedFallback: "工具调用失败",
    selectModelToRun: "请选择要运行的模型",
    renderVariablesFailedTitle: "无法渲染提示词变量",
    renderVariablesFallback: "请检查系统提示词变量。",
  },
  message: {
    // message-list-view.tsx
    addMessage: "添加消息",

    // message-list-item.tsx
    insertMessageHere: "在此处插入消息",
    insertMessageBeforeAria: "在此消息前插入消息",
    enterUserMessageHere: "在此输入用户消息",
    enterAssistantMessageHere: "在此输入助手消息",
    callTools: "调用工具",
    callToolsAria: "调用可用的 MCP 和内置工具",
    continue: "继续",
    runFromThisMessage: "从此消息运行",
    someToolCallsFailed: "部分工具调用失败",
    toolCallFailedCount: "{errorCount}/{total} 个工具调用失败",
    toolCallsFailedCount: "{errorCount}/{total} 个工具调用失败",
    toolCallMarkerOne: "{count} 个工具调用",
    toolCallMarkerOther: "{count} 个工具调用",

    // message-list-item-header.tsx
    dragToReorder: "拖拽以重新排序",
    messageDragHandleAria: "{role} 消息拖拽手柄",
    toggleRole: "切换角色",
    changeMessageRoleAria: "将消息角色从 {role} 更改",
    roleUser: "用户",
    roleAssistant: "助手",
    previewTextContent: "预览文本内容",
    noTextContent: "无文本内容",
    noRunnableContent: "无可运行内容",
    cannotRunFromThisMessage: "无法从此消息运行",
    removeMessage: "移除消息",
    expandMessage: "展开消息",
    collapseMessage: "折叠消息",
    userMessageText: "用户消息文本",
    assistantMessageText: "助手消息文本",

    // thinking-view.tsx
    thinking: "思考",

    // todo-write-view.tsx
    viewArguments: "查看参数",
    argumentsOfTodoWrite: "todo_write() 的参数",

    // token-usage-summary.tsx
    tokenUsage: "Token 用量",
    tokenUsageAria: "Token 用量：{label}",

    // tool-call-input-view.tsx
    openInBrowser: "在浏览器中打开",
    revealInFileManager: "在文件管理器中显示",
    collapse: "折叠",
    expand: "展开",
    copyTextContent: "复制文本内容",
    copyValueAsJson: "复制值为 JSON",
    textContentLabel: "文本内容",
    valueJsonLabel: "值 JSON",
    previewValue: "预览值...",
    viewJson: "查看 JSON...",
    openInBrowserTitle: "在浏览器中打开",
    revealInFileManagerTitle: "在文件管理器中显示",
    viewValueOfArgument: "查看 {argumentKey} 的值",
    clickToCollapse: "点击折叠",
    clickToExpand: "点击展开",
    openActionsForArgumentAria: "打开 {argumentKey} 的操作",
    labelCopied: "已复制 {label}",
    failedToCopyLabel: "复制 {label} 失败",
    skillNotFound: "未找到技能：{value}",
    notFoundValue: "未找到：{value}",
    failedToRevealInFileManager: "在文件管理器中显示失败",

    // tool-call-list-item.tsx
    addToolResponsesBeforeContinuing: "继续前请添加工具响应",
    failedToCallTool: "调用 {toolName}() 失败",
    argumentsCopied: "已复制参数",
    failedToCopyArguments: "复制参数失败",
    copyArguments: "复制参数",
    callThisTool: "调用此工具",
    response: "响应",
    previewResponse: "预览响应",
    clearError: "清除错误",
    markAsError: "标记为错误",
    responseOfTool: "{toolName}() 的响应",
    enterResponseOfTool: "输入 {name}() 的响应",
    other: "其他",
    typeYourAnswer: "输入你的回答…",
    otherAnswerForQuestionAria: "{question} 的其他回答",

    // image-content-view.tsx
    openImagePreviewAria: "打开图片预览",
    removeImage: "移除图片",
    imagePreviewTitle: "图片预览",

    // add-images-menu.tsx
    imageFilesAria: "图片文件",
    addImageToMessageAria: "向消息添加图片",
    addImages: "添加图片",
    fromFiles: "从文件",
    fromClipboard: "从剪贴板",

    // use-tool-call-runner.ts
    toolCallFailedFallback: "工具调用失败",
  },
  model: {
    // model-selector.tsx
    noModelSelectedPlaceholder: "（未选择模型）",
    noModelsFound: "未找到模型。",
    modelSelectorAria: "模型选择器",
    openModelSelectorAria: "打开模型选择器",
    configureModels: "配置模型...",
    // model-config-editor.tsx
    noModelFallback: "（无模型）",
    // model-card.tsx
    supported: "支持",
    notSupported: "不支持",
    modelLabel: "模型",
    providerLabel: "提供商",
    apiTypeLabel: "API 类型",
    baseUrlLabel: "基础 URL",
    contextWindowLabel: "上下文窗口",
    maxTokensLabel: "最大 Token 数",
    reasoningLabel: "推理",
    imageInputLabel: "图像输入",
    inputCostLabel: "输入成本",
    outputCostLabel: "输出成本",
    // model-params-popover.tsx
    showModelDetailsAria: "显示模型详情",
    configureModelSettings: "配置模型设置",
    configureModelParametersAria: "配置模型参数",
    openModelProviderSettingsAria: "打开模型提供商设置",
    modelSettingsTitle: "模型设置",
    temperatureLabel: "温度",
    thinkingEffortLabel: "思考强度",
    responseFormatLabel: "响应格式",
    jsonObject: "JSON 对象",
    jsonSchema: "JSON Schema",
    editSchema: "编辑 Schema",
    reasoningOff: "关闭",
    reasoningMinimal: "最小",
    reasoningLow: "低",
    reasoningMedium: "中",
    reasoningHigh: "高",
    reasoningXHigh: "超高",
    disableAria: "禁用 {label}",
    enableAria: "启用 {label}",
    // json-schema-dialog.tsx
    editResponseSchemaTitle: "编辑响应 Schema",
    editResponseSchemaDescription:
      "模型会将其响应限制为此 JSON Schema。支持程度与严格性因提供商而异。",
    cancel: "取消",
    save: "保存",
    errorToastTitle: "错误",
    invalidJsonToast: "无效的 JSON",
    schemaMustBeObjectToast: "Schema 必须是 JSON 对象",
  },
  tool: {
    // tool-list-view.tsx — "Add" dropdown trigger + items
    add: "添加",
    addBuiltInTools: "添加内置工具",
    addMcpTools: "添加 MCP 工具",
    addCustomFunctionTool: "添加自定义函数工具",

    // tool-list-item.tsx — tooltips + aria labels
    removeTool: "移除工具",
    editToolAria: "编辑 {name} 工具",
    manageToolAria: "管理 {name} {type} 工具",
    removeToolAria: "移除 {name} 工具",
    typeMcp: "MCP",
    typeBuiltin: "内置",

    // tool-editor-dialog.tsx
    editToolTitle: "编辑工具",
    addFunctionToolTitle: "添加函数工具",
    editorDescription:
      "函数工具由名称、描述和参数组成。参数使用 JSON Schema 定义。由于该工具是自定义的，你需要在运行时提供响应。",
    definition: "定义",
    create: "创建",
    generatePlaceholder:
      "描述你的函数功能（或粘贴你的函数声明代码），我们将为你生成定义。",
    mcpNotEditableToast: "MCP 工具不能作为函数工具编辑",
    invalidJsonToast: "无效的 JSON",

    // tool-import-sidebar-actions.tsx
    toolActionsAria: "工具操作",
    enableAllTools: "启用全部工具",
    disableAllTools: "禁用全部工具",

    // built-in-tool-import-dialog.tsx
    addBuiltInToolsTitle: "添加内置工具",
    addBuiltInToolsDescription: "选择要在此对话中启用的内置工具。",
    searchTools: "搜索工具",
    categoryFileSystem: "文件系统",
    categoryWeb: "网络",
    categoryMisc: "其他",
    noToolsMatchSearch: "没有符合搜索条件的工具。",
    noBuiltInToolsInCategory: "此类别中没有内置工具。",
    addToolAria: "添加 {name}",
    removeToolAriaBuiltIn: "移除 {name}",
    failedToLoadBuiltInTools: "加载内置工具失败",

    // mcp-tool-import-popover.tsx
    addMcpToolsTitle: "添加 MCP 工具",
    addMcpToolsDescription: "选择一个服务器，然后向此对话添加一个或多个 MCP 工具。",
    noServers: "无服务器",
    noMcpServersConfigured: "未配置 MCP 服务器。",
    openSettings: "打开设置",
    testServer: "测试服务器",
    configureMcp: "配置 MCP",
    untested: "未测试",
    testedPrefix: "测试于",
    noToolsLoaded: "未加载工具",
    addToolAriaMcp: "添加 {name}",
    removeToolAriaMcp: "移除 {name}",
    failedToLoadMcpServers: "加载 MCP 服务器失败",
    failedToLoadMcpTools: "加载 MCP 工具失败",
  },
  variable: {
    // prompt-variables-dialog.tsx
    dialogTitle: "变量",
    dialogDescription:
      "在提示词、消息和工具结果中使用 `{{variable_name}}` 作为占位符来引用该变量。例如 `{{current_date}}` 会被替换为当前日期。",
    // prompt-variables-list-view.tsx — chip list "Add" button
    add: "添加",
    // prompt-variables-panel.tsx — "Add variable" button
    addVariable: "添加变量",
    // built-in skills variable statuses
    allSkills: "全部技能",
    allSkillsDefault: "全部技能（默认）",
    selectedCount: "已选 {count} 个",
    missingCount: "{count} 个缺失",
    countSelected: "已选 {count} 个",
    // custom variable empty value
    emptyValue: "（空）",
    // section group headers
    builtIn: "内置",
    custom: "自定义",
    noCustomVariables: "暂无自定义变量。",
    // detail shell titles
    currentDate: "当前日期",
    availableSkills: "可用技能",
    userDefinedVariable: "用户定义变量",
    // field labels
    name: "名称",
    format: "格式",
    value: "值",
    indent: "缩进",
    variableValuePlaceholder: "变量值",
    // name validation feedback
    nameInvalid: "只能使用字母、数字和下划线；需以字母或下划线开头。",
    nameExists: "名称已存在。",
    // skills selection
    selectSkills: "选择技能",
    selectSkillsTitle: "选择技能",
    selectSkillsDescription:
      "默认包含所有已启用的技能。选择特定技能可将其限定为仅这些技能。",
    searchSkills: "搜索技能",
    clear: "清除",
    noMatchingSkills: "没有匹配的技能。",
    loadingSkills: "正在加载技能...",
    someSkillsNoLongerEnabled: "部分已选技能已不再启用。",
    failedToLoadSkills: "加载技能失败。",
    // empty / placeholder detail states
    addCustomHint: "添加一个自定义变量以提供可复用的值。",
    selectVariableToEdit: "选择一个变量进行编辑。",
    // delete custom variable confirm
    deleteCustomTitle: "删除自定义变量？",
    deleteVariable: "删除变量",
    deleteReferencedDesc:
      "此对话引用了 `{{name}}`。删除该变量将留下未解析的占位符。",
    deleteRemoveDesc: "此操作会从该对话中移除 `{{name}}` 及其值。",
    // indent option labels
    indentDefault: "默认",
    indentSpaces: "{count} 个空格",
    // chip copy affordance
    ariaManageVariable: "管理 {name} 变量",
    ariaCopyToken: "复制 {token}",
    tooltipCopyHeading: "复制",
    toastCopiedToken: "已复制 {token}",
    toastPasteHint: "将其粘贴到提示词、消息或工具结果中以引用该变量。",
    // CodeMirror hover tooltip (prompt-variable-extension.ts)
    viewVariableDetails: "查看变量详情",
    warningNoValue: "此变量尚无值。",
    warningInvalidName: "无效的变量名。",
    warningUnknown: "未知变量——未在此对话中定义。",
    // date format option labels (prompt-variable-options.ts)
    formatReadableDate: "可读日期",
    formatIsoDate: "ISO 日期",
    formatLocalDateTime: "本地日期和时间",
    // skills format option labels (prompt-variable-options.ts)
    formatXml: "XML",
    formatMarkdownList: "Markdown 列表",
    // select aria-labels
    ariaCurrentDateFormat: "当前日期格式",
    ariaSkillsFormat: "技能格式",
    ariaSkillsIndentation: "技能缩进",
    ariaDeleteCustomVariable: "删除自定义变量",
  },
  prompt: {
    sectionLabel: "系统提示词",
    editorPlaceholder: "在此输入系统提示词",
    generateSystemHint:
      "描述你想要的助手（其角色、语气和规则），我们将为你生成系统提示词。",
    generateFunctionHint:
      "描述你的函数功能（或粘贴你的代码），我们将为你生成定义。",
    generate: "生成",
  },
  runHistory: {
    // 标题与分区标题
    title: "运行历史",
    inspectRunTitle: "查看运行",
    compareRuns: "对比运行",
    evaluations: "评估",
    // 按钮
    back: "返回",
    compare: "对比",
    // 提示
    previousRun: "上一个运行",
    nextRun: "下一个运行",
    removeRun: "移除运行",
    inspectRun: "查看运行",
    restoreRun: "恢复运行",
    selectRun: "选择运行",
    removeFromComparison: "从对比中移除",
    removeEvaluation: "移除评估",
    // 空状态与回退文案
    noRunsYet: "暂无运行",
    selectRunToInspect: "选择一个已保存的运行进行查看。",
    systemPrompt: "系统提示词",
    noSystemPrompt: "无系统提示词",
    // 数量与位置
    selectedCount: "已选 {count}/2",
    positionOfTotal: "第 {index} 个，共 {total} 个",
    // aria-labels
    ariaBackToRunHistory: "返回运行历史",
    ariaCloseRunHistory: "关闭运行历史",
    ariaInspectPreviousRun: "查看上一个运行",
    ariaInspectNextRun: "查看下一个运行",
    ariaInspectRun: "查看运行，时间：{time}：{summary}",
    ariaRemoveRun: "移除运行，时间：{time}",
    ariaRemoveFromComparison: "从对比中移除运行：{summary}",
    ariaSelectRunForComparison: "选择运行进行对比：{summary}",
    ariaInspectRunDetailed:
      "查看运行，时间：{time}：{summary}。{modelLabel}。{messageCountLabel}",
    ariaRestoreRun:
      "恢复运行，时间：{time}：{summary}。{modelLabel}。{messageCountLabel}",
    ariaOpenEvaluation: "打开已保存的评估：{verdict}",
    ariaRemoveEvaluation: "移除评估：{verdict}",
    // 确认对话框
    confirmRemoveRunTitle: "移除运行？",
    confirmRemoveRunDescription:
      "此操作会从该对话中移除已保存的运行，并移除任何引用它的评估。",
    confirmRemoveEvaluationTitle: "移除评估？",
    confirmRemoveEvaluationDescription:
      "此操作会从该对话中移除已保存的评估。被对比的运行将保留。",
    remove: "移除",
    // 对比摘要与评分
    runLabelA: "A：{summary}",
    runLabelB: "B：{summary}",
    rubricRevision: "{name} · v{revision}",
    scoreDelta: "A {aAvg} · B {bAvg} · Δ {delta}",
    // 评审结论标签（与 evaluation 分组共享）
    verdictRunABetter: "运行 A 更好",
    verdictRunBBetter: "运行 B 更好",
    verdictTie: "平局",
    verdictPass: "通过",
    verdictFail: "未通过",
  },
  evaluation: {
    // run-evaluation-dialog.tsx — conditional dialog titles
    compareRunsTitle: "对比运行",
    inspectRunTitle: "查看运行",
    editRubricTitle: "编辑评分量表",
    createRubricTitle: "创建评分量表",
    evaluateRunsTitle: "评估运行",
    // run-evaluation-dialog.tsx — conditional dialog descriptions
    inspectRunDescription: "本次对比中保存的运行证据。",
    editRubricDescription: "为在此对话中手动对比运行创建可复用的评审标准。",
    compareRunsDescription: "对比两次已保存的运行，并将结构化评估保存到此对话。",
    // run-evaluation-dialog.tsx — comparison panels
    runLabelA: "运行 A",
    runLabelB: "运行 B",
    inspectButton: "查看",
    inspectAria: "查看 {label}：{summary}",
    lastSaved: "上次保存 {time}",
    compareTimestampsTitle: "{left} 对 {right}",
    // run-evaluation-dialog.tsx — meta labels
    metaModel: "模型",
    metaMessages: "消息",
    metaCaptured: "捕获时间",
    systemPromptLabel: "系统提示词",
    lastUserMessageLabel: "最后一条用户消息",
    resultLabel: "结果",
    // run-evaluation-dialog.tsx — verdict section + note
    verdictLabel: "结论",
    evaluationNoteLabel: "评估备注",
    evaluationNotePlaceholder: "此次运行为何通过、失败或优于另一运行？",
    // run-evaluation-dialog.tsx — footer buttons
    close: "关闭",
    saveEvaluation: "保存评估",
    backToEvaluation: "返回评估",
    // run-evaluation-dialog.tsx — empty state
    selectTwoRuns: "选择两个运行进行对比。",
    // run-evaluation-dialog.tsx — remove-scores confirm dialog
    confirmRemoveScoresTitle: "移除评分量表分数？",
    confirmRemoveScoresDescription:
      "不带评分量表保存将永久移除此评估中已保存的量表快照及所有评分标准的分数。此操作不可撤销。",
    confirmRemoveScoresAction: "移除分数并保存",
    // run-evaluation-dialog.tsx — toasts
    saveEvaluationErrorToast: "无法保存评估",
    saveEvaluationErrorToastDescription: "请检查所选运行和量表分数。",
    saveEvaluationSuccessToast: "评估已保存",
    // run-evaluation-scorecard.tsx
    rubricLabel: "评分量表",
    rubricHint: "对每次运行一致地评分，或保留仅使用结论的旧流程。",
    rubricAria: "评估评分量表",
    noRubricOption: "无评分量表",
    savedRubricOption: "{name}（已保存 v{revision}）",
    definitionRubricOption: "{name} · v{revision}",
    useCurrentVersion: "使用当前 v{revision}",
    editRubricTooltip: "编辑评分量表",
    createRubricTooltip: "创建评分量表",
    editRubricAria: "编辑评分量表 {name}",
    maxRubricsTooltip: "每个对话最多 {max} 个评分量表",
    maxRubricsAria: "每个对话最多 {max} 个评分量表",
    createRubricAria: "创建评分量表",
    // run-evaluation-scorecard.tsx — rubric grid headers + legend
    criterionHeader: "评分标准",
    scoreLegend: "1 = 差 · 5 = 优",
    scoresRemainingOne: "剩余 {count} 个分数",
    scoresRemainingOther: "剩余 {count} 个分数",
    scoreAria: "{label}，{criterionName}，分数 {score} / 5",
    scoreRadiogroupAria: "{label}，{criterionName}",
    // run-evaluation-rubric-editor.tsx
    rubricNameLabel: "评分量表名称",
    rubricNamePlaceholder: "回答质量",
    criteriaLabel: "评分标准",
    criteriaHint: "使用 2–6 个维度。每个分数使用 1 = 差，5 = 优。",
    addCriterionButton: "添加评分标准",
    criterionIndex: "评分标准 {index}",
    criterionNamePlaceholder: "正确性",
    criterionNameDuplicate: "评分标准名称必须唯一。",
    criterionDescriptionLabel: "描述（可选）",
    criterionDescriptionPlaceholder: "评审者应关注什么？",
    moveCriterionUpTooltip: "上移评分标准",
    moveCriterionDownTooltip: "下移评分标准",
    removeCriterionTooltip: "移除评分标准",
    moveCriterionUpAria: "上移 {name}",
    moveCriterionDownAria: "下移 {name}",
    removeCriterionAria: "移除 {name}",
    deleteRubricButton: "删除评分量表",
    // run-evaluation-rubric-editor.tsx — footer
    backButton: "返回",
    saveRubricButton: "保存评分量表",
    createRubricButton: "创建评分量表",
    // run-evaluation-rubric-editor.tsx — delete confirm dialog
    confirmDeleteRubricTitle: "删除评分量表？",
    confirmDeleteRubricDescription:
      "可复用的定义将被移除。已保存的评估保留其不可变的量表快照和分数。",
    confirmDeleteRubricAction: "删除",
    // run-evaluation-rubric-editor.tsx — toast
    saveRubricErrorToast: "无法保存评分量表",
    saveRubricErrorToastDescription: "请检查量表字段或对话量表数量上限。",
  },
  misc: {
    // skeleton.tsx
    loadingThreadPlaygroundAria: "正在加载对话游乐场",
    modelsLabel: "模型",
    toolsLabel: "工具",
    systemPromptLabel: "系统提示词",
    // title-editor.tsx
    threadTitleAria: "对话标题",
    editThreadTitleAria: "编辑对话标题",
    untitledPlaceholder: "未命名",
    clickToEditTitle: "点击编辑标题",
    editTitle: "编辑标题",
    // examples/prompts.ts — 每个可选提示词示例的 label/description，按示例稳定 id 索引。
    exampleLabel_blank: "空白 - 从零开始",
    exampleLabel_generalAgent: "通用 Agent",
    exampleLabel_deepResearch: "深度研究",
    exampleLabel_translation: "翻译",
    exampleLabel_deepWiki: "Deep Wiki",
    exampleLabel_compactMemory: "紧凑记忆",
    exampleLabel_metaPrompt: "元提示词",
    exampleLabel_metaImagePrompt: "元图像提示词",
    exampleDescription_blank: "",
    exampleDescription_generalAgent:
      "一个 [类似 DeerFlow](https://github.com/bytedance/deer-flow) 的助手，可用于编程、深度研究等。",
    exampleDescription_deepResearch:
      "一个结构化的调研助手，会规划并深入研究某个主题。",
    exampleDescription_translation: "专注于保留含义与风格的翻译提示词。",
    exampleDescription_deepWiki: "长文知识库问答提示词，附带来源。",
    exampleDescription_compactMemory: "用于保持有用上下文简洁的记忆压缩提示词。",
    exampleDescription_metaPrompt: "帮助改进指令的提示词写作助手。",
    exampleDescription_metaImagePrompt: "用于结构化图像生成简报的提示词构建器。",
  },
  errors: {
    // thread-file.ts — validateThreadFileStem error strings. The validator is a
    // pure module used outside React (import-threads.ts), so it cannot call
    // useI18n; consumers map these by matching the English source. Kept here as
    // the canonical translations.
    fileNameRequired: "文件名不能为空。",
    fileNameCannotBeDotOrDotDot: "文件名不能为 . 或 ..",
    fileNameContainsReservedChar: "文件名包含保留字符。",
    fileNameReservedByWindows: "文件名为 Windows 保留名称。",
    fileNameCannotEndWithPeriodOrSpace: "文件名不能以句点或空格结尾。",
    // title-editor.tsx — fallback when validateTitle returns no error message
    invalidFileName: "无效的文件名。",
    // use-stream-text.ts
    noModelAvailable: "没有可用的模型",
    textGenerationNotAvailable: "此处无法生成文本。",
  },
};
