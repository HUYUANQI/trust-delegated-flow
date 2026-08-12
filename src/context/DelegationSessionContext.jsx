import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { analyzeGoal } from "../services/analyzeGoal";
import { createRemoteSession, logExecutionEvent, updateRemoteSession } from "../services/sessionRepository";

const STORAGE_KEY = "delegateai.current-session.v1";
const SessionContext = createContext(null);

const emptySession = {
  id: null,
  goal: "",
  status: "draft",
  analysis: null,
  tasks: [],
  delegationMode: "shared",
  progress: 0,
  events: [],
  accepted: false,
};

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || emptySession;
  } catch {
    return emptySession;
  }
}

export function DelegationSessionProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  async function start(goal) {
    setIsAnalyzing(true);
    setError("");
    try {
      const analysis = await analyzeGoal(goal);
      const next = {
        ...emptySession,
        goal,
        status: "planned",
        analysis,
        tasks: analysis.tasks,
        events: [{ type: "analysis_completed", detail: "Goal analyzed and tasks created", at: new Date().toISOString() }],
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

  function setExecutor(order, executor) {
    setSession((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.order === order ? { ...task, executor } : task),
      events: [...current.events, { type: "assignment_changed", detail: `Task ${order} assigned to ${executor}`, at: new Date().toISOString() }],
    }));
  }

  async function beginExecution() {
    setSession((current) => ({ ...current, status: "running", progress: 35 }));
    await updateRemoteSession(session.id, { status: "running" }).catch(() => null);
    await logExecutionEvent(session.id, "started", "Execution started").catch(() => null);
  }

  async function complete() {
    setSession((current) => ({
      ...current,
      status: "completed",
      progress: 100,
      tasks: current.tasks.map((task) => ({ ...task, status: "completed" })),
      events: [...current.events, { type: "completed", detail: "Session completed", at: new Date().toISOString() }],
    }));
    await updateRemoteSession(session.id, { status: "completed" }).catch(() => null);
  }

  async function accept() {
    setSession((current) => ({ ...current, accepted: true }));
    await updateRemoteSession(session.id, { accepted: true }).catch(() => null);
  }

  async function undo() {
    setSession((current) => ({
      ...current,
      status: "undone",
      accepted: false,
      progress: 0,
      tasks: current.tasks.map((task) => ({ ...task, status: "undone" })),
      events: [...current.events, { type: "undone", detail: "Control returned to the user", at: new Date().toISOString() }],
    }));
    await updateRemoteSession(session.id, { status: "undone", accepted: false }).catch(() => null);
  }

  function reset() {
    setSession(emptySession);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(() => ({
    session, isAnalyzing, error, start, setExecutor, beginExecution, complete, accept, undo, reset,
  }), [session, isAnalyzing, error]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useDelegationSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useDelegationSession must be used within DelegationSessionProvider");
  return context;
}
