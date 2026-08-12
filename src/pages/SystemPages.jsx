import { ArrowRight, Check, Eye, Hand, RotateCcw, Save, ShieldCheck, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Badge, PageHeader, Panel, Progress } from "../components/ui";
import { demoMemories, scoringDimensions } from "../data/demoFixtures";
import { useDelegationSession } from "../context/DelegationSessionContext";
import { useStudy } from "../context/StudyContext";

function countEvents(events, type) {
  return events.filter((event) => event.type === type).length;
}

export function TrustDashboard() {
  const { session } = useDelegationSession();
  const events = session.events || [];
  const explanationCount = countEvents(events, "delegation_explanation_opened");
  const assignmentChanges = countEvents(events, "assignment_changed");
  const approvals = events.filter((event) => event.type === "approval_decision" && event.metadata?.decision !== "take_control").length;
  const interventions = countEvents(events, "take_back_control");
  const undone = countEvents(events, "undo");
  const boundaryPauses = countEvents(events, "decision_boundary_reached");
  const completedActions = countEvents(events, "task_completed") + countEvents(events, "human_task_completed");
  const trust = Math.max(0, Math.min(100, 70 + (boundaryPauses ? 5 : 0) + approvals * 2 + interventions * 2 + (session.accepted ? 3 : 0) - undone * 2));

  const reasons = [
    boundaryPauses > 0 && "AI stopped before an external, hard-to-reverse action.",
    approvals > 0 && `Explicit permission was recorded for ${approvals} external action${approvals > 1 ? "s" : ""}.`,
    assignmentChanges > 0 && `The user changed AI assignment ${assignmentChanges} time${assignmentChanges > 1 ? "s" : ""} before proceeding.`,
    explanationCount > 0 && `AI recommendation reasoning was inspected ${explanationCount} time${explanationCount > 1 ? "s" : ""}.`,
    interventions > 0 && "Take Back Control was used and draft work remained available.",
    completedActions > 0 && `${completedActions} completed action${completedActions > 1 ? "s were" : " was"} logged in sequence.`,
  ].filter(Boolean);

  const evidence = [
    ["Permission respected", boundaryPauses || approvals ? "Yes" : "Not yet observed", boundaryPauses || approvals ? "green" : "neutral"],
    ["Recoverability preserved", undone || interventions || session.analysis?.recoverability === "high" ? "Yes" : "Partly", "green"],
    ["Human intervention available", "Yes", "green"],
    ["AI reasoning inspected", `${explanationCount} time${explanationCount === 1 ? "" : "s"}`, "blue"],
    ["External actions approved", approvals, approvals ? "blue" : "neutral"],
    ["Actions undone", undone, undone ? "amber" : "neutral"],
  ];

  return <div className="page page-enter">
    <PageHeader eyebrow="Step 6 · Trust Evidence" title="Trust is evidence, not just a score" description="Review the behaviors that changed trust. Numbers are supporting indicators, not scientific precision." />
    <div className="trust-overview">
      <Panel className="trust-score compact"><span><small>Supporting trust indicator</small><strong>{trust}<em>/100</em></strong></span><Progress value={trust} /><small>Derived from visible session events</small></Panel>
      <Panel className="why-trust"><h2>Why trust changed</h2>{reasons.length ? <ul>{reasons.map((reason) => <li key={reason}><ShieldCheck size={15} /> {reason}</li>)}</ul> : <p>Start and complete an execution to create session-specific trust evidence.</p>}</Panel>
    </div>
    <div className="section-title"><h2>Trust Evidence</h2><Badge tone="blue">Session-derived</Badge></div>
    <div className="evidence-grid">{evidence.map(([label, value, tone]) => <Panel className="evidence-card" key={label}><small>{label}</small><strong>{value}</strong><Badge tone={tone}>{tone === "green" ? "preserved" : "observed"}</Badge></Panel>)}</div>
    <div className="section-title"><h2>Visible Action Log</h2><Badge>{events.length} events</Badge></div>
    <Panel className="list-panel audit-log">{events.length ? events.slice().reverse().slice(0, 10).map((event, index) => <div className="list-row" key={`${event.at}-${index}`}><span><strong>{event.detail}</strong><small>{new Date(event.at).toLocaleString()}</small></span><Badge tone={event.type.includes("control") || event.type.includes("undo") ? "amber" : event.type.includes("approval") || event.type.includes("boundary") ? "blue" : "green"}>{event.type.replaceAll("_", " ")}</Badge></div>) : <p className="muted padded-empty">Complete a delegation to generate real trust evidence.</p>}</Panel>
    <div className="actions end"><Link className="button primary" to="/reflection">View Reflection <ArrowRight size={16} /></Link></div>
  </div>;
}

