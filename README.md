# GreenRoute AI

**Sustainable mobility decision and optimization platform**

GreenRoute AI answers: *"What is the best way for me to get there considering time, cost, carbon emissions, reliability, accessibility, and my personal preferences?"*

This is not a navigation app — it is a decision-support platform that uses external routing data as input while owning the intelligence layer: sustainability calculations, multi-objective optimization, carpool matching, and AI-assisted recommendations.

## Architecture

```
┌─────────────┐     REST      ┌─────────────────┐     Prisma     ┌────────────┐
│   React     │ ────────────► │  Express API    │ ─────────────► │ PostgreSQL │
│  Frontend   │               │  (Node.js/TS)   │                │            │
└─────────────┘               └────────┬────────┘                └────────────┘
                                       │
                                       │ HTTP
                                       ▼
                              ┌─────────────────┐
                              │  AI Service     │
                              │  (FastAPI/Py)   │
                              └─────────────────┘
```

See [docs/architecture/overview.md](docs/architecture/overview.md) for details.

## Tech Stack

| Layer      | Technologies                                              |
|------------|-----------------------------------------------------------|
| Frontend   | React, TypeScript, Vite, Tailwind CSS, TanStack Query     |
| Backend    | Node.js, Express, TypeScript, Prisma, JWT, Zod              |
| Database   | PostgreSQL 16                                             |
| AI Service | Python, FastAPI, Pydantic, Pandas, Scikit-learn             |
| Infra      | Docker Compose, GitHub Actions CI                           |

## Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- Git

## Quick Start

### 1. Clone and configure

```bash
git clone <repository-url>
cd greenroute-ai
cp .env.example .env
```

**Windows quick setup** (installs deps, starts Docker DB, runs migrations + seed):

```powershell
.\scripts\dev-setup.ps1
```

### 2. Start PostgreSQL

Start Docker Desktop, then:

```bash
docker compose up -d
```

PostgreSQL runs on port **5433** (mapped externally) to avoid conflicts with local PostgreSQL installations on 5432.

### 3. Backend setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:3001**

### 4. AI service setup

```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

AI service runs at **http://localhost:8000** (docs at `/docs`)

### 5. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Health Checks

| Service    | Endpoint                          |
|------------|-----------------------------------|
| Backend    | `GET /api/v1/health`              |
| Backend    | `GET /api/v1/health/ready`        |
| AI Service | `GET /health`                     |

The landing page displays live system status from these endpoints.

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable         | Description                    | Default              |
|------------------|--------------------------------|----------------------|
| `DATABASE_URL`   | PostgreSQL connection string   | (see .env.example)   |
| `BACKEND_PORT`   | API server port                | `3001`               |
| `JWT_SECRET`     | JWT signing secret (16+ chars) | —                  |
| `CORS_ORIGIN`    | Allowed frontend origin        | `http://localhost:5173` |
| `AI_SERVICE_URL` | AI service base URL            | `http://localhost:8000` |
| `VITE_API_URL`   | Backend URL for frontend       | `http://localhost:3001` |

## Project Structure

```
greenroute-ai/
├── frontend/          # React SPA
├── backend/           # Express REST API + Prisma
├── ai-service/        # FastAPI AI/ML service
├── database/          # Seed data & DB documentation
├── docs/              # Architecture, API, algorithms, AI docs
├── tests/             # Integration & E2E tests
└── docker-compose.yml # PostgreSQL container
```

## SDG Alignment

- **Primary:** SDG 11 — Sustainable Cities and Communities
- **Secondary:** SDG 13 — Climate Action

## Development Status

**Phase 1 (Complete):** Repository foundation, health checks, connectivity verification

**Next phases:**
- Authentication & user management
- Route planning & sustainability engine
- Multi-objective optimization
- AI mobility assistant
- Carpool matching
- Analytics dashboards
- What-if simulation

## License

MIT — see [LICENSE](LICENSE)
