export const sampleGoals = [
  "Prepare next sprint planning",
  "Analyze user interview results",
  "Create a PRD for a new feature",
  "Benchmark five AI competitors",
  "Review my Figma design",
  "Prepare stakeholder meeting",
];

export const demoMetrics = [
  { label: "Delegation Success Rate", value: "92%", change: "+3%" },
  { label: "Human Intervention Rate", value: "28%", change: "-5%" },
  { label: "Recovery Success Rate", value: "85%", change: "+8%" },
  { label: "User Trust Score", value: "78/100", change: "+3" },
  { label: "Decision Accuracy", value: "91%", change: "+2%" },
  { label: "Time Saved", value: "142 hrs", change: "+18" },
  { label: "Automation Ratio", value: "64%", change: "+6%" },
  { label: "Avg Completion Time", value: "3.2 min", change: "-0.4" },
];

export const recentDelegations = [
  { title: "Weekly UX Feedback Summary", time: "10:30 AM · 2 min 15 sec", status: "Completed" },
  { title: "Competitor Analysis Report", time: "9:00 AM · 1 min 42 sec", status: "Completed" },
  { title: "Sprint Retrospective Notes", time: "4:00 PM · 0 min 38 sec", status: "Stopped" },
  { title: "Design Review Preparation", time: "11:00 AM · 3 min 02 sec", status: "Completed" },
];

export const scoringDimensions = [
  { key: "complexity", label: "Task Complexity", weight: 15, description: "Steps, tools and dependencies" },
  { key: "clarity", label: "Requirement Clarity", weight: 15, description: "Specificity and ambiguity" },
  { key: "risk", label: "Risk Level", weight: 20, description: "Impact and severity of errors" },
  { key: "recoverability", label: "Recoverability", weight: 15, description: "Whether failures can be undone" },
  { key: "domain", label: "Domain Knowledge", weight: 10, description: "Specialized knowledge required" },
  { key: "impact", label: "Decision Impact", weight: 10, description: "Business impact of outcome" },
  { key: "data", label: "Data Dependency", weight: 10, description: "External sources and integrations" },
  { key: "judgment", label: "Human Judgment", weight: 5, description: "Human judgment required" },
];

export const demoMemories = [
  { id: "m1", title: "UX Review Tool Strategy", category: "Work Pattern", content: "Auto-read Figma & Jira for UX review tasks", enabled: true },
  { id: "m2", title: "Slack Requires Permission", category: "Data Source Rule", content: "Always ask before reading Slack messages", enabled: true },
  { id: "m3", title: "Teams Draft Only", category: "Output Rule", content: "Generate draft only, never auto-send to Teams", enabled: true },
];

export function buildDemoAnalysis(goal) {
  return {
    task_summary: goal,
    expected_outcome: `A reviewed and actionable result for: ${goal}`,
    constraints: [
      "Keep the user informed at approval boundaries",
      "Avoid irreversible actions without confirmation",
      "Record decisions for later review",
    ],
    overall_risk: "medium",
    ai_confidence: 0.87,
    recoverability: "high",
    difficulty_score: 2.4,
    delegation_strategy: "AI-led with human approval at key decision points",
    tasks: [
      { order: 1, title: "Understand the goal", description: "Clarify the desired outcome and constraints", risk: "low", recoverability: "high", executor: "ai", permission: "not_required", status: "pending", depends_on: [] },
      { order: 2, title: "Collect relevant information", description: "Gather the inputs needed to complete the goal", risk: "low", recoverability: "high", executor: "ai", permission: "not_required", status: "pending", depends_on: [1] },
      { order: 3, title: "Develop a proposed solution", description: "Create a draft plan or deliverable", risk: "medium", recoverability: "high", executor: "shared", permission: "ask_first", status: "pending", depends_on: [2] },
      { order: 4, title: "Review critical decisions", description: "Human reviews choices with meaningful impact", risk: "high", recoverability: "medium", executor: "human", permission: "required", status: "pending", depends_on: [3] },
      { order: 5, title: "Finalize the result", description: "Apply approved changes and prepare the outcome", risk: "medium", recoverability: "high", executor: "shared", permission: "ask_first", status: "pending", depends_on: [4] },
    ],
    scores: { complexity: 3, clarity: 2, risk: 2, recoverability: 2, domain: 2, impact: 3, data: 3, judgment: 3 },
  };
}

