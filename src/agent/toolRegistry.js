export const boundaryOptions = [
  { value: "Automatic", description: "Run without asking" },
  { value: "Ask first", description: "Pause for your approval" },
  { value: "Draft only", description: "Prepare, never publish" },
  { value: "Blocked", description: "Do not access" },
];

export const MCP_CATALOG_SIZE = 127;

export const autonomyPresets = [
  {
    id: "conservative",
    name: "Conservative",
    description: "Read and reason automatically. Ask before drafts, changes, or anything external.",
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Read and reason automatically, prepare private drafts, and ask before visible changes.",
    recommended: true,
  },
  {
    id: "high",
    name: "High autonomy",
    description: "Run low-risk work automatically and ask only before high-impact actions.",
  },
];

const actions = [
  {
    id: "ai-understand",
    name: "AI Analysis",
    mark: "AI",
    action: "Interpret the request and available context",
    type: "reasoning",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "This happens inside the reasoning workspace and does not access or change an external system.",
  },
  {
    id: "ai-analyze",
    name: "AI Analysis",
    mark: "AI",
    action: "Analyse information and identify useful patterns",
    type: "reasoning",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Reasoning is needed to turn the information in your request into findings. It does not publish anything.",
  },
  {
    id: "ai-classify",
    name: "AI Analysis",
    mark: "AI",
    action: "Classify and group the supplied information",
    type: "reasoning",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "The information is grouped in the prototype workspace so recurring themes can be reviewed without changing source data.",
  },
  {
    id: "ai-compare",
    name: "AI Analysis",
    mark: "AI",
    action: "Compare options using consistent criteria",
    type: "reasoning",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "A consistent comparison is required to make the final recommendation explainable.",
  },
  {
    id: "ai-prioritize",
    name: "AI Analysis",
    mark: "AI",
    action: "Prioritise items by impact, urgency, and effort",
    type: "reasoning",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "The AI scores and orders the supplied items locally; it does not assign work or update a shared system.",
  },
  {
    id: "ai-recommend",
    name: "AI Analysis",
    mark: "AI",
    action: "Generate an evidence-aware recommendation",
    type: "reasoning",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "The recommendation is prepared for your review and is not treated as an external decision or published action.",
  },
  {
    id: "ai-structure",
    name: "AI Analysis",
    mark: "AI",
    action: "Structure the task into a practical plan",
    type: "reasoning",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Structuring uses only the task context provided in this prototype and does not require an external integration.",
  },
  {
    id: "ai-draft",
    name: "AI Drafting",
    mark: "AI",
    action: "Prepare editable draft content",
    type: "write",
    risk: "medium",
    defaultBoundary: "Draft only",
    explanation:
      "The AI prepares editable content but never publishes or sends it automatically.",
  },
  {
    id: "drive-search",
    name: "Google Drive",
    mark: "G",
    action: "Search relevant workspace files",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Read-only search helps locate relevant context. It cannot edit, move, or share a file.",
  },
  {
    id: "drive-read",
    name: "Google Drive",
    mark: "G",
    action: "Read relevant documents",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Read-only document access provides evidence for the task without modifying the source documents.",
  },
  {
    id: "figma-comments",
    name: "Figma",
    mark: "F",
    action: "Review design notes and unresolved comments",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Read-only access is useful when design feedback matters. The AI does not need permission to edit the design.",
  },
  {
    id: "jira-read",
    name: "Jira",
    mark: "J",
    action: "Read relevant issues and delivery status",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Issue status is read to identify dependencies and blockers; no shared issue is changed.",
  },
  {
    id: "jira-blockers",
    name: "Jira",
    mark: "J",
    action: "Search for unresolved blockers",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "A read-only blocker search supports risk assessment without changing project records.",
  },
  {
    id: "jira-draft",
    name: "Jira",
    mark: "J",
    action: "Prepare a draft Jira issue",
    type: "write",
    risk: "medium",
    defaultBoundary: "Draft only",
    explanation:
      "The proposed issue is prepared as a draft so you can review its wording and priority before creating anything.",
  },
  {
    id: "jira-update",
    name: "Jira",
    mark: "J",
    action: "Update a shared Jira issue",
    type: "write",
    risk: "high",
    defaultBoundary: "Ask first",
    explanation:
      "This would change a shared project record, so the agent must pause for explicit approval.",
  },
  {
    id: "slack-read",
    name: "Slack",
    mark: "S",
    action: "Read relevant team discussions",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Read-only access can provide team context. It does not post, react, or notify anyone.",
  },
  {
    id: "slack-draft",
    name: "Slack",
    mark: "S",
    action: "Prepare a Slack message draft",
    type: "write",
    risk: "medium",
    defaultBoundary: "Draft only",
    explanation:
      "A private draft is prepared for your review. No channel or person receives it.",
  },
  {
    id: "slack-send",
    name: "Slack",
    mark: "S",
    action: "Send a Slack message",
    type: "publish",
    risk: "high",
    defaultBoundary: "Ask first",
    explanation:
      "Sending is externally visible and can affect other people, so explicit approval is required.",
  },
  {
    id: "teams-read",
    name: "Microsoft Teams",
    mark: "T",
    action: "Read relevant Teams conversations",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Read-only access supplies team context without posting or changing a conversation.",
  },
  {
    id: "teams-draft",
    name: "Microsoft Teams",
    mark: "T",
    action: "Prepare a private Teams message draft",
    type: "write",
    risk: "medium",
    defaultBoundary: "Draft only",
    explanation:
      "The message remains a private draft until you choose to send it outside this prototype.",
  },
  {
    id: "teams-send",
    name: "Microsoft Teams",
    mark: "T",
    action: "Send a Teams message",
    type: "publish",
    risk: "high",
    defaultBoundary: "Ask first",
    explanation:
      "Sending affects other people and is externally visible, so the agent must pause first.",
  },
  {
    id: "web-search",
    name: "Web Research",
    mark: "W",
    action: "Search public information",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Public research is used when external evidence is needed. It does not sign in, purchase, or publish anything.",
  },
  {
    id: "web-compare",
    name: "Web Research",
    mark: "W",
    action: "Compare public sources",
    type: "read",
    risk: "low",
    defaultBoundary: "Automatic",
    explanation:
      "Comparing multiple public sources makes the result more balanced and traceable.",
  },
];

