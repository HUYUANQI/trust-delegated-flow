const artifactNames = {
  research: ["research-summary.md", "Research summary"],
  "product-analysis": ["product-investigation.md", "Product investigation"],
  competitive: ["competitive-analysis.md", "Competitive analysis"],
  feedback: ["customer-feedback-analysis.md", "Customer feedback analysis"],
  planning: ["sprint-plan.md", "Sprint plan"],
  prioritization: ["priority-recommendation.md", "Priority recommendation"],
  communication: ["project-update.md", "Project update"],
  meeting: ["meeting-notes.md", "Meeting notes"],
  decision: ["launch-decision-brief.md", "Decision brief"],
  presentation: ["presentation-outline.md", "Presentation outline"],
  risk: ["risk-assessment.md", "Risk assessment"],
  event: ["event-plan.md", "Event plan"],
  writing: ["content-draft.md", "Content draft"],
  general: ["delegated-task-result.md", "Task result"],
};

export function createDeliverableArtifact(goal, plan, result) {
  const [filename, label] = artifactNames[plan.intent] ?? artifactNames.general;
  const content = buildMarkdown(goal, result);
  const bytes = new TextEncoder().encode(content).length;

  return {
    id: `deliverable-${plan.id}`,
    filename,
    label,
    format: "Markdown document",
    extension: "MD",
    content,
    size: formatBytes(bytes),
    status: "Ready to review",
    description: deliveryDescription(plan.intent),
    createdLabel: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function downloadDeliverableArtifact(artifact) {
  const blob = new Blob([artifact.content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = artifact.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildMarkdown(goal, result) {
  const sections = result.sections.map((section) => {
    const body = section.body ? `\n${section.body.trim()}\n` : "";
    const items = section.items?.length
      ? `\n${section.items.map((item) => `- ${item}`).join("\n")}\n`
      : "";
    return `## ${section.title}\n${body}${items}`.trim();
  });

  return [
    `# ${result.title}`,
    "",
    "**Status:** Complete",
    "",
    `**Task:** ${goal}`,
    "",
    result.summary,
    "",
    ...sections.flatMap((section) => [section, ""]),
    "## Recommended next step",
    "",
    result.nextStep,
    "",
    "---",
    "Prepared in the Delegate prototype. Review facts and source evidence before external use.",
  ].join("\n");
}

function deliveryDescription(intent) {
  const descriptions = {
    meeting: "A shareable meeting record with decisions, action items, and open questions.",
    communication: "A review-ready update that can be edited before it is shared.",
    research: "A structured synthesis of findings, implications, and next actions.",
    feedback: "A structured file containing customer themes, priorities, and follow-up actions.",
    planning: "A review-ready working plan with priorities, dependencies, and guardrails.",
    decision: "A decision file containing the recommendation, evidence, and launch guardrails.",
  };
  return descriptions[intent] ?? "A portable record of the agent's completed work and recommended next action.";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
