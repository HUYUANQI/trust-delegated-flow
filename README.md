# Delegate - Controlled AI Handoff

A high-fidelity React/Vite prototype for delegating open-ended work to a controllable AI agent.

The product keeps a four-stage enterprise workflow:

1. **Add context** - enter almost any reasonable task or insert an editable example prompt.
2. **Review brief** - inspect, edit, remove, add, regenerate, or revise AI-generated steps.
3. **Set controls** - choose Automatic, Ask first, Draft only, or Blocked for only the capabilities the plan needs.
4. **Run / approve** - watch step-by-step simulation, handle approval boundaries and replanning, then review a task-specific result and audit trail.

## Dynamic agent architecture

The three example cards are prompts only. They do not contain a brief, tool list, or result.

The active architecture is:

```text
User goal
  -> generateAgentPlan(goal)
  -> editable structured plan
  -> relevant actions from the tool registry
  -> user-defined autonomy controls
  -> simulated step-by-step execution
  -> generateAgentResult(context)
```

Key modules:

- `src/agent/planner.js` - provider-neutral API abstraction with automatic fallback
- `src/agent/fallbackPlanner.js` - local intent detection, clarification, plan revision, and dynamic results
- `src/agent/toolRegistry.js` - reusable reasoning and external-tool action metadata
- `src/agent/executor.js` - execution states, realistic status copy, audit events, and replanning proposals
- `src/pages/DelegationScreens.jsx` - the four-stage interaction
- `src/components/AgentCompanion.jsx` - supplementary floating agent status and controls
- `src/data/scenarios.js` - example prompt text only

## Built-in fallback

No API key or backend is required. The local planner supports research, product analysis, customer feedback, competitive research, planning, prioritisation, communication, meetings, decisions, presentations, risk analysis, writing, events, and general tasks.

Vague requests can trigger a clarifying question. If an optional AI endpoint fails or returns an invalid plan, the prototype creates a local plan instead of showing a blank or irrelevant screen.

## Optional secure AI backend

Never put a private model API key in this frontend. Host a secure endpoint and set:

```bash
VITE_AGENT_API_URL=https://your-secure-endpoint.example.com/agent
```

The frontend sends JSON in this shape:

```json
{
  "operation": "generateAgentPlan | reviseAgentPlan | generateAgentResult",
  "payload": {}
}
```

The backend can use any LLM provider. When the variable is blank, the local fallback is used automatically.

## Trust and safety behaviour

- Read and reasoning actions are normally recommended as Automatic.
- Drafts normally stay Draft only.
- Shared changes and externally visible actions recommend Ask first.
- Every capability explains why it is needed.
- Blocked and skipped actions remain visible in the result and audit trail.
- The UI labels execution as **Prototype simulation**.
- It never claims that a real message, issue, purchase, deletion, or integration action occurred.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173/trust-delegated-flow/>.

## Validate

```bash
npm run test:planner
npm run build
```

The planner test covers the ten required open-ended inputs, clarification, unrelated event planning, reasoning-only tasks, dynamic tools, task-specific results, and an Ask first sensitive-action case.

## Live site

GitHub Pages deploys the `main` branch automatically through `.github/workflows/deploy-pages.yml`:

<https://huyuanqi.github.io/trust-delegated-flow/>

Earlier versions remain available in Git history.