export const toolRegistry = Object.fromEntries(
  actions.map((action) => [action.id, action]),
);

export function getToolAction(id) {
  return toolRegistry[id] ?? toolRegistry["ai-analyze"];
}

export function derivePlanActions(plan) {
  const byId = new Map();

  plan.steps.forEach((step) => {
    const registryAction = getToolAction(step.toolId);
    if (byId.has(registryAction.id)) {
      byId.get(registryAction.id).stepIds.push(step.id);
      return;
    }

    byId.set(registryAction.id, {
      ...registryAction,
      ...capabilityContext(registryAction),
      stepIds: [step.id],
      boundary: registryAction.defaultBoundary,
      recommendedBoundary: registryAction.defaultBoundary,
      reason: recommendationReason(registryAction),
      why: `${registryAction.explanation} It supports the plan step: “${step.title}”.`,
    });
  });

  return [...byId.values()];
}

export function applyAutonomyPreset(planActions, presetId = "balanced") {
  return planActions.map((action) => {
    let boundary = action.defaultBoundary;
    if (presetId === "conservative") {
      boundary = ["read", "reasoning"].includes(action.type) ? "Automatic" : "Ask first";
    } else if (presetId === "balanced") {
      boundary = action.type === "write"
        ? "Draft only"
        : action.type === "publish" || action.risk === "high"
          ? "Ask first"
          : "Automatic";
    } else if (presetId === "high") {
      boundary = action.type === "publish" || action.risk === "high"
        ? "Ask first"
        : action.type === "write"
          ? "Automatic"
          : "Automatic";
    }
    return { ...action, boundary, presetBoundary: boundary };
  });
}

