import { Activity, RotateCcw, X } from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { Badge, Panel } from "./ui";

export default function StudyObserverPanel({ open, onClose }) {
  const { summary, clearStudy } = useStudy();
  if (!open) return null;
  return <div className="observer-backdrop" role="presentation" onClick={onClose}>
    <aside className="observer-panel" role="dialog" aria-modal="true" aria-label="Study Observation" onClick={(event) => event.stopPropagation()}>
      <header><span><Activity size={18} /><strong>Study Observation</strong></span><button className="icon-button" onClick={onClose}><X size={16} /></button></header>
      <p>Interaction friction indicators based on local behavior. These are observation cues, not psychological or scientific confusion scores.</p>
      <div className="observer-list">{summary.map((item) => <Panel key={item.step} className="observer-item">
        <div><strong>{item.step}</strong><Badge tone={item.friction.startsWith("High") ? "red" : item.friction.startsWith("Medium") ? "amber" : "green"}>{item.friction}</Badge></div>
        <small>{item.duration || 0} sec observed</small>
        <ul>
          {item.assignmentChanges > 0 && <li>{item.assignmentChanges} assignment change{item.assignmentChanges > 1 ? "s" : ""}</li>}
          {item.explanationsOpened > 0 && <li>{item.explanationsOpened} explanation{item.explanationsOpened > 1 ? "s" : ""} opened</li>}
          {item.decisionChanges > 0 && <li>{item.decisionChanges} decision interaction{item.decisionChanges > 1 ? "s" : ""}</li>}
          {item.approvalOpened && <li>Approval required</li>}
          {item.interventions > 0 && <li>Take Back Control / undo used</li>}
        </ul>
      </Panel>)}</div>
      <button className="button secondary observer-reset" onClick={clearStudy}><RotateCcw size={14} /> Reset local observation</button>
    </aside>
  </div>;
}
