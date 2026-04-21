# HR Workflow Designer

Drag-and-drop workflow builder for HR processes (onboarding, leave approval, etc). Built with React + React Flow + Zustand.

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

For production: `npm run build && npm run preview`

## How it works

You drag nodes from the sidebar onto a canvas, wire them together, and configure each step. There's a simulation mode that runs through the whole flow and tells you if anything's broken.

**Node types:**
- **Start** — entry point with metadata
- **Task** — assign work to someone, set priority/due date
- **Approval** — sign-off step with auto-approve thresholds and escalation
- **Automation** — system actions (emails, HRIS updates, webhooks, etc)
- **Condition** — if/else branching with two output handles
- **End** — completion marker, optionally generates a summary

**Shortcuts:** Ctrl+Z undo, Ctrl+Y redo, Ctrl+D duplicate node, Delete to remove

## Project structure

```
src/
├── types/workflow.ts        # TypeScript interfaces (discriminated union for node data)
├── api/mockApi.ts           # mock endpoints — automations, templates, validation, simulation
├── store/workflowStore.ts   # zustand store with undo/redo history
├── hooks/
│   ├── useSimulation.ts     # animated step-by-step simulation
│   └── useAutoLayout.ts     # dagre auto-layout
├── nodes/index.tsx          # custom node components
├── components/
│   ├── Canvas/              # react flow canvas + sidebar
│   ├── Forms/               # node config forms
│   └── Sandbox/             # simulation panel
└── App.tsx                  # main layout + toolbar
```

## Architecture notes

Using zustand instead of context because context re-renders everything and zustand lets components subscribe to individual slices. Undo/redo is just pushing/popping state snapshots — simple but effective.

Node data uses a discriminated union (`type` field) so TypeScript narrows properly in switch blocks. Adding a new node type means adding the interface, default data, form component, and registering it.

Mock API functions are async with fake delays so they're easy to swap for real endpoints later.

## TODO

- Edge labels for conditional branches (the condition node has dual handles but edges don't carry label data yet)
- Parallel execution paths (AND/OR split-join)
- Real backend persistence
- E2E tests with Playwright

## Tech

React 18, TypeScript, Vite 5, React Flow 11, Zustand 4, dagre, Tailwind CSS 3, lucide-react, clsx

## Contributing
1. Fork the repository
2. Clone your fork
``` bash
git clone https://github.com/your-username/repository-name.git
```
3. Create a new branch
``` bash
git checkout -b feature-name
```
4. Make changes & commit
``` bash
git add .
git commit -m "Describe your changes"
```
5. Push to your fork
``` bash
git push origin feature-name
```
6. Open a Pull Request to merge your changes
