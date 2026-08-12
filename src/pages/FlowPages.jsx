import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Circle, Hand, LoaderCircle,
  PauseCircle, Play, RotateCcw, Sparkles, UserRoundCheck,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ApprovalModal from "../components/ApprovalModal";
import DecisionBoundary from "../components/DecisionBoundary";
import WhyThisDecision from "../components/WhyThisDecision";
import { Badge, EmptyState, PageHeader, Panel, Progress } from "../components/ui";
import { sampleGoals, scoringDimensions } from "../data/demoFixtures";
import { researchScenarioGoal } from "../data/studyFixtures";
import { useDelegationSession } from "../context/DelegationSessionContext";
import { useStudy } from "../context/StudyContext";

const executorLabel = { ai: "AI", shared: "AI + Human", human: "Human" };

function RequireSession({ children }) {
  const { session } = useDelegationSession();
  return session.analysis ? children : <Navigate to="/delegation" replace />;
}

export function DelegationWorkspace() {
  const [goal, setGoal] = useState("");
  const { start, isAnalyzing, error, reset } = useDelegationSession();
  const { record } = useStudy();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    if (!goal.trim()) return;
    reset();
    record("goal_submitted", { scenario: goal.trim() === researchScenarioGoal ? "research_demo" : "custom" });
    await start(goal.trim());
    navigate("/goal-analysis");
  }

  return <div className="page narrow page-enter">
    <PageHeader eyebrow="Delegation Workspace" title="What do you want to achieve?" description="Describe the outcome. AI will expose what it can do, where it needs you, and when it must stop." />
    <form onSubmit={submit}>
      <textarea className="goal-input" rows={6} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="e.g. Analyze five interviews and prepare a product-team summary..." autoFocus />
      <div className="field-heading"><p className="field-label">Try a scenario</p><Badge tone="blue">HCD study scenario included</Badge></div>
      <div className="chips">{sampleGoals.map((sample) => <button type="button" className={goal === sample ? "chip selected" : "chip"} onClick={() => setGoal(sample)} key={sample}>{sample}</button>)}</div>
      {error && <p className="error-text">{error}</p>}
      {isAnalyzing && <Panel className="thinking-panel"><LoaderCircle className="spin" size={18} /><span><strong>Analyzing delegation boundaries</strong><small>Checking complexity, risk, recoverability, external impact, and human judgment.</small></span></Panel>}
      <div className="actions end"><button className="button primary" disabled={!goal.trim() || isAnalyzing}>{isAnalyzing ? "Analyzing…" : <><Sparkles size={16} /> Analyze Goal <ArrowRight size={16} /></>}</button></div>
    </form>
  </div>;
}

