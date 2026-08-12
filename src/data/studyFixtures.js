export const researchScenarioGoal = "Analyze five user interviews and prepare a summary for the product team.";

export const researchScenarioTasks = [
  {
    order: 1, title: "Understand research objective", description: "Clarify the learning goals, participant context, and intended product decision.",
    risk: "low", recoverability: "high", executor: "ai", recommended_executor: "ai", permission: "not_required", human_judgment: "low",
    reasoning: "The objective can be structured from the supplied brief, and any misunderstanding is easy to correct before later work begins.",
    confidence: .94, external_impact: false, status: "pending", depends_on: [],
  },
  {
    order: 2, title: "Organize interview data", description: "Group notes by participant and normalize the interview material without changing meaning.",
    risk: "low", recoverability: "high", executor: "ai", recommended_executor: "ai", permission: "not_required", human_judgment: "low",
    reasoning: "AI can organize repeated material efficiently. The source notes remain unchanged, so the organization can be reviewed or undone.",
    confidence: .92, external_impact: false, status: "pending", depends_on: [1],
  },
  {
    order: 3, title: "Identify recurring themes", description: "Find repeated needs, pain points, behaviors, and contradictions across the five interviews.",
    risk: "medium", recoverability: "high", executor: "ai", recommended_executor: "ai", permission: "not_required", human_judgment: "medium",
    reasoning: "AI can detect repeated patterns quickly, while keeping links to the source notes makes its analysis inspectable and recoverable.",
    confidence: .86, external_impact: false, status: "pending", depends_on: [2],
  },
  {
    order: 4, title: "Interpret user motivations", description: "Interpret why participants behaved as they did and identify important uncertainties.",
    risk: "medium", recoverability: "high", executor: "shared", recommended_executor: "shared", permission: "ask_first", human_judgment: "medium",
    reasoning: "AI can propose interpretations, but intent is ambiguous and may affect later product decisions, so final interpretation should remain shared.",
    confidence: .79, external_impact: false, status: "pending", depends_on: [3],
  },
  {
    order: 5, title: "Prepare stakeholder summary", description: "Draft a concise summary with themes, evidence, caveats, and recommended next steps.",
    risk: "medium", recoverability: "high", executor: "shared", recommended_executor: "shared", permission: "ask_first", human_judgment: "medium",
    reasoning: "AI can create a clear draft, while a human should confirm the framing and emphasis before it represents the research externally.",
    confidence: .83, external_impact: false, status: "pending", depends_on: [4],
  },
  {
    order: 6, title: "Send findings to stakeholder", description: "Send the reviewed findings to the product stakeholder outside this workspace.",
    action_description: "Send the summarized interview findings to the product stakeholder.",
    approval_reason: "This action affects an external stakeholder and cannot be fully reversed.",
    risk: "high", recoverability: "low", executor: "shared", recommended_executor: "shared", permission: "required", human_judgment: "high",
    reasoning: "AI can prepare the message, but sending it creates external impact. The final action requires explicit human approval and must remain interruptible.",
    confidence: .72, external_impact: true, undoable: false, decision_boundary: true, status: "pending", depends_on: [5],
  },
];

export const studyStageIntent = {
  "Goal Input": "Low friction",
  "Task Decomposition": "Low friction",
  "Delegation Matrix": "Medium friction",
  "Decision Boundary": "High friction",
  Execution: "Highest-value observation",
  "Trust Evidence": "Medium friction",
  Reflection: "Low friction",
};
