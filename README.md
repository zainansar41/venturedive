# VentureDive Take-Home: Wikipedia RAG Chat

A fullstack RAG application that:

- ingests a single Wikipedia URL,
- summarizes the article using a local LLM (Ollama),
- chunks + embeds content and stores vectors in MongoDB Vector Search,
- answers chat questions grounded in retrieved article chunks.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript (MVC + service layer)
- **LLM Runtime:** Ollama (`llama3.2:3b`, `nomic-embed-text`)
- **Vector Store:** MongoDB with `$vectorSearch`
- **Tests:** Vitest + Supertest

## Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── services
│   │   ├── types
│   │   └── utils
│   └── tests
├── frontend
│   └── src
├── REQUIREMENTS.md
├── DESIGN.md
└── TASKS.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- Ollama running on host machine
- MongoDB running locally on `localhost:27017`

Pull required Ollama models:

```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Run App (Simple Dev Commands)

Open two terminals:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- MongoDB: `localhost:27017`

## Testing & Coverage

```bash
cd backend
npm run test
npm run test:coverage
```

Coverage reports are generated in `backend/coverage`.

## API Endpoints

- `GET /api/health` - health check
- `POST /api/ingest`
  - body: `{ "url": "https://en.wikipedia.org/wiki/Node.js" }`
  - returns: `{ "sessionId": "...", "title": "...", "summary": "..." }`
- `POST /api/chat`
  - body: `{ "sessionId": "...", "message": "Who created Node.js?" }`
  - returns: `{ "answer": "...", "sources": [{ "sectionTitle": "...", "snippet": "..." }] }`

## Known Limitations

- Single article per session.
- Session metadata is in memory (reset on backend restart).
- Vector index warm-up may take time on first start.
- English Wikipedia URL flow (`en.wikipedia.org/wiki/...`) is the primary path.
