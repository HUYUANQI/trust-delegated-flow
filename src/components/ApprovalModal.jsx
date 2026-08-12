import { AlertTriangle, Check, Pencil, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ApprovalModal({ task, open, onClose, onDecision }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task?.action_description || task?.description || "");
  useEffect(() => {
    setDraft(task?.action_description || task?.description || "");
    setEditing(false);
  }, [task?.order]);
  if (!open || !task) return null;

  function decide(type) {
    onDecision(type, draft.trim());
    setEditing(false);
  }

  return <div className="modal-backdrop" role="presentation">
    <section className="approval-modal" role="dialog" aria-modal="true" aria-labelledby="approval-title">
      <button className="modal-close" onClick={onClose} aria-label="Close approval dialog"><X size={17} /></button>
      <span className="modal-icon"><AlertTriangle size={20} /></span>
      <small>DECISION BOUNDARY</small>
      <h2 id="approval-title">Approval Required</h2>
      <div className="approval-question">
        <strong>What is AI about to do?</strong>
        {editing
          ? <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} autoFocus />
          : <p>{task.action_description || task.description}</p>}
      </div>
      <div className="approval-grid">
        <div><small>Why approval is required</small><strong>{task.approval_reason || "This action crosses the current permission boundary."}</strong></div>
        <div><small>What approval allows</small><strong>This action only. Global permissions remain unchanged.</strong></div>
        <div><small>Can it be undone?</small><strong>{task.undoable === false ? "Not fully — external impact may remain." : `Partly — recoverability is ${task.recoverability}.`}</strong></div>
        <div><small>AI confidence</small><strong>{Math.round((task.confidence || .72) * 100)}%</strong></div>
      </div>
      <div className="approval-reasons">
        <span><AlertTriangle size={13} /> {task.external_impact ? "External action" : "Decision impact"}</span>
        <span><AlertTriangle size={13} /> {task.risk} risk</span>
        <span><AlertTriangle size={13} /> {task.recoverability} recoverability</span>
      </div>
      <div className="modal-actions">
        <button className="button primary" onClick={() => decide(editing ? "edit_first" : "approve")}><Check size={15} /> {editing ? "Save Edit & Approve" : "Approve"}</button>
        {!editing && <button className="button secondary" onClick={() => setEditing(true)}><Pencil size={15} /> Edit First</button>}
        <button className="button danger" onClick={() => decide("take_control")}><RotateCcw size={15} /> Take Back Control</button>
      </div>
    </section>
  </div>;
}
