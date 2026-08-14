import { useMemo, useState } from "react";
import { generateAgentPlan, reviseAgentPlan } from "./agent/planner";
import {
  applyAutonomyPreset,
  deriveMcpSelection,
  derivePlanActions,
  getToolAction,
} from "./agent/toolRegistry";
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
  const [pauseToken, setPauseToken] = useState(0);
  const [autonomyPreset, setAutonomyPreset] = useState("balanced");
  const [agentStatus, setAgentStatus] = useState({
    state: "idle",
    message: stepStatusCopy.context,
  });
  const [agentNote, setAgentNote] = useState(
    "Give me a task and I’ll build a plan before anything runs.",
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
      setAutonomyPreset("balanced");
      setActions(applyAutonomyPreset(derivePlanActions(nextPlan), "balanced"));
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
        setActions(applyAutonomyPreset(derivePlanActions(nextPlan), autonomyPreset));
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
      setActions(applyAutonomyPreset(derivePlanActions(nextPlan), autonomyPreset));
      setAgentNote(`Revision applied: “${feedback.trim()}”`);
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
    setAgentNote("I’ve recommended a boundary for every capability in this plan.");
    goToTop();
  }

  function selectMcpSource(toolId, ambiguity) {
    if (!ambiguity) return;
    if (toolId === ambiguity.recommendedToolId) {
      setPlan({
        ...plan,
        sourceChoiceResolved: true,
        sourceChoiceLabel: getToolAction(toolId).name,
      });
      setAgentNote(`The recommendation stays with ${getToolAction(toolId).name}.`);
      return;
    }
    const nextPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      sourceChoiceResolved: true,
      sourceChoiceLabel: getToolAction(toolId).name,
      steps: plan.steps.map((step) =>
        step.toolId === ambiguity.recommendedToolId
          ? { ...step, toolId, title: `${step.title} using an alternative source` }
          : step,
      ),
    };
    setPlan(nextPlan);
    setActions(applyAutonomyPreset(derivePlanActions(nextPlan), autonomyPreset));
    setAgentNote("The source choice changed. The MCP selection and its explanation were recalculated.");
  }

  function selectPreset(presetId) {
    setAutonomyPreset(presetId);
    setActions((current) => applyAutonomyPreset(current, presetId));
    setAgentNote(`The ${presetId === "high" ? "high autonomy" : presetId} preset populated every detailed boundary. You can still override any action.`);
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
    setAgentNote("I’ll pause exactly where you chose Ask first.");
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
    setPauseToken(0);
    setAutonomyPreset("balanced");
    setAgentStatus({ state: "idle", message: stepStatusCopy.context });
    setAgentNote("Give me a task and I’ll build a plan before anything runs.");
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
    if (command === "pause") {
      if (currentStep === "result") {
        setPauseToken((value) => value + 1);
        setAgentNote("Pause or resume requested. The agent keeps the same boundaries either way.");
      } else {
        setAgentNote("Nothing is running yet. You can review the plan and boundaries first.");
      }
      return;
    }
    if (command === "access") {
      const active = actions.filter((action) => action.boundary !== "Blocked");
      setAgentNote(active.length
        ? active.map((action) => `${action.name}: ${action.boundary}`).join(" · ")
        : "No capabilities currently have access.");
      return;
    }
    if (command === "boundaries") {
      setAgentNote(actions.length
        ? actions.map((action) => `${action.action} — ${action.boundary}`).join(" · ")
        : "Boundaries will appear after the plan is built.");
      return;
    }
    if (command === "next") {
      setAgentNote(currentStep === "result"
        ? "The next pending execution row will run. The agent will pause before any Ask first action or new MCP permission."
        : `Next: ${steps[Math.min(currentIndex + 1, steps.length - 1)].label}.`);
      return;
    }
    if (command === "why") {
      const selection = plan ? deriveMcpSelection(plan) : null;
      setAgentNote(
        selection?.selected.length
          ? selection.selected.map((action) => `${action.name}: ${action.selectionReason}`).join(" · ")
          : "The agent selected no external MCP for this task because the supplied context and reasoning workspace are sufficient.",
      );
      return;
    }
    setAgentNote(
      currentStep === "result"
        ? "The highlighted execution step shows what the agent is doing and whether it needs approval."
        : `You are on “${steps[currentIndex].label}”. The agent will not run work before the plan and controls are reviewed.`,
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
            onMcpChoice={selectMcpSource}
            onRegenerate={regeneratePlan}
            onRevise={revisePlan}
            plan={plan}
            planning={planning}
          />
        )}

        {currentStep === "controls" && plan && (
          <ControlsScreen
            actions={actions}
            activePreset={autonomyPreset}
            onBack={() => navigate("brief")}
            onNext={startRun}
            onPreset={selectPreset}
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
            pauseToken={pauseToken}
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
