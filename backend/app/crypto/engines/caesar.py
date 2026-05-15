"""
CryptoForge Engine — Caesar Cipher

The ancient substitution cipher that shifts each letter by a fixed
number of positions in the alphabet.

First-principle implementation — no cryptographic libraries used.

How it works:
  1. For each letter in the plaintext, determine if it's uppercase or lowercase.
  2. Convert the letter to its position in the alphabet (A=0, B=1, ..., Z=25).
  3. Add the shift value and wrap around using modulo 26.
  4. Convert back to a letter.
  5. Non-alphabetic characters (digits, punctuation, spaces) pass through unchanged.

Category: Classical Ciphers | Difficulty: 1/5 | Complexity: O(n)
"""

ALPHABET_SIZE = 26


def _shift_char(char: str, shift: int) -> str:
    """Shift a single character by `shift` positions. Non-alpha chars pass through."""
    if 'A' <= char <= 'Z':
        # ord('A') = 65.  Map to 0-25, shift, wrap, map back.
        return chr((ord(char) - ord('A') + shift) % ALPHABET_SIZE + ord('A'))
    elif 'a' <= char <= 'z':
        return chr((ord(char) - ord('a') + shift) % ALPHABET_SIZE + ord('a'))
    else:
        return char  # digits, punctuation, whitespace — unchanged


def encrypt(plaintext: str, shift: int = 3) -> dict:
    """
    Encrypt plaintext using the Caesar cipher.

    Args:
        plaintext: The text to encrypt.
        shift:     Number of positions to shift each letter (default 3, as Caesar used).

    Returns:
        dict with ciphertext, the shift used, and a character-level breakdown.
    """
    shift = int(shift) % ALPHABET_SIZE  # normalise to 0-25

    ciphertext_chars = []
    breakdown = []

    for ch in plaintext:
        shifted = _shift_char(ch, shift)
        ciphertext_chars.append(shifted)

        if ch.isalpha():
            breakdown.append(f"{ch} → {shifted}")

    ciphertext = "".join(ciphertext_chars)

    return {
        "ciphertext": ciphertext,
        "shift": shift,
        "input_length": len(plaintext),
        "algorithm": "Caesar Cipher",
        "breakdown": " | ".join(breakdown[:12]) + (" ..." if len(breakdown) > 12 else ""),
    }


def decrypt(ciphertext: str, shift: int = 3) -> dict:
    """
    Decrypt ciphertext by shifting in the opposite direction.

    Decryption is just encryption with the negated shift.
    """
    shift = int(shift) % ALPHABET_SIZE

    plaintext_chars = [_shift_char(ch, -shift) for ch in ciphertext]
    plaintext = "".join(plaintext_chars)

    return {
        "ciphertext": plaintext,  # key expected by the pipeline system
        "shift": shift,
        "algorithm": "Caesar Cipher (decrypt)",
    }


def brute_force(ciphertext: str) -> dict:
    """
    Try all 25 non-trivial shifts and return every possibility.
    Useful for breaking an unknown Caesar cipher.
    """
    results = []
    for s in range(1, ALPHABET_SIZE):
        candidate = "".join(_shift_char(ch, -s) for ch in ciphertext)
        results.append({"shift": s, "plaintext": candidate})

    return {
        "ciphertext": ciphertext,
        "candidates": results,
        "algorithm": "Caesar Cipher (brute-force)",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────
# This dict is auto-discovered by the engine loader. Just define it and the
# algorithm will appear in the Explore page and be available in the Lab.

ALGORITHM = {
    "id": "caesar",
    "name": "Caesar Cipher",
    "category": "Classical Ciphers",
    "difficulty": 1,
    "complexity": "O(n)",
    "description": "The ancient substitution cipher that shifts each letter by a fixed number of positions.",
    "parameters": ["shift"],
    "encrypt_fn": encrypt,
    "decrypt_fn": decrypt,
}
