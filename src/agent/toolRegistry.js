export const boundaryOptions = [
  { value: "Automatic", description: "Run without asking" },
  { value: "Ask first", description: "Pause for your approval" },
  { value: "Draft only", description: "Prepare, never publish" },
  { value: "Blocked", description: "Do not access" },
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
      stepIds: [step.id],
      boundary: registryAction.defaultBoundary,
      recommendedBoundary: registryAction.defaultBoundary,
      reason: recommendationReason(registryAction),
      why: `${registryAction.explanation} It supports the plan step: 鈥?{step.title}鈥?`,
    });
  });

  return [...byId.values()];
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
