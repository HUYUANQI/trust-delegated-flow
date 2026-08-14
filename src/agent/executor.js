import { getToolAction } from "./toolRegistry";

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
  if (boundary === "Blocked") return `${step.title} skipped 鈥?access blocked.`;
  if (action.type === "publish") {
    return `${step.title} simulated after approval 鈥?nothing was actually sent.`;
  }
  if (action.type === "write" || boundary === "Draft only") {
    return `${step.title} completed 鈥?a private draft was prepared.`;
  }
  if (action.type === "read") {
    return `${step.title} completed in prototype simulation 鈥?no external data was changed.`;
  }
  return `${step.title} completed in the reasoning workspace.`;
}

export function runningMessage(step) {
  const action = getToolAction(step.toolId);
  const byType = {
    read: `Reviewing the information needed for 鈥?{step.title}鈥濃€,
    write: `Preparing a reviewable draft for 鈥?{step.title}鈥濃€,
    publish: `Preparing the proposed external action for approval鈥,
    reasoning: `Working through 鈥?{step.title}鈥濃€,
  };
  return byType[action.type] ?? `Working on 鈥?{step.title}鈥濃€;
}

export function discoveryForPlan(plan, completedCount) {
  if (completedCount < 2) return null;
  if (!["research", "feedback", "product-analysis", "decision"].includes(plan.intent)) {
    return null;
  }

  return {
    id: `discovery-${Date.now()}`,
    title: "Review an additional risk signal",
    description:
      plan.intent === "product-analysis"
        ? "The initial analysis suggests that accessibility or error recovery may contribute to the observed product friction."
        : "The evidence may contain a related risk signal that was not explicit in the original plan.",
    recommendation: "+ Add a focused review before finalising the recommendation",
    step: {
      id: `step-discovery-${Date.now()}`,
      title: "Review the newly discovered risk signal",
      description:
        "Assess whether the additional signal changes the findings or recommended next action.",
      toolId: "ai-analyze",
      risk: "low",
      status: "pending",
      statusMessage: "Waiting to review the new signal.",
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
