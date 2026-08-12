# DelegateAI — Trust & Delegation Flow

A GitHub-ready React/Vite reconstruction of the deployed Base44 prototype at:

<https://trust-delegated-flow.base44.app>

This repository turns the static demonstration flow into a shared session model and provides Base44 Entity schemas for persistence.

## What is included

- Dashboard and the complete delegation flow
- Goal analysis with Base44 `Core.InvokeLLM`
- Demo fallback when the integration is unavailable
- Shared session state persisted in local storage
- Base44 repository helpers for sessions, tasks, execution events, trust events, and memory
- Base44 Entity JSON schemas
- Clear separation between demo fixtures and real session data

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open <http://localhost:5173>.

## Base44 setup

The public app ID is already present in `.env.example`. Keep `VITE_DEMO_MODE=true` until the Entity schemas have been pushed and their security rules have been reviewed.

For a Base44 CLI project:

```bash
npm install -g base44@latest
base44 link
base44 entities push
```

`base44/.app.jsonc` is intentionally excluded from Git.

## GitHub setup

This directory is initialized with the `main` branch. After creating an empty repository on GitHub:

```bash
git remote add origin https://github.com/HUYUANQI/trust-delegated-flow.git
git push -u origin main
```

## Important

The original Base44 `.jsx` files were not publicly available. This codebase is a clean reconstruction based on the deployed application, its routes, UI text, runtime behavior, and published JavaScript bundle. Connect the Base44 app to GitHub if you need the exact original source history.
