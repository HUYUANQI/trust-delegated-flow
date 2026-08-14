import {
  generateFallbackPlan,
  generateFallbackResult,
  reviseFallbackPlan,
} from "./fallbackPlanner";

const endpoint = import.meta.env.VITE_AGENT_API_URL?.trim();

export async function generateAgentPlan(goal, context = {}) {
  if (!goal.trim()) return generateFallbackPlan(goal, context);
  if (!endpoint) return generateFallbackPlan(goal, context);

  try {
    const response = await requestAgent("generateAgentPlan", { goal, context });
    return validatePlan(response, goal);
  } catch {
    return generateFallbackPlan(goal, { ...context, apiFailed: true });
  }
}

export async function reviseAgentPlan(plan, feedback) {
  if (!endpoint) return reviseFallbackPlan(plan, feedback);

  try {
    const response = await requestAgent("reviseAgentPlan", { plan, feedback });
    return validatePlan(response, plan.originalGoal);
  } catch {
    return {
      ...reviseFallbackPlan(plan, feedback),
      plannerNotice:
        "The AI service could not revise the plan, so the local planner applied your instruction instead.",
    };
  }
}

export async function generateAgentResult(goal, plan, execution) {
  if (!endpoint) return generateFallbackResult(goal, plan, execution);

  try {
    return await requestAgent("generateAgentResult", { goal, plan, execution });
  } catch {
    return generateFallbackResult(goal, plan, execution);
  }
}

async function requestAgent(operation, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, payload }),
  });
  if (!response.ok) throw new Error(`Agent API returned ${response.status}`);
  return response.json();
}

function validatePlan(value, goal) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.title !== "string" ||
    typeof value.understanding !== "string" ||
    !Array.isArray(value.steps) ||
    value.steps.length < 2 ||
    value.steps.length > 6
  ) {
    throw new Error("Invalid agent plan");
  }

  return {
    ...value,
    id: value.id ?? `plan-${Date.now()}`,
    originalGoal: value.originalGoal ?? goal,
    expectedOutput: value.expectedOutput ?? "A reviewable task outcome.",
    assumptions: Array.isArray(value.assumptions) ? value.assumptions : [],
    riskLevel: ["low", "medium", "high"].includes(value.riskLevel)
      ? value.riskLevel
      : "medium",
    needsClarification: Boolean(value.needsClarification),
    clarifyingQuestion: value.clarifyingQuestion ?? null,
    clarificationOptions: Array.isArray(value.clarificationOptions)
      ? value.clarificationOptions
      : [],
    source: "api",
    steps: value.steps.map((step, index) => ({
      id: step.id ?? `step-${index + 1}`,
      title: step.title ?? `Step ${index + 1}`,
      description: step.description ?? "Complete this part of the task.",
      toolId: step.toolId ?? "ai-analyze",
      risk: ["low", "medium", "high"].includes(step.risk)
        ? step.risk
        : "low",
    })),
  };
}
