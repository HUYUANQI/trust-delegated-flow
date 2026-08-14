const intentPatterns = [
  ["event", /birthday|dinner|event|party|venue|guest|生日|聚餐|活动|宴会/i],
  ["competitive", /competitor|competitive|market comparison|against three|竞品|竞争对手/i],
  ["meeting", /meeting|minutes|workshop|会议|纪要/i],
  ["prioritization", /prioriti[sz]|what.*work on|next week.*team|优先级|先做什么/i],
  ["planning", /sprint|roadmap|plan next|planning|计划|迭代/i],
  ["feedback", /complaint|customer feedback|customers? (are )?(unhappy|dissatisfied)|投诉|客户反馈|不满意/i],
  ["product-analysis", /abandon|checkout|drop.?off|conversion|funnel|流失|结账|转化/i],
  ["decision", /launch|ship|hold|readiness|decide whether|recommendation|上线|发布|是否应该/i],
  ["research", /ux|user research|interview|usability|research summary|用户研究|访谈|可用性/i],
  ["communication", /project update|project progress|status update|manager|stakeholder update|项目更新|项目进展|汇报/i],
  ["presentation", /presentation|slide|deck|演示|汇报大纲|幻灯片/i],
  ["risk", /biggest risk|major risk|risk in this project|最大风险|项目风险/i],
  ["writing", /write|draft|summari[sz]e|report|outline|prepare.*summary|撰写|草拟|总结|报告|大纲/i],
];

