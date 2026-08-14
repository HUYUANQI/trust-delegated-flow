import { useEffect, useMemo, useRef, useState } from "react";
import {
  completionMessage,
  createAuditEvent,
  createExecutionItems,
  discoveryForPlan,
  runningMessage,
} from "../agent/executor";
import { generateAgentResult } from "../agent/planner";
import {
  boundaryOptions,
  getToolAction,
} from "../agent/toolRegistry";
import { examplePrompts } from "../data/scenarios";

export function ContextScreen({
  activeExample,
  clarification,
  error,
  goal,
  onAnswerClarification,
  onGoalChange,
  onNext,
  onSelectExample,
  planning,
}) {
  const [answer, setAnswer] = useState("");

  return (
    <section className="screen context-screen">
      <span className="eyebrow">Controlled AI delegation</span>
      <h1>What do you want AI to handle?</h1>
      <p className="lead">
        Describe a task, goal, or problem. AI will understand the request,
        build a plan, and ask you before taking sensitive actions.
      </p>

      <div className="goal-composer">
        <textarea
          aria-label="Task, goal, or problem"
          onChange={(event) => onGoalChange(event.target.value)}
          placeholder="e.g. Help me understand why users are abandoning checkout..."
          value={goal}
        />
        <div className="composer-footer">
          <span>Any reasonable task works 鈥?nothing runs before review.</span>
          <button
            className="primary-button"
            type="button"
            onClick={onNext}
            disabled={planning}
          >
            {planning ? "Building plan鈥? : "Build a plan"}
          </button>
        </div>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}

      {clarification && (
        <article className="clarification-card" aria-live="polite">
          <span className="ask-pill">One quick question</span>
          <h2>{clarification.clarifyingQuestion}</h2>
          {clarification.clarificationOptions.length > 0 && (
            <div className="clarification-options">
              {clarification.clarificationOptions.map((option) => (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onAnswerClarification(option)}
                  key={option}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <label className="field-stack">
            <span>Or add your own context</span>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Tell AI what the output is for, who will read it, or what matters most..."
            />
          </label>
          <button
            className="primary-button"
            type="button"
            onClick={() => onAnswerClarification(answer)}
            disabled={!answer.trim() || planning}
          >
            Continue with this context
          </button>
        </article>
      )}

      <div className="scenario-picker">
        <div className="scenario-heading">
          <span>Try an example</span>
          <strong>Or describe any task in your own words.</strong>
        </div>
        <div className="scenario-grid">
          {examplePrompts.map((example) => (
            <button
              className={
                activeExample === example.id
                  ? "scenario-card selected"
                  : "scenario-card"
              }
              type="button"
              onClick={() => onSelectExample(example)}
              key={example.id}
            >
              <span>{example.label}</span>
              <h2>{example.title}</h2>
              <p>{example.description}</p>
              <strong>Insert prompt</strong>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BriefScreen({
  goal,
  onBack,
  onContinue,
  onPlanChange,
  onRegenerate,
  onRevise,
  plan,
  planning,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", description: "" });
  const [revision, setRevision] = useState("");

  function beginEdit(step) {
    setEditingId(step.id);
    setEditDraft({ title: step.title, description: step.description });
  }

  function saveEdit() {
    onPlanChange({
      ...plan,
      steps: plan.steps.map((step) =>
        step.id === editingId
          ? {
              ...step,
              title: editDraft.title.trim() || step.title,
              description: editDraft.description.trim() || step.description,
            }
          : step,
      ),
    });
    setEditingId(null);
  }

  function removeStep(stepId) {
    if (plan.steps.length <= 2) return;
    onPlanChange({
      ...plan,
      steps: plan.steps.filter((step) => step.id !== stepId),
    });
  }

  function addStep() {
    if (plan.steps.length >= 6) return;
    const newStep = {
      id: `step-manual-${Date.now()}`,
      title: "Review an additional consideration",
      description: "Analyse an additional factor before preparing the final outcome.",
      toolId: "ai-analyze",
      risk: "low",
    };
    onPlanChange({ ...plan, steps: [...plan.steps, newStep] });
    beginEdit(newStep);
  }

  async function submitRevision() {
    await onRevise(revision);
    setRevision("");
  }

  return (
    <section className="screen compact-screen brief-screen">
      <button className="text-button" type="button" onClick={onBack}>Back to request</button>
      <span className="eyebrow blue">AI-generated brief</span>
      <div className="brief-title-line">
        <div>
          <h1>{plan.title}</h1>
          <p className="lead">{plan.understanding}</p>
        </div>
        <span className={`risk-pill ${plan.riskLevel}`}>{plan.riskLevel} risk</span>
      </div>

      {plan.plannerNotice && <div className="notice-banner">{plan.plannerNotice}</div>}

      <div className="brief-summary-grid">
        <article className="surface summary-card">
          <span className="section-label">Your request</span>
          <p>{goal}</p>
        </article>
        <article className="surface summary-card">
          <span className="section-label">Expected output</span>
          <p>{plan.expectedOutput}</p>
        </article>
      </div>

      <article className="surface brief-card">
        <div className="surface-heading">
          <div>
            <span className="section-label">Proposed workflow</span>
            <h2>{plan.steps.length} reviewable steps</h2>
          </div>
          <span className="status-pill">Nothing has run</span>
        </div>
        <div className="editable-action-list">
          {plan.steps.map((step, index) => (
            <div className="editable-action-row" key={step.id}>
              <span className="number">{index + 1}</span>
              {editingId === step.id ? (
                <div className="step-editor">
                  <input
                    value={editDraft.title}
                    onChange={(event) =>
                      setEditDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    aria-label="Step title"
                  />
                  <textarea
                    value={editDraft.description}
                    onChange={(event) =>
                      setEditDraft((current) => ({ ...current, description: event.target.value }))
                    }
                    aria-label="Step description"
                  />
                  <div className="inline-actions">
                    <button className="primary-button small-button" type="button" onClick={saveEdit}>Save</button>
                    <button className="text-button small-button" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="step-copy">
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                  <span>{getToolAction(step.toolId).name} 路 {step.risk} risk</span>
                </div>
              )}
              {editingId !== step.id && (
                <div className="step-actions">
                  <button type="button" onClick={() => beginEdit(step)}>Edit</button>
                  <button type="button" onClick={() => removeStep(step.id)} disabled={plan.steps.length <= 2}>Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="add-step-button" type="button" onClick={addStep} disabled={plan.steps.length >= 6}>+ Add a step</button>
      </article>

      {plan.assumptions?.length > 0 && (
        <article className="assumption-card">
          <span className="section-label">Assumptions</span>
          <ul>{plan.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      )}

      <article className="revision-card">
        <div>
          <span className="section-label">Ask AI to revise</span>
          <p>For example: 鈥淒on鈥檛 use Slack鈥?or 鈥淔ocus more on customer feedback.鈥?/p>
        </div>
        <div className="revision-input">
          <input
            value={revision}
            onChange={(event) => setRevision(event.target.value)}
            placeholder="Tell the agent how to change the plan..."
          />
          <button className="secondary-button" type="button" onClick={submitRevision} disabled={!revision.trim() || planning}>
            {planning ? "Revising鈥? : "Revise"}
          </button>
        </div>
      </article>

      <div className="footer-actions">
        <button className="text-button" type="button" onClick={onBack}>Back</button>
        <div className="grouped-actions">
          <button className="secondary-button" type="button" onClick={onRegenerate} disabled={planning}>Regenerate</button>
          <button className="primary-button" type="button" onClick={onContinue}>Review controls</button>
        </div>
      </div>
    </section>
  );
}

export function ControlsScreen({ actions, onBack, onNext, onUpdate, plan }) {
  return (
    <section className="screen wide-screen">
      <button className="text-button" type="button" onClick={onBack}>Back to brief</button>
      <span className="eyebrow blue">Set controls</span>
      <h1>Choose what AI can do on its own.</h1>
      <p className="lead">
        Only capabilities required by this plan are shown. Every recommendation
        is based on whether the action reads, drafts, changes, or publishes.
      </p>

      <div className="control-context">
        <strong>{plan.title}</strong>
        <span>{actions.length} required capabilities 路 Prototype simulation</span>
      </div>

      <div className="control-list">
        {actions.map((action) => (
          <article className="dynamic-control-row" key={action.id}>
            <div className={`tool-mark ${toolClass(action.id)}`}>{action.mark}</div>
            <div className="tool-summary">
              <div className="tool-title-line">
                <h2>{action.name}</h2>
                <span className="recommended-pill">Recommended: {action.recommendedBoundary}</span>
              </div>
              <p>{action.action}</p>
              <p className="recommendation-reason"><strong>Reason:</strong> {action.reason}</p>
              <details className="permission-details">
                <summary>Why does AI need this?</summary>
                <p>{action.why}</p>
              </details>
            </div>
            <div className="boundary-grid" role="group" aria-label={`${action.name} control`}>
              {boundaryOptions.map((option) => (
                <button
                  className={
                    action.boundary === option.value
                      ? `boundary-option active ${option.value.toLowerCase().replace(" ", "-")}`
                      : "boundary-option"
                  }
                  type="button"
                  onClick={() => onUpdate(action.id, option.value)}
                  aria-pressed={action.boundary === option.value}
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

      <div className="footer-actions">
        <button className="text-button" type="button" onClick={onBack}>Back</button>
        <button className="primary-button" type="button" onClick={onNext}>Approve and run</button>
      </div>
    </section>
  );
}

export function RunScreen({
  actions,
  goal,
  onAgentStatus,
  onBack,
  onRestart,
  plan,
  stopToken,
}) {
  const [items, setItems] = useState(() => createExecutionItems(plan));
  const [phase, setPhase] = useState("running");
  const [activeId, setActiveId] = useState(null);
  const [approvalId, setApprovalId] = useState(null);
  const [editApproval, setEditApproval] = useState(false);
  const [approvalDraft, setApprovalDraft] = useState("");
  const [discovery, setDiscovery] = useState(null);
  const [discoveryHandled, setDiscoveryHandled] = useState(false);
  const [result, setResult] = useState(null);
  const [audit, setAudit] = useState(() => [
    createAuditEvent("Goal received"),
    createAuditEvent(`AI generated a ${plan.steps.length}-step workflow`),
    createAuditEvent("User reviewed the workflow and set autonomy controls"),
  ]);
  const previousStopToken = useRef(stopToken);

  const actionMap = useMemo(
    () => Object.fromEntries(actions.map((action) => [action.id, action])),
    [actions],
  );
  const resolved = items.filter((item) => ["completed", "blocked", "failed"].includes(item.status)).length;
  const progress = items.length ? Math.round((resolved / items.length) * 100) : 0;
  const approvalItem = items.find((item) => item.id === approvalId);

  useEffect(() => {
    if (previousStopToken.current === stopToken) return;
    previousStopToken.current = stopToken;
    if (["complete", "stopped"].includes(phase)) return;
    setItems((current) =>
      current.map((item) =>
        ["pending", "running", "needs-approval"].includes(item.status)
          ? { ...item, status: "blocked", statusMessage: "Stopped by the user before completion." }
          : item,
      ),
    );
    setApprovalId(null);
    setDiscovery(null);
    setPhase("stopped");
    setAudit((current) => [...current, createAuditEvent("User stopped the prototype task", "warning")]);
    onAgentStatus({ state: "stopped", message: "Task stopped by the user" });
  }, [onAgentStatus, phase, stopToken]);

  useEffect(() => {
    if (phase !== "running") return;
    const next = items.find((item) => item.status === "pending");
    if (!next) {
      setPhase("finalizing");
      onAgentStatus({ state: "thinking", message: "Preparing the task-specific result" });
      return;
    }

    setActiveId(next.id);
    setItems((current) =>
      current.map((item) =>
        item.id === next.id
          ? { ...item, status: "running", statusMessage: runningMessage(item) }
          : item,
      ),
    );
    setAudit((current) => [...current, createAuditEvent(`Started: ${next.title}`)]);
    setPhase("executing");
    onAgentStatus({ state: "working", message: runningMessage(next) });
  }, [items, onAgentStatus, phase]);

  useEffect(() => {
    if (phase !== "executing" || !activeId) return undefined;
    const timer = window.setTimeout(() => {
      const currentItem = items.find((item) => item.id === activeId);
      if (!currentItem) return;
      const registryAction = getToolAction(currentItem.toolId);
      const control = actionMap[registryAction.id] ?? {
        boundary: registryAction.defaultBoundary,
      };

      if (control.boundary === "Ask first") {
        setItems((current) =>
          current.map((item) =>
            item.id === activeId
              ? { ...item, status: "needs-approval", statusMessage: "Paused exactly at the Ask first boundary." }
              : item,
          ),
        );
        setApprovalId(activeId);
        setApprovalDraft(currentItem.title);
        setPhase("waiting");
        setAudit((current) => [
          ...current,
          createAuditEvent(`${registryAction.name} action paused for approval`, "approval"),
        ]);
        onAgentStatus({ state: "waiting", message: `Approval needed for ${registryAction.name}` });
        return;
      }

      if (control.boundary === "Blocked") {
        setItems((current) =>
          current.map((item) =>
            item.id === activeId
              ? { ...item, status: "blocked", statusMessage: completionMessage(item, registryAction, control.boundary) }
              : item,
          ),
        );
        setAudit((current) => [
          ...current,
          createAuditEvent(`${currentItem.title} skipped 鈥?access blocked`, "warning"),
        ]);
        setPhase("running");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === activeId
            ? { ...item, status: "completed", statusMessage: completionMessage(item, registryAction, control.boundary) }
            : item,
        ),
      );
      setAudit((current) => [
        ...current,
        createAuditEvent(completionMessage(currentItem, registryAction, control.boundary), "success"),
      ]);

      const completedCount = items.filter((item) => item.status === "completed").length + 1;
      const proposal = !discoveryHandled
        ? discoveryForPlan(plan, completedCount)
        : null;
      if (proposal) {
        setDiscovery(proposal);
        setDiscoveryHandled(true);
        setPhase("replanning");
        setAudit((current) => [
          ...current,
          createAuditEvent("Agent proposed a plan adjustment", "approval"),
        ]);
        onAgentStatus({ state: "waiting", message: "A new risk signal may change the plan" });
      } else {
        setPhase("running");
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [actionMap, activeId, discoveryHandled, items, onAgentStatus, phase, plan]);

  useEffect(() => {
    if (phase !== "finalizing") return undefined;
    let cancelled = false;
    generateAgentResult(goal, plan, { items, audit }).then((nextResult) => {
      if (cancelled) return;
      setResult(nextResult);
      setPhase("complete");
      setAudit((current) => [...current, createAuditEvent("Final task-specific result prepared", "success")]);
      onAgentStatus({ state: "completed", message: "Task-specific result prepared" });
    });
    return () => {
      cancelled = true;
    };
  }, [audit, goal, items, onAgentStatus, phase, plan]);

  function approveAction() {
    const item = items.find((entry) => entry.id === approvalId);
    if (!item) return;
    const action = getToolAction(item.toolId);
    setItems((current) =>
      current.map((entry) =>
        entry.id === approvalId
          ? {
              ...entry,
              title: approvalDraft.trim() || entry.title,
              status: "completed",
              statusMessage: completionMessage(entry, action, "Ask first"),
            }
          : entry,
      ),
    );
    setAudit((current) => [
      ...current,
      createAuditEvent(`User approved the prepared ${action.name} action; no real external action occurred`, "success"),
    ]);
    setApprovalId(null);
    setEditApproval(false);
    setPhase("running");
  }

  function skipAction() {
    const item = items.find((entry) => entry.id === approvalId);
    if (!item) return;
    setItems((current) =>
      current.map((entry) =>
        entry.id === approvalId
          ? { ...entry, status: "blocked", statusMessage: "Skipped by the user at the approval boundary." }
          : entry,
      ),
    );
    setAudit((current) => [...current, createAuditEvent(`User skipped: ${item.title}`, "warning")]);
    setApprovalId(null);
    setEditApproval(false);
    setPhase("running");
  }

  function addDiscovery() {
    if (!discovery) return;
    setItems((current) => {
      const firstPending = current.findIndex((item) => item.status === "pending");
      if (firstPending === -1) return [...current, discovery.step];
      return [
        ...current.slice(0, firstPending),
        discovery.step,
        ...current.slice(firstPending),
      ];
    });
    setAudit((current) => [...current, createAuditEvent(`User added: ${discovery.step.title}`, "success")]);
    setDiscovery(null);
    setPhase("running");
  }

  function skipDiscovery() {
    setAudit((current) => [...current, createAuditEvent("User continued without the proposed plan change", "warning")]);
    setDiscovery(null);
    setPhase("running");
  }

  if (phase === "complete" && result) {
    return (
      <section className="screen compact-screen result-screen">
        <div className="done-mark">OK</div>
        <span className="eyebrow blue">Task completed</span>
        <h1>{result.title}</h1>
        <p className="result-goal"><strong>Goal:</strong> {goal}</p>
        <div className="simulation-banner">Prototype simulation 路 Prepared, not externally executed</div>
        <p className="lead">{result.summary}</p>

        <div className="dynamic-result-stack">
          {result.sections.map((section) => (
            <article className="surface result-section" key={section.title}>
              <div className="surface-heading">
                <div>
                  <span className="section-label">Prepared result</span>
                  <h2>{section.title}</h2>
                </div>
              </div>
              {section.body && <p className="result-body">{section.body}</p>}
              {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
            </article>
          ))}
        </div>

        <article className="next-step-card">
          <span className="section-label">Recommended next step</span>
          <p>{result.nextStep}</p>
        </article>
        <AuditTrail records={audit} />
        <div className="final-actions">
          <button className="secondary-button" type="button" onClick={onRestart}>New delegation</button>
          <button className="primary-button" type="button" onClick={() => window.print()}>Review / save result</button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen compact-screen run-screen">
      <span className="eyebrow blue">Agent execution</span>
      <h1>{runHeading(phase)}</h1>
      <p className="result-goal"><strong>Goal:</strong> {goal}</p>
      <div className="simulation-banner">Prototype simulation 路 No real integration is being used</div>
      <p className="lead">{runLead(phase)}</p>

      <div className="progress-line" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-copy"><span>Progress</span><strong>{progress}%</strong></div>

      {phase === "waiting" && approvalItem && (
        <article className="approval-panel">
          <div className="approval-title">
            <div className={`tool-mark ${toolClass(approvalItem.toolId)}`}>{getToolAction(approvalItem.toolId).mark}</div>
            <div><span className="ask-pill">Ask first</span><h2>{getToolAction(approvalItem.toolId).name}</h2></div>
          </div>
          <h3>{approvalItem.title}</h3>
          <p>{getToolAction(approvalItem.toolId).explanation}</p>
          {editApproval && (
            <label className="field-stack approval-edit">
              <span>Edit the proposed action</span>
              <input value={approvalDraft} onChange={(event) => setApprovalDraft(event.target.value)} />
            </label>
          )}
          <div className="approval-buttons">
            <button className="secondary-button" type="button" onClick={skipAction}>Skip</button>
            <button className="secondary-button" type="button" onClick={() => setEditApproval((value) => !value)}>Edit</button>
            <button className="primary-button" type="button" onClick={approveAction}>Approve simulation</button>
          </div>
        </article>
      )}

      {phase === "replanning" && discovery && (
        <article className="discovery-panel">
          <span className="status-pill">Agent discovered new context</span>
          <h2>{discovery.title}</h2>
          <p>{discovery.description}</p>
          <strong>{discovery.recommendation}</strong>
          <div className="approval-buttons">
            <button className="secondary-button" type="button" onClick={skipDiscovery}>Continue without it</button>
            <button className="primary-button" type="button" onClick={addDiscovery}>Add to plan</button>
          </div>
        </article>
      )}

      <article className="surface execution-card">
        <div className="surface-heading">
          <div><span className="section-label">Live execution</span><h2>Working through the plan</h2></div>
          <span className="status-pill">{phaseLabel(phase)}</span>
        </div>
        <div className="execution-list">
          {items.map((item) => (
            <div className={`execution-row ${item.status}`} key={item.id}>
              <span className="execution-icon">{statusIcon(item.status)}</span>
              <div><strong>{item.title}</strong><p>{item.statusMessage}</p></div>
              <span className={`execution-status ${item.status}`}>{statusLabel(item.status)}</span>
            </div>
          ))}
        </div>
      </article>

      <AuditTrail records={audit} />
      <button className="text-button result-back" type="button" onClick={onBack}>Change controls</button>
    </section>
  );
}

function AuditTrail({ records }) {
  return (
    <article className="surface record-card">
      <div className="surface-heading">
        <div><span className="section-label">Audit trail</span><h2>Execution record</h2></div>
      </div>
      {records.map((record) => (
        <div className="dynamic-record-row" key={record.id}>
          <time>{record.time}</time>
          <span className={`audit-dot ${record.kind}`} />
          <p>{record.message}</p>
        </div>
      ))}
    </article>
  );
}

function toolClass(id) {
  if (id.startsWith("ai-")) return "reasoning";
  return id.split("-")[0];
}

function statusIcon(status) {
  return { pending: "鈼?, running: "鈼?, completed: "鉁?, "needs-approval": "!", blocked: "鈥?, failed: "脳" }[status] ?? "鈼?;
}

function statusLabel(status) {
  return { pending: "Pending", running: "Running", completed: "Completed", "needs-approval": "Needs approval", blocked: "Blocked", failed: "Failed" }[status] ?? status;
}

function phaseLabel(phase) {
  return { running: "Working", executing: "Working", waiting: "Needs approval", replanning: "Replanning", finalizing: "Preparing result", stopped: "Stopped" }[phase] ?? phase;
}

function runHeading(phase) {
  if (phase === "waiting") return "AI needs your approval.";
  if (phase === "replanning") return "AI found something worth reviewing.";
  if (phase === "finalizing") return "Preparing your result.";
  if (phase === "stopped") return "Task stopped.";
  return "Working on your task.";
}

function runLead(phase) {
  if (phase === "waiting") return "The agent paused exactly where the selected control requires approval.";
  if (phase === "replanning") return "The plan can adapt, but you decide whether the newly discovered work is added.";
  if (phase === "finalizing") return "The completed and blocked steps are being turned into a task-specific outcome.";
  if (phase === "stopped") return "No additional simulated step will run. You can change controls or start a new delegation.";
  return "Each step changes state as it runs. Sensitive actions pause before anything visible could happen.";
}
