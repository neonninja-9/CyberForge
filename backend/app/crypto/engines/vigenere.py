"""
CryptoForge Engine — Vigenère Cipher

A polyalphabetic substitution cipher that uses a keyword to shift each
letter by a different amount, defeating simple frequency analysis.

First-principle implementation — no cryptographic libraries used.

How it works:
  1. Repeat the keyword to match the plaintext length (skipping non-alpha chars).
  2. For each letter, shift by the corresponding keyword letter's position.
     E(pᵢ) = (pᵢ + kᵢ) mod 26
  3. Decryption reverses the shift: D(cᵢ) = (cᵢ - kᵢ) mod 26.

Category: Classical Ciphers | Difficulty: 2/5 | Complexity: O(n)
"""

ALPHABET_SIZE = 26


def encrypt(text: str, key: str = "SECRET") -> dict:
    """
    Encrypt text using the Vigenère cipher.

    Args:
        text: Plaintext to encrypt.
        key:  Keyword (alphabetic characters only).
    """
    key = key.upper().strip()
    if not key or not key.isalpha():
        raise ValueError("Key must contain only alphabetic characters.")

    result = []
    key_index = 0

    for ch in text:
        if ch.isalpha():
            shift = ord(key[key_index % len(key)]) - ord('A')
            base = ord('A') if ch.isupper() else ord('a')
            encrypted = chr((ord(ch) - base + shift) % ALPHABET_SIZE + base)
            result.append(encrypted)
            key_index += 1
        else:
            result.append(ch)

    ciphertext = "".join(result)

    return {
        "ciphertext": ciphertext,
        "key": key,
        "key_length": len(key),
        "algorithm": "Vigenère Cipher",
    }


def decrypt(ciphertext: str, key: str = "SECRET") -> dict:
    """Decrypt by subtracting the key shifts."""
    key = key.upper().strip()
    if not key or not key.isalpha():
        raise ValueError("Key must contain only alphabetic characters.")

    result = []
    key_index = 0

    for ch in ciphertext:
        if ch.isalpha():
            shift = ord(key[key_index % len(key)]) - ord('A')
            base = ord('A') if ch.isupper() else ord('a')
            decrypted = chr((ord(ch) - base - shift) % ALPHABET_SIZE + base)
            result.append(decrypted)
            key_index += 1
        else:
            result.append(ch)

    return {
        "ciphertext": "".join(result),
        "key": key,
        "algorithm": "Vigenère Cipher (decrypt)",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "vigenere",
    "name": "Vigenere Cipher",
    "category": "Classical Ciphers",
    "difficulty": 2,
    "complexity": "O(n)",
    "description": "A method of encrypting alphabetic text by using a series of interwoven Caesar ciphers based on the letters of a keyword.",
    "parameters": ["key"],
    "encrypt_fn": encrypt,
    "decrypt_fn": decrypt,
}
