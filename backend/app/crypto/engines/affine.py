"""
CryptoForge Engine — Affine Cipher

A monoalphabetic substitution cipher using the linear function:
    E(x) = (a * x + b) mod 26
    D(y) = a_inv * (y - b) mod 26

First-principle implementation — no cryptographic libraries used.

How it works:
  1. For each letter, map to 0-25.
  2. Apply E(x) = (a*x + b) mod 26 where 'a' must be coprime with 26.
  3. Convert back to a letter.
  4. Decryption: D(y) = a⁻¹ * (y - b) mod 26 using modular inverse.

Category: Classical Ciphers | Difficulty: 2/5 | Complexity: O(n)
"""

ALPHABET_SIZE = 26


def _gcd(a: int, b: int) -> int:
    """Euclidean algorithm."""
    while b:
        a, b = b, a % b
    return a


def _mod_inverse(a: int, m: int) -> int:
    """Extended Euclidean Algorithm for modular inverse."""
    if _gcd(a, m) != 1:
        raise ValueError(f"No modular inverse: gcd({a}, {m}) != 1")
    old_r, r = a, m
    old_s, s = 1, 0
    while r != 0:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
    return old_s % m


def encrypt(text: str, a: int = 5, b: int = 8) -> dict:
    """
    Encrypt text with the Affine cipher: E(x) = (a*x + b) mod 26.

    Args:
        text: Plaintext to encrypt.
        a:    Multiplicative key (must be coprime with 26).
        b:    Additive key (shift).
    """
    a, b = int(a), int(b)

    if _gcd(a, ALPHABET_SIZE) != 1:
        valid = [k for k in range(1, ALPHABET_SIZE) if _gcd(k, ALPHABET_SIZE) == 1]
        raise ValueError(f"'a' must be coprime with 26. Valid values: {valid}")

    result = []
    for ch in text:
        if "A" <= ch <= "Z":
            x = ord(ch) - ord("A")
            result.append(chr((a * x + b) % ALPHABET_SIZE + ord("A")))
        elif "a" <= ch <= "z":
            x = ord(ch) - ord("a")
            result.append(chr((a * x + b) % ALPHABET_SIZE + ord("a")))
        else:
            result.append(ch)

    ciphertext = "".join(result)

    return {
        "ciphertext": ciphertext,
        "a": a,
        "b": b,
        "formula": f"E(x) = ({a}·x + {b}) mod 26",
        "algorithm": "Affine Cipher",
    }


def decrypt(ciphertext: str, a: int = 5, b: int = 8) -> dict:
    """Decrypt: D(y) = a⁻¹ * (y - b) mod 26."""
    a, b = int(a), int(b)
    a_inv = _mod_inverse(a, ALPHABET_SIZE)

    result = []
    for ch in ciphertext:
        if "A" <= ch <= "Z":
            y = ord(ch) - ord("A")
            result.append(chr((a_inv * (y - b)) % ALPHABET_SIZE + ord("A")))
        elif "a" <= ch <= "z":
            y = ord(ch) - ord("a")
            result.append(chr((a_inv * (y - b)) % ALPHABET_SIZE + ord("a")))
        else:
            result.append(ch)

    return {
        "ciphertext": "".join(result),
        "formula": f"D(y) = {a_inv}·(y - {b}) mod 26",
        "algorithm": "Affine Cipher (decrypt)",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "affine",
    "name": "Affine Cipher",
    "category": "Classical Ciphers",
    "difficulty": 2,
    "complexity": "O(n)",
    "description": "A monoalphabetic substitution cipher where each letter is mapped to its numeric equivalent, encrypted using a linear mathematical function, and converted back to a letter.",
    "parameters": ["a", "b"],
    "encrypt_fn": encrypt,
    "decrypt_fn": decrypt,
}
