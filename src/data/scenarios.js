export const boundaryOptions = [
  { value: "Automatic", description: "Run without asking" },
  { value: "Ask first", description: "Pause for your approval" },
  { value: "Draft only", description: "Prepare, never publish" },
  { value: "Blocked", description: "Do not access" },
];

export const defaultTools = [
  {
    id: "drive",
    name: "Google Drive",
    mark: "G",
    action: "Read UX research documents",
    boundary: "Automatic",
  },
  {
    id: "figma",
    name: "Figma",
    mark: "F",
    action: "Read design comments and annotations",
    boundary: "Automatic",
  },
  {
    id: "jira",
    name: "Jira",
    mark: "J",
    action: "Draft an issue summary",
    boundary: "Draft only",
  },
  {
    id: "slack",
    name: "Slack",
    mark: "S",
    action: "Read team design discussions",
    boundary: "Blocked",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    mark: "T",
    action: "Draft a summary message to the product channel",
    boundary: "Ask first",
  },
];

const defaultOutputPoints = [
  "12 design comments resolved, 2 still open on the checkout flow",
  "Top 3 reported bugs: broken filter (P1), slow image load (P2), misaligned CTA (P3)",
  "Research suggests users skip the tooltip - consider inline hints instead",
  "Team consensus supports simplifying onboarding to three steps",
];

export const scenarios = [
  {
    id: "product-review",
    company: "Atlas Commerce",
    role: "Product manager",
    deadline: "Friday, 2 PM",
    title: "Product review brief",
    cardCopy: "Turn scattered UX evidence into one review-ready summary.",
    goal:
      "Prepare a UX feedback summary for Friday's product review. Highlight unresolved issues, draft follow-up work, and prepare a private Teams update.",
    brief:
      "Collect design feedback, product issues, research, and relevant team context, then prepare a reviewable summary draft.",
    tools: defaultTools,
    outputTitle: "UX Feedback Summary - Sprint 24",
    outputPoints: defaultOutputPoints,
  },
  {
    id: "sprint-planning",
    company: "Meridian Cloud",
    role: "Product lead",
    deadline: "Monday, 10 AM",
    title: "Sprint planning",
    cardCopy: "Prioritize the next sprint without manually chasing every update.",
    goal:
      "Prepare Sprint 25 planning for Monday. Identify blockers, propose the highest-value work, draft Jira updates, and prepare a private Teams brief.",
    brief:
      "Combine roadmap priorities, design readiness, and current delivery risks into a focused sprint recommendation.",
    tools: [
      {
        id: "drive",
        name: "Google Drive",
        mark: "G",
        action: "Read the approved roadmap and PRD",
        boundary: "Automatic",
      },
      {
        id: "figma",
        name: "Figma",
        mark: "F",
        action: "Check which designs are ready for development",
        boundary: "Automatic",
      },
      {
        id: "jira",
        name: "Jira",
        mark: "J",
        action: "Draft updates for proposed sprint issues",
        boundary: "Draft only",
      },
      {
        id: "slack",
        name: "Slack",
        mark: "S",
        action: "Read engineering status discussions",
        boundary: "Blocked",
      },
      {
        id: "teams",
        name: "Microsoft Teams",
        mark: "T",
        action: "Draft a private Sprint 25 planning brief",
        boundary: "Ask first",
      },
    ],
    outputTitle: "Sprint 25 Planning Brief",
    outputPoints: [
      "Recommend 4 items for Sprint 25 based on roadmap priority and design readiness",
      "Two dependencies need owners before sprint kickoff",
      "Keep analytics export out of scope until API performance is resolved",
      "Three Jira update drafts are ready for product lead review",
    ],
  },
  {
    id: "launch-decision",
    company: "Northstar Travel",
    role: "Product manager",
    deadline: "Today, 3 PM",
    title: "Checkout launch decision",
    cardCopy: "Reach a defensible Ship / Hold decision before a launch review.",
    goal:
      "Prepare a launch-readiness brief for the redesigned checkout before today's 3 PM product review. Identify unresolved customer issues and prepare a private Teams update.",
    brief:
      "Review customer evidence, design comments, and open defects, then recommend whether the checkout should ship or be held.",
    tools: [
      {
        id: "drive",
        name: "Google Drive",
        mark: "G",
        action: "Read 6 checkout usability-test notes",
        boundary: "Automatic",
      },
      {
        id: "figma",
        name: "Figma",
        mark: "F",
        action: "Read 18 comments on the checkout redesign",
        boundary: "Automatic",
      },
      {
        id: "jira",
        name: "Jira",
        mark: "J",
        action: "Draft a follow-up issue for the launch blocker",
        boundary: "Draft only",
      },
      {
        id: "slack",
        name: "Slack",
        mark: "S",
        action: "Read launch-channel discussions",
        boundary: "Blocked",
      },
      {
        id: "teams",
        name: "Microsoft Teams",
        mark: "T",
        action: "Prepare a private Ship / Hold decision update",
        boundary: "Ask first",
      },
    ],
    outputTitle: "Checkout Launch Decision - Hold for 24 Hours",
    outputPoints: [
      "Recommendation: Hold the rollout for 24 hours",
      "5 of 8 test users could not edit their delivery address after autofill",
      "PAY-184 is still open and two Figma error-state comments are unresolved",
      "A Jira follow-up draft is ready for product manager review",
    ],
  },
];
