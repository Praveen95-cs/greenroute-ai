"""Rule-based constraint extraction — deterministic, no hallucinated facts."""

from __future__ import annotations

import re
from datetime import datetime, timedelta

from app.schemas.mobility import ExtractedConstraints

KNOWN_PLACES = [
    "chennai central",
    "anna university",
    "t nagar",
    "chennai airport",
    "marina beach",
]

PRIORITY_PATTERNS: list[tuple[str, str]] = [
    (r"\b(sustainable|eco|green|carbon|environment)\b", "sustainability"),
    (r"\b(fast|quick|speed|time|urgent|rush)\b", "time"),
    (r"\b(cheap|budget|cost|afford|save money)\b", "cost"),
]

MODE_KEYWORDS: dict[str, list[str]] = {
    "BUS": ["bus"],
    "METRO": ["metro", "subway"],
    "TRAIN": ["train"],
    "CAR": ["car", "drive", "private"],
    "CARPOOL": ["carpool", "share ride"],
    "WALK": ["walk", "walking"],
    "BIKE": ["bike", "bicycle", "cycle"],
    "AUTO": ["auto", "rickshaw"],
}


def _find_place(text: str) -> str | None:
    lower = text.lower()
    for place in KNOWN_PLACES:
        if place in lower:
            return place.title()
    return None


def _extract_destination(query: str) -> str | None:
    patterns = [
        r"(?:reach|get to|go to|arrive at|travel to|heading to)\s+([a-zA-Z\s]+?)(?:\s+before|\s+by|\s+with|\s+under|\s+don't|\s+do not|$|\.)",
        r"(?:destination|dest)\s*[:\-]?\s*([a-zA-Z\s]+?)(?:\s+before|\s+by|$|\.)",
    ]
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            candidate = match.group(1).strip()
            resolved = _find_place(candidate) or candidate.title()
            return resolved
    return _find_place(query)


def _extract_source(query: str) -> str | None:
    match = re.search(
        r"(?:from|starting at|leave from)\s+([a-zA-Z\s]+?)(?:\s+to|\s+and|\s+before|\s+by|$|\.)",
        query,
        re.IGNORECASE,
    )
    if match:
        candidate = match.group(1).strip()
        return _find_place(candidate) or candidate.title()
    return None


def _extract_budget(query: str) -> float | None:
    patterns = [
        r"budget\s*(?:of|is)?\s*(?:₹|rs\.?|inr|rupees?)?\s*(\d+(?:\.\d+)?)",
        r"(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)",
        r"under\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)",
    ]
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return None


def _extract_walking_minutes(query: str) -> int | None:
    patterns = [
        r"(?:walk|walking)\s*(?:more than|over|max|at most|under|less than)?\s*(\d+)\s*(?:min|mins|minutes?)",
        r"(\d+)\s*(?:min|mins|minutes?)\s*(?:walk|walking|on foot)",
    ]
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def _extract_arrival_deadline(query: str) -> str | None:
    time_match = re.search(
        r"(?:before|by|until|no later than)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?",
        query,
        re.IGNORECASE,
    )
    if not time_match:
        return None

    hour = int(time_match.group(1))
    minute = int(time_match.group(2) or 0)
    meridiem = (time_match.group(3) or "").lower()

    if meridiem == "pm" and hour < 12:
        hour += 12
    if meridiem == "am" and hour == 12:
        hour = 0

    now = datetime.now()
    deadline = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if deadline <= now:
        deadline += timedelta(days=1)

    return deadline.isoformat()


def _extract_priority(query: str) -> str | None:
    lower = query.lower()
    for pattern, priority in PRIORITY_PATTERNS:
        if re.search(pattern, lower):
            return priority
    return None


def _extract_modes(query: str) -> list[str] | None:
    lower = query.lower()
    modes: list[str] = []
    for code, keywords in MODE_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            modes.append(code)
    return modes or None


def extract_constraints(query: str, default_source: str | None = None) -> ExtractedConstraints:
    destination = _extract_destination(query)
    source = _extract_source(query) or default_source
    budget = _extract_budget(query)
    max_walking = _extract_walking_minutes(query)
    arrival = _extract_arrival_deadline(query)
    priority = _extract_priority(query)
    modes = _extract_modes(query)

    filled = sum(
        1
        for v in [destination, source, budget, max_walking, arrival, priority, modes]
        if v is not None
    )
    confidence = min(0.95, 0.35 + filled * 0.1)

    return ExtractedConstraints(
        source_label=source,
        destination_label=destination,
        arrival_deadline=arrival,
        budget=budget,
        max_walking_minutes=max_walking,
        priority=priority,
        transport_modes=modes,
        confidence=confidence,
        extraction_method="rule-based",
    )


def list_ambiguities(constraints: ExtractedConstraints) -> list[str]:
    ambiguities: list[str] = []
    if not constraints.destination_label:
        ambiguities.append("Destination could not be identified. Try naming a known place.")
    if not constraints.source_label:
        ambiguities.append("Origin not specified — using default or profile location.")
    if constraints.confidence < 0.5:
        ambiguities.append("Low confidence extraction. Please verify constraints before traveling.")
    return ambiguities
