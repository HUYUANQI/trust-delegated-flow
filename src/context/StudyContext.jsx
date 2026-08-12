import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ENABLED_KEY = "delegateai.study-mode.enabled.v1";
const EVENTS_KEY = "delegateai.study-mode.events.v1";
const StudyContext = createContext(null);

const routeSteps = {
  "/delegation": "Goal Input",
  "/goal-analysis": "Goal Analysis",
  "/task-decomposition": "Task Decomposition",
  "/matrix": "Delegation Matrix",
  "/decision": "Decision Boundary",
  "/timeline": "Execution",
  "/trust": "Trust Evidence",
  "/reflection": "Reflection",
};

function loadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function StudyProvider({ children }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [enabled, setEnabled] = useState(() => loadJson(ENABLED_KEY, false));
  const [events, setEvents] = useState(() => loadJson(EVENTS_KEY, []));
  const visitRef = useRef({ step: routeSteps[location.pathname], startedAt: Date.now() });

  useEffect(() => localStorage.setItem(ENABLED_KEY, JSON.stringify(enabled)), [enabled]);
  useEffect(() => localStorage.setItem(EVENTS_KEY, JSON.stringify(events)), [events]);

  function record(type, metadata = {}) {
    if (!enabled) return;
    setEvents((current) => [...current, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      step: metadata.step || routeSteps[location.pathname] || "Other",
      at: new Date().toISOString(),
      ...metadata,
    }]);
  }

  useEffect(() => {
    const nextStep = routeSteps[location.pathname];
    const previous = visitRef.current;
    if (enabled && previous.step) {
      const duration = Math.max(1, Math.round((Date.now() - previous.startedAt) / 1000));
      setEvents((current) => [...current, {
        id: `${Date.now()}-duration`, type: "page_duration", step: previous.step,
        duration, at: new Date().toISOString(),
      }]);
    }
    visitRef.current = { step: nextStep, startedAt: Date.now() };
    if (enabled && nextStep) {
      setEvents((current) => [...current, {
        id: `${Date.now()}-entered`, type: "page_entered", step: nextStep,
        at: new Date().toISOString(),
      }, ...(navigationType === "POP" ? [{
        id: `${Date.now()}-back`, type: "back_navigation", step: nextStep,
        at: new Date().toISOString(),
      }] : [])]);
    }
  }, [location.pathname, enabled, navigationType]);

  function toggle() {
    setEnabled((current) => !current);
  }

  function clearStudy() {
    setEvents([]);
    localStorage.removeItem(EVENTS_KEY);
  }

  const summary = useMemo(() => {
    const order = ["Goal Input", "Goal Analysis", "Task Decomposition", "Delegation Matrix", "Decision Boundary", "Execution", "Trust Evidence", "Reflection"];
    return order.map((step) => {
      const items = events.filter((event) => event.step === step);
      const duration = items.filter((event) => event.type === "page_duration").reduce((sum, event) => sum + (event.duration || 0), 0);
      const count = (type) => items.filter((event) => event.type === type).length;
      const assignmentChanges = count("assignment_changed");
      const explanationsOpened = count("delegation_explanation_opened");
      const decisionChanges = count("approval_decision") + count("decision_changed");
      const interventions = count("take_back_control") + count("undo");
      const approvalOpened = count("approval_modal_opened") > 0;
      const signals = assignmentChanges + explanationsOpened + decisionChanges + interventions + count("back_navigation");
      const friction = interventions > 0 || decisionChanges >= 2 || duration >= 60
        ? "High friction"
        : signals > 0 || duration >= 30
          ? "Medium friction"
          : "Low friction";
      return { step, duration, assignmentChanges, explanationsOpened, decisionChanges, interventions, approvalOpened, friction };
    });
  }, [events]);

  const value = useMemo(() => ({ enabled, events, summary, toggle, record, clearStudy }), [enabled, events, summary]);
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used inside StudyProvider");
  return context;
}
