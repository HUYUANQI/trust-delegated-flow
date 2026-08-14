# Delegate - Controlled AI Handoff

A readable React/Vite reconstruction of the latest TrustOS delegation console:

<https://trustos-delegation-console.kang99841.chatgpt.site/>

The project demonstrates a controlled enterprise workflow for delegating work to AI while keeping the user in charge of tool access and external actions.

## Experience

The prototype follows four steps:

1. **Add context** - describe a goal or choose a prepared product scenario.
2. **Review brief** - inspect the proposed workflow before anything runs.
3. **Set controls** - choose a boundary for every tool: Automatic, Ask first, Draft only, or Blocked.
4. **Approve result** - review paused actions, approve or skip them, and inspect the audit trail.

Three prepared scenarios are included: product review, sprint planning, and checkout launch decision. All integrations and outputs are simulated in the browser; the prototype does not read a real Drive, Figma, Jira, Slack, or Teams account and never sends external messages.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173/trust-delegated-flow/>.

## Production build

```bash
npm run build
npm run preview
```

## Live site

GitHub Pages deploys the `main` branch automatically through `.github/workflows/deploy-pages.yml`:

<https://huyuanqi.github.io/trust-delegated-flow/>

## Project structure

- `src/App.jsx` - four-step delegation experience and approval flow
- `src/data/scenarios.js` - scenarios, tools, actions, and control options
- `src/styles.css` - responsive visual system for desktop and mobile
- `public/favicon.svg` - project favicon
- `base44/` - preserved Base44 schemas and integration helpers from the earlier prototype

The earlier dark dashboard implementation remains in Git history, so it can be inspected or restored without affecting the current deployment.
