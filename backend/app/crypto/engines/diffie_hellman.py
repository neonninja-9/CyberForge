"""
CryptoForge Engine — Diffie-Hellman Key Exchange

Allows two parties to establish a shared secret over an insecure channel
without ever transmitting the secret itself. Foundation of modern key exchange.

First-principle implementation — no cryptographic libraries used.

╔════════════════════════════════════════════════════════════════╗
║  HOW DIFFIE-HELLMAN WORKS                                     ║
║                                                                ║
║  Public parameters: prime p, generator g                       ║
║                                                                ║
║  Alice:                        Bob:                            ║
║    picks private a               picks private b               ║
║    computes A = g^a mod p        computes B = g^b mod p        ║
║    sends A to Bob ──────────►    sends B to Alice              ║
║                   ◄──────────                                  ║
║    shared = B^a mod p            shared = A^b mod p            ║
║                                                                ║
║  Both compute the SAME shared secret:                          ║
║    B^a mod p = (g^b)^a mod p = g^(ab) mod p                   ║
║    A^b mod p = (g^a)^b mod p = g^(ab) mod p                   ║
║                                                                ║
║  An eavesdropper sees p, g, A, B but computing g^(ab) from     ║
║  those requires solving the Discrete Logarithm Problem (hard!) ║
╚════════════════════════════════════════════════════════════════╝

Category: Asymmetric | Difficulty: 4/5 | Complexity: O(n³)
"""

import secrets


def _mod_pow(base: int, exp: int, mod: int) -> int:
    """
    Fast modular exponentiation via repeated squaring.
    Computes base^exp mod mod in O(log exp) multiplications.
    """
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1:  # If exponent is odd, multiply into result
            result = result * base % mod
        exp >>= 1  # Halve exponent
        base = base * base % mod  # Square base
    return result


def _is_probable_prime(n: int, k: int = 20) -> bool:
    """Miller-Rabin primality test."""
    if n < 4:
        return n >= 2
    if n % 2 == 0:
        return False
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    for _ in range(k):
        a = secrets.SystemRandom().randrange(2, n - 1)
        x = _mod_pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = _mod_pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True


def _generate_prime(bits: int) -> int:
    """Generate a random prime of given bit length."""
    while True:
        n = secrets.SystemRandom().getrandbits(bits) | (1 << (bits - 1)) | 1
        if _is_probable_prime(n):
            return n


def encrypt(p: int = 0, g: int = 0, private_key: int = 0) -> dict:
    """
    Simulate a complete Diffie-Hellman key exchange.

    If p and g are not provided (or 0), generates safe parameters.
    Simulates both Alice and Bob's sides to demonstrate the protocol.

    Args:
        p:           Prime modulus (0 = auto-generate a 256-bit prime).
        g:           Generator (0 = use 2).
        private_key: Alice's private key (0 = auto-generate).
    """
    p, g, private_key = int(p), int(g), int(private_key)

    # ── Step 1: Set up public parameters ──
    if p == 0:
        # Generate a prime for the demo (256-bit for speed)
        p = _generate_prime(256)
    if g == 0:
        g = 2  # 2 is a common generator choice

    # ── Step 2: Alice's side ──
    # Alice picks a private key and computes her public value
    alice_private = (
        private_key if private_key > 0 else secrets.SystemRandom().randrange(2, p - 1)
    )
    alice_public = _mod_pow(g, alice_private, p)  # A = g^a mod p

    # ── Step 3: Bob's side ──
    # Bob picks his own private key and computes his public value
    bob_private = secrets.SystemRandom().randrange(2, p - 1)
    bob_public = _mod_pow(g, bob_private, p)  # B = g^b mod p

    # ── Step 4: Shared secret computation ──
    # Alice computes: shared = B^a mod p = g^(ba) mod p
    alice_shared = _mod_pow(bob_public, alice_private, p)

    # Bob computes: shared = A^b mod p = g^(ab) mod p
    bob_shared = _mod_pow(alice_public, bob_private, p)

    # Both should arrive at the same value!
    assert alice_shared == bob_shared, "Key exchange failed!"

    return {
        "output": f"Shared secret established ({p.bit_length()}-bit prime)",
        "prime_p_bits": p.bit_length(),
        "generator_g": g,
        "alice_public": str(alice_public)[:50] + "...",
        "bob_public": str(bob_public)[:50] + "...",
        "shared_secret": str(alice_shared)[:50] + "...",
        "secrets_match": alice_shared == bob_shared,
        "algorithm": "Diffie-Hellman Key Exchange",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "diffie-hellman",
    "name": "Diffie-Hellman Key Exchange",
    "category": "Asymmetric",
    "difficulty": 4,
    "complexity": "O(n³)",
    "description": "A method of securely exchanging cryptographic keys over a public channel.",
    "parameters": ["p", "g", "private_key"],
    "encrypt_fn": encrypt,
}
