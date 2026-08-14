import { useState } from "react";

const stateLabels = {
  idle: "Ready",
  thinking: "Thinking",
  working: "Working",
  waiting: "Waiting for you",
  completed: "Completed",
  stopped: "Stopped",
};

export default function AgentCompanion({ note, onCommand, status }) {
  const [open, setOpen] = useState(false);

  return (
    <aside className={open ? "agent-companion open" : "agent-companion"}>
      {open && (
        <div className="agent-panel" role="dialog" aria-label="AI Agent status">
          <div className="agent-panel-heading">
            <div>
              <span className="section-label">AI Agent</span>
              <strong>{stateLabels[status.state] ?? "Ready"}</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close AI Agent panel">
              脳
            </button>
          </div>
          <p className="agent-current-status">{status.message}</p>
          <p className="agent-note">{note}</p>
          <div className="agent-commands">
            <button type="button" onClick={() => onCommand("explain")}>Explain this step</button>
            <button type="button" onClick={() => onCommand("change-plan")}>Change the plan</button>
            <button type="button" onClick={() => onCommand("why")}>Why did you choose this?</button>
            <button type="button" onClick={() => onCommand("stop")}>Stop task</button>
          </div>
        </div>
      )}
      <button
        className={`agent-orb ${status.state}`}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open AI Agent status"
        aria-expanded={open}
      >
        <span className="agent-orb-core">AI</span>
        <span className="agent-orb-ring" />
      </button>
    </aside>
  );
}
