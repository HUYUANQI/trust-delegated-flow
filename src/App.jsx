import { useMemo, useState } from "react";
import { generateAgentPlan, reviseAgentPlan } from "./agent/planner";
import { derivePlanActions } from "./agent/toolRegistry";
import AgentCompanion from "./components/AgentCompanion";
import {
  BriefScreen,
  ContextScreen,
  ControlsScreen,
  RunScreen,
} from "./pages/DelegationScreens";

const steps = [
  { id: "context", label: "Add context" },
  { id: "brief", label: "Review brief" },
  { id: "controls", label: "Set controls" },
  { id: "result", label: "Run / approve" },
];

const stepStatusCopy = {
  context: "Ready for a task",
  brief: "Waiting for you to review the plan",
  controls: "Waiting for autonomy controls",
  result: "Preparing to run the approved plan",
};

function goToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function App() {
  const [currentStep, setCurrentStep] = useState("context");
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState(null);
  const [actions, setActions] = useState([]);
  const [planning, setPlanning] = useState(false);
  const [inputError, setInputError] = useState("");
  const [clarification, setClarification] = useState(null);
  const [activeExample, setActiveExample] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const [stopToken, setStopToken] = useState(0);
  const [agentStatus, setAgentStatus] = useState({
    state: "idle",
    message: stepStatusCopy.context,
  });
  const [agentNote, setAgentNote] = useState(
    "Give me a task and I鈥檒l build a plan before anything runs.",
  );

  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const availableSteps = useMemo(
    () => ({
      context: true,
      brief: Boolean(plan),
      controls: Boolean(plan),
      result: runKey > 0,
    }),
    [plan, runKey],
  );

  function navigate(step) {
    if (!availableSteps[step]) return;
    setCurrentStep(step);
    if (step !== "result") {
      setAgentStatus({ state: "idle", message: stepStatusCopy[step] });
    }
    goToTop();
  }

  function changeGoal(value) {
    setGoal(value);
    setActiveExample(null);
    setInputError("");
    setClarification(null);
  }

  function insertExample(example) {
    setGoal(example.prompt);
    setActiveExample(example.id);
    setInputError("");
    setClarification(null);
    setAgentNote("Example inserted. You can edit every word before continuing.");
  }

  async function createPlan(clarificationAnswer = null) {
    if (!goal.trim()) {
      setInputError("Describe a task, goal, or problem before continuing.");
      setAgentStatus({ state: "waiting", message: "Waiting for a task" });
      return;
    }

    setPlanning(true);
    setInputError("");
    setAgentStatus({ state: "thinking", message: "Interpreting your task and building a plan" });
    try {
      const nextPlan = await generateAgentPlan(goal, { clarificationAnswer });
      if (nextPlan.needsClarification) {
        setClarification(nextPlan);
        setAgentStatus({ state: "waiting", message: "A little more context is needed" });
        setAgentNote(nextPlan.clarifyingQuestion);
        return;
      }

      setClarification(null);
      setPlan(nextPlan);
      setActions(derivePlanActions(nextPlan));
      setCurrentStep("brief");
      setAgentStatus({ state: "idle", message: stepStatusCopy.brief });
      setAgentNote(`I created a ${nextPlan.steps.length}-step plan. Nothing has run yet.`);
      goToTop();
    } finally {
      setPlanning(false);
    }
  }

  async function regeneratePlan() {
    setPlanning(true);
    setAgentStatus({ state: "thinking", message: "Regenerating the workflow" });
    try {
      const nextPlan = await generateAgentPlan(goal, { regenerate: true });
      if (!nextPlan.needsClarification) {
        setPlan(nextPlan);
        setActions(derivePlanActions(nextPlan));
        setAgentNote("The workflow has been regenerated for your review.");
      }
    } finally {
      setPlanning(false);
      setAgentStatus({ state: "idle", message: stepStatusCopy.brief });
    }
  }

  async function revisePlan(feedback) {
    if (!feedback.trim() || !plan) return;
    setPlanning(true);
    setAgentStatus({ state: "thinking", message: "Revising the plan from your instruction" });
    try {
      const nextPlan = await reviseAgentPlan(plan, feedback);
      setPlan(nextPlan);
      setActions(derivePlanActions(nextPlan));
      setAgentNote(`Revision applied: 鈥?{feedback.trim()}鈥漙);
    } finally {
      setPlanning(false);
      setAgentStatus({ state: "idle", message: stepStatusCopy.brief });
    }
  }

  function continueToControls() {
    const nextActions = derivePlanActions(plan).map((action) => {
      const previous = actions.find((item) => item.id === action.id);
      return previous ? { ...action, boundary: previous.boundary } : action;
    });
    setActions(nextActions);
    setCurrentStep("controls");
    setAgentStatus({ state: "idle", message: stepStatusCopy.controls });
    setAgentNote("I鈥檝e recommended a boundary for every capability in this plan.");
    goToTop();
  }

  function updateBoundary(actionId, boundary) {
    setActions((current) =>
      current.map((action) =>
        action.id === actionId ? { ...action, boundary } : action,
      ),
    );
  }

  function startRun() {
    setRunKey((value) => value + 1);
    setCurrentStep("result");
    setAgentStatus({ state: "working", message: "Starting the approved plan" });
    setAgentNote("I鈥檒l pause exactly where you chose Ask first.");
    goToTop();
  }

  function restart() {
    setCurrentStep("context");
    setGoal("");
    setPlan(null);
    setActions([]);
    setClarification(null);
    setInputError("");
    setActiveExample(null);
    setRunKey(0);
    setStopToken(0);
    setAgentStatus({ state: "idle", message: stepStatusCopy.context });
    setAgentNote("Give me a task and I鈥檒l build a plan before anything runs.");
    goToTop();
  }

  function handleAgentCommand(command) {
    if (command === "change-plan" && plan) {
      navigate("brief");
      setAgentNote("Change any step directly or ask me to revise the workflow.");
      return;
    }
    if (command === "stop") {
      if (currentStep === "result") {
        setStopToken((value) => value + 1);
        setAgentNote("Stop requested. The prototype will not start another step.");
      } else {
        setAgentNote("Nothing is running right now.");
      }
      return;
    }
    if (command === "why") {
      setAgentNote(
        currentStep === "controls"
          ? "Each recommendation follows action risk: read and reasoning are usually automatic; drafts stay private; visible or shared changes require approval."
          : "The plan uses the smallest set of capabilities that can produce a useful, reviewable outcome.",
      );
      return;
    }
    setAgentNote(
      currentStep === "result"
        ? "The highlighted execution step shows what the agent is doing and whether it needs approval."
        : `You are on 鈥?{steps[currentIndex].label}鈥? The agent will not run work before the plan and controls are reviewed.`,
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <button
          className="brand"
          type="button"
          onClick={restart}
          aria-label="Start a new delegation"
        >
          <span className="brand-mark">D</span>
          <strong>Delegate</strong>
        </button>

        <nav className="step-nav" aria-label="Delegation steps">
          {steps.map((step, index) => {
            const stateClass =
              index === currentIndex
                ? "step-link active"
                : index < currentIndex
                  ? "step-link complete"
                  : "step-link";
            return (
              <button
                className={stateClass}
                type="button"
                onClick={() => navigate(step.id)}
                aria-current={index === currentIndex ? "step" : undefined}
                disabled={!availableSteps[step.id]}
                key={step.id}
              >
                <span>{index + 1}</span>
                {step.label}
              </button>
            );
          })}
        </nav>

        <div className="profile" aria-label="Current user">
          <span>AM</span>
          <strong>Alex Morgan</strong>
        </div>
      </header>

      <div className="page-container">
        {currentStep === "context" && (
          <ContextScreen
            activeExample={activeExample}
            clarification={clarification}
            error={inputError}
            goal={goal}
            onAnswerClarification={createPlan}
            onGoalChange={changeGoal}
            onNext={() => createPlan()}
            onSelectExample={insertExample}
            planning={planning}
          />
        )}

        {currentStep === "brief" && plan && (
          <BriefScreen
            goal={goal}
            onBack={() => navigate("context")}
            onContinue={continueToControls}
            onPlanChange={setPlan}
            onRegenerate={regeneratePlan}
            onRevise={revisePlan}
            plan={plan}
            planning={planning}
          />
        )}

        {currentStep === "controls" && plan && (
          <ControlsScreen
            actions={actions}
            onBack={() => navigate("brief")}
            onNext={startRun}
            onUpdate={updateBoundary}
            plan={plan}
          />
        )}

        {currentStep === "result" && plan && (
          <RunScreen
            actions={actions}
            goal={goal}
            key={runKey}
            onAgentStatus={setAgentStatus}
            onBack={() => navigate("controls")}
            onRestart={restart}
            plan={plan}
            stopToken={stopToken}
          />
        )}
      </div>

      <AgentCompanion
        note={agentNote}
        onCommand={handleAgentCommand}
        status={agentStatus}
      />
    </main>
  );
}
