# GreenRoute AI — Architecture Overview

## System Context

GreenRoute AI is a modular monolith with a separate AI/ML service. External mapping providers are accessed through an abstraction layer (to be implemented).

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
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  LLM / ML       │
                              └─────────────────┘
```

## Design Principles

1. **Modular monolith** — Single backend deployable with clear service boundaries
2. **Deterministic calculations** — CO₂, cost, and scoring live in backend services
3. **LLM for interpretation only** — Never fabricates route facts
4. **Responsible AI** — Transparency, privacy, human oversight

## Service Ports

| Service    | Port | Health Endpoint        |
|------------|------|------------------------|
| Frontend   | 5173 | —                      |
| Backend    | 3001 | `/api/v1/health`       |
| AI Service | 8000 | `/health`              |
| PostgreSQL | 5433 | Docker healthcheck (avoids local PG on 5432) |

## Domain Modules (Planned)

- Authentication & authorization
- User preferences
- Route planning & external provider abstraction
- Sustainability engine
- Multi-objective optimization
- Carpool matching
- Personal & admin analytics
- What-if simulation
- AI mobility assistant
