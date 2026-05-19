def calculate_risk_score(severity: str, depth: int = 1) -> float:
    sev = (severity or "none").strip().lower()

    if sev == "critical":
        base = 9.5
    elif sev == "high":
        base = 7.5
    elif sev in ("medium", "moderate"):
        base = 5.5
    elif sev == "low":
        base = 3.0
    else:
        base = 0.0

    # Slight reduction for transitive dependencies (depth > 1) if desired.
    # Currently we just return the base score rounded to 1 decimal place.
    return round(base, 1)
