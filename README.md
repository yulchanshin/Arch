# Arch — AI-Native System Design Whiteboard

Describe your system architecture in plain English. Arch generates and modifies interactive node graphs in real-time using AI.

Built with React + ReactFlow + Zustand on the frontend, FastAPI + Anthropic Claude on the backend.

---

## Features

- **AI-Powered Generation** — Describe architectures in natural language, get interactive diagrams
- **Atomic Mutations** — AI returns JSON patches (add/remove/update nodes & edges), not full rewrites
- **6 Node Types** — Service, Database, Cache, Queue, Gateway, Load Balancer
- **60+ Technologies** — Full catalog with icons: Postgres, Redis, Kafka, Elasticsearch, S3, and many more
- **Drag & Drop** — Build architectures manually by dragging components onto the canvas
- **Undo/Redo** — Full state snapshot history (max 50 states) with Cmd+Z / Cmd+Shift+Z
- **Inspector Panel** — Select nodes/edges to view and edit properties with context-aware tech dropdowns
- **Dark Mode** — Linear/Vercel-inspired zinc palette with glassmorphism panels
- **Demo Mode** — Works without an API key by returning a static sample architecture

## Tech Stack

### Frontend
- **React 18** (Vite)
- **TypeScript** (Strict Mode)
- **Tailwind CSS v4** + shadcn/ui
- **@xyflow/react** v12 (ReactFlow) — Canvas engine
- **Zustand** + Immer — State management (4 slices: graph, UI, history, chat)
- **Iconify** — Technology & provider brand icons
- **Lucide React** — UI icons
- **Sonner** — Toast notifications

### Backend
- **FastAPI** (Python 3.10+)
- **Pydantic v2** — Request/response validation with tech normalization & alias resolution
- **Anthropic API** (Claude Haiku) — AI generation
- **uvicorn** — ASGI server

## Supported Technologies

The tech catalog is defined as a single source of truth in `frontend/src/lib/techCatalog.ts`. The backend mirrors the same set for validation.

| Category | Technologies |
|----------|-------------|
| **DB (SQL)** | PostgreSQL, MySQL, MariaDB, SQLite, CockroachDB, PlanetScale |
| **DB (NoSQL)** | MongoDB, DynamoDB, Cassandra, CouchDB, Firestore |
| **DB (Vector)** | Pinecone, Weaviate, Qdrant, Milvus, Chroma |
| **DB (Time-series)** | InfluxDB, TimescaleDB, ClickHouse |
| **Caches** | Redis, Memcached, Dragonfly, Valkey |
| **Brokers / Queues** | Kafka, RabbitMQ, SQS, NATS, Pulsar |
| **Gateways** | NGINX, Envoy, Kong, Traefik, APISIX |
| **Load Balancers** | NGINX, Envoy, Traefik, HAProxy |
| **Runtimes** | Python, Go, Node.js, Rust, Java, .NET, Elixir, Ruby, PHP |
| **Search** | Elasticsearch, OpenSearch, Meilisearch, Typesense, Algolia |
| **Object Storage** | S3, GCS, MinIO, R2 |
| **Observability** | Prometheus, Grafana, Datadog, Jaeger, Sentry |
| **Auth** | Auth0, Clerk, Keycloak, Firebase Auth, Supabase Auth |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Anthropic API key (optional — falls back to demo mode)

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
# Edit .env and add your ANTHROPIC_API_KEY (or leave empty for demo mode)
uvicorn app.main:app --reload --port 8000
```

API runs at `http://localhost:8000`.

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | (empty — demo mode) |
| `ANTHROPIC_MODEL` | Model to use | `claude-haiku-4-5-20251001` |
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
  -> Anthropic Claude (or demo fallback)
  -> Pydantic AIResponse parsing
  -> Tech normalization (aliases, unknown -> None)
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

### Tech Validation Pipeline

The backend normalizes LLM-generated tech values before they reach the graph:

1. Lowercase + strip whitespace
2. Check exact match against 60+ valid IDs
3. Resolve aliases (e.g. `"postgresql"` -> `"postgres"`, `"elastic"` -> `"elasticsearch"`)
4. Handle hyphens/underscores (`"firebase-auth"` -> `"firebase_auth"`)
5. Unknown values silently drop to `None` (no crash)

## Project Structure

```
vibearch/
|- frontend/
|   |- src/
|   |   |- types/          # TypeScript types (graph, actions)
|   |   |- store/          # Zustand store (4 slices)
|   |   |- lib/
|   |   |   |- techCatalog.ts  # Single source of truth for 60+ technologies
|   |   |   |- logos.ts        # Provider logos + re-exports from catalog
|   |   |   +- ...             # Utilities, API client
|   |   |- components/
|   |   |   |- ui/         # shadcn components
|   |   |   |- layout/     # Layout, Sidebar, DraggableNodeItem
|   |   |   |- canvas/     # Canvas, Toolbar, EmptyState, nodes/, edges/
|   |   |   |- chat/       # ChatPanel, ChatMessage, ChatInput
|   |   |   |- shared/     # TechLogo, ProviderLogo
|   |   |   +- inspector/  # InspectorPanel (context-aware tech dropdown)
|   |   +- hooks/          # Keyboard shortcuts
|- backend/
|   |- app/
|   |   |- models/         # Pydantic models (60+ tech Literal, alias map)
|   |   |- services/       # LLM service (with demo fallback), validator
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

---

Built with Claude Code.
