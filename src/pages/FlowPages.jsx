import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Play, RotateCcw, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Badge, EmptyState, PageHeader, Panel, Progress } from "../components/ui";
import { sampleGoals, scoringDimensions } from "../data/demoFixtures";
import { useDelegationSession } from "../context/DelegationSessionContext";

function RequireSession({ children }) {
  const { session } = useDelegationSession();
  return session.analysis ? children : <Navigate to="/delegation" replace />;
}

export function DelegationWorkspace() {
  const [goal, setGoal] = useState("");
  const { start, isAnalyzing, error, reset } = useDelegationSession();
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    if (!goal.trim()) return;
    reset();
    await start(goal.trim());
    navigate("/goal-analysis");
  }
  return <div className="page narrow">
    <PageHeader eyebrow="Delegation Workspace" title="What do you want to achieve?" description="Describe your goal — AI will analyze, decompose, and decide what to delegate." />
    <form onSubmit={submit}>
      <textarea className="goal-input" rows={6} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="e.g. Prepare next sprint planning, analyze user interviews, create a PRD..." autoFocus />
      <p className="field-label">Try one of these:</p>
      <div className="chips">{sampleGoals.map((sample) => <button type="button" className={goal === sample ? "chip selected" : "chip"} onClick={() => setGoal(sample)} key={sample}>{sample}</button>)}</div>
      {error && <p className="error-text">{error}</p>}
      <div className="actions end"><button className="button primary" disabled={!goal.trim() || isAnalyzing}>{isAnalyzing ? "Analyzing…" : <><Sparkles size={16} /> Analyze Goal <ArrowRight size={16} /></>}</button></div>
    </form>
  </div>;
}

export function GoalAnalysis() {
  const { session } = useDelegationSession();
  const analysis = session.analysis;
  return <RequireSession><div className="page">
    <Link className="back-link" to="/delegation"><ArrowLeft size={15} /> Back to Workspace</Link>
    <PageHeader eyebrow="Step 1 — Goal Understanding" title="Goal Analysis" description="AI has parsed your goal. Review before proceeding." />
    <Panel>
      <div className="detail-grid">
        <div><small>Goal</small><strong>{session.goal}</strong></div>
        <div><small>Expected Outcome</small><strong>{analysis?.expected_outcome}</strong></div>
        <div><small>Estimated Risk</small><Badge tone={analysis?.overall_risk}>{analysis?.overall_risk}</Badge></div>
        <div><small>Recoverability</small><Badge tone="green">{analysis?.recoverability}</Badge></div>
      </div>
    </Panel>
    <Panel className="score-panel"><span><small>AI Difficulty Score</small><strong>{analysis?.difficulty_score}<em>/5.0</em></strong></span><div>{Object.entries(analysis?.scores || {}).map(([key, value]) => <p key={key}><span>{scoringDimensions.find((item) => item.key === key)?.label || key}</span><b>{value}</b></p>)}</div></Panel>
    <Panel className="recommendation"><small>Recommended Delegation Strategy</small><strong>{analysis?.delegation_strategy}</strong></Panel>
    <div className="actions end"><Link className="button primary" to="/task-decomposition">Decompose Tasks <ArrowRight size={16} /></Link></div>
  </div></RequireSession>;
}

export function TaskDecomposition() {
  const { session } = useDelegationSession();
  return <RequireSession><div className="page">
    <PageHeader eyebrow="Step 2 — Task Decomposition" title="Task Decomposition" description={`AI split the goal into ${session.tasks.length} executable subtasks.`} />
    <div className="stack">{session.tasks.map((task) => <Panel className="task-card" key={task.order}><span className="task-number">{task.order}</span><div><h3>{task.title}</h3><p>{task.description}</p><span className="task-meta"><Badge tone={task.risk}>{task.risk} risk</Badge><Badge tone="blue">{task.executor}</Badge>{task.depends_on?.length > 0 && <small>Depends on: {task.depends_on.join(", ")}</small>}</span></div></Panel>)}</div>
    <div className="actions end"><Link className="button primary" to="/matrix">Open Delegation Matrix <ArrowRight size={16} /></Link></div>
  </div></RequireSession>;
}

