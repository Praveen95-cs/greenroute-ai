"""Tests for rule-based constraint extraction."""

from app.services.constraint_extraction.rule_extractor import extract_constraints


def test_extracts_destination_budget_and_walking() -> None:
    query = (
        "I need to reach Anna University before 9 AM. "
        "I have a budget of 100 rupees and don't want to walk more than 10 minutes."
    )
    result = extract_constraints(query, default_source="Chennai Central")

    assert result.destination_label == "Anna University"
    assert result.source_label == "Chennai Central"
    assert result.budget == 100
    assert result.max_walking_minutes == 10
    assert result.arrival_deadline is not None


def test_extracts_sustainability_priority() -> None:
    query = "Get me to Marina Beach sustainably from T Nagar"
    result = extract_constraints(query)

    assert result.destination_label == "Marina Beach"
    assert result.source_label == "T Nagar"
    assert result.priority == "sustainability"
