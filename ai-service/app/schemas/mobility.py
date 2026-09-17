from pydantic import BaseModel, Field


class ExtractedConstraints(BaseModel):
    source_label: str | None = None
    destination_label: str | None = None
    arrival_deadline: str | None = Field(
        None, description="ISO 8601 datetime if parseable"
    )
    budget: float | None = None
    max_walking_minutes: int | None = None
    priority: str | None = Field(None, description="sustainability | time | cost | balanced")
    transport_modes: list[str] | None = None
    confidence: float = Field(ge=0, le=1)
    extraction_method: str = "rule-based"


class ConstraintExtractionRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    default_source_label: str | None = None


class ConstraintExtractionResponse(BaseModel):
    constraints: ExtractedConstraints
    ambiguities: list[str] = []


class RouteFact(BaseModel):
    transport_mode: str
    duration_minutes: int
    estimated_cost: float
    estimated_co2_grams: float
    walking_minutes: int
    composite_score: float
    is_recommended: bool


class ExplanationRequest(BaseModel):
    user_query: str
    constraints: ExtractedConstraints
    source_label: str
    destination_label: str
    recommended: RouteFact
    alternatives: list[RouteFact] = []
    disclaimer: str


class ExplanationResponse(BaseModel):
    explanation: str
    highlights: list[str]
    responsible_ai_note: str