export function DelegationMatrix() {
  const { session, setExecutor } = useDelegationSession();
  if (!session.analysis) return <EmptyState><h2>No active delegation</h2><Link className="button primary" to="/delegation">Start a delegation</Link></EmptyState>;
  return <div className="page wide">
    <PageHeader eyebrow="Step 3 — AI Delegation Matrix" title="Delegation Matrix" description="AI recommends who should handle each task. You can modify any assignment." />
    <div className="stack">{session.tasks.map((task) => <Panel className="matrix-row" key={task.order}><div><h3>{task.title}</h3><p>{task.description}</p><span className="task-meta"><Badge tone={task.risk}>{task.risk}</Badge><small>Recoverability: {task.recoverability}</small><small>Permission: {task.permission.replaceAll("_", " ")}</small></span></div><div className="segmented">{["ai", "shared", "human"].map((executor) => <button className={task.executor === executor ? "selected" : ""} onClick={() => setExecutor(task.order, executor)} key={executor}>{executor === "shared" ? "AI + Human" : executor.toUpperCase()}</button>)}</div></Panel>)}</div>
    <div className="actions end"><Link className="button primary" to="/decision">View Decision Engine <ArrowRight size={16} /></Link></div>
  </div>;
}

export function DecisionEngine() {
  const { session } = useDelegationSession();
  if (!session.analysis) return <Navigate to="/delegation" replace />;
  return <div className="page">
    <PageHeader eyebrow="Step 4 — Decision Engine" title="Decision Engine Visualization" description="AI never hides decisions. See why AI continues, asks, or returns control." />
    <div className="stack">{session.tasks.map((task) => {
      const decision = task.executor === "human" ? "Ask Human" : task.permission === "ask_first" ? "Ask First" : "Continue";
      return <Panel className="decision-card" key={task.order}><div><h3>{task.title}</h3><p>{task.description}</p></div><div className="decision-factors"><span>Risk <Badge tone={task.risk}>{task.risk}</Badge></span><span>Recoverability <b>{task.recoverability}</b></span><span>Permission <b>{task.permission.replaceAll("_", " ")}</b></span></div><strong className="decision-result">{decision}</strong></Panel>;
    })}</div>
    <Panel className="principle"><strong>Recoverability first</strong><p>High-impact or hard-to-reverse actions remain under meaningful human control.</p></Panel>
    <div className="actions end"><Link className="button primary" to="/timeline">View Execution Timeline <ArrowRight size={16} /></Link></div>
  </div>;
}

export function ExecutionTimeline() {
  const { session, beginExecution, complete, undo } = useDelegationSession();
  if (!session.analysis) return <Navigate to="/delegation" replace />;
  const running = session.status === "running";
  const completed = session.status === "completed";
  return <div className="page">
    <PageHeader eyebrow="Step 5 — Execution" title="Execution Timeline" description="A reversible execution state with explicit human control." />
    <Panel className="execution-summary"><span><small>Overall Progress</small><strong>{session.progress}%</strong></span><Progress value={session.progress} /></Panel>
    <div className="timeline">{session.tasks.map((task, index) => {
      const done = completed || session.progress > (index + 1) / session.tasks.length * 100;
      const current = running && !done && index === Math.floor(session.tasks.length * session.progress / 100);
      return <div className="timeline-item" key={task.order}>{done ? <CheckCircle2 /> : current ? <Play /> : <Circle />}<Panel><h3>{task.title}</h3><p>{done ? "Completed" : current ? "Running" : task.executor === "human" ? "Waiting for human" : "Pending"}</p></Panel></div>;
    })}</div>
    <div className="actions"><button className="button secondary" onClick={undo}><RotateCcw size={16} /> Take Back Control</button>{!running && !completed && <button className="button primary" onClick={beginExecution}><Play size={16} /> Start</button>}{running && <button className="button primary" onClick={complete}>Complete Prototype Run</button>}{completed && <Link className="button primary" to="/trust">View Trust Panel <ArrowRight size={16} /></Link>}</div>
  </div>;
}
