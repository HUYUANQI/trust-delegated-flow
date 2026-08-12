import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { analyzeGoal } from "../services/analyzeGoal";
import { createRemoteSession, logExecutionEvent, updateRemoteSession } from "../services/sessionRepository";

const STORAGE_KEY = "delegateai.current-session.v2";
const LEGACY_STORAGE_KEY = "delegateai.current-session.v1";
const SessionContext = createContext(null);

const emptySession = {
  id: null,
  goal: "",
  status: "draft",
  analysis: null,
  tasks: [],
  delegationMode: "shared",
  progress: 0,
  currentTaskOrder: null,
  events: [],
  accepted: false,
};

const phaseWeight = {
  pending: 0,
  analyzing: .2,
  reviewing: .4,
  ready: .55,
  awaiting_approval: .55,
  paused: .55,
  human_control: .6,
  running: .8,
  completed: 1,
  accepted: 1,
  undone: 0,
};

function event(type, detail, metadata = {}) {
  return { type, detail, metadata, at: new Date().toISOString() };
}

function normalizeTask(task, index) {
  return {
    order: task.order || index + 1,
    recommended_executor: task.recommended_executor || task.executor || "shared",
    human_judgment: task.human_judgment || (task.risk === "high" ? "high" : "medium"),
    reasoning: task.reasoning || "The recommendation balances risk, recoverability, permission, and human judgment.",
    confidence: task.confidence || .78,
    decision_boundary: Boolean(task.decision_boundary || task.risk === "high" || task.permission === "required"),
    boundary_state: task.boundary_state || "pending",
    approval_state: task.approval_state || "not_requested",
    status: task.status || "pending",
    ...task,
  };
}

function normalizeSession(value) {
  if (!value) return emptySession;
  return { ...emptySession, ...value, tasks: (value.tasks || []).map(normalizeTask) };
}

function loadSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return normalizeSession(stored ? JSON.parse(stored) : emptySession);
  } catch {
    return emptySession;
  }
}

function progressFor(tasks) {
  if (!tasks.length) return 0;
  const total = tasks.reduce((sum, task) => sum + (phaseWeight[task.status] ?? 0), 0);
  return Math.round((total / tasks.length) * 100);
}

