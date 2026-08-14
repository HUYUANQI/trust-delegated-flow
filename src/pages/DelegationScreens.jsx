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
  autonomyPresets,
  boundaryOptions,
  deriveMcpSelection,
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
      <h1>Tell the agent what you want to accomplish.</h1>
      <p className="lead">
        You do not need to choose an MCP server. The agent will identify the
        capabilities it needs, explain its choices, and ask before sensitive actions.
      </p>

      <div className="goal-composer">
        <textarea
          aria-label="Task, goal, or problem"
          onChange={(event) => onGoalChange(event.target.value)}
          placeholder="e.g. Help me understand why users are abandoning checkout..."
          value={goal}
        />
        <div className="composer-footer">
          <span>Any reasonable task works — nothing runs before review.</span>
          <button
            className="primary-button"
            type="button"
            onClick={onNext}
            disabled={planning}
          >
            {planning ? "Building plan…" : "Build a plan"}
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
  onMcpChoice,
  onPlanChange,
  onRegenerate,
  onRevise,
  plan,
  planning,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: "", description: "" });
  const [revision, setRevision] = useState("");
  const mcpSelection = useMemo(() => deriveMcpSelection(plan), [plan]);

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
                  <span>{getToolAction(step.toolId).name} · {step.risk} risk</span>
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

      <article className="surface mcp-selection-card">
        <div className="surface-heading mcp-heading">
          <div>
            <span className="section-label">AI-selected MCP capabilities</span>
            <h2>
              {mcpSelection.selected.length
                ? `AI selected ${mcpSelection.selected.length} of ${mcpSelection.catalogSize} available capabilities.`
                : `AI selected 0 of ${mcpSelection.catalogSize} external capabilities.`}
            </h2>
            <p>
              You do not need to choose every MCP server. The agent selected the
              smallest relevant set for this plan.
            </p>
          </div>
          <div className={`confidence-badge ${mcpSelection.confidence.level.toLowerCase()}`}>
            <span>Tool-selection confidence</span>
            <strong>{mcpSelection.confidence.level}</strong>
          </div>
        </div>

        <details className="confidence-details">
          <summary>Why this confidence level?</summary>
          <p>{mcpSelection.confidence.reason}</p>
        </details>

        {mcpSelection.selected.length ? (
          <div className="mcp-card-grid">
            {mcpSelection.selected.map((action) => (
              <article className="mcp-capability-card" key={action.id}>
                <div className="mcp-capability-title">
                  <div className={`tool-mark ${toolClass(action.id)}`}>{action.mark}</div>
                  <div><strong>{action.name}</strong><span>{action.action}</span></div>
                </div>
                <dl className="compact-facts">
                  <div><dt>Permission</dt><dd>{action.permission}</dd></div>
                  <div><dt>Scope</dt><dd>{action.scope}</dd></div>
                </dl>
                <details className="permission-details">
                  <summary>Why was this selected?</summary>
                  <p>{action.selectionReason}</p>
                  <p><strong>Lower-risk alternative:</strong> {action.lowerRiskAlternative}</p>
                </details>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-mcp-message">
            The supplied context is enough for analysis. Avoiding unrelated MCP access is part of the recommendation.
          </div>
        )}

        {mcpSelection.ambiguity && (
          <article className="ambiguity-card">
            <span className="ask-pill">Source choice needs judgment</span>
            <h3>{mcpSelection.ambiguity.question}</h3>
            <p><strong>AI recommendation:</strong> {mcpSelection.ambiguity.recommendation}</p>
            <p>{mcpSelection.ambiguity.reason}</p>
            <div className="inline-actions">
              <button
                className="primary-button small-button"
                type="button"
                onClick={() => {
                  onMcpChoice(mcpSelection.ambiguity.recommendedToolId, mcpSelection.ambiguity);
                }}
              >Use recommendation</button>
              <button
                className="secondary-button small-button"
                type="button"
                onClick={() => {
                  onMcpChoice(mcpSelection.ambiguity.alternativeToolId, mcpSelection.ambiguity);
                }}
              >Choose another source</button>
            </div>
            <details className="permission-details"><summary>Why?</summary><p>{mcpSelection.ambiguity.reason}</p></details>
          </article>
        )}

        {plan.sourceChoiceResolved && (
          <div className="source-choice-confirmed">
            Source choice confirmed: <strong>{plan.sourceChoiceLabel}</strong>. The plan and capability set reflect this choice.
          </div>
        )}

        <details className="considered-details">
          <summary>Other capabilities considered ({mcpSelection.considered.length})</summary>
          <div className="considered-list">
            {mcpSelection.considered.map((action) => (
              <div key={action.id}>
                <strong>{action.name} · {action.action}</strong>
                <p>{action.reasonNotSelected}</p>
              </div>
            ))}
          </div>
        </details>
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
          <p>For example: “Don’t use Slack” or “Focus more on customer feedback.”</p>
        </div>
        <div className="revision-input">
          <input
            value={revision}
            onChange={(event) => setRevision(event.target.value)}
            placeholder="Tell the agent how to change the plan..."
          />
          <button className="secondary-button" type="button" onClick={submitRevision} disabled={!revision.trim() || planning}>
            {planning ? "Revising…" : "Revise"}
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

export function ControlsScreen({ actions, activePreset, onBack, onNext, onPreset, onUpdate, plan }) {
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
        <span>{actions.length} required capabilities · Prototype simulation</span>
      </div>

      <div className="preset-grid" aria-label="Autonomy presets">
        {autonomyPresets.map((preset) => (
          <button
            className={activePreset === preset.id ? "preset-card active" : "preset-card"}
            type="button"
            onClick={() => onPreset(preset.id)}
            aria-pressed={activePreset === preset.id}
            key={preset.id}
          >
            <span>{preset.recommended ? "Recommended" : "Autonomy preset"}</span>
            <strong>{preset.name}</strong>
            <p>{preset.description}</p>
          </button>
        ))}
      </div>

      <p className="preset-note">The preset fills every control below. You can still override any action.</p>

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
              {action.external && (
                <div className="scope-line">
                  <span>{action.permission}</span><span>{action.scope}</span><span>{action.duration}</span>
                </div>
              )}
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
  pauseToken,
  stopToken,
}) {
  const [items, setItems] = useState(() => createExecutionItems(plan));
  const [runtimeActions, setRuntimeActions] = useState(actions);
  const [phase, setPhase] = useState("running");
  const [activeId, setActiveId] = useState(null);
  const [approvalId, setApprovalId] = useState(null);
  const [editApproval, setEditApproval] = useState(false);
  const [approvalDraft, setApprovalDraft] = useState("");
  const [discovery, setDiscovery] = useState(null);
  const [discoveryHandled, setDiscoveryHandled] = useState(false);
  const [showDiscoveryWhy, setShowDiscoveryWhy] = useState(false);
  const [violation, setViolation] = useState(null);
  const [approvalCount, setApprovalCount] = useState(0);
  const [blockedCrossings, setBlockedCrossings] = useState(0);
  const [temporaryGrants, setTemporaryGrants] = useState([]);
  const [showRunWhy, setShowRunWhy] = useState(false);
  const [result, setResult] = useState(null);
  const [audit, setAudit] = useState(() => [
    createAuditEvent("Goal received"),
    createAuditEvent(`AI generated a ${plan.steps.length}-step workflow`),
    createAuditEvent("User reviewed the workflow and set autonomy controls"),
  ]);
  const previousStopToken = useRef(stopToken);
  const previousPauseToken = useRef(pauseToken);

  const actionMap = useMemo(
    () => Object.fromEntries(runtimeActions.map((action) => [action.id, action])),
    [runtimeActions],
  );
  const resolved = items.filter((item) => ["completed", "blocked", "failed"].includes(item.status)).length;
  const progress = items.length ? Math.round((resolved / items.length) * 100) : 0;
  const approvalItem = items.find((item) => item.id === approvalId);
  const approvalAction = approvalItem
    ? actionMap[getToolAction(approvalItem.toolId).id] ?? getToolAction(approvalItem.toolId)
    : null;
  const violationItem = violation ? items.find((item) => item.id === violation.itemId) : null;

  function actionForItem(item) {
    const registryAction = getToolAction(item.toolId);
    return actionMap[registryAction.id] ?? { ...registryAction, boundary: registryAction.defaultBoundary };
  }

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
    if (previousPauseToken.current === pauseToken) return;
    previousPauseToken.current = pauseToken;
    togglePause();
  }, [pauseToken]);

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
          createAuditEvent(`Boundary prevented: ${currentItem.title} was not performed`, "warning"),
        ]);
        setViolation({ itemId: activeId, actionId: registryAction.id });
        setBlockedCrossings((value) => value + 1);
        setPhase("boundary-prevented");
        onAgentStatus({ state: "waiting", message: `${registryAction.name} was blocked by your boundary` });
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
        onAgentStatus({ state: "waiting", message: "A new MCP permission is needed to continue" });
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
  }, [goal, items, onAgentStatus, phase, plan]);

  function togglePause() {
    if (phase === "paused") {
      setPhase("running");
      setAudit((current) => [...current, createAuditEvent("User resumed the agent", "success")]);
      onAgentStatus({ state: "working", message: "Agent resumed within the same boundaries" });
      return;
    }
    if (!["running", "executing"].includes(phase)) return;
    if (phase === "executing" && activeId) {
      setItems((current) => current.map((item) =>
        item.id === activeId ? { ...item, status: "pending", statusMessage: "Paused before the simulated step completed." } : item,
      ));
      setActiveId(null);
    }
    setPhase("paused");
    setAudit((current) => [...current, createAuditEvent("User paused the agent", "warning")]);
    onAgentStatus({ state: "waiting", message: "Agent paused by the user" });
  }

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
    setApprovalCount((value) => value + 1);
    setApprovalId(null);
    setEditApproval(false);
    setPhase("running");
  }

  function blockCapability() {
    const item = items.find((entry) => entry.id === approvalId);
    if (!item || !approvalAction) return;
    setRuntimeActions((current) => current.map((action) =>
      action.id === approvalAction.id ? { ...action, boundary: "Blocked" } : action,
    ));
    setItems((current) => current.map((entry) =>
      entry.id === approvalId
        ? { ...entry, status: "blocked", statusMessage: "Capability blocked by the user; the action was not performed." }
        : entry,
    ));
    setBlockedCrossings((value) => value + 1);
    setAudit((current) => [...current, createAuditEvent(`User blocked ${approvalAction.name}; the proposed action was not performed`, "warning")]);
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
    const temporaryAction = {
      ...discovery.action,
      boundary: "Automatic",
      recommendedBoundary: "Ask first",
      temporary: true,
      external: true,
      selectionReason: discovery.why,
      visibility: "Not externally visible",
      impact: "Read-only access within the approved scope",
    };
    setRuntimeActions((current) => [
      ...current.filter((action) => action.id !== temporaryAction.id),
      temporaryAction,
    ]);
    setTemporaryGrants((current) => [...new Set([...current, temporaryAction.id])]);
    setItems((current) => {
      const firstPending = current.findIndex((item) => item.status === "pending");
      if (firstPending === -1) return [...current, discovery.step];
      return [
        ...current.slice(0, firstPending),
        discovery.step,
        ...current.slice(firstPending),
      ];
    });
    setApprovalCount((value) => value + 1);
    setAudit((current) => [...current, createAuditEvent(`User allowed ${temporaryAction.name} once · ${temporaryAction.scope} · ${temporaryAction.duration}`, "success")]);
    setDiscovery(null);
    setPhase("running");
  }

  function useDiscoveryAlternative() {
    if (!discovery) return;
    const alternativeAction = {
      ...discovery.alternative,
      boundary: "Automatic",
      recommendedBoundary: "Automatic",
      temporary: discovery.alternative.id !== "ai-analyze",
      external: !discovery.alternative.id.startsWith("ai-"),
      selectionReason: "Chosen as the lower-access alternative during execution.",
      visibility: "Not externally visible",
      impact: "Does not change external data",
    };
    setRuntimeActions((current) => [
      ...current.filter((action) => action.id !== alternativeAction.id),
      alternativeAction,
    ]);
    if (alternativeAction.temporary) {
      setTemporaryGrants((current) => [...new Set([...current, alternativeAction.id])]);
      setApprovalCount((value) => value + 1);
    }
    const alternativeStep = {
      ...discovery.step,
      id: `${discovery.step.id}-alternative`,
      title: `Use the lower-access alternative: ${alternativeAction.name}`,
      toolId: alternativeAction.id,
      statusMessage: "Waiting to use the selected alternative.",
    };
    setItems((current) => {
      const firstPending = current.findIndex((item) => item.status === "pending");
      if (firstPending === -1) return [...current, alternativeStep];
      return [...current.slice(0, firstPending), alternativeStep, ...current.slice(firstPending)];
    });
    setAudit((current) => [...current, createAuditEvent(`User chose ${alternativeAction.name} instead of the requested MCP`, "success")]);
    setDiscovery(null);
    setPhase("running");
  }

  function skipDiscovery() {
    setAudit((current) => [...current, createAuditEvent("User continued without the proposed plan change", "warning")]);
    setDiscovery(null);
    setPhase("running");
  }

  function keepBlocked() {
    if (!violationItem) return;
    setAudit((current) => [...current, createAuditEvent(`User kept ${violationItem.title} blocked`, "success")]);
    setViolation(null);
    setPhase("running");
  }

  function allowViolationOnce() {
    if (!violationItem) return;
    const action = getToolAction(violationItem.toolId);
    setItems((current) => current.map((item) =>
      item.id === violationItem.id
        ? { ...item, status: "completed", statusMessage: `${item.title} allowed once in prototype simulation; the standing boundary remains Blocked.` }
        : item,
    ));
    setApprovalCount((value) => value + 1);
    setAudit((current) => [...current, createAuditEvent(`User allowed ${action.name} once; no standing access was changed`, "success")]);
    setViolation(null);
    setPhase("running");
  }

  function changeViolationBoundary() {
    if (!violation) return;
    setRuntimeActions((current) => current.map((action) =>
      action.id === violation.actionId ? { ...action, boundary: "Ask first" } : action,
    ));
    setItems((current) => current.map((item) =>
      item.id === violation.itemId
        ? { ...item, status: "pending", statusMessage: "Boundary changed to Ask first; waiting to retry." }
        : item,
    ));
    setAudit((current) => [...current, createAuditEvent("User changed the blocked capability to Ask first", "approval")]);
    setViolation(null);
    setPhase("running");
  }

  if (phase === "complete" && result) {
    const completedItems = items.filter((item) => item.status === "completed");
    const capabilitiesUsed = new Set(completedItems.map((item) => getToolAction(item.toolId).id));
    const automaticActions = completedItems.filter((item) => actionForItem(item).boundary === "Automatic").length;
    const usedMcpActions = runtimeActions.filter((action) =>
      action.external && completedItems.some((item) => getToolAction(item.toolId).id === action.id),
    );
    return (
      <section className="screen compact-screen result-screen">
        <div className="done-mark">OK</div>
        <span className="eyebrow blue">Task completed</span>
        <h1>{result.title}</h1>
        <p className="result-goal"><strong>Goal:</strong> {goal}</p>
        <div className="simulation-banner">Prototype simulation · Prepared, not externally executed</div>
        <p className="lead">{result.summary}</p>

        <article className="surface trust-summary">
          <div className="surface-heading">
            <div><span className="section-label">Trust summary</span><h2>Your controls were respected</h2></div>
            <span className="status-pill success">Verified in simulation</span>
          </div>
          <div className="trust-metrics">
            <div><strong>{capabilitiesUsed.size}</strong><span>Capabilities used</span></div>
            <div><strong>{automaticActions}</strong><span>Automatic actions</span></div>
            <div><strong>{approvalCount}</strong><span>User approvals</span></div>
            <div><strong>{blockedCrossings}</strong><span>Blocked crossings</span></div>
          </div>
          <ul className="respect-list">
            <li>No messages were sent automatically.</li>
            <li>No shared records were modified without approval.</li>
            <li>Blocked capabilities were never accessed unless you explicitly allowed one use.</li>
            <li>{temporaryGrants.length ? `${temporaryGrants.length} temporary permission${temporaryGrants.length === 1 ? "" : "s"} expired when this run finished.` : "No temporary access remained open."}</li>
          </ul>
          {usedMcpActions.length > 0 && (
            <details className="considered-details">
              <summary>Why these MCPs were used</summary>
              <div className="considered-list">
                {usedMcpActions.map((action) => <div key={action.id}><strong>{action.name}</strong><p>{action.selectionReason ?? action.explanation}</p></div>)}
              </div>
            </details>
          )}
        </article>

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
      <h1>Agent is working within your boundaries.</h1>
      <p className="result-goal"><strong>Goal:</strong> {goal}</p>
      <div className="simulation-banner">Prototype simulation · No real integration is being used</div>
      <p className="lead">{runLead(phase)}</p>

      <div className="run-command-bar" aria-label="Agent controls">
        <button type="button" onClick={togglePause} disabled={!["running", "executing", "paused"].includes(phase)}>{phase === "paused" ? "Resume agent" : "Pause agent"}</button>
        <button type="button" onClick={onBack}>Change boundaries</button>
        <button type="button" onClick={() => setShowRunWhy((value) => !value)}>Ask why</button>
        <button type="button" onClick={() => {
          setItems((current) => current.map((item) => ["pending", "running", "needs-approval"].includes(item.status) ? { ...item, status: "blocked", statusMessage: "Stopped by the user." } : item));
          setPhase("stopped");
          onAgentStatus({ state: "stopped", message: "Task stopped by the user" });
          setAudit((current) => [...current, createAuditEvent("User stopped the prototype task", "warning")]);
        }}>Stop task</button>
      </div>
      {showRunWhy && <div className="run-why">The agent runs only capabilities shown below. Automatic actions are low-risk, Ask first actions pause here, Draft only actions stay private, and Blocked actions are prevented.</div>}

      <div className="progress-line" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-copy"><span>Progress</span><strong>{progress}%</strong></div>

      {phase === "waiting" && approvalItem && approvalAction && (
        <article className="approval-panel">
          <div className="approval-title">
            <div className={`tool-mark ${toolClass(approvalItem.toolId)}`}>{approvalAction.mark}</div>
            <div><span className="ask-pill">Approval checkpoint</span><h2>{approvalAction.name}</h2></div>
          </div>
          <h3>{approvalItem.title}</h3>
          <dl className="approval-facts">
            <div><dt>Capability</dt><dd>{approvalAction.name} · {approvalAction.action}</dd></div>
            <div><dt>Visibility</dt><dd>{approvalAction.visibility ?? "Not externally visible"}</dd></div>
            <div><dt>Impact</dt><dd>{approvalAction.impact ?? approvalAction.explanation}</dd></div>
            <div><dt>AI recommendation</dt><dd>Approve once if this proposed action matches your intent.</dd></div>
          </dl>
          <details className="permission-details"><summary>Why is approval needed?</summary><p>{approvalAction.explanation}</p></details>
          {editApproval && (
            <label className="field-stack approval-edit">
              <span>Edit the proposed action</span>
              <input value={approvalDraft} onChange={(event) => setApprovalDraft(event.target.value)} />
            </label>
          )}
          <div className="approval-buttons">
            <button className="secondary-button" type="button" onClick={skipAction}>Skip</button>
            <button className="secondary-button" type="button" onClick={blockCapability}>Block capability</button>
            <button className="secondary-button" type="button" onClick={() => setEditApproval((value) => !value)}>Edit before approving</button>
            <button className="primary-button" type="button" onClick={approveAction}>Approve once</button>
          </div>
        </article>
      )}

      {phase === "boundary-prevented" && violationItem && (
        <article className="violation-panel">
          <span className="blocked-pill">Boundary violation prevented</span>
          <h2>{violationItem.title} was not performed.</h2>
          <p>The agent reached a capability you set to <strong>Blocked</strong>. It stopped before access and kept the standing boundary unchanged.</p>
          <div className="approval-buttons">
            <button className="secondary-button" type="button" onClick={keepBlocked}>Keep blocked</button>
            <button className="secondary-button" type="button" onClick={changeViolationBoundary}>Change boundary</button>
            <button className="primary-button" type="button" onClick={allowViolationOnce}>Allow once</button>
          </div>
        </article>
      )}

      {phase === "replanning" && discovery && (
        <article className="discovery-panel">
          <span className="status-pill">Dynamic MCP re-selection</span>
          <h2>{discovery.title}</h2>
          <p>{discovery.description}</p>
          <dl className="approval-facts">
            <div><dt>Requested capability</dt><dd>{discovery.action.name} · {discovery.action.action}</dd></div>
            <div><dt>Scope</dt><dd>{discovery.action.scope}</dd></div>
            <div><dt>Permission</dt><dd>{discovery.action.permission}</dd></div>
            <div><dt>Duration</dt><dd>{discovery.action.duration}</dd></div>
            <div><dt>Reason</dt><dd>{discovery.recommendation}</dd></div>
          </dl>
          {showDiscoveryWhy && <p className="discovery-why">{discovery.why}</p>}
          <div className="approval-buttons">
            <button className="secondary-button" type="button" onClick={skipDiscovery}>Do not allow</button>
            <button className="secondary-button" type="button" onClick={useDiscoveryAlternative}>Choose another</button>
            <button className="secondary-button" type="button" onClick={() => setShowDiscoveryWhy((value) => !value)}>Why?</button>
            <button className="primary-button" type="button" onClick={addDiscovery}>Allow once</button>
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
              <div><strong>{item.title}</strong><p>{item.statusMessage}</p><span className="row-boundary">Boundary: {actionForItem(item).boundary ?? actionForItem(item).defaultBoundary}{actionForItem(item).temporary ? ` · Temporary · ${actionForItem(item).scope}` : ""}</span></div>
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
  return { pending: "○", running: "●", completed: "✓", "needs-approval": "!", blocked: "—", failed: "×" }[status] ?? "○";
}

function statusLabel(status) {
  return { pending: "Pending", running: "Running", completed: "Completed", "needs-approval": "Needs approval", blocked: "Blocked", failed: "Failed" }[status] ?? status;
}

function phaseLabel(phase) {
  return { running: "Working", executing: "Working", paused: "Paused", waiting: "Needs approval", replanning: "Permission needed", "boundary-prevented": "Boundary protected", finalizing: "Preparing result", stopped: "Stopped" }[phase] ?? phase;
}

function runLead(phase) {
  if (phase === "waiting") return "The agent paused exactly where the selected control requires approval.";
  if (phase === "replanning") return "A missing capability appeared during execution. The agent cannot expand access without you.";
  if (phase === "boundary-prevented") return "A blocked action was not performed. You can keep the boundary, allow one use, or change it.";
  if (phase === "paused") return "The run is paused. No new simulated step will begin until you resume it.";
  if (phase === "finalizing") return "The completed and blocked steps are being turned into a task-specific outcome.";
  if (phase === "stopped") return "No additional simulated step will run. You can change controls or start a new delegation.";
  return "Each step changes state as it runs. Sensitive actions pause before anything visible could happen.";
}