export function Reflection() {
  const { session, accept, undo } = useDelegationSession();
  const { record } = useStudy();
  const events = session.events || [];
  const completed = ["completed", "accepted"].includes(session.status);
  const aiCompleted = session.tasks.filter((task) => task.status === "completed" && task.executor !== "human").length;
  const paused = countEvents(events, "decision_boundary_reached");
  const humanDecisions = countEvents(events, "assignment_changed") + countEvents(events, "approval_decision") + countEvents(events, "human_task_completed");
  const controlTaken = countEvents(events, "take_back_control");

  function acceptResult() {
    record("reflection_decision", { decision: "accept" });
    accept();
  }

  function undoResult() {
    record("undo", { step: "Reflection" });
    undo();
  }

  return <div className="page page-enter">
    <PageHeader eyebrow="Step 7 · Reflection" title="Review the delegation outcome" description="Answer three practical questions from the actual session history before accepting or changing the result." />
    <Panel className={session.accepted ? "reflection-result accepted" : "reflection-result"}><Badge tone={session.accepted ? "green" : completed ? "blue" : "neutral"}>{session.status}</Badge><h2>{session.goal || "No active session"}</h2><p>{session.accepted ? "Outcome accepted. The decision and its evidence remain stored locally for review." : completed ? "Execution finished. Review the boundary and control evidence below." : "Complete the execution timeline before accepting the outcome."}</p></Panel>
    <div className="reflection-questions">
      <Panel><span className="question-number">1</span><small>What did AI do?</small><h3>{aiCompleted} low/medium-risk tasks completed</h3><p>AI analyzed, drafted, and reviewed only within the task-level delegation settings.</p></Panel>
      <Panel><span className="question-number">2</span><small>Where did AI stop and ask?</small><h3>{paused} high-impact boundary pause{paused === 1 ? "" : "s"}</h3><p>{paused ? "AI paused before the external stakeholder action and requested an explicit decision." : "No execution boundary has been reached yet."}</p></Panel>
      <Panel><span className="question-number">3</span><small>Where did the user retain control?</small><h3>{humanDecisions} human decision{humanDecisions === 1 ? "" : "s"}</h3><p>{controlTaken ? `Take Back Control was used ${controlTaken} time${controlTaken > 1 ? "s" : ""}.` : "Assignments, approval, editing, intervention, and undo remained available throughout."}</p></Panel>
    </div>
    <Panel className="reflection-summary"><Eye size={18} /><span><strong>Session control summary</strong><small>AI completed: {aiCompleted} · AI paused: {paused} · Human decisions: {humanDecisions} · Control taken back: {controlTaken}</small></span></Panel>
    <div className="actions"><button className="button danger" onClick={undoResult}><RotateCcw size={16} /> Undo</button><Link className="button secondary" to="/matrix">Modify Delegation</Link><button className="button primary" onClick={acceptResult} disabled={!completed || session.accepted}><Check size={16} /> Accept</button></div>
    {session.accepted && <Panel className="success-message"><Check size={18} /> Outcome accepted. Evidence and reflection are preserved in this browser.</Panel>}
  </div>;
}

