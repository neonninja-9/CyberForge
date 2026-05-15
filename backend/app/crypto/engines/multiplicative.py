"""
CryptoForge Engine — Multiplicative Cipher

A substitution cipher where each letter is multiplied by a key modulo
the alphabet size (26). Only keys coprime with 26 are valid.

First-principle implementation — no cryptographic libraries used.

╔═══════════════════════════════════════════════════════════════╗
║  MATH BEHIND IT                                              ║
║                                                              ║
║  Encryption:  E(x) = (key × x) mod 26                       ║
║  Decryption:  D(y) = (key⁻¹ × y) mod 26                     ║
║                                                              ║
║  key⁻¹ is the modular multiplicative inverse of key mod 26.  ║
║  It only exists when gcd(key, 26) == 1 (coprime).            ║
║                                                              ║
║  Valid keys: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25      ║
║  (12 out of 26 — those coprime with 26)                      ║
╚═══════════════════════════════════════════════════════════════╝

Category: Classical Ciphers | Difficulty: 2/5 | Complexity: O(n)
"""

ALPHABET_SIZE = 26


def _gcd(a: int, b: int) -> int:
    """
    Euclidean algorithm for greatest common divisor.

    Repeatedly replaces the larger number with the remainder of dividing
    the two, until the remainder is 0. The last non-zero value is the GCD.

    Example: gcd(48, 18)
      48 = 2×18 + 12  →  gcd(18, 12)
      18 = 1×12 + 6   →  gcd(12, 6)
      12 = 2×6  + 0   →  gcd = 6
    """
    while b:
        a, b = b, a % b
    return a


def _mod_inverse(a: int, m: int) -> int:
    """
    Find the modular multiplicative inverse of 'a' modulo 'm'.

    Uses the Extended Euclidean Algorithm to find x such that:
        (a × x) mod m == 1

    This works by running the Euclidean algorithm while tracking
    coefficients (Bézout's identity): gcd(a, m) = a·x + m·y.
    The coefficient x is the modular inverse.

    Example: mod_inverse(7, 26)
      We need x where (7 × x) mod 26 == 1
      Answer: x = 15, because 7 × 15 = 105 = 4×26 + 1
    """
    if _gcd(a, m) != 1:
        raise ValueError(f"No modular inverse: gcd({a}, {m}) != 1")

    # Extended Euclidean Algorithm
    old_r, r = a, m       # remainders
    old_s, s = 1, 0       # coefficients for 'a'

    while r != 0:
        quotient = old_r // r
        old_r, r = r, old_r - quotient * r   # standard Euclidean step
        old_s, s = s, old_s - quotient * s   # track the coefficient

    # old_s might be negative, so take mod m to get positive result
    return old_s % m


# Precompute the 12 valid keys (those coprime with 26)
VALID_KEYS = [k for k in range(1, ALPHABET_SIZE) if _gcd(k, ALPHABET_SIZE) == 1]


def encrypt(text: str, key: int = 7) -> dict:
    """
    Encrypt text using the Multiplicative cipher.

    For each letter:
      1. Convert to number: A=0, B=1, ..., Z=25
      2. Multiply:          encrypted = (key × number) mod 26
      3. Convert back:      number → letter

    Non-alphabetic characters pass through unchanged.

    Args:
        text: The plaintext to encrypt.
        key:  Multiplicative key (must be coprime with 26).
    """
    key = int(key)

    # Validate: key must be coprime with 26, otherwise decryption is impossible
    if _gcd(key, ALPHABET_SIZE) != 1:
        raise ValueError(
            f"Key {key} is not coprime with {ALPHABET_SIZE}. "
            f"Valid keys: {VALID_KEYS}"
        )

    result = []
    for ch in text:
        if 'A' <= ch <= 'Z':
            # Map A-Z to 0-25, multiply, wrap with mod, map back
            x = ord(ch) - ord('A')
            result.append(chr((key * x) % ALPHABET_SIZE + ord('A')))
        elif 'a' <= ch <= 'z':
            x = ord(ch) - ord('a')
            result.append(chr((key * x) % ALPHABET_SIZE + ord('a')))
        else:
            result.append(ch)  # spaces, digits, punctuation — unchanged

    ciphertext = "".join(result)

    return {
        "ciphertext": ciphertext,
        "key": key,
        "inverse_key": _mod_inverse(key, ALPHABET_SIZE),
        "valid_keys": VALID_KEYS,
        "algorithm": "Multiplicative Cipher",
    }


def decrypt(ciphertext: str, key: int = 7) -> dict:
    """
    Decrypt by multiplying with the modular inverse of the key.

    If encryption was E(x) = (7 × x) mod 26,
    then decryption is D(y) = (15 × y) mod 26, because 7⁻¹ mod 26 = 15.
    """
    key = int(key)
    inv = _mod_inverse(key, ALPHABET_SIZE)
    result = encrypt(ciphertext, inv)
    result["algorithm"] = "Multiplicative Cipher (decrypt)"
    return result


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "multiplicative",
    "name": "Multiplicative Cipher",
    "category": "Classical Ciphers",
    "difficulty": 2,
    "complexity": "O(n)",
    "description": "A substitution cipher where the plaintext is multiplied by a key modulo the alphabet size.",
    "parameters": ["key"],
    "encrypt_fn": encrypt,
    "decrypt_fn": decrypt,
}
