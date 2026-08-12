import { ArrowRight, Check, RotateCcw, Save, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Badge, PageHeader, Panel, Progress } from "../components/ui";
import { demoMemories, scoringDimensions } from "../data/demoFixtures";
import { useDelegationSession } from "../context/DelegationSessionContext";

export function TrustDashboard() {
  const { session } = useDelegationSession();
  const trust = Math.max(0, Math.min(100, 73 + (session.status === "completed" ? 4 : 0) + (session.accepted ? 3 : 0) - (session.status === "undone" ? 2 : 0)));
  const dimensions = [
    ["Automation Confidence", 85], ["User Confidence", session.accepted ? 78 : 72],
    ["Recovery Reliability", session.status === "undone" ? 92 : 88], ["Human Intervention", 28], ["Permission Accuracy", 91],
  ];
  return <div className="page">
    <PageHeader eyebrow="Step 6 — Trust Panel" title="Trust Dashboard" description="Trust is built across multiple dimensions and evidence—not represented by a single opaque score." />
    <Panel className="trust-score"><span><small>Overall Trust Score</small><strong>{trust}<em>/100</em></strong></span><Progress value={trust} /></Panel>
    <div className="section-title"><h2>Trust Dimensions</h2></div>
    <div className="two-column">{dimensions.map(([label, value]) => <Panel className="dimension" key={label}><span><strong>{label}</strong><b>{value}%</b></span><Progress value={value} /></Panel>)}</div>
    <div className="section-title"><h2>Session Evidence</h2></div>
    <Panel className="list-panel">{session.events.length ? session.events.map((event, index) => <div className="list-row" key={`${event.at}-${index}`}><span><strong>{event.detail}</strong><small>{new Date(event.at).toLocaleString()}</small></span><Badge tone="green">{event.type}</Badge></div>) : <p className="muted">Complete a delegation to generate real trust evidence.</p>}</Panel>
    <div className="actions end"><Link className="button primary" to="/reflection">View Reflection <ArrowRight size={16} /></Link></div>
  </div>;
}

export function Reflection() {
  const { session, accept, undo } = useDelegationSession();
  const completed = session.status === "completed";
  return <div className="page">
    <PageHeader eyebrow="Step 7 — Reflection" title="Reflection & User Control" description="Review the outcome, accept it, or return control to the user." />
    <Panel className="reflection-result"><Badge tone={completed ? "green" : "neutral"}>{session.status}</Badge><h2>{session.goal || "No active session"}</h2><p>{completed ? "The prototype run completed. Review the boundary choices before accepting." : "Run the execution timeline before completing the reflection."}</p></Panel>
    <div className="three-column">
      <Panel><small>What happened?</small><p>{session.tasks.filter((task) => task.status === "completed").length} of {session.tasks.length} tasks completed.</p></Panel>
      <Panel><small>Was human control preserved?</small><p>{session.tasks.some((task) => task.executor === "human") ? "Yes—at least one critical task remained human-led." : "Review the matrix; no task is currently human-led."}</p></Panel>
      <Panel><small>Can the outcome be recovered?</small><p>{session.analysis?.recoverability || "Unknown"}. Undo remains available.</p></Panel>
    </div>
    <div className="actions"><button className="button danger" onClick={undo}><RotateCcw size={16} /> Undo</button><button className="button secondary">Modify</button><button className="button primary" onClick={accept} disabled={!completed}><Check size={16} /> Accept</button></div>
    {session.accepted && <Panel className="success-message"><Check size={18} /> Decision accepted and saved locally. In real mode it is also written to Base44.</Panel>}
  </div>;
}

export function Scoring() {
  return <div className="page wide">
    <PageHeader eyebrow="Scoring Criteria" title="AI Difficulty Scoring Standard" description="Overall = Σ(score × weight) / 100. Score range: 1.0 easiest → 5.0 hardest." />
    <div className="difficulty-bands">{[["1.0–2.0", "Easy", "green"], ["2.0–3.0", "Moderate", "blue"], ["3.0–4.0", "Hard", "amber"], ["4.0–5.0", "Very Hard", "red"]].map(([range, label, tone]) => <Panel key={label}><Badge tone={tone}>{range}</Badge><h3>{label}</h3></Panel>)}</div>
    <div className="two-column">{scoringDimensions.map((dimension) => <Panel className="scoring-card" key={dimension.key}><span><h3>{dimension.label}</h3><Badge tone="blue">Weight {dimension.weight}%</Badge></span><p>{dimension.description}</p><ol><li>Minimal</li><li>Low</li><li>Moderate</li><li>High</li><li>Critical</li></ol></Panel>)}</div>
  </div>;
}

export function MemoryCenter() {
  const [memories, setMemories] = useState(demoMemories);
  function toggle(id) { setMemories((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item)); }
  function remove(id) { setMemories((items) => items.filter((item) => item.id !== id)); }
  return <div className="page">
    <PageHeader eyebrow="Memory & Consent Center" title="Memory & Consent Center" description="Every remembered collaboration pattern remains visible, editable, and revocable." />
    <div className="stack">{memories.map((memory) => <Panel className={memory.enabled ? "memory-row" : "memory-row paused"} key={memory.id}><div><span><h3>{memory.title}</h3><Badge>{memory.category}</Badge></span><p>{memory.content}</p></div><div className="memory-actions"><button className={memory.enabled ? "toggle on" : "toggle"} onClick={() => toggle(memory.id)} aria-label={`Toggle ${memory.title}`}><span /></button><button className="icon-button" onClick={() => remove(memory.id)}><Trash2 size={16} /></button></div></Panel>)}</div>
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
  return <div className="page">
    <PageHeader eyebrow="Control Center" title="Settings" description="Define global rules for how AI acts on your behalf." />
    <Panel className="settings-panel">{rows.map(([key, label, description]) => <div className="setting-row" key={key}><span><strong>{label}</strong><small>{description}</small></span><button className={settings[key] ? "toggle on" : "toggle"} onClick={() => toggle(key)}><span /></button></div>)}</Panel>
    <div className="actions end"><button className="button primary" onClick={() => setSaved(true)}><Save size={16} /> Save Settings</button></div>
    {saved && <p className="saved-text">Settings saved in this browser.</p>}
  </div>;
}

