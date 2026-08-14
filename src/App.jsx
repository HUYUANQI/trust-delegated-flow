import { useMemo, useState } from "react";
import { boundaryOptions, defaultTools, scenarios } from "./data/scenarios";

const steps = [
  { id: "context", label: "Add context" },
  { id: "brief", label: "Review brief" },
  { id: "controls", label: "Set controls" },
  { id: "result", label: "Approve result" },
];

const fallbackScenario = {
  company: "Your workspace",
  role: "Enterprise user",
  deadline: "When needed",
  title: "Delegated work brief",
  goal: "Prepare UX feedback summary for next product review",
  brief:
    "Collect the relevant evidence and prepare a reviewable result without publishing anything automatically.",
  tools: defaultTools,
  outputTitle: "Delegated Work Summary",
  outputPoints: [
    "12 design comments resolved, 2 still open on the checkout flow",
    "Top 3 reported bugs: broken filter (P1), slow image load (P2), misaligned CTA (P3)",
    "Research suggests users skip the tooltip - consider inline hints instead",
    "Team consensus supports simplifying onboarding to three steps",
  ],
};

function goToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function App() {
  const [currentStep, setCurrentStep] = useState("context");
  const [goal, setGoal] = useState("");
  const [scenarioId, setScenarioId] = useState(null);
  const [tools, setTools] = useState(defaultTools);
  const [approved, setApproved] = useState([]);
  const [skipped, setSkipped] = useState([]);

  const stepIndex = steps.findIndex((step) => step.id === currentStep);
  const displayGoal =
    goal.trim() || "Prepare UX feedback summary for next product review";
  const scenario =
    scenarios.find((item) => item.id === scenarioId) ?? fallbackScenario;

  function navigate(step) {
    setCurrentStep(step);
    goToTop();
  }

  function selectScenario(selectedScenario) {
    setScenarioId(selectedScenario.id);
    setGoal(selectedScenario.goal);
    setTools(selectedScenario.tools.map((tool) => ({ ...tool })));
  }

  function startRun() {
    setApproved([]);
    setSkipped([]);
    navigate("result");
  }

  function restart() {
    setGoal("");
    setScenarioId(null);
    setTools(defaultTools.map((tool) => ({ ...tool })));
    setApproved([]);
    setSkipped([]);
    navigate("context");
  }

  function updateBoundary(toolId, boundary) {
    setTools((currentTools) =>
      currentTools.map((tool) =>
        tool.id === toolId ? { ...tool, boundary } : tool,
      ),
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <button
          className="brand"
          type="button"
          onClick={restart}
          aria-label="Start a new delegation"
        >
          <span className="brand-mark">D</span>
          <strong>Delegate</strong>
        </button>

        <nav className="step-nav" aria-label="Delegation steps">
          {steps.map((step, index) => {
            const stateClass =
              index === stepIndex
                ? "step-link active"
                : index < stepIndex
                  ? "step-link complete"
                  : "step-link";

            return (
              <button
                className={stateClass}
                type="button"
                onClick={() => navigate(step.id)}
                aria-current={index === stepIndex ? "step" : undefined}
                key={step.id}
              >
                <span>{index + 1}</span>
                {step.label}
              </button>
            );
          })}
        </nav>

        <div className="profile" aria-label="Current user">
          <span>AM</span>
          <strong>Alex Morgan</strong>
        </div>
      </header>

      <div className="page-container">
        {currentStep === "context" && (
          <ContextScreen
            goal={goal}
            onGoalChange={setGoal}
            onNext={() => navigate("brief")}
            onSelectScenario={selectScenario}
            scenarioId={scenarioId}
          />
        )}

        {currentStep === "brief" && (
          <BriefScreen
            goal={displayGoal}
            onBack={() => navigate("context")}
            onNext={() => navigate("controls")}
            scenario={scenario}
          />
        )}

        {currentStep === "controls" && (
          <ControlsScreen
            tools={tools}
            onBack={() => navigate("brief")}
            onNext={startRun}
            onUpdate={updateBoundary}
          />
        )}

        {currentStep === "result" && (
          <ResultScreen
            approved={approved}
            goal={displayGoal}
            onApprove={(toolId) =>
              setApproved((current) => [...current, toolId])
            }
            onBack={() => navigate("controls")}
            onRestart={restart}
            onSkip={(toolId) => setSkipped((current) => [...current, toolId])}
            skipped={skipped}
            scenario={scenario}
            tools={tools}
          />
        )}
      </div>
    </main>
  );
}

function ContextScreen({
  goal,
  onGoalChange,
  onNext,
  onSelectScenario,
  scenarioId,
}) {
  return (
    <section className="screen context-screen">
      <span className="eyebrow">Good morning, Alex</span>
      <h1>What do you want to delegate?</h1>
      <p className="lead">
        Describe your goal and any context. AI will draft a plan you can review
        and control.
      </p>

      <div className="goal-composer">
        <textarea
          aria-label="Delegation goal"
          onChange={(event) => onGoalChange(event.target.value)}
          placeholder="e.g. Prepare UX feedback summary for next product review..."
          value={goal}
        />
        <div className="composer-footer">
          <span>AI will draft a brief - nothing runs yet.</span>
          <button className="primary-button" type="button" onClick={onNext}>
            Continue
          </button>
        </div>
      </div>

      <div className="scenario-picker">
        <div className="scenario-heading">
          <span>Real-world examples</span>
          <strong>Start with a prepared scenario</strong>
        </div>
        <div className="scenario-grid">
          {scenarios.map((scenario) => (
            <button
              className={
                scenarioId === scenario.id
                  ? "scenario-card selected"
                  : "scenario-card"
              }
              type="button"
              onClick={() => onSelectScenario(scenario)}
              key={scenario.id}
            >
              <span>
                {scenario.role} | {scenario.company}
              </span>
              <h2>{scenario.title}</h2>
              <p>{scenario.cardCopy}</p>
              <strong>{scenario.deadline}</strong>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function BriefScreen({ goal, onBack, onNext, scenario }) {
  return (
    <section className="screen compact-screen">
      <button className="text-button" type="button" onClick={onBack}>
        Back to goal
      </button>
      <span className="eyebrow blue">Drafted brief</span>
      <h1>{goal}</h1>
      <p className="lead">{scenario.brief}</p>

      <div className="brief-meta">
        <div>
          <span>Estimated time</span>
          <strong>About 2 minutes</strong>
        </div>
        <div>
          <span>Output</span>
          <strong>A private Teams draft - never sent automatically</strong>
        </div>
      </div>

      <article className="surface brief-card">
        <div className="surface-heading">
          <div>
            <span className="section-label">Proposed workflow</span>
            <h2>Planned actions</h2>
          </div>
          <span className="status-pill">Nothing has run</span>
        </div>
        <div className="action-list">
          {scenario.tools.map((tool, index) => (
            <div className="action-row" key={tool.id}>
              <span className="number">{index + 1}</span>
              <div>
                <strong>{tool.name}</strong>
                <p>{tool.action}</p>
              </div>
            </div>
          ))}
        </div>
      </article>

      <FooterActions
        back="Back"
        onBack={onBack}
        primary="Looks good"
        onPrimary={onNext}
      />
    </section>
  );
}

function ControlsScreen({ tools, onBack, onNext, onUpdate }) {
  return (
    <section className="screen wide-screen">
      <button className="text-button" type="button" onClick={onBack}>
        Back to brief
      </button>
      <span className="eyebrow blue">Set controls</span>
      <h1>Choose what AI can do on its own.</h1>
      <p className="lead">
        For each tool, pick how much autonomy AI has. You can change these
        controls every time.
      </p>

      <div className="control-list">
        {tools.map((tool) => (
          <article className="control-row" key={tool.id}>
            <div className={`tool-mark ${tool.id}`}>{tool.mark}</div>
            <div className="tool-summary">
              <h2>{tool.name}</h2>
              <p>{tool.action}</p>
            </div>
            <div
              className="boundary-grid"
              role="group"
              aria-label={`${tool.name} control`}
            >
              {boundaryOptions.map((option) => (
                <button
                  className={
                    tool.boundary === option.value
                      ? `boundary-option active ${option.value
                          .toLowerCase()
                          .replace(" ", "-")}`
                      : "boundary-option"
                  }
                  type="button"
                  onClick={() => onUpdate(tool.id, option.value)}
                  aria-pressed={tool.boundary === option.value}
                  key={option.value}
                >
                  <strong>{option.value}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <FooterActions
        back="Back"
        onBack={onBack}
        primary="Approve and run"
        onPrimary={onNext}
      />
    </section>
  );
}

function ResultScreen({
  approved,
  goal,
  onApprove,
  onBack,
  onRestart,
  onSkip,
  skipped,
  scenario,
  tools,
}) {
  const pendingApproval = tools.find(
    (tool) =>
      tool.boundary === "Ask first" &&
      !approved.includes(tool.id) &&
      !skipped.includes(tool.id),
  );
  const complete = !pendingApproval;
  const resolvedCount = tools.filter(
    (tool) =>
      tool.boundary !== "Ask first" ||
      approved.includes(tool.id) ||
      skipped.includes(tool.id),
  ).length;
  const progress = Math.round((resolvedCount / tools.length) * 100);

  const records = useMemo(
    () =>
      tools.flatMap((tool) => {
        if (tool.boundary === "Automatic") {
          return [`${tool.name}: Completed - ${tool.action}`];
        }
        if (tool.boundary === "Draft only") {
          return [`${tool.name}: Draft created - not published`];
        }
        if (tool.boundary === "Blocked") {
          return [`${tool.name}: Skipped - access blocked`];
        }
        if (approved.includes(tool.id)) {
          return [`${tool.name}: Private draft created - nothing sent`];
        }
        if (skipped.includes(tool.id)) {
          return [`${tool.name}: Skipped by user`];
        }
        return [];
      }),
    [approved, skipped, tools],
  );

  if (complete) {
    const teamsApproved = approved.includes("teams");

    return (
      <section className="screen compact-screen">
        <div className="done-mark">OK</div>
        <span className="eyebrow blue">Delegation complete</span>
        <h1>
          {teamsApproved ? "Done - draft ready." : "Done - approval step skipped."}
        </h1>
        <p className="result-goal">
          <strong>Goal:</strong> {goal}
        </p>
        <p className="lead">
          {teamsApproved
            ? "Summary drafted in Teams as a private draft. Nothing was sent."
            : "The completed work is ready. No Teams draft was created."}
        </p>

        {teamsApproved && (
          <article className="surface output-card">
            <div className="surface-heading">
              <div>
                <span className="section-label">Teams - private draft</span>
                <h2>{scenario.outputTitle}</h2>
              </div>
              <span className="status-pill">Private draft</span>
            </div>
            <ul>
              {scenario.outputPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p>Review the draft and send it to the channel when ready.</p>
          </article>
        )}

        <AuditTrail records={records} />
        <div className="final-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={onRestart}
          >
            New delegation
          </button>
          {teamsApproved && (
            <button className="primary-button" type="button">
              Open draft in Teams
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="screen compact-screen">
      <span className="eyebrow blue">Running your task</span>
      <h1>AI paused - your approval is needed.</h1>
      <p className="result-goal">
        <strong>Goal:</strong> {goal}
      </p>
      <p className="lead">
        The approved work is progressing. AI stopped exactly where you set Ask
        first.
      </p>

      <div
        className="progress-line"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-copy">
        <span>Progress</span>
        <strong>{progress}%</strong>
      </div>

      <article className="approval-panel">
        <div className="approval-title">
          <div className={`tool-mark ${pendingApproval.id}`}>
            {pendingApproval.mark}
          </div>
          <div>
            <span className="ask-pill">Ask first</span>
            <h2>{pendingApproval.name}</h2>
          </div>
        </div>
        <h3>{pendingApproval.action}</h3>
        <p>
          {pendingApproval.id === "teams"
            ? "Approving creates a private Teams draft and sends nothing. You can review it before anyone sees it."
            : `Approving allows this one ${pendingApproval.name} action. No broader access is granted.`}
        </p>
        <div className="approval-buttons">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onSkip(pendingApproval.id)}
          >
            Skip
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => onApprove(pendingApproval.id)}
          >
            {pendingApproval.id === "teams" ? "Approve draft" : "Approve action"}
          </button>
        </div>
      </article>

      <div className="run-summary">
        {tools.map((tool) => (
          <div key={tool.id}>
            <span>{tool.action}</span>
            <strong>{tool.boundary}</strong>
          </div>
        ))}
      </div>

      <AuditTrail records={records} />
      <button
        className="text-button result-back"
        type="button"
        onClick={onBack}
      >
        Change controls
      </button>
    </section>
  );
}

function AuditTrail({ records }) {
  return (
    <article className="surface record-card">
      <div className="surface-heading">
        <div>
          <span className="section-label">Audit trail</span>
          <h2>Execution record</h2>
        </div>
      </div>
      {records.map((record) => (
        <div className="record-row" key={record}>
          <span>Done</span>
          <p>{record}</p>
        </div>
      ))}
    </article>
  );
}

function FooterActions({ back, onBack, onPrimary, primary }) {
  return (
    <div className="footer-actions">
      <button className="text-button" type="button" onClick={onBack}>
        {back}
      </button>
      <button className="primary-button" type="button" onClick={onPrimary}>
        {primary}
      </button>
    </div>
  );
}