export function deriveMcpSelection(plan) {
  const planActions = derivePlanActions(plan);
  const selected = planActions.filter((action) => action.external);
  const selectedIds = new Set(selected.map((action) => action.id));
  const confidence = selectionConfidence(plan, selected);
  const considered = consideredCapabilities(plan.intent)
    .filter((item) => !selectedIds.has(item.id))
    .slice(0, 3)
    .map((item) => ({ ...getToolAction(item.id), ...capabilityContext(getToolAction(item.id)), reasonNotSelected: item.reason }));
  const ambiguity = sourceAmbiguity(plan, selected);

  return {
    catalogSize: MCP_CATALOG_SIZE,
    selected,
    considered,
    confidence,
    ambiguity,
  };
}

function capabilityContext(action) {
  const external = !action.id.startsWith("ai-");
  const context = {
    external,
    permission: action.type === "read"
      ? "Read-only"
      : action.type === "publish"
        ? "External action after approval"
        : action.type === "write"
          ? "Private draft"
          : "Reasoning workspace only",
    scope: scopeFor(action.id),
    duration: external ? "This task only" : "While this task is open",
    lowerRiskAlternative: lowerRiskAlternative(action),
    selectionReason: selectionReason(action.id),
    visibility: action.type === "publish"
      ? "Visible to other people"
      : action.type === "write"
        ? "Private until you approve sharing"
        : "Not externally visible",
    impact: action.type === "publish" || action.risk === "high"
      ? "Can affect a shared workspace or other people"
      : action.type === "write"
        ? "Creates reviewable content without publishing it"
        : "Does not change external data",
  };
  return context;
}

function scopeFor(id) {
  if (id.startsWith("slack-")) return "Relevant channel only (for example, #launch)";
  if (id.startsWith("teams-")) return "Relevant project conversation only";
  if (id.startsWith("jira-")) return "Current project and relevant issues only";
  if (id.startsWith("figma-")) return "Relevant design file and its comments only";
  if (id.startsWith("drive-")) return "Relevant project files only";
  if (id.startsWith("web-")) return "Public sources only";
  return "This task workspace only";
}

function lowerRiskAlternative(action) {
  if (action.type === "publish") return "Prepare a private draft and let the user send it.";
  if (action.id === "jira-update") return "Prepare a draft Jira change without updating the shared issue.";
  if (action.type === "read" && !action.id.startsWith("ai-")) return "Use only the context already supplied in this task.";
  return "Keep the work inside the reasoning workspace.";
}

function selectionReason(id) {
  const reasons = {
    "drive-search": "Project files are the most direct place to locate structured research evidence.",
    "drive-read": "Structured workspace documents provide traceable evidence with read-only access.",
    "figma-comments": "Design comments contain the closest evidence about unresolved experience decisions.",
    "jira-read": "Jira is the structured source for current work, ownership, and delivery status.",
    "jira-blockers": "Open issues are the most reliable source for known delivery blockers.",
    "jira-draft": "The outcome belongs in project work, but a draft avoids changing the shared backlog.",
    "jira-update": "The requested outcome explicitly requires a shared issue change.",
    "slack-read": "Recent team discussion may contain context that has not reached project records yet.",
    "slack-draft": "A private Slack draft fits the requested audience without sending anything.",
    "slack-send": "The goal explicitly asks for a Slack message to be sent after approval.",
    "teams-read": "The relevant Teams conversation may contain recent internal context.",
    "teams-draft": "A private Teams draft matches the requested project-update format.",
    "teams-send": "The goal explicitly asks for a Teams message to be sent after approval.",
    "web-search": "Current public evidence is needed and no private workspace access is required.",
    "web-compare": "Multiple public sources are needed to cross-check claims consistently.",
  };
  return reasons[id] ?? "This is the smallest capability that can complete its assigned plan step.";
}