export function GoalAnalysis() {
  const { session } = useDelegationSession();
  const analysis = session.analysis;
  return <RequireSession><div className="page page-enter">
    <Link className="back-link" to="/delegation"><ArrowLeft size={15} /> Back to Workspace</Link>
    <PageHeader eyebrow="Step 1 · Goal Understanding" title="Goal Analysis" description="AI parsed the outcome and identified where delegation may need human control." />
    <Panel>
      <div className="detail-grid">
        <div><small>Goal</small><strong>{session.goal}</strong></div>
        <div><small>Expected outcome</small><strong>{analysis?.expected_outcome}</strong></div>
        <div><small>Estimated risk</small><Badge tone={analysis?.overall_risk}>{analysis?.overall_risk}</Badge></div>
        <div><small>Recoverability</small><Badge tone="green">{analysis?.recoverability}</Badge></div>
      </div>
    </Panel>
    <Panel className="score-panel"><span><small>AI Difficulty Indicator</small><strong>{analysis?.difficulty_score}<em>/5.0</em></strong><small>Planning support only — not a scientific score.</small></span><div>{Object.entries(analysis?.scores || {}).map(([key, value]) => <p key={key}><span>{scoringDimensions.find((item) => item.key === key)?.label || key}</span><b>{value}</b></p>)}</div></Panel>
    <div className="two-column analysis-footer">
      <Panel className="recommendation"><small>Recommended delegation strategy</small><strong>{analysis?.delegation_strategy}</strong></Panel>
      <Panel><small>Boundaries AI will preserve</small><ul className="compact-list">{analysis?.constraints?.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></Panel>
    </div>
    <div className="actions end"><Link className="button primary" to="/task-decomposition">Decompose Tasks <ArrowRight size={16} /></Link></div>
  </div></RequireSession>;
}

export function TaskDecomposition() {
  const { session } = useDelegationSession();
  return <RequireSession><div className="page page-enter">
    <PageHeader eyebrow="Step 2 · Task Decomposition" title="Task Decomposition" description={`AI split the goal into ${session.tasks.length} ordered tasks and marked the point where external impact begins.`} />
    <div className="stack">{session.tasks.map((task) => <Panel className={task.decision_boundary ? "task-card boundary-task" : "task-card"} key={task.order}>
      <span className="task-number">{task.order}</span>
      <div><div className="task-title-row"><h3>{task.title}</h3>{task.decision_boundary && <Badge tone="red">Decision boundary</Badge>}</div><p>{task.description}</p><span className="task-meta"><Badge tone={task.risk}>{task.risk} risk</Badge><Badge tone="blue">{executorLabel[task.executor]}</Badge><small>Recoverability: {task.recoverability}</small><small>Human judgment: {task.human_judgment}</small>{task.depends_on?.length > 0 && <small>Depends on: {task.depends_on.join(", ")}</small>}</span></div>
    </Panel>)}</div>
    <div className="actions end"><Link className="button primary" to="/matrix">Open Delegation Matrix <ArrowRight size={16} /></Link></div>
  </div></RequireSession>;
}

export function DelegationMatrix() {
  const { session, setExecutor, openExplanation } = useDelegationSession();
  const { record } = useStudy();
  if (!session.analysis) return <EmptyState><h2>No active delegation</h2><Link className="button primary" to="/delegation">Start a delegation</Link></EmptyState>;

  function changeExecutor(task, executor) {
    if (task.executor === executor) return;
    record("assignment_changed", { taskOrder: task.order, from: task.executor, to: executor });
    setExecutor(task.order, executor);
  }

  function inspect(task) {
    record("delegation_explanation_opened", { taskOrder: task.order });
    openExplanation(task.order);
  }

  return <div className="page wide page-enter">
    <PageHeader eyebrow="Step 3 · Delegation Matrix" title="Who should do what?" description="Inspect why AI recommends each mode. Changing an assignment never blocks you; it makes the control shift visible." />
    <div className="matrix-legend"><span><i className="legend-dot ai" /> AI acts within the boundary</span><span><i className="legend-dot shared" /> Shared interpretation or review</span><span><i className="legend-dot human" /> Direct human control</span></div>
    <div className="stack">{session.tasks.map((task) => <Panel className={task.decision_boundary ? "matrix-row boundary-task" : "matrix-row"} key={task.order}>
      <div className="matrix-main">
        <div className="task-title-row"><h3>{task.title}</h3><Badge tone="blue">Recommended: {executorLabel[task.recommended_executor]}</Badge></div>
        <p>{task.description}</p>
        <div className="matrix-evidence"><span><small>Risk</small><Badge tone={task.risk}>{task.risk}</Badge></span><span><small>Recoverability</small><strong>{task.recoverability}</strong></span><span><small>Permission</small><strong>{task.permission.replaceAll("_", " ")}</strong></span><span><small>Human judgment</small><strong>{task.human_judgment}</strong></span></div>
        <WhyThisDecision reasoning={task.reasoning} onOpen={() => inspect(task)} />
        {task.assignment_feedback && <div className={task.executor === "ai" ? "assignment-feedback warning" : "assignment-feedback"}><AlertTriangle size={14} /><span>{task.assignment_feedback}</span></div>}
      </div>
      <div className="segmented" aria-label={`Executor for ${task.title}`}>{["ai", "shared", "human"].map((executor) => <button className={task.executor === executor ? "selected" : ""} onClick={() => changeExecutor(task, executor)} key={executor}>{executorLabel[executor]}</button>)}</div>
    </Panel>)}</div>
    <div className="actions end"><Link className="button primary" to="/decision">Inspect Decision Boundary <ArrowRight size={16} /></Link></div>
  </div>;
}

export function DecisionEngine() {
  const { session, boundaryTask, allowOnce, approvalDecision, takeBackControl, logEvent } = useDelegationSession();
  const { record } = useStudy();
  const [approvalOpen, setApprovalOpen] = useState(false);
  if (!session.analysis) return <Navigate to="/delegation" replace />;

  function review() {
    setApprovalOpen(true);
    logEvent("approval_modal_opened", `Approval details opened for “${boundaryTask.title}”`, { taskOrder: boundaryTask.order, source: "decision_boundary" });
    record("approval_modal_opened", { taskOrder: boundaryTask.order });
  }

  function allow() {
    allowOnce(boundaryTask.order);
    record("decision_changed", { decision: "allow_once", taskOrder: boundaryTask.order });
  }

  function keepHuman() {
    takeBackControl(boundaryTask.order, "decision_boundary");
    record("take_back_control", { taskOrder: boundaryTask.order });
    record("decision_changed", { decision: "keep_human", taskOrder: boundaryTask.order });
  }

  function decide(decision, editedAction) {
    approvalDecision(boundaryTask.order, decision, editedAction);
    record(decision === "take_control" ? "take_back_control" : "approval_decision", { decision, taskOrder: boundaryTask.order });
    setApprovalOpen(false);
  }

  return <div className="page page-enter">
    <PageHeader eyebrow="Step 4 · Decision Boundary" title="AI knows when it must stop" description="The system evaluates permission, impact, recoverability, and confidence before acting." />
    <DecisionBoundary task={boundaryTask} state={boundaryTask.boundary_state} onReview={review} onAllowOnce={allow} onKeepHuman={keepHuman} />
    <div className="section-title"><h2>How other tasks are handled</h2><Badge tone="blue">Transparent rules</Badge></div>
    <div className="stack compact-decisions">{session.tasks.filter((task) => task.order !== boundaryTask.order).map((task) => {
      const decision = task.executor === "human" ? "Human control" : task.permission === "ask_first" ? "Shared review" : "Continue automatically";
      return <Panel className="decision-card" key={task.order}><div><h3>{task.title}</h3><p>{task.reasoning}</p></div><div className="decision-factors"><span>Risk <Badge tone={task.risk}>{task.risk}</Badge></span><span>Recoverability <b>{task.recoverability}</b></span><span>Permission <b>{task.permission.replaceAll("_", " ")}</b></span></div><strong className="decision-result">{decision}</strong></Panel>;
    })}</div>
    <Panel className="principle"><strong>Recoverability first</strong><p>High-impact or hard-to-reverse actions remain under meaningful human control. “Allow once” never changes global settings.</p></Panel>
    <div className="actions end"><Link className="button primary" to="/timeline">Start Execution Experience <ArrowRight size={16} /></Link></div>
    <ApprovalModal task={boundaryTask} open={approvalOpen} onClose={() => setApprovalOpen(false)} onDecision={decide} />
  </div>;
}

const stateLabels = {
  pending: "Waiting in plan", analyzing: "Analyzing inputs", reviewing: "Checking evidence", ready: "Ready to act",
  running: "AI is working…", awaiting_approval: "Approval required", paused: "AI paused", human_control: "Human control",
  completed: "Completed", accepted: "Accepted", undone: "Undone",
};

function TimelineIcon({ status }) {
  if (status === "completed" || status === "accepted") return <CheckCircle2 />;
  if (["analyzing", "reviewing", "running"].includes(status)) return <LoaderCircle className="spin" />;
  if (status === "awaiting_approval" || status === "paused") return <PauseCircle />;
  if (status === "human_control") return <UserRoundCheck />;
  return <Circle />;
}

export function ExecutionTimeline() {
  const { session, boundaryTask, beginExecution, approvalDecision, takeBackControl, completeHumanTask, undo } = useDelegationSession();
  const { record } = useStudy();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const openedForRef = useRef(null);
  const activeTask = session.tasks.find((task) => task.order === session.currentTaskOrder);
  const completed = session.status === "completed" || session.status === "accepted";

  useEffect(() => {
    if (session.status === "awaiting_approval" && activeTask && openedForRef.current !== activeTask.order) {
      openedForRef.current = activeTask.order;
      setApprovalOpen(true);
      record("approval_modal_opened", { taskOrder: activeTask.order, source: "execution" });
    }
  }, [session.status, activeTask?.order]);

  if (!session.analysis) return <Navigate to="/delegation" replace />;

  function decide(decision, editedAction) {
    approvalDecision(activeTask?.order || boundaryTask.order, decision, editedAction);
    record(decision === "take_control" ? "take_back_control" : "approval_decision", { decision, taskOrder: activeTask?.order || boundaryTask.order });
    setApprovalOpen(false);
  }

  function intervene() {
    takeBackControl(activeTask?.order, "execution_timeline");
    record("take_back_control", { taskOrder: activeTask?.order });
    setApprovalOpen(false);
  }

  function run() {
    record("execution_started");
    beginExecution();
  }

  function undoRun() {
    record("undo");
    undo();
  }

  return <div className="page page-enter">
    <PageHeader eyebrow="Step 5 · Execution" title="Execution Timeline" description="Watch the agent work task by task. It will pause automatically before crossing the approval boundary." />
    <Panel className="execution-summary"><span><div><small>Overall progress</small><strong>{session.progress}%</strong></div><Badge tone={session.status === "awaiting_approval" ? "red" : session.status === "human_control" ? "amber" : completed ? "green" : "blue"}>{session.status.replaceAll("_", " ")}</Badge></span><Progress value={session.progress} /></Panel>
    {session.status === "awaiting_approval" && <Panel className="execution-alert"><AlertTriangle size={19} /><span><strong>Approval Required</strong><small>AI wants to perform an external action. Execution is stopped until you decide.</small></span><button className="button primary" onClick={() => setApprovalOpen(true)}>Review approval</button></Panel>}
    {session.status === "human_control" && <Panel className="control-returned"><Hand size={20} /><span><strong>Control returned to you</strong><small>No external action was performed. Draft work and earlier evidence have been preserved.</small></span></Panel>}
    <div className="timeline">{session.tasks.map((task) => <div className={`timeline-item ${task.status}`} key={task.order}><TimelineIcon status={task.status} /><Panel><div className="timeline-heading"><span><h3>{task.title}</h3><p>{stateLabels[task.status] || task.status}</p></span><Badge tone={task.status === "awaiting_approval" ? "red" : task.status === "human_control" ? "amber" : task.status === "completed" ? "green" : "neutral"}>{executorLabel[task.executor]}</Badge></div>{["analyzing", "reviewing", "running"].includes(task.status) && <div className="task-activity"><i /><span>{task.status === "analyzing" ? "Reading task context" : task.status === "reviewing" ? "Checking decision quality" : "Producing the next artifact"}</span></div>}{task.status === "awaiting_approval" && <p className="timeline-warning">AI paused: {task.approval_reason}</p>}</Panel></div>)}</div>
    <div className="actions execution-actions">
      {["running", "awaiting_approval"].includes(session.status) && <button className="button danger" onClick={intervene}><RotateCcw size={16} /> Take Back Control</button>}
      {session.status === "human_control" && <button className="button primary" onClick={completeHumanTask}><UserRoundCheck size={16} /> Mark Human Task Complete & Continue</button>}
      {["planned", "undone", "draft"].includes(session.status) && <button className="button primary" onClick={run}><Play size={16} /> Start Agent Execution</button>}
      {completed && <><button className="button danger" onClick={undoRun}><RotateCcw size={16} /> Undo Outcome</button><Link className="button primary" to="/trust">Review Trust Evidence <ArrowRight size={16} /></Link></>}
    </div>
    <ApprovalModal task={activeTask || boundaryTask} open={approvalOpen} onClose={() => setApprovalOpen(false)} onDecision={decide} />
  </div>;
}
