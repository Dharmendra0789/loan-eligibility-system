import random


async def fetch_credit_score(mobile: str) -> int:
    """Mock credit-score provider for assessment/demo use.

    Replace this service with a real provider integration when credentials/API access
    are available. The assessment explicitly allows a demo/mock API if documented.
    """
    # Deterministic demo score based on mobile number, useful for repeatable testing.
    digits = sum(int(ch) for ch in mobile if ch.isdigit())
    return 650 + (digits % 151)