function selectionConfidence(plan, selected) {
  if (plan.needsClarification || plan.intent === "general") {
    return {
      level: "Low",
      reason: "The goal or source context is broad, so a more specific outcome could change the capability choice.",
    };
  }
  if (["decision", "product-analysis", "communication"].includes(plan.intent)) {
    return {
      level: "Medium",
      reason: "The task is clear, but more than one enterprise source could contain the latest relevant evidence.",
    };
  }
  return {
    level: "High",
    reason: selected.length
      ? "The goal names a clear work type and each selected capability maps directly to a plan step."
      : "The supplied task can be completed in the reasoning workspace without unrelated external access.",
  };
}

function consideredCapabilities(intent) {
  const byIntent = {
    research: [
      { id: "slack-read", reason: "Recent discussion is less structured than the selected research files and design comments." },
      { id: "jira-read", reason: "Delivery status is not required to synthesise the requested research evidence." },
    ],
    "product-analysis": [
      { id: "slack-read", reason: "Structured product evidence and known issues are more traceable than recent chat." },
      { id: "web-search", reason: "The question concerns the internal product, not public market evidence." },
    ],
    competitive: [
      { id: "drive-read", reason: "Current public sources are more relevant than internal workspace files for this comparison." },
      { id: "slack-read", reason: "Team discussion would add opinion, not the external evidence the task requires." },
    ],
    feedback: [
      { id: "drive-read", reason: "The complaints supplied in the task are sufficient for the first analysis pass." },
      { id: "slack-read", reason: "Internal chat is not needed to classify the customer evidence provided." },
    ],
    planning: [
      { id: "slack-read", reason: "Jira is the structured system of record for sprint status and dependencies." },
      { id: "drive-read", reason: "The sprint can be planned from current issues without broad file access." },
    ],
    communication: [
      { id: "slack-read", reason: "Jira provides more structured status evidence than recent discussion." },
      { id: "drive-read", reason: "Broad document access is unnecessary for a concise status update." },
    ],
    decision: [
      { id: "drive-read", reason: "Direct design evidence and tracked blockers are closer to the launch decision." },
      { id: "slack-read", reason: "Recent discussion is less reliable than the selected source records." },
      { id: "web-search", reason: "Public information is not needed for this internal launch decision." },
    ],
  };
  return byIntent[intent] ?? [
    { id: "drive-read", reason: "The task does not currently require external workspace evidence." },
    { id: "slack-read", reason: "The task can proceed without reading team conversations." },
  ];
}

function sourceAmbiguity(plan, selected) {
  if (plan.sourceChoiceResolved) return null;
  const selectedIds = new Set(selected.map((action) => action.id));
  if (selectedIds.has("drive-read")) {
    return {
      question: "Structured reports or the latest team discussion?",
      recommendedToolId: "drive-read",
      alternativeToolId: "slack-read",
      recommendation: "Use Google Drive",
      reason: "Drive contains structured, traceable reports and can be scoped read-only; Slack may be newer but is broader and less stable.",
    };
  }
  if (selectedIds.has("figma-comments")) {
    return {
      question: "Direct design evidence or broader workspace reports?",
      recommendedToolId: "figma-comments",
      alternativeToolId: "drive-read",
      recommendation: "Use Figma comments",
      reason: "The design discussion is closest to the decision and needs a narrower scope than searching workspace files.",
    };
  }
  if (selectedIds.has("jira-read")) {
    return {
      question: "Structured project status or the latest team discussion?",
      recommendedToolId: "jira-read",
      alternativeToolId: "slack-read",
      recommendation: "Use Jira",
      reason: "Jira is the system of record for current work and needs narrower, read-only access than chat history.",
    };
  }
  return null;
}

function recommendationReason(action) {
  if (action.type === "read") {
    return "Read-only access does not change external data.";
  }
  if (action.type === "reasoning") {
    return "This work stays inside the analysis workspace.";
  }
  if (action.type === "publish" || action.risk === "high") {
    return "This action is externally visible or changes shared work.";
  }
  return "A reviewable draft is safer than changing a shared system directly.";
}
