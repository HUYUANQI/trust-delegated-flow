import { Bot, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useDelegationSession } from "../context/DelegationSessionContext";
import { useStudy } from "../context/StudyContext";

function getCompanion(location, session) {
  if (session.status === "awaiting_approval") return ["warning", "I stopped here because this action may affect someone outside this workspace."];
  if (session.status === "human_control") return ["waiting", "You are now controlling this task. Draft work has been preserved."];
  if (session.status === "completed" || session.accepted) return ["completed", "Execution finished. Review the evidence before accepting."];
  const messages = {
    "/delegation": ["thinking", "I’m checking complexity, risk, and recoverability."],
    "/goal-analysis": ["thinking", "I separated the goal from the actions needed to achieve it."],
    "/task-decomposition": ["thinking", "I’m ordering tasks so boundaries are visible before execution."],
    "/matrix": ["idle", "Shared control is recommended where human judgment can change the outcome."],
    "/decision": ["warning", "I will stop when an action crosses the permission boundary."],
    "/timeline": ["working", "I’m working on low-risk tasks automatically and logging each transition."],
    "/trust": ["idle", "Trust is shown through evidence, permissions, and available intervention."],
    "/reflection": ["idle", "Review what I did, where I stopped, and where you retained control."],
  };
  return messages[location.pathname] || ["idle", "I’ll keep delegation boundaries visible as you work."];
}

export default function DelegateCompanion() {
  const location = useLocation();
  const { session } = useDelegationSession();
  const { record } = useStudy();
  const [open, setOpen] = useState(true);
  const [state, message] = getCompanion(location, session);

  function toggle() {
    setOpen((current) => {
      if (!current) record("companion_opened");
      return !current;
    });
  }

  return <aside className={open ? `companion ${state} open` : `companion ${state}`}>
    <button className="companion-toggle" onClick={toggle} aria-label={open ? "Collapse AI companion" : "Open AI companion"}>
      <span><Bot size={18} /></span>{open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
    </button>
    {open && <div><small><Sparkles size={11} /> DELEGATE AI · {state}</small><p>{message}</p></div>}
  </aside>;
}
