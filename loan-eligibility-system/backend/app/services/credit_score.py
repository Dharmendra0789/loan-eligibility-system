async def fetch_credit_score(mobile: str) -> int:
    """Mock credit-score provider for assessment/demo use."""

    # Deterministic demo score based on mobile number
    digits = sum(int(ch) for ch in mobile if ch.isdigit())

    return 650 + (digits % 151)