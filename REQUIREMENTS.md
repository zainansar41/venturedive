# Requirements

## 1. Purpose

Build a containerised RAG-based chat application that ingests a single Wikipedia article and lets a user chat with its contents using a **local LLM**. The application must be planned, decomposed, and implemented using an AI-agent-driven development workflow (Cursor).

This document is our interpretation of the [VentureDive Engineering Take-Home Test](VentureDive_TakeHome_Test-%20Node.pdf) brief.

---

## 2. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | The user pastes a Wikipedia article URL into a form. |
| FR-2 | The app scrapes the article content — text body, sections, and references where reasonable. |
| FR-3 | The app generates a concise summary of the article using a **local LLM** and displays it to the user. |
| FR-4 | The app chunks the article, generates embeddings, and stores them in **MongoDB** using **MongoDB Vector Search**. |
| FR-5 | Below the summary, a chat box lets the user ask questions about the article. Answers must be grounded in retrieved chunks (RAG), not in the model's general knowledge. |
| FR-6 | The app provides sensible error handling for bad URLs, non-Wikipedia URLs, and empty or unparseable articles. |

---

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Summarisation and chat must run against a locally-deployed LLM via **Ollama** or **vLLM**. No calls to OpenAI, Anthropic, Gemini, or other hosted inference APIs in the running application. |
| NFR-2 | **MongoDB** with **MongoDB Vector Search** must run as part of the containerised stack (not an in-process toy store). |
| NFR-3 | The full stack must start with a **single command** — typically `docker compose up`. |
| NFR-4 | No secrets committed to the repository. Use `.env.example` for any required configuration. |
| NFR-5 | Minimum **85% line coverage** on application code. Generate and commit a coverage report. Tests must be meaningful, not assertion padding. |
| NFR-6 | Unit tests must mock the LLM and vector DB. At least one integration test must exercise the real wired-up stack. |
| NFR-7 | The UI must be functional and unembarrassing — a single page with a URL input, a summary, and a chat box. Visual design polish is not a goal. |
| NFR-8 | The repository root must contain `REQUIREMENTS.md`, `DESIGN.md`, and `TASKS.md` as planning artefacts produced before implementation. |

---

## 4. In Scope

- Single Wikipedia article ingest per browser session.
- Wikipedia URL validation and content scraping.
- Local LLM summarisation of scraped article text.
- RAG pipeline: chunk → embed → store in MongoDB → vector search retrieve → generate.
- Docker Compose orchestration for the full stack.
- Planning artefacts (`REQUIREMENTS.md`, `DESIGN.md`, `TASKS.md`).
- `README.md` with run instructions (created during implementation phase).
- Coverage report committed to the repo.

---

## 5. Out of Scope

The following are explicitly excluded to keep the surface area small and evaluable:

- Authentication, user accounts, and login flows.
- Multi-article history or persistent article storage across sessions.
- Analytics, logging dashboards, or telemetry beyond basic error handling.
- Hosted LLM inference in the running application (OpenAI, Anthropic, Gemini, etc.).
- Visual design polish, animations, or responsive/mobile-first layouts beyond functional usability.
- Features beyond the core flow (auth, history, analytics) unless the core flow is solid and tested.

---

## 6. Assumptions

| Area | Assumption |
|------|------------|
| **Backend** | Node.js with Express and TypeScript (per the brief's Node variant). |
| **Frontend** | React + Vite SPA with TypeScript. |
| **LLM runtime** | Ollama with `llama3.2:3b` (fallback: `qwen2.5:3b` or `phi3:mini`) — small enough for a developer laptop. |
| **Embeddings** | Local via Ollama `nomic-embed-text` (preferred over hosted embedding APIs). |
| **Vector DB** | **MongoDB** with **MongoDB Vector Search** (`$vectorSearch` aggregation) — stores chunk documents with embedding vectors; HNSW vector index for cosine similarity search. |
| **MongoDB driver** | Official `mongodb` Node.js driver with Mongoose optional for schema validation. |
| **Scraping** | Wikipedia REST HTML API (`/api/rest_v1/page/html/{title}`) parsed with Cheerio — no headless browser. |
| **Session model** | One article per session. Chunks stored in MongoDB filtered by `sessionId`; lightweight in-memory map tracks active session metadata (title, summary). |
| **Ollama placement** | If containerising Ollama is impractical due to model size, connect to a host-side Ollama instance via `host.docker.internal`. Documented in `DESIGN.md`. |
| **AI workflow** | Cursor used for planning, decomposition, and code generation. Human reviews architecture boundaries, RAG prompts, and test quality. |

---

## 7. Resolved Open Questions

These ambiguities in the brief were resolved unilaterally. Rationale is included so reviewers understand the trade-offs.

| Question | Decision | Rationale |
|----------|----------|-----------|
| What chunk size and overlap? | ~500 tokens (~2000 chars) per chunk, ~50 tokens (~200 chars) overlap | Balances retrieval precision against the limited context window of a 3B-class model. |
| How to enforce RAG grounding? | System prompt restricts answers to provided context; return "I cannot find that in the article" when no relevant chunks are retrieved | Prevents the model from falling back on general knowledge. |
| How to scrape Wikipedia? | Fetch via the official REST HTML endpoint + Cheerio parsing | More stable than scraping arbitrary DOM structures; no Puppeteer/Playwright overhead. |
| Which vector database? | **MongoDB + MongoDB Vector Search** | Native `$vectorSearch` support; single database for chunk storage and similarity search; familiar Node.js ecosystem via official driver; runs in Docker Compose. |
| How to manage session state? | Chunk embeddings in MongoDB keyed by `sessionId`; session metadata (title, summary) in an in-memory `Map` | Vector data persisted in MongoDB for RAG retrieval; minimal in-memory state for the demo UI. |
| What to exclude from coverage calculation? | Entry/bootstrap files and generated type stubs — documented in Vitest coverage config | Per brief FAQ: boilerplate and framework glue are excluded from the 85% threshold. |
| How many retrieved chunks for RAG? | Top-5 chunks with a minimum similarity score threshold | Enough context for a 3B model without overflowing the prompt; filters irrelevant noise. |
| Can hosted models be used during development? | Yes, via the AI IDE (Cursor). Constraint applies only to the running application. | Aligns with brief Section 3.3 and FAQ. |

---

## 8. Submission Requirements

The final repository must include:

- `REQUIREMENTS.md`, `DESIGN.md`, `TASKS.md` at the root.
- `README.md` with clone-and-run instructions.
- `docker-compose.yml` wiring the full stack.
- Source code with tests and a coverage report (≥85%).
- A 2–4 minute screen recording or screenshots showing the end-to-end flow.

Optionally: `NOTES.md` describing what would change with two more days and what the AI agent got wrong.

---

## 9. Evaluation Criteria (Reference)

| Area | Weight | What Reviewers Look For |
|------|--------|------------------------|
| AI-Assisted Workflow | 25% | Quality of planning artefacts; evidence of agent-driven planning, not just autocomplete |
| Functionality | 20% | End-to-end flow: scrape → summarise → embed → chat; error handling |
| Code Quality & Architecture | 20% | Separation of concerns; swappable LLM and vector store abstractions |
| Testing | 15% | ≥85% coverage with meaningful tests; coverage report included |
| Containerisation & DX | 10% | Single command startup; no secrets; clean compose |
| Documentation & Clarity | 10% | README, honest trade-offs, known limitations |
