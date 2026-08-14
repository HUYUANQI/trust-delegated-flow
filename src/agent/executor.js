import { getToolAction } from "./toolRegistry.js";

export function createExecutionItems(plan) {
  return plan.steps.map((step) => ({
    ...step,
    status: "pending",
    statusMessage: pendingMessage(step),
  }));
}

export function createAuditEvent(message, kind = "info") {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    message,
    kind,
  };
}

export function completionMessage(step, action, boundary) {
  if (boundary === "Blocked") return `${step.title} skipped — access blocked.`;
  if (action.type === "publish") {
    return `${step.title} simulated after approval — nothing was actually sent.`;
  }
  if (action.type === "write" || boundary === "Draft only") {
    return `${step.title} completed — a private draft was prepared.`;
  }
  if (action.type === "read") {
    return `${step.title} completed in prototype simulation — no external data was changed.`;
  }
  return `${step.title} completed in the reasoning workspace.`;
}

export function runningMessage(step) {
  const action = getToolAction(step.toolId);
  const byType = {
    read: `Reviewing the information needed for “${step.title}”…`,
    write: `Preparing a reviewable draft for “${step.title}”…`,
    publish: `Preparing the proposed external action for approval…`,
    reasoning: `Working through “${step.title}”…`,
  };
  return byType[action.type] ?? `Working on “${step.title}”…`;
}

export function discoveryForPlan(plan, completedCount) {
  if (completedCount < 2) return null;
  if (!["research", "feedback", "product-analysis", "decision"].includes(plan.intent)) {
    return null;
  }

  const needsRecentDiscussion = ["research", "product-analysis", "decision"].includes(plan.intent);
  const toolId = needsRecentDiscussion ? "slack-read" : "drive-read";
  const alternativeToolId = needsRecentDiscussion ? "drive-read" : "ai-analyze";
  const action = getToolAction(toolId);

  return {
    id: `discovery-${Date.now()}`,
    title: `A missing ${action.name} capability could improve this result`,
    description:
      needsRecentDiscussion
        ? "The agent found a reference to a recent launch discussion that was not available in the original plan."
        : "The agent found a reference to a structured workspace report that was not available in the original plan.",
    recommendation: `Allow read-only ${action.name} access once, scoped to ${needsRecentDiscussion ? "#launch" : "the referenced project file"}.`,
    why: "This capability was not selected initially because the reference only appeared during execution. The agent is pausing instead of expanding its own access.",
    action: {
      ...action,
      scope: needsRecentDiscussion ? "#launch only" : "Referenced project file only",
      duration: "This task only; expires when the run finishes",
      permission: "Read-only",
    },
    alternative: {
      ...getToolAction(alternativeToolId),
      scope: alternativeToolId === "drive-read" ? "Referenced launch report only" : "Current task context only",
      duration: "This task only",
      permission: alternativeToolId === "drive-read" ? "Read-only" : "No external access",
    },
    step: {
      id: `step-discovery-${Date.now()}`,
      title: needsRecentDiscussion ? "Check the referenced #launch discussion" : "Review the referenced project report",
      description:
        "Use the temporary, scoped permission to check whether the new evidence changes the recommendation.",
      toolId,
      risk: "low",
      status: "pending",
      statusMessage: `Waiting for temporary ${action.name} permission.`,
    },
  };
}

function pendingMessage(step) {
  const action = getToolAction(step.toolId);
  if (action.type === "read") return `Waiting for approved read-only access to ${action.name}.`;
  if (action.type === "write") return "Waiting to prepare a private draft.";
  if (action.type === "publish") return "Waiting for explicit approval before any visible action.";
  return "Waiting in the reasoning workspace.";
}
