# Arch — AI-Native System Design Whiteboard

Describe your system architecture in plain English. Arch generates and modifies interactive node graphs in real-time using AI.

Built with React + ReactFlow + Zustand on the frontend, FastAPI + OpenAI on the backend.

---

## Features

- **AI-Powered Generation** — Describe architectures in natural language, get interactive diagrams
- **Atomic Mutations** — AI returns JSON patches (add/remove/update nodes & edges), not full rewrites
- **6 Node Types** — Service, Database, Cache, Queue, Gateway, Load Balancer
- **Drag & Drop** — Build architectures manually by dragging components onto the canvas
- **Undo/Redo** — Full state snapshot history (max 50 states) with Cmd+Z / Cmd+Shift+Z
- **Inspector Panel** — Select nodes/edges to view and edit properties
- **Dark Mode** — Linear/Vercel-inspired zinc palette with glassmorphism panels

## Tech Stack

### Frontend
- **React 18** (Vite)
- **TypeScript** (Strict Mode)
- **Tailwind CSS v4** + shadcn/ui
- **@xyflow/react** v12 (ReactFlow) — Canvas engine
- **Zustand** + Immer — State management (4 slices: graph, UI, history, chat)
- **Lucide React** — Icons
- **Sonner** — Toast notifications

### Backend
- **FastAPI** (Python 3.10+)
- **Pydantic v2** — Request/response validation
- **OpenAI API** (GPT-4o) — AI generation with JSON mode
- **uvicorn** — ASGI server

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- OpenAI API key

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

API runs at `http://localhost:8000`.

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | (required) |
| `OPENAI_MODEL` | Model to use | `gpt-4o` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |

#### Frontend (`frontend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Architecture

```
User Prompt -> Chat Panel -> Zustand chatSlice
  -> POST /api/generate or /api/modify
  -> FastAPI + Pydantic validation
  -> OpenAI GPT-4o (JSON mode)
  -> Pydantic AIResponse parsing
  -> Validator (reference integrity, collision detection)
  -> JSON Response with GraphAction[]
  -> graphSlice.applyPatch() -> ReactFlow re-renders
```

### The Patch Protocol

The AI never rewrites the entire graph. It returns atomic operations:

| Op | Description |
|----|-------------|
| `add_node` | Add a new component |
| `remove_node` | Remove a component (cascades to edges) |
| `update_node` | Update component properties |
| `move_node` | Reposition a component |
| `add_edge` | Connect two components |
| `remove_edge` | Disconnect two components |
| `update_edge` | Update connection properties |

## Project Structure

```
vibearch/
|- frontend/
|   |- src/
|   |   |- types/          # TypeScript types (graph, actions)
|   |   |- store/          # Zustand store (4 slices)
|   |   |- lib/            # Utilities, API client, constants
|   |   |- components/
|   |   |   |- ui/         # shadcn components
|   |   |   |- layout/     # Layout, Sidebar, DraggableNodeItem
|   |   |   |- canvas/     # Canvas, Toolbar, EmptyState, nodes/, edges/
|   |   |   |- chat/       # ChatPanel, ChatMessage, ChatInput
|   |   |   +- inspector/  # InspectorPanel
|   |   +- hooks/          # Keyboard shortcuts
|- backend/
|   |- app/
|   |   |- models/         # Pydantic models
|   |   |- services/       # LLM service, validator
|   |   |- routes/         # API endpoints
|   |   +- middleware/      # Error handling
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+/` | Toggle chat panel |
| `Backspace` / `Delete` | Delete selected node/edge |

## Status

**Day 1 Complete** — Canvas, state management, all components, backend API, chat panel, and AI pipeline scaffolded. Full drag-and-drop, node/edge inspection, undo/redo, and end-to-end AI mutation flow.

---

Built with Claude Code.
