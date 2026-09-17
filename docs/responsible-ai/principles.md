# Responsible AI Principles

GreenRoute AI follows responsible AI practices aligned with SDG 11 and SDG 13.

## Core Principles

1. **Fairness** — Recommendations must not systematically disadvantage user groups
2. **Transparency** — Scores, weights, and assumptions are visible to users
3. **Privacy** — User data is minimized and protected; no sensitive data sent to LLMs unnecessarily
4. **Human oversight** — Users make final mobility decisions; AI provides decision support
5. **Accuracy** — LLMs never invent route facts, prices, times, or emissions

## LLM Usage Boundaries

| Allowed                          | Not Allowed                    |
|----------------------------------|--------------------------------|
| Parse natural language requests  | Generate route geometry        |
| Extract structured constraints   | Invent travel times or costs   |
| Explain backend recommendations  | Override optimization results  |
| Assist with sustainability Q&A   | Make unsourced factual claims  |

## Validation

- All LLM outputs validated against Pydantic/Zod schemas
- Fallback handling when AI service is unavailable
- AI failures logged safely without exposing user PII
