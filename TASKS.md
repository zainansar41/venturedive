# Tasks

Execution log for the Wikipedia RAG chat application. Tasks are ordered, small, and individually testable. Status is updated as work progresses.

**Legend:** `done` | `in_progress` | `pending`

---

## Phase 0: Planning

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Create `REQUIREMENTS.md` | done | AI-drafted from brief in Cursor; human review pending |
| 0.2 | Create `DESIGN.md` | done | AI-drafted architecture with mermaid diagram; human review pending |
| 0.3 | Create `TASKS.md` | done | AI-decomposed backlog; this file |

---

## Phase 1: Project Scaffold

| # | Task | Status | AI / Manual |
|---|------|--------|-------------|
| 1.1 | Init monorepo structure (`backend/`, `frontend/`) | pending | AI |
| 1.2 | Backend: Express + TypeScript + Vitest setup | pending | AI |
| 1.3 | Frontend: React + Vite + TypeScript setup | pending | AI |
| 1.4 | Add `.env.example`, `.gitignore`, ESLint/Prettier | pending | AI |

---

## Phase 2: Core Services

Unit-tested services with mocked LLM and vector DB dependencies.

| # | Task | Status | AI / Manual |
|---|------|--------|-------------|
| 2.1 | Wikipedia scraper service + tests | pending | AI scaffold, manual edge-case review |
| 2.2 | Text chunker service + tests | pending | AI |
| 2.3 | Ollama LLM client (`LlmProvider` interface + impl) + mocked tests | pending | AI |
| 2.4 | Embeddings client (`EmbeddingsProvider` interface + impl) + mocked tests | pending | AI |
| 2.5 | MongoDB vector store client (`VectorStore` interface + impl) with `$vectorSearch` + mocked tests | pending | AI |
| 2.5a | MongoDB connection service + vector search index setup on startup | pending | AI |
| 2.6 | RAG orchestrator (retrieve → prompt → generate) + tests | pending | AI scaffold, manual prompt review |
| 2.7 | In-memory session store + tests | pending | AI |

---

## Phase 3: API Layer

| # | Task | Status | AI / Manual |
|---|------|--------|-------------|
| 3.1 | `POST /api/ingest` route + URL validation + tests | pending | AI |
| 3.2 | `POST /api/chat` route + tests | pending | AI |
| 3.3 | Error handling middleware (bad URL, scrape fail, empty article, service unavailable) | pending | AI + manual |
| 3.4 | Health check endpoint `GET /api/health` | pending | AI |

---

## Phase 4: Frontend

| # | Task | Status | AI / Manual |
|---|------|--------|-------------|
| 4.1 | URL input form with loading and error states | pending | AI |
| 4.2 | Summary display component | pending | AI |
| 4.3 | Chat box with message history | pending | AI |
| 4.4 | Wire frontend to backend API | pending | AI |

---

## Phase 5: Integration & Containerisation

| # | Task | Status | AI / Manual |
|---|------|--------|-------------|
| 5.1 | Integration test: ingest → chat end-to-end (real MongoDB with Vector Search, mocked or real Ollama) | pending | Manual |
| 5.2 | `docker-compose.yml` (backend, frontend, mongodb; Ollama host-side or in-container) | pending | AI + manual |
| 5.3 | Dockerfiles for backend and frontend | pending | AI |
| 5.4 | Verify `docker compose up` happy path on clean machine | pending | Manual |

---

## Phase 6: Quality & Submission

| # | Task | Status | AI / Manual |
|---|------|--------|-------------|
| 6.1 | Achieve ≥85% line coverage; commit coverage report | pending | AI tests, manual audit |
| 6.2 | Write `README.md` (run instructions, prerequisites, caveats) | pending | AI draft, manual review |
| 6.3 | Record demo (2–4 min screen recording) or commit screenshots | pending | Manual |
| 6.4 | Optional `NOTES.md` (trade-offs, AI corrections) | pending | Manual |

---

## Delegation Notes

### What the AI agent handles

- Project scaffolding and boilerplate (package.json, tsconfig, folder structure).
- Service implementations and interface definitions.
- Unit test stubs and route handlers.
- Docker Compose and Dockerfile configs.
- Initial React component code and API wiring.

### What requires human review

- Architecture sign-off (module boundaries, interface contracts).
- RAG system prompt tuning and chunk parameter validation.
- Wikipedia scraper edge cases (redirects, disambiguation pages, empty sections).
- Coverage quality audit — ensuring tests assert real behaviour, not padding.
- Integration test verification against a running MongoDB instance with Vector Search index.
- MongoDB vector search index creation and `$vectorSearch` query correctness.
- End-to-end manual test via `docker compose up`.
- Demo recording and final README accuracy check.

### Workflow

1. Pick the next `pending` task from this file.
2. Execute in a single Cursor agent run where possible.
3. Mark task `done` and commit after each meaningful unit of work.
4. Update this file so the plan and repo stay in sync.

---

## Progress Summary

| Phase | Total | Done | Pending |
|-------|-------|------|---------|
| 0 — Planning | 3 | 3 | 0 |
| 1 — Scaffold | 4 | 0 | 4 |
| 2 — Core Services | 8 | 0 | 8 |
| 3 — API Layer | 4 | 0 | 4 |
| 4 — Frontend | 4 | 0 | 4 |
| 5 — Integration | 4 | 0 | 4 |
| 6 — Quality | 4 | 0 | 4 |
| **Total** | **31** | **3** | **28** |