export function Scoring() {
  return <div className="page wide page-enter">
    <PageHeader eyebrow="Scoring Criteria" title="AI Difficulty Scoring Standard" description="Overall = Σ(score × weight) / 100. Score range: 1.0 easiest → 5.0 hardest." />
    <div className="difficulty-bands">{[["1.0–2.0", "Easy", "green"], ["2.0–3.0", "Moderate", "blue"], ["3.0–4.0", "Hard", "amber"], ["4.0–5.0", "Very Hard", "red"]].map(([range, label, tone]) => <Panel key={label}><Badge tone={tone}>{range}</Badge><h3>{label}</h3></Panel>)}</div>
    <Panel className="principle"><strong>Study note</strong><p>Difficulty indicators support interface explanation. They are not presented as measured confusion, trust, or psychological diagnosis.</p></Panel>
    <div className="two-column scoring-grid">{scoringDimensions.map((dimension) => <Panel className="scoring-card" key={dimension.key}><span><h3>{dimension.label}</h3><Badge tone="blue">Weight {dimension.weight}%</Badge></span><p>{dimension.description}</p><ol><li>Minimal</li><li>Low</li><li>Moderate</li><li>High</li><li>Critical</li></ol></Panel>)}</div>
  </div>;
}

export function MemoryCenter() {
  const [memories, setMemories] = useState(demoMemories);
  function toggle(id) { setMemories((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item)); }
  function remove(id) { setMemories((items) => items.filter((item) => item.id !== id)); }
  return <div className="page page-enter">
    <PageHeader eyebrow="Memory & Consent Center" title="Memory & Consent Center" description="Every remembered collaboration pattern remains visible, editable, and revocable." />
    <div className="stack">{memories.map((memory) => <Panel className={memory.enabled ? "memory-row" : "memory-row paused"} key={memory.id}><div><span><h3>{memory.title}</h3><Badge>{memory.category}</Badge></span><p>{memory.content}</p></div><div className="memory-actions"><button className={memory.enabled ? "toggle on" : "toggle"} onClick={() => toggle(memory.id)} aria-label={`Toggle ${memory.title}`}><span /></button><button className="icon-button" onClick={() => remove(memory.id)} aria-label={`Delete ${memory.title}`}><Trash2 size={16} /></button></div></Panel>)}</div>
    {!memories.length && <Panel><p>No memories are active.</p></Panel>}
  </div>;
}

export function SettingsPage() {
  const [settings, setSettings] = useState({ highRisk: true, autoLowRisk: true, explain: true, remember: false });
  const [saved, setSaved] = useState(false);
  const rows = [
    ["highRisk", "Require approval for high-risk tasks", "AI must ask before high-impact or irreversible actions."],
    ["autoLowRisk", "Auto-run low-risk repetitive tasks", "Allow automation when risk is low and recovery is easy."],
    ["explain", "Show explanation before execution", "Display the decision factors and chosen boundary."],
    ["remember", "Allow AI to remember my workflow", "Save approved collaboration patterns as memory."],
  ];
  function toggle(key) { setSaved(false); setSettings((current) => ({ ...current, [key]: !current[key] })); }
  return <div className="page page-enter">
    <PageHeader eyebrow="Control Center" title="Settings" description="Define global rules for how AI acts on your behalf." />
    <Panel className="settings-panel">{rows.map(([key, label, description]) => <div className="setting-row" key={key}><span><strong>{label}</strong><small>{description}</small></span><button className={settings[key] ? "toggle on" : "toggle"} onClick={() => toggle(key)} aria-label={`Toggle ${label}`}><span /></button></div>)}</Panel>
    <div className="actions end"><button className="button primary" onClick={() => setSaved(true)}><Save size={16} /> Save Settings</button></div>
    {saved && <p className="saved-text">Settings saved in this browser.</p>}
  </div>;
}
