import { AlertTriangle, CheckCircle2, Eye, Hand, ShieldAlert } from "lucide-react";
import { Badge, Panel, Progress } from "./ui";

export default function DecisionBoundary({ task, state = "pending", onReview, onAllowOnce, onKeepHuman }) {
  if (!task) return null;
  const resolved = state === "allowed_once" || state === "human_control";
  return <Panel className={resolved ? "decision-boundary resolved" : "decision-boundary"}>
    <div className="boundary-heading">
      <span className="boundary-icon">{resolved ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}</span>
      <div><small>AI REACHED A DECISION BOUNDARY</small><h2>{task.title}</h2><p>{task.action_description || task.description}</p></div>
      <Badge tone={resolved ? "green" : "red"}>{state.replaceAll("_", " ")}</Badge>
    </div>
    <div className="boundary-signals">
      <span><small>Risk</small><Badge tone={task.risk}>{task.risk}</Badge></span>
      <span><small>Recoverability</small><strong>{task.recoverability}</strong></span>
      <span><small>External impact</small><strong>{task.external_impact ? "High" : "Contained"}</strong></span>
      <span><small>AI confidence</small><strong>{Math.round((task.confidence || .72) * 100)}%</strong><Progress value={(task.confidence || .72) * 100} /></span>
    </div>
    <div className="ai-paused"><AlertTriangle size={17} /><span><strong>{state === "human_control" ? "HUMAN CONTROL" : state === "allowed_once" ? "ALLOWED ONCE" : "AI PAUSED"}</strong><small>{state === "human_control" ? "Control returned to you. No external action was performed." : state === "allowed_once" ? "Permission granted for this action only." : task.approval_reason}</small></span></div>
    {!resolved && <div className="boundary-actions">
      <button className="button secondary" onClick={onReview}><Eye size={15} /> Review Action</button>
      <button className="button primary" onClick={onAllowOnce}>Allow Once</button>
      <button className="button danger" onClick={onKeepHuman}><Hand size={15} /> Keep Human Control</button>
    </div>}
  </Panel>;
}
