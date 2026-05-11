"""
CryptoForge — Engine Base Helpers

Shared utilities used across all algorithm engine modules.
"""


def not_implemented(algorithm_name: str) -> None:
    """Raise NotImplementedError with a helpful message."""
    raise NotImplementedError(
        f"{algorithm_name} is not implemented yet. "
        f"Open this engine file and implement the encrypt() function."
    )
