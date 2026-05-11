"""
CryptoForge Engine — GCD (Greatest Common Divisor)

Calculates the greatest common divisor of two integers using the Euclidean algorithm.
Category: Math Functions | Difficulty: 1/5 | Complexity: O(log(min(a,b)))
"""
from ._base import not_implemented


def encrypt(a: int, b: int) -> dict:
    """
    Implement GCD (Greatest Common Divisor) logic here.

    Return a dict with at least a "result" key containing the output.
    Example: {"result": "<encrypted_text>", "details": {...}}
    """
    not_implemented("GCD (Greatest Common Divisor)")


# ─── Algorithm Registration ─────────────────────────────────────────────────
# This dict is auto-discovered by the engine loader. Just define it and the
# algorithm will appear in the Explore page and be available in the Lab.

ALGORITHM = {
    "id": "gcd",
    "name": "GCD (Greatest Common Divisor)",
    "category": "Math Functions",
    "difficulty": 1,
    "complexity": "O(log(min(a,b)))",
    "description": "Calculates the greatest common divisor of two integers using the Euclidean algorithm.",
    "parameters": ["a", "b"],
    "encrypt_fn": encrypt,
}
