import assert from "node:assert/strict";
import {
  generateFallbackPlan,
  generateFallbackResult,
} from "../src/agent/fallbackPlanner.js";
import {
  applyAutonomyPreset,
  deriveMcpSelection,
  derivePlanActions,
  getToolAction,
} from "../src/agent/toolRegistry.js";
import {
  completionMessage,
  discoveryForPlan,
} from "../src/agent/executor.js";

const inputs = [
  "Prepare a UX feedback summary for Friday.",
  "Help me understand why users are abandoning checkout.",
  "Compare our product against three competitors.",
  "Prepare a project update for my manager.",
  "Help me prioritise what the team should work on next week.",
  "Analyse these customer complaints and identify themes.",
  "Prepare a report.",
  "Help me plan a birthday dinner.",
  "What is the biggest risk in this project?",
  "Create a weekly study schedule for learning Japanese around a full-time job.",
];

const plans = inputs.map((input) => generateFallbackPlan(input));

plans.forEach((plan, index) => {
  if (index === 6) return;
  assert.equal(plan.needsClarification, false, `Unexpected clarification for: ${inputs[index]}`);
  assert.ok(plan.steps.length >= 2 && plan.steps.length <= 6, `Invalid step count for: ${inputs[index]}`);
  assert.ok(plan.understanding.length > 20, `Missing understanding for: ${inputs[index]}`);
  assert.ok(plan.expectedOutput.length > 15, `Missing output for: ${inputs[index]}`);
  const result = generateFallbackResult(inputs[index], plan, {
    items: plan.steps.map((step) => ({ ...step, status: "completed" })),
  });
  assert.ok(result.sections.length > 0, `Missing dynamic result for: ${inputs[index]}`);
});

assert.equal(plans[6].needsClarification, true, "A vague report request should ask a clarifying question");
assert.ok(plans[6].clarificationOptions.length >= 3, "Clarification should offer useful options");

const clarifiedReport = generateFallbackPlan(inputs[6], {
  clarificationAnswer: "Project progress for my manager",
});
assert.equal(clarifiedReport.intent, "communication");
assert.ok(clarifiedReport.steps.length >= 2);

assert.equal(plans[2].intent, "competitive");
assert.ok(plans[2].steps.some((step) => step.toolId === "web-search"));

assert.equal(plans[3].intent, "communication");
assert.ok(plans[3].steps.some((step) => step.toolId === "teams-draft"));

assert.equal(plans[5].intent, "feedback");
assert.ok(plans[5].steps.some((step) => step.toolId === "ai-classify"));

assert.equal(plans[7].intent, "event");
assert.ok(
  plans[7].steps.every(
    (step) => !step.toolId.startsWith("figma") && !step.toolId.startsWith("jira"),
  ),
  "Birthday planning must not invent Figma or Jira usage",
);

assert.equal(plans[8].intent, "risk");
assert.ok(plans[8].steps.every((step) => step.toolId.startsWith("ai-")));

const sensitivePlan = generateFallbackPlan("Prepare and send a project update in Slack.");
const sensitiveActions = derivePlanActions(sensitivePlan);
assert.ok(
  sensitiveActions.some(
    (action) => action.id === "slack-send" && action.recommendedBoundary === "Ask first",
  ),
  "Externally visible actions must recommend Ask first",
);

const signatures = new Set(
  plans
    .filter((plan) => !plan.needsClarification)
    .map((plan) => plan.steps.map((step) => step.toolId).join(",")),
);
assert.ok(signatures.size >= 7, "Different tasks should produce meaningfully different tools and plans");

// Seven research flows: tool choice, autonomy, ambiguity, runtime permission, and blocking.
const launchFlow = generateFallbackPlan("Decide whether our redesigned onboarding should launch next week.");
const launchSelection = deriveMcpSelection(launchFlow);
assert.ok(launchSelection.selected.some((action) => action.id === "figma-comments"));
assert.ok(launchSelection.selected.some((action) => action.id === "jira-blockers"));
assert.equal(launchSelection.confidence.level, "Medium");
assert.ok(launchSelection.considered.length >= 1);

const complaintFlow = generateFallbackPlan("Analyse these customer complaints and identify recurring themes.");
const complaintSelection = deriveMcpSelection(complaintFlow);
assert.equal(complaintFlow.intent, "feedback");
assert.equal(complaintSelection.selected.length, 0, "Supplied complaints should not trigger irrelevant MCP access");
assert.equal(complaintSelection.confidence.level, "High");

const sprintFlow = generateFallbackPlan("Plan next week's sprint and identify delivery blockers.");
assert.ok(deriveMcpSelection(sprintFlow).selected.some((action) => action.id === "jira-read"));
assert.ok(!deriveMcpSelection(sprintFlow).selected.some((action) => action.id === "figma-comments"));

const updateFlow = generateFallbackPlan("Prepare and send a project update in Teams.");
const updateActions = derivePlanActions(updateFlow);
assert.ok(updateActions.some((action) => action.id === "jira-read"));
assert.ok(updateActions.some((action) => action.id === "teams-send" && action.defaultBoundary === "Ask first"));

assert.ok(launchSelection.ambiguity, "Launch decisions should surface an ambiguous enterprise source choice");
assert.notEqual(launchSelection.ambiguity.recommendedToolId, launchSelection.ambiguity.alternativeToolId);

const runtimeRequest = discoveryForPlan(launchFlow, 2);
assert.ok(runtimeRequest, "Execution should be able to request a missing MCP");
assert.equal(runtimeRequest.action.permission, "Read-only");
assert.match(runtimeRequest.action.scope, /#launch|project file/i);
assert.match(runtimeRequest.action.duration, /task only/i);

const balanced = applyAutonomyPreset(updateActions, "balanced");
const conservative = applyAutonomyPreset(updateActions, "conservative");
const high = applyAutonomyPreset(updateActions, "high");
assert.equal(balanced.find((action) => action.id === "teams-draft")?.boundary, "Draft only");
assert.equal(conservative.find((action) => action.id === "teams-draft")?.boundary, "Ask first");
assert.equal(high.find((action) => action.id === "teams-send")?.boundary, "Ask first");

const blockedAction = getToolAction("jira-read");
assert.match(
  completionMessage(sprintFlow.steps[0], blockedAction, "Blocked"),
  /skipped.*blocked/i,
  "A blocked capability must be recorded as not executed",
);

console.log(`Planner checks passed for ${inputs.length} general inputs and all 7 MCP trust research flows.`);
