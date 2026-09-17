from fastapi import APIRouter

from app.schemas.mobility import (
    ConstraintExtractionRequest,
    ConstraintExtractionResponse,
    ExplanationRequest,
    ExplanationResponse,
)
from app.services.constraint_extraction.rule_extractor import (
    extract_constraints,
    list_ambiguities,
)
from app.services.recommendation.explainer import explain_recommendation

router = APIRouter(prefix="/mobility", tags=["mobility"])


@router.post("/extract-constraints", response_model=ConstraintExtractionResponse)
async def extract_constraints_endpoint(
    body: ConstraintExtractionRequest,
) -> ConstraintExtractionResponse:
    constraints = extract_constraints(body.query, body.default_source_label)
    return ConstraintExtractionResponse(
        constraints=constraints,
        ambiguities=list_ambiguities(constraints),
    )


@router.post("/explain", response_model=ExplanationResponse)
async def explain_endpoint(body: ExplanationRequest) -> ExplanationResponse:
    return explain_recommendation(body)