const templates = {
  research: {
    title: "Research synthesis",
    understanding: (goal) =>
      `You want a concise, decision-ready synthesis of the research related to “${shorten(goal)}”.`,
    expectedOutput: "Research themes, key insights, implications, and recommended next actions.",
    assumptions: ["I’ll treat this as an internal working document unless you specify an external audience."],
    steps: [
      step("Locate relevant research material", "Identify the notes and evidence that are most relevant to the request.", "drive-search", "low"),
      step("Review research and design feedback", "Read the available research evidence and unresolved design comments.", "figma-comments", "low"),
      step("Identify recurring themes", "Group observations and separate strong signals from isolated comments.", "ai-classify", "low"),
      step("Prepare the research summary", "Draft insights, implications, and clear next actions for review.", "ai-draft", "medium"),
    ],
  },
  "product-analysis": {
    title: "Product problem investigation",
    understanding: (goal) =>
      `You want to investigate the product behaviour behind “${shorten(goal)}” and identify practical ways to improve it.`,
    expectedOutput: "Root-cause hypotheses, supporting signals, risks, and a prioritised investigation plan.",
    assumptions: ["Without live analytics, findings will be labelled as hypotheses that need validation."],
    steps: [
      step("Collect available customer evidence", "Review feedback, research, and product context related to the problem.", "drive-read", "low"),
      step("Check known delivery issues", "Search for unresolved defects or blockers that could explain the behaviour.", "jira-blockers", "low"),
      step("Analyse likely friction points", "Map possible causes across usability, trust, performance, and expectation gaps.", "ai-analyze", "low"),
      step("Prioritise validation work", "Rank the most plausible causes by impact and evidence strength.", "ai-prioritize", "low"),
      step("Prepare recommendations", "Draft experiments and product actions for the highest-priority hypotheses.", "ai-recommend", "low"),
    ],
  },
  competitive: {
    title: "Competitive comparison",
    understanding: (goal) =>
      `You want a structured comparison for “${shorten(goal)}” rather than a list of disconnected competitor facts.`,
    expectedOutput: "Competitor comparison, differentiators, gaps, and a recommended product response.",
    assumptions: ["I’ll use publicly available information and clearly separate evidence from inference."],
    steps: [
      step("Define comparison criteria", "Set consistent criteria such as target users, capabilities, experience, and positioning.", "ai-structure", "low"),
      step("Collect public evidence", "Search current public information for the products being compared.", "web-search", "low"),
      step("Compare sources and offerings", "Cross-check claims and compare each option against the same criteria.", "web-compare", "low"),
      step("Identify strategic implications", "Highlight meaningful advantages, gaps, and opportunities.", "ai-analyze", "low"),
      step("Prepare a recommendation", "Draft the recommended response and the evidence needed for the next decision.", "ai-recommend", "low"),
    ],
  },
  feedback: {
    title: "Customer feedback analysis",
    understanding: (goal) =>
      `You want to understand the customer signals in “${shorten(goal)}”, find recurring themes, and decide what deserves attention first.`,
    expectedOutput: "Feedback themes, likely root causes, severity assessment, and recommended actions.",
    assumptions: ["I’ll analyse the feedback supplied in the request first and avoid inventing missing customer evidence."],
    steps: [
      step("Prepare the feedback for analysis", "Separate individual complaints, observations, and requested outcomes.", "ai-structure", "low"),
      step("Group recurring themes", "Classify the feedback by problem, user impact, and frequency signal.", "ai-classify", "low"),
      step("Identify likely root causes", "Distinguish symptoms from product, service, or expectation problems.", "ai-analyze", "low"),
      step("Prioritise the issues", "Rank themes by apparent severity, reach, and confidence.", "ai-prioritize", "low"),
      step("Recommend next actions", "Prepare validation and response actions for the most important themes.", "ai-recommend", "low"),
    ],
  },
  planning: {
    title: "Work planning brief",
    understanding: (goal) =>
      `You want a focused, achievable plan for “${shorten(goal)}” with priorities and dependencies made explicit.`,
    expectedOutput: "Prioritised work plan, dependencies, trade-offs, and review-ready updates.",
    assumptions: ["I’ll optimise for an achievable internal plan rather than maximum scope."],
    steps: [
      step("Review current work and constraints", "Read relevant project status, open work, and known dependencies.", "jira-read", "low"),
      step("Identify the highest-value outcomes", "Clarify what must be achieved and what can remain out of scope.", "ai-analyze", "low"),
      step("Prioritise candidate work", "Rank work by impact, urgency, confidence, and effort.", "ai-prioritize", "low"),
      step("Build the working plan", "Sequence priorities and make dependencies and ownership gaps visible.", "ai-structure", "low"),
      step("Prepare planning updates", "Draft reviewable updates for the selected work without publishing them.", "jira-draft", "medium"),
    ],
  },
  prioritization: {
    title: "Priority recommendation",
    understanding: (goal) =>
      `You want a defensible order of work for “${shorten(goal)}”, including the trade-offs behind the ranking.`,
    expectedOutput: "Ranked priorities, decision criteria, trade-offs, and a recommended first move.",
    assumptions: ["I’ll use impact, urgency, effort, and dependency risk as the initial criteria."],
    steps: [
      step("Clarify the decision criteria", "Define what a good priority decision should optimise for.", "ai-structure", "low"),
      step("Assess each item", "Evaluate impact, urgency, effort, confidence, and dependencies.", "ai-analyze", "low"),
      step("Rank the work", "Create a transparent ordering and flag close calls.", "ai-prioritize", "low"),
      step("Prepare the recommendation", "Explain what to start, defer, and validate next.", "ai-recommend", "low"),
    ],
  },
  communication: {
    title: "Project update draft",
    understanding: (goal) =>
      `You want a clear, audience-appropriate update for “${shorten(goal)}” that communicates progress, risks, and next steps.`,
    expectedOutput: "An editable project update with status, decisions, risks, and next actions.",
    assumptions: ["I’ll keep the tone concise and suitable for an internal manager or stakeholder."],
    steps: [
      step("Review current project status", "Collect the relevant progress, decisions, risks, and upcoming milestones.", "jira-read", "low"),
      step("Identify the essential message", "Separate decision-relevant information from background detail.", "ai-analyze", "low"),
      step("Structure the update", "Organise the update into progress, risks, decisions, and next steps.", "ai-structure", "low"),
      step("Prepare an editable draft", "Draft the update for review without sending it to anyone.", "teams-draft", "medium"),
    ],
  },
  meeting: {
    title: "Meeting summary",
    understanding: (goal) =>
      `You want to turn “${shorten(goal)}” into a concise record of decisions, actions, and unresolved questions.`,
    expectedOutput: "Meeting summary, decisions, action items, owners to confirm, and open questions.",
    assumptions: ["I’ll avoid assigning owners when the meeting context does not name them."],
    steps: [
      step("Organise the meeting content", "Separate discussion topics, decisions, questions, and action items.", "ai-structure", "low"),
      step("Identify decisions and commitments", "Extract confirmed decisions and distinguish them from suggestions.", "ai-analyze", "low"),
      step("Prepare the summary", "Draft a concise record with action items and unresolved questions.", "ai-draft", "medium"),
    ],
  },
  decision: {
    title: "Decision recommendation",
    understanding: (goal) =>
      `You want an evidence-aware decision for “${shorten(goal)}”, including reasons to proceed, pause, or reduce risk.`,
    expectedOutput: "Recommendation, evidence, uncertainties, risks, and next actions.",
    assumptions: ["I’ll treat the recommendation as advisory and show where more evidence is needed."],
    steps: [
      step("Define the decision criteria", "Clarify what must be true for the decision to be safe and valuable.", "ai-structure", "low"),
      step("Review customer and design evidence", "Inspect relevant research and unresolved design feedback.", "figma-comments", "low"),
      step("Check unresolved blockers", "Search for open issues that could materially affect the decision.", "jira-blockers", "low"),
      step("Assess evidence and risk", "Compare benefits, gaps, reversibility, and likely impact.", "ai-compare", "low"),
      step("Prepare the recommendation", "Draft a proceed, pause, or conditional recommendation with next actions.", "ai-recommend", "low"),
    ],
  },
  presentation: {
    title: "Presentation outline",
    understanding: (goal) =>
      `You want a coherent presentation structure for “${shorten(goal)}” with a clear narrative and decision point.`,
    expectedOutput: "Slide-by-slide outline, key messages, evidence placeholders, and closing action.",
    assumptions: ["I’ll create an outline rather than a finished visual deck."],
    steps: [
      step("Define the audience and objective", "Identify what the audience should understand or decide.", "ai-understand", "low"),
      step("Build the narrative", "Organise the story from context and evidence to recommendation.", "ai-structure", "low"),
      step("Prepare the slide outline", "Draft slide titles, key messages, and evidence placeholders.", "ai-draft", "medium"),
    ],
  },
  risk: {
    title: "Project risk analysis",
    understanding: (goal) =>
      `You want to identify the most important risk behind “${shorten(goal)}” and determine how to reduce it.`,
    expectedOutput: "Primary risk, likelihood and impact rationale, warning signals, and mitigation actions.",
    assumptions: ["Without project evidence, the result will be a preliminary risk hypothesis rather than a verified finding."],
    steps: [
      step("Identify relevant risk categories", "Consider customer, delivery, technical, commercial, and decision-quality risks.", "ai-structure", "low"),
      step("Assess likelihood and impact", "Compare the plausible risks using consistent criteria.", "ai-compare", "low"),
      step("Select the leading risk", "Explain which risk matters most and what evidence could change the assessment.", "ai-analyze", "low"),
      step("Prepare mitigation actions", "Recommend immediate safeguards and validation steps.", "ai-recommend", "low"),
    ],
  },
  event: {
    title: "Event plan",
    understanding: (goal) =>
      `You want a practical plan for “${shorten(goal)}” that balances people, budget, timing, and preferences.`,
    expectedOutput: "Event checklist, option criteria, timeline, and an editable invitation draft.",
    assumptions: ["I’ll start with a flexible plan and leave guest count, budget, and dietary constraints as items to confirm."],
    steps: [
      step("Define constraints and preferences", "List the guest count, budget, timing, location, and dietary needs to confirm.", "ai-structure", "low"),
      step("Identify suitable options", "Research public venue or format options that match the constraints.", "web-search", "low"),
      step("Compare the options", "Evaluate convenience, atmosphere, cost, and constraint fit.", "ai-compare", "low"),
      step("Build the event checklist", "Sequence reservations, confirmations, logistics, and contingency tasks.", "ai-prioritize", "low"),
      step("Prepare an invitation draft", "Draft an editable invitation without sending it.", "ai-draft", "medium"),
    ],
  },
  writing: {
    title: "Content draft",
    understanding: (goal) =>
      `You want a useful, well-structured draft for “${shorten(goal)}” that can be reviewed and refined.`,
    expectedOutput: "A structured, editable draft with assumptions and suggested next edits.",
    assumptions: ["I’ll use a concise internal tone unless the request names another audience."],
    steps: [
      step("Clarify the purpose and audience", "Identify the intended outcome, reader, and level of detail.", "ai-understand", "low"),
      step("Structure the content", "Create a logical outline that supports the intended outcome.", "ai-structure", "low"),
      step("Prepare the draft", "Write editable content and flag details that still need confirmation.", "ai-draft", "medium"),
    ],
  },
  general: {
    title: "Delegated task plan",
    understanding: (goal) =>
      `You want the AI to make progress on “${shorten(goal)}” and return a reviewable, practical outcome.`,
    expectedOutput: "Structured analysis, recommended approach, and a clear next action.",
    assumptions: ["I’ll keep the work inside the reasoning workspace unless an external source is clearly required."],
    steps: [
      step("Interpret the objective", "Clarify the desired outcome, constraints, and available context.", "ai-understand", "low"),
      step("Break down the task", "Turn the objective into a small set of useful work items.", "ai-structure", "low"),
    �_m�G����ƭy�.trim();
  if (!cleanGoal) {
    return clarificationPlan(
      cleanGoal,
      "What task, goal, or problem would you like AI to handle?",
      [],
    );
  }

  if (!context.clarificationAnswer && isVague(cleanGoal)) {
    return clarificationPlan(
      cleanGoal,
      "I can do that. What kind of report are you preparing?",
      ["Project progress", "User research", "Product review", "Business analysis"],
    );
  }

  const enrichedGoal = context.clarificationAnswer
    ? `${cleanGoal} ${context.clarificationAnswer}`
    : cleanGoal;
  const intent = detectIntent(enrichedGoal);
  const template = templates[intent] ?? templates.general;
  let steps = template.steps.slice(0, 6).map((item, index) => ({
    ...item,
    id: `step-${index + 1}`,
  }));
  const sensitiveStep = sensitiveStepForGoal(enrichedGoal);
  if (sensitiveStep && !steps.some((item) => item.toolId === sensitiveStep.toolId)) {
    steps = [...steps.slice(0, 5), { ...sensitiveStep, id: `step-${Math.min(6, steps.length + 1)}` }];
  }
  const riskLevel = steps.some((item) => item.risk === "high")
    ? "high"
    : steps.some((item) => item.risk === "medium")
      ? "medium"
      : "low";

  return {
    id: `plan-${Date.now()}`,
    title: template.title,
    originalGoal: cleanGoal,
    understanding: template.understanding(cleanGoal),
    needsClarification: false,
    clarifyingQuestion: null,
    clarificationOptions: [],
    expectedOutput: template.expectedOutput,
    assumptions: context.clarificationAnswer
      ? [
          `I’ll use your clarification — “${context.clarificationAnswer}” — as part of the working context.`,
          ...template.assumptions,
        ]
      : template.assumptions,
    riskLevel,
    intent,
    steps,
    source: "fallback",
    plannerNotice: context.apiFailed
      ? "The AI service was unavailable, so a local plan was created for you to review."
      : null,
  };
}

export function reviseFallbackPlan(plan, feedback) {
  const cleanFeedback = feedback.trim();
  if (!cleanFeedback) return plan;

  let steps = plan.steps.map((item) => ({ ...item }));
  const excludedTool = excludedToolFromFeedback(cleanFeedback);
  if (excludedTool) {
    steps = steps.filter((item) => !item.toolId.startsWith(excludedTool));
  }

  if (/customer|feedback|complaint|用户|客户|反馈/i.test(cleanFeedback)) {
    const hasFeedbackStep = steps.some((item) => item.toolId === "ai-classify");
    if (!hasFeedbackStep) {
      steps.splice(Math.min(2, steps.length), 0, {
        id: `step-revision-${Date.now()}`,
        title: "Analyse customer feedback in more depth",
        description: "Group feedback into themes and identify the strongest customer signals.",
        toolId: "ai-classify",
        risk: "low",
      });
    }
  }

  if (/shorter|simpler|fewer|精简|简短/i.test(cleanFeedback) && steps.length > 3) {
    steps = steps.slice(0, 3);
  }

  if (steps.length < 2) {
    steps.push(
      {
        id: `step-recovery-${Date.now()}`,
        title: "Analyse the available context",
        description: "Use the reasoning workspace to make progress without the excluded integration.",
        toolId: "ai-analyze",
        risk: "low",
      },
      {
        id: `step-outcome-${Date.now()}`,
        title: "Prepare a reviewable outcome",
        description: "Summarise findings and recommend the next action.",
        toolId: "ai-recommend",
        risk: "low",
      },
    );
  }

  return {
    ...plan,
    id: `plan-${Date.now()}`,
    understanding: `${plan.understanding} The revised plan also follows this direction: “${cleanFeedback}”.`,
    assumptions: [...(plan.assumptions ?? []), `Revision applied: ${cleanFeedback}`],
    steps: steps.slice(0, 6).map((item, index) => ({
      ...item,
      id: `step-${index + 1}`,
    })),
  };
}

export function generateFallbackResult(goal, plan, execution = {}) {
  const completed = execution.items?.filter((item) => item.status === "completed").length ?? 0;
  const blocked = execution.items?.filter((item) => item.status === "blocked").map((item) => item.title) ?? [];
  const base = {
    title: `${plan.title} — prepared outcome`,
    summary: `A prototype result was generated for “${goal}” after ${completed} planned step${completed === 1 ? "" : "s"} completed. No real external action was performed.`,
    nextStep: "Review the prepared outcome, add real evidence where needed, and decide whether any draft should be used outside the prototype.",
    sections: [],
  };

  const sections = resultSections(plan.intent, goal);
  if (blocked.length) {
    sections.push({
      title: "Needs your attention",
      items: blocked.map((title) => `${title} was skipped or blocked, so the result may need additional evidence.`),
    });
  }

  return { ...base, sections };
}

export function detectIntent(goal) {
  const match = intentPatterns.find(([, pattern]) => pattern.test(goal));
  return match?.[0] ?? "general";
}

function resultSections(intent, goal) {
  const topic = shorten(goal, 92);
  const commonEvidence = "Validate this prototype analysis with the real source material before acting on it.";

  const byIntent = {
    research: [
      { title: "Key themes", items: ["Consolidate repeated observations before treating isolated comments as a trend.", "Separate user needs, usability friction, and product expectation gaps.", "Flag conflicting evidence instead of forcing a single conclusion."] },
      { title: "Design implications", items: ["Prioritise issues that repeatedly prevent task completion.", "Translate each strong insight into a testable design change."] },
      { title: "Evidence to add", items: [commonEvidence] },
    ],
    "product-analysis": [
      { title: "Working diagnosis", items: ["The leading risk is likely concentrated at a high-friction or low-trust point in the journey.", "Performance, unclear expectations, and recovery from errors should be tested as separate hypotheses.", "The current result is a hypothesis map, not a claim about live customer behaviour."] },
      { title: "Recommended investigation", items: ["Measure the exact step where users leave.", "Review session evidence and error states for that step.", "Test the top two hypotheses with the smallest reversible change."] },
      { title: "Decision rule", items: ["Prioritise the cause with the strongest combination of customer impact, frequency, and evidence confidence."] },
    ],
    competitive: [
      { title: "Comparison framework", items: ["Target customer and core job", "Product experience and time to value", "Differentiators, pricing, and switching friction", "Evidence quality and recency"] },
      { title: "Preliminary recommendation", items: ["Compete on a customer outcome you can defend rather than matching every feature.", "Verify competitor claims through multiple current public sources."] },
      { title: "Evidence needed", items: [commonEvidence] },
    ],
    feedback: [
      { title: "Theme structure", items: ["Task failure or reliability problems", "Confusing experience or unclear expectations", "Service and communication gaps", "Requests that may signal a broader unmet need"] },
      { title: "Prioritisation approach", items: ["Start with severe problems that block a core customer outcome.", "Use frequency as a signal, not the only decision criterion.", "Keep raw customer language attached to each theme for traceability."] },
      { title: "Next action", items: ["Add the real complaints, confirm theme counts, and assign an owner to validate the leading root cause."] },
    ],
    planning: [
      { title: "Recommended priorities", items: ["Protect the highest-value outcome first.", "Resolve blocking dependencies before starting optional scope.", "Limit simultaneous work so the team can finish and learn."] },
      { title: "Planning guardrails", items: ["Make ownership explicit.", "Keep one small buffer for unexpected work.", "Define what will be removed if capacity changes."] },
      { title: "Prepared action", items: ["A draft planning update is ready for review; nothing was created in Jira."] },
    ],
    prioritization: [
      { title: "Priority model", items: ["Score impact, urgency, confidence, effort, and dependency risk.", "Do first: high impact with a clear path to completion.", "Validate next: high potential with weak evidence.", "Defer: low impact or dependency-heavy work."] },
      { title: "Recommendation", items: ["Choose the first item that advances the main outcome and removes a constraint for later work."] },
    ],
    communication: [
      { title: "Draft project update", body: `Subject: Project update — ${topic}\n\nProgress\n• The work has been organised around the main outcome and current delivery risks.\n\nRisks / decisions\n• Confirm the highest-impact open dependency and whether it changes timing or scope.\n\nNext steps\n• Validate status with the source project data.\n• Confirm owners and the next review point.` },
      { title: "Before sharing", items: ["Replace the placeholders with verified project facts.", "Confirm the audience and desired decision.", "This draft was prepared only; it was not sent."] },
    ],
    meeting: [
      { title: "Prepared summary structure", items: ["Purpose and context", "Confirmed decisions", "Action items and owners to confirm", "Open questions and next checkpoint"] },
      { title: "Quality check", items: ["Do not present suggestions as decisions.", "Confirm owners and deadlines against the original meeting record."] },
    ],
    decision: [
      { title: "Recommendation", items: ["Use a conditional decision: proceed only when the highest-impact unresolved risk has a clear owner and validation result.", "If the evidence is incomplete or the change is hard to reverse, prefer a limited rollout or short hold."] },
      { title: "Evidence", items: ["Customer outcome and usability evidence", "Open blockers and error severity", "Reversibility and monitoring coverage"] },
      { title: "Decision guardrail", items: [commonEvidence] },
    ],
    presentation: [
      { title: "Presentation outline", items: ["1. Decision or objective", "2. Current context", "3. Evidence and key insight", "4. Options and trade-offs", "5. Recommendation", "6. Next action"] },
      { title: "Narrative advice", items: ["Lead with the audience’s decision, not the work performed.", "Use one evidence point per claim and label assumptions."] },
    ],
    risk: [
      { title: "Leading risk", items: ["The biggest preliminary risk is making an important decision with incomplete or fragmented evidence.", "This can create false confidence, late rework, and unclear ownership."] },
      { title: "Mitigation", items: ["Name the decision owner and decision date.", "List the two pieces of evidence that could change the decision.", "Use a reversible next step while uncertainty remains high."] },
      { title: "Confidence", items: ["Preliminary — real project context is required to verify the leading risk."] },
    ],
    event: [
      { title: "Event plan", items: ["Confirm guest count, budget, date, location, and dietary constraints.", "Shortlist two options and one low-risk backup.", "Reserve only after the main constraints are confirmed.", "Send the invitation after date and venue are final."] },
      { title: "Invitation draft", body: "You’re invited! I’m planning a birthday dinner and would love you to join. Please hold the date while I confirm the final venue and dietary details." },
      { title: "Still needed", items: ["Guest count", "Budget range", "Location", "Dietary and accessibility needs"] },
    ],
    writing: [
      { title: "Draft structure", items: ["Purpose and desired outcome", "Essential context", "Main points or evidence", "Recommendation or requested action"] },
      { title: "Prepared draft", body: `Working draft for: ${topic}\n\nThis document is structured to clarify the objective, present the most relevant information, and end with a specific next action. Add the verified facts and audience details before using it outside the prototype.` },
    ],
    general: [
      { title: "Analysis", items: ["The task can be progressed by clarifying the desired outcome, identifying constraints, and comparing practical options.", "The most useful next move should be small, reviewable, and reversible where uncertainty remains."] },
      { title: "Recommended approach", items: ["Confirm the success criterion.", "Add the strongest available evidence.", "Choose the next action with the best impact-to-risk balance."] },
    ],
  };

  return byIntent[intent] ?? byIntent.general;
}

function clarificationPlan(goal, question, options) {
  return {
    id: `clarification-${Date.now()}`,
    title: "A little more context needed",
    originalGoal: goal,
    understanding: "The desired output is not specific enough to build a useful workflow yet.",
    needsClarification: true,
    clarifyingQuestion: question,
    clarificationOptions: options,
    expectedOutput: "A relevant plan once the report type is confirmed.",
    assumptions: [],
    riskLevel: "low",
    intent: "general",
    steps: [],
    source: "fallback",
  };
}

function step(title, description, toolId, risk) {
  return { title, description, toolId, risk };
}

function isVague(goal) {
  const simple = goal.trim().replace(/[.!?。！？]+$/, "");
  return (
    /^(prepare|create|write|draft|make)\s+(a\s+)?(report|summary|plan|update|presentation)$/i.test(simple) ||
    /^(help me|analyse this|analyze this|review this|summari[sz]e this)$/i.test(simple) ||
    /^(准备|写|制作|创建)(一份)?(报告|总结|计划|更新|演示)$/i.test(simple)
  );
}

function excludedToolFromFeedback(feedback) {
  const match = feedback.match(/(?:don't|do not|avoid|without|不要|不使用)\s+(?:use\s+)?(slack|teams|jira|figma|drive|web)/i);
  if (!match) return null;
  const tool = match[1].toLowerCase();
  return tool === "drive" ? "drive" : tool;
}

function sensitiveStepForGoal(goal) {
  if (/send|post|publish|notify|发送|发布|通知/i.test(goal)) {
    const slack = /slack/i.test(goal);
    return {
      title: `Prepare and approve the ${slack ? "Slack" : "Teams"} message`,
      description:
        "Prepare the externally visible message, pause for approval, and simulate the send without contacting anyone.",
      toolId: slack ? "slack-send" : "teams-send",
      risk: "high",
    };
  }
  if (/(update|change|edit).*(jira|issue)|(jira|issue).*(update|change|edit)|更新.*jira/i.test(goal)) {
    return {
      title: "Prepare and approve the Jira update",
      description:
        "Review the proposed shared-workspace change before simulating the update.",
      toolId: "jira-update",
      risk: "high",
    };
  }
  return null;
}

function shorten(value, length = 72) {
  const compact = value.trim().replace(/\s+/g, " ");
  return compact.length > length ? `${compact.slice(0, length - 1)}…` : compact;
}
