# Route Planning & Sustainability Engine

## Overview

Route planning uses a **provider abstraction** so external mapping APIs (Google, OSRM, etc.) can replace the demo provider without changing business logic.

```
Route Search Request
       ↓
DemoRouteProvider (or external provider)
       ↓
Sustainability Engine (CO₂, cost — deterministic)
       ↓
Route Ranker (multi-objective scoring)
       ↓
User preference constraints (budget, walking)
       ↓
Persist Route + RouteOptions
```

## Sustainability Calculations

All calculations are **deterministic and testable**:

| Metric | Formula |
|--------|---------|
| CO₂ | `distanceKm × co2GramsPerKm` |
| Cost | `baseFare + distanceKm × avgCostPerKm` |
| Time score | Normalized inverse (lower duration = higher score) |
| Carbon score | Normalized inverse (lower CO₂ = higher score) |
| Cost score | Normalized inverse (lower cost = higher score) |
| Composite | `Σ(weight × score)` |

## Scoring Weights

Default weights:
- Time: 25%
- Cost: 20%
- Carbon: 30%
- Reliability: 15%
- Walking: 10%

User preferences adjust weights automatically (`sustainabilityPriority`, `timePriority`, budget/walking constraints).

## Demo Provider Disclaimer

The `DemoRouteProvider` generates **model-based estimates** from straight-line distance and transport mode profiles. It is not live navigation data. All API responses include a disclaimer field.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/routes/search` | Search and score routes |
| POST | `/api/v1/routes/:id/rank` | Re-rank with custom weights |
| GET | `/api/v1/routes/:id` | Retrieve saved route comparison |