export function DelegationSessionProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [session]);

  useEffect(() => {
    if (session.status !== "running" || !session.currentTaskOrder) return undefined;
    const index = session.tasks.findIndex((task) => task.order === session.currentTaskOrder);
    const currentTask = session.tasks[index];
    if (!currentTask) return undefined;

    const transitions = {
      pending: ["analyzing", 450],
      analyzing: ["reviewing", 700],
      reviewing: ["ready", 650],
      running: ["completed", 850],
    };

    let next = transitions[currentTask.status];
    if (currentTask.status === "ready") {
      if (currentTask.executor === "human") next = ["human_control", 350];
      else if (currentTask.decision_boundary && currentTask.approval_state !== "approved_once" && currentTask.approval_state !== "edited_approved") next = ["awaiting_approval", 350];
      else next = ["running", 350];
    }
    if (!next) return undefined;

    const timer = setTimeout(() => {
      setSession((current) => {
        const activeIndex = current.tasks.findIndex((task) => task.order === current.currentTaskOrder);
        const active = current.tasks[activeIndex];
        if (!active || active.order !== currentTask.order) return current;
        const [nextStatus] = next;
        let tasks = current.tasks.map((task) => task.order === active.order ? { ...task, status: nextStatus } : task);
        let status = current.status;
        let currentTaskOrder = current.currentTaskOrder;
        let events = current.events;

        if (nextStatus === "awaiting_approval") {
          status = "awaiting_approval";
          tasks = tasks.map((task) => task.order === active.order ? { ...task, boundary_state: "paused", approval_state: "requested" } : task);
          events = [...events,
            event("decision_boundary_reached", `AI paused before “${active.title}”`, { taskOrder: active.order }),
            event("approval_modal_opened", `Approval required for “${active.title}”`, { taskOrder: active.order }),
          ];
        } else if (nextStatus === "human_control") {
          status = "human_control";
          events = [...events, event("human_control_active", `“${active.title}” is waiting for the user`, { taskOrder: active.order })];
        } else if (nextStatus === "completed") {
          events = [...events, event("task_completed", `AI completed “${active.title}”`, { taskOrder: active.order })];
          const following = tasks[activeIndex + 1];
          if (following) currentTaskOrder = following.order;
          else {
            status = "completed";
            currentTaskOrder = null;
            events = [...events, event("completed", "Execution completed with all actions logged")];
          }
        }

        return { ...current, tasks, status, currentTaskOrder, progress: progressFor(tasks), events };
      });
    }, next[1]);
    return () => clearTimeout(timer);
  }, [session.status, session.currentTaskOrder, session.tasks]);

  async function start(goal) {
    setIsAnalyzing(true);
    setError("");
    try {
      const analysis = await analyzeGoal(goal);
      const tasks = analysis.tasks.map(normalizeTask);
      const next = {
        ...emptySession,
        goal,
        status: "planned",
        analysis: { ...analysis, tasks },
        tasks,
        events: [event("analysis_completed", "Goal analyzed and tasks created")],
      };
      setSession(next);
      try {
        const remote = await createRemoteSession(next);
        if (remote?.id) setSession((current) => ({ ...current, id: remote.id }));
      } catch (remoteError) {
        console.warn("Remote session was not saved.", remoteError);
      }
      return next;
    } catch (analysisError) {
      setError(analysisError.message || "Goal analysis failed.");
      throw analysisError;
    } finally {
      setIsAnalyzing(false);
    }
  }

  function logEvent(type, detail, metadata = {}) {
    setSession((current) => ({ ...current, events: [...current.events, event(type, detail, metadata)] }));
  }

  function setExecutor(order, executor) {
    setSession((current) => {
      const task = current.tasks.find((item) => item.order === order);
      if (!task || task.executor === executor) return current;
      const autonomy = { human: 0, shared: 1, ai: 2 };
      const increased = autonomy[executor] > autonomy[task.executor];
      const feedback = increased
        ? executor === "ai"
          ? "You are giving AI more autonomy. Final interpretation will no longer require human approval."
          : "You are increasing AI participation while keeping shared review."
        : executor === "human"
          ? "You are taking direct control of this task."
          : "You are reducing AI autonomy and adding human review.";
      const tasks = current.tasks.map((item) => item.order === order ? { ...item, executor, assignment_feedback: feedback } : item);
      return {
        ...current,
        tasks,
        events: [...current.events,
          event("assignment_changed", `“${task.title}” changed from ${task.executor} to ${executor}`, { taskOrder: order, from: task.executor, to: executor }),
          event(increased ? "autonomy_increased" : "autonomy_reduced", feedback, { taskOrder: order }),
        ],
      };
    });
  }

  function openExplanation(order) {
    const task = session.tasks.find((item) => item.order === order);
    logEvent("delegation_explanation_opened", `Recommendation explanation opened for “${task?.title || `Task ${order}`}”`, { taskOrder: order });
  }

  function allowOnce(order, source = "decision_boundary") {
    setSession((current) => {
      const task = current.tasks.find((item) => item.order === order);
      const tasks = current.tasks.map((item) => item.order === order ? {
        ...item, approval_state: "approved_once", boundary_state: "allowed_once", status: item.status === "awaiting_approval" ? "ready" : item.status,
      } : item);
      return {
        ...current,
        status: current.status === "awaiting_approval" ? "running" : current.status,
        tasks,
        events: [...current.events, event("approval_decision", `Permission granted once for “${task?.title}”`, { taskOrder: order, decision: "allow_once", source })],
      };
    });
  }

  function approvalDecision(order, decision, editedAction = "") {
    if (decision === "take_control") {
      takeBackControl(order, "approval_modal");
      return;
    }
    setSession((current) => {
      const task = current.tasks.find((item) => item.order === order);
      const approvalState = decision === "edit_first" ? "edited_approved" : "approved_once";
      const tasks = current.tasks.map((item) => item.order === order ? {
        ...item,
        action_description: editedAction || item.action_description,
        approval_state: approvalState,
        boundary_state: "allowed_once",
        status: item.status === "awaiting_approval" ? "ready" : item.status,
      } : item);
      return {
        ...current,
        status: current.status === "awaiting_approval" ? "running" : current.status,
        tasks,
        events: [...current.events, event("approval_decision", decision === "edit_first" ? `Action edited and approved for “${task?.title}”` : `Action approved once for “${task?.title}”`, { taskOrder: order, decision })],
      };
    });
  }

  function takeBackControl(order = session.currentTaskOrder, source = "execution") {
    setSession((current) => {
      const task = current.tasks.find((item) => item.order === order);
      const duringExecution = ["running", "awaiting_approval", "paused", "human_control"].includes(current.status);
      const tasks = current.tasks.map((item) => item.order === order ? {
        ...item, executor: "human", boundary_state: "human_control", approval_state: "declined", status: duringExecution ? "human_control" : item.status,
      } : item);
      return {
        ...current,
        status: duringExecution ? "human_control" : current.status,
        tasks,
        events: [...current.events, event("take_back_control", `Control returned to the user for “${task?.title || "current task"}”. Draft work was preserved.`, { taskOrder: order, source })],
      };
    });
  }

  async function beginExecution() {
    setSession((current) => {
      const tasks = current.tasks.map((task) => ({
        ...task,
        status: task.status === "completed" ? "pending" : task.status === "undone" ? "pending" : task.status,
      }));
      const first = tasks.find((task) => task.status !== "completed");
      return { ...current, accepted: false, status: "running", currentTaskOrder: first?.order || null, tasks, progress: progressFor(tasks), events: [...current.events, event("execution_started", "Agent execution started")] };
    });
    await updateRemoteSession(session.id, { status: "running" }).catch(() => null);
    await logExecutionEvent(session.id, "started", "Execution started").catch(() => null);
  }

  function completeHumanTask() {
    setSession((current) => {
      const index = current.tasks.findIndex((task) => task.order === current.currentTaskOrder);
      if (index < 0) return current;
      const active = current.tasks[index];
      const tasks = current.tasks.map((task) => task.order === active.order ? { ...task, status: "completed" } : task);
      const following = tasks[index + 1];
      const status = following ? "running" : "completed";
      return {
        ...current, tasks, status, currentTaskOrder: following?.order || null, progress: progressFor(tasks),
        events: [...current.events, event("human_task_completed", `User completed “${active.title}”`, { taskOrder: active.order }), ...(following ? [] : [event("completed", "Execution completed with human intervention")])],
      };
    });
  }

  async function accept() {
    setSession((current) => ({ ...current, accepted: true, status: "accepted", events: [...current.events, event("accepted", "User accepted the reviewed outcome")] }));
    await updateRemoteSession(session.id, { accepted: true, status: "accepted" }).catch(() => null);
  }

  async function undo() {
    setSession((current) => ({
      ...current,
      status: "undone",
      accepted: false,
      progress: 0,
      currentTaskOrder: null,
      tasks: current.tasks.map((task) => ({ ...task, status: "undone" })),
      events: [...current.events, event("undo", "Outcome undone and control returned to the user")],
    }));
    await updateRemoteSession(session.id, { status: "undone", accepted: false }).catch(() => null);
  }

  function reset() {
    setSession(emptySession);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  const boundaryTask = session.tasks.find((task) => task.decision_boundary) || session.tasks.find((task) => task.permission === "required");
  const value = useMemo(() => ({
    session, boundaryTask, isAnalyzing, error, start, logEvent, setExecutor, openExplanation,
    allowOnce, approvalDecision, takeBackControl, beginExecution, completeHumanTask, accept, undo, reset,
  }), [session, boundaryTask, isAnalyzing, error]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useDelegationSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useDelegationSession must be used within DelegationSessionProvider");
  return context;
}
