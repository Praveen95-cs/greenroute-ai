# ADR-001: PostgreSQL External Port 5433

## Status

Accepted

## Context

Many developer machines run a local PostgreSQL instance on port 5432. GreenRoute AI uses Docker Compose for its development database.

## Decision

Map the container's internal port 5432 to **host port 5433** by default.

## Consequences

- Developers must use `DATABASE_URL=...@localhost:5433/...` in `.env`
- CI continues to use port 5432 (isolated runner environment)
- Avoids credential conflicts with existing local PostgreSQL installations
