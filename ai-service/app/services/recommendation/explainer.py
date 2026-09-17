from app.schemas.mobility import (
    ExplanationRequest,
    ExplanationResponse,
    RouteFact,
)


def explain_recommendation(request: ExplanationRequest) -> ExplanationResponse:
    rec = request.recommended
    highlights = [
        f"Recommended: {rec.transport_mode} — {rec.duration_minutes} min, "
        f"₹{rec.estimated_cost:.0f}, {rec.estimated_co2_grams:.0f}g CO₂",
    ]

    if request.constraints.priority == "sustainability":
        reason = "This option balances your sustainability priority with practical travel time."
    elif request.constraints.priority == "time":
        reason = "This option is ranked highest for time efficiency among feasible routes."
    elif request.constraints.priority == "cost":
        reason = "This option offers the best cost efficiency within your constraints."
    else:
        reason = "This option offers the best overall multi-objective score for your request."

    if request.constraints.budget is not None:
        if rec.estimated_cost <= request.constraints.budget:
            highlights.append(
                f"Within your stated budget of ₹{request.constraints.budget:.0f}."
            )
        else:
            highlights.append(
                f"Note: estimated cost ₹{rec.estimated_cost:.0f} exceeds stated budget "
                f"₹{request.constraints.budget:.0f}."
            )

    if request.constraints.max_walking_minutes is not None:
        highlights.append(
            f"Walking segment: {rec.walking_minutes} min "
            f"(your limit: {request.constraints.max_walking_minutes} min)."
        )

    alt_lines = _format_alternatives(request.alternatives, rec)
    explanation = (
        f"Based on your request to travel from {request.source_label} to "
        f"{request.destination_label}, {reason} "
        f"The {rec.transport_mode} option takes about {rec.duration_minutes} minutes, "
        f"costs approximately ₹{rec.estimated_cost:.0f}, and emits an estimated "
        f"{rec.estimated_co2_grams:.0f}g CO₂. "
        f"{alt_lines} "
        f"{request.disclaimer}"
    )

    return ExplanationResponse(
        explanation=explanation.strip(),
        highlights=highlights,
        responsible_ai_note=(
            "This explanation is generated from backend-calculated route data only. "
            "Travel times, costs, and emissions are estimates — verify before you travel."
        ),
    )


def _format_alternatives(alternatives: list[RouteFact], recommended: RouteFact) -> str:
    others = [a for a in alternatives if a.transport_mode != recommended.transport_mode][:2]
    if not others:
        return ""
    parts = [
        f"{a.transport_mode} ({a.duration_minutes} min, {a.estimated_co2_grams:.0f}g CO₂)"
        for a in others
    ]
    return f"Alternatives considered: {', '.join(parts)}."
