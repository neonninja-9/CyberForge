"""
CryptoForge Engine — Autokey Cipher

A strengthened Vigenère variant where the plaintext itself extends the key,
eliminating the periodic weakness of the basic Vigenère cipher.

First-principle implementation — no cryptographic libraries used.

╔═══════════════════════════════════════════════════════════════╗
║  HOW AUTOKEY WORKS                                            ║
║                                                               ║
║  Given primer "KEY" and plaintext "HELLO":                    ║
║                                                               ║
║  Key stream:  K  E  Y  H  E      ← primer + plaintext        ║
║  Plaintext:   H  E  L  L  O                                  ║
║  Encryption:  (H+K) (E+E) (L+Y) (L+H) (O+E) mod 26          ║
║  Ciphertext:  R  I  J  S  S                                  ║
║                                                               ║
║  Unlike Vigenère, the key never repeats — each plaintext      ║
║  letter becomes part of the key for subsequent letters.       ║
╚═══════════════════════════════════════════════════════════════╝

Category: Classical Ciphers | Difficulty: 2/5 | Complexity: O(n)
"""

ALPHABET_SIZE = 26


def encrypt(text: str, key: str = "SECRET") -> dict:
    """
    Encrypt text using the Autokey cipher.

    Args:
        text: Plaintext to encrypt.
        key:  Primer keyword (alphabetic only).
    """
    key = key.upper().strip()
    if not key or not key.isalpha():
        raise ValueError("Key must contain only alphabetic characters.")

    # Key stream starts with the primer, then extends with plaintext letters
    key_stream = list(key)
    result = []
    alpha_index = 0  # tracks position in key_stream (only alpha chars advance)

    for ch in text:
        if ch.isalpha():
            # Get the shift from the current key stream position
            k = ord(key_stream[alpha_index]) - ord("A")

            # Preserve original case
            base = ord("A") if ch.isupper() else ord("a")
            plain_val = ord(ch.upper()) - ord("A")

            # Encrypt: E(p) = (p + k) mod 26
            encrypted = chr((plain_val + k) % ALPHABET_SIZE + base)
            result.append(encrypted)

            # Extend key stream with the PLAINTEXT letter (not the ciphertext)
            # This is the defining feature of Autokey
            key_stream.append(ch.upper())
            alpha_index += 1
        else:
            # Non-alpha characters pass through unchanged
            result.append(ch)

    ciphertext = "".join(result)

    return {
        "ciphertext": ciphertext,
        "primer": key,
        "full_key_preview": "".join(key_stream[:20])
        + ("..." if len(key_stream) > 20 else ""),
        "algorithm": "Autokey Cipher",
    }


def decrypt(ciphertext: str, key: str = "SECRET") -> dict:
    """
    Decrypt: recover plaintext letter by letter, extending the key as we go.

    The key difference from encryption: we extend the key stream with the
    RECOVERED plaintext (not the ciphertext), so we decrypt one letter at a time.
    """
    key = key.upper().strip()
    if not key or not key.isalpha():
        raise ValueError("Key must contain only alphabetic characters.")

    key_stream = list(key)
    result = []
    alpha_index = 0

    for ch in ciphertext:
        if ch.isalpha():
            # Get shift from key stream
            k = ord(key_stream[alpha_index]) - ord("A")

            # Preserve original case
            base = ord("A") if ch.isupper() else ord("a")
            cipher_val = ord(ch.upper()) - ord("A")

            # Decrypt: D(c) = (c - k) mod 26
            plain_val = (cipher_val - k) % ALPHABET_SIZE
            decrypted = chr(plain_val + base)
            result.append(decrypted)

            # Extend key stream with the RECOVERED plaintext letter
            key_stream.append(chr(plain_val + ord("A")))
            alpha_index += 1
        else:
            result.append(ch)

    return {
        "ciphertext": "".join(result),
        "primer": key,
        "algorithm": "Autokey Cipher (decrypt)",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "autokey",
    "name": "Autokey Cipher",
    "category": "Classical Ciphers",
    "difficulty": 2,
    "complexity": "O(n)",
    "description": "A cipher that incorporates the plaintext into the key to avoid the periodicity vulnerabilities of Vigenère.",
    "parameters": ["key"],
    "encrypt_fn": encrypt,
    "decrypt_fn": decrypt,
}
