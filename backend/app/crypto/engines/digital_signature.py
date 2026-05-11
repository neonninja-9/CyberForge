"""
CryptoForge Engine — Digital Signature (RSA-based)

A digital signature proves that a message was created by a known sender
and was not altered in transit. This implements RSA signing.

First-principle implementation — no cryptographic libraries used.

╔════════════════════════════════════════════════════════════════╗
║  HOW RSA DIGITAL SIGNATURES WORK                              ║
║                                                                ║
║  SIGNING (sender, using private key):                          ║
║    1. Hash the message → h = hash(message)                     ║
║    2. Sign the hash   → sig = h^d mod n                        ║
║    3. Send (message, sig) to the receiver                      ║
║                                                                ║
║  VERIFICATION (receiver, using public key):                    ║
║    1. Hash the received message → h' = hash(message)           ║
║    2. Recover hash from sig     → h  = sig^e mod n             ║
║    3. Compare: if h == h', signature is valid                  ║
║                                                                ║
║  Security: only the private key holder can produce a valid     ║
║  signature, but anyone with the public key can verify it.      ║
╚════════════════════════════════════════════════════════════════╝

Category: Asymmetric | Difficulty: 4/5 | Complexity: O(n³)
"""
import random


# ─── Math primitives (same as RSA engine) ──────────────────────────────────

def _gcd(a, b):
    while b: a, b = b, a % b
    return a

def _mod_inverse(a, m):
    """Extended Euclidean: find d where (a×d) mod m == 1."""
    old_r, r = a, m
    old_s, s = 1, 0
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
    return old_s % m

def _mod_pow(base, exp, mod):
    """Repeated squaring for fast modular exponentiation."""
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1: result = result * base % mod
        exp >>= 1
        base = base * base % mod
    return result

def _is_probable_prime(n, k=20):
    if n < 4: return n >= 2
    if n % 2 == 0: return False
    r, d = 0, n - 1
    while d % 2 == 0: r += 1; d //= 2
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = _mod_pow(a, d, n)
        if x in (1, n - 1): continue
        for _ in range(r - 1):
            x = _mod_pow(x, 2, n)
            if x == n - 1: break
        else: return False
    return True

def _generate_prime(bits):
    while True:
        n = random.getrandbits(bits) | (1 << (bits-1)) | 1
        if _is_probable_prime(n): return n


# ─── Simple hash (DJB2 — for signing demo, not cryptographic strength) ─────

def _simple_hash(message: str) -> int:
    """
    DJB2 hash — a fast, non-cryptographic hash function.

    Used here to demonstrate the signing workflow.
    In production, you'd use SHA-256 (see sha256 engine).

    Algorithm:
      hash = 5381
      for each byte: hash = hash × 33 + byte
    """
    h = 5381
    for ch in message.encode('utf-8'):
        h = ((h << 5) + h + ch) & 0xFFFFFFFFFFFFFFFF  # h * 33 + ch, 64-bit
    return h


# ─── RSA key generation ────────────────────────────────────────────────────

def _generate_keypair(bits=256):
    """Generate a small RSA key pair for signing demo."""
    p = _generate_prime(bits // 2)
    q = _generate_prime(bits // 2)
    while p == q: q = _generate_prime(bits // 2)
    n = p * q
    phi = (p - 1) * (q - 1)
    e = 65537
    if _gcd(e, phi) != 1:
        e = 3
        while _gcd(e, phi) != 1: e += 2
    d = _mod_inverse(e, phi)
    return {"n": n, "e": e, "d": d}


# ─── Sign & Verify ─────────────────────────────────────────────────────────

def sign(message: str, d: int, n: int) -> int:
    """
    Sign a message: signature = hash(message)^d mod n

    The private key (d) is used, so only the key owner can sign.
    """
    h = _simple_hash(message)
    h = h % n  # Ensure hash fits within modulus
    return _mod_pow(h, d, n)


def verify(message: str, signature: int, e: int, n: int) -> bool:
    """
    Verify a signature: recovered_hash = signature^e mod n

    The public key (e) is used, so anyone can verify.
    Compare recovered hash with freshly computed hash.
    """
    h = _simple_hash(message)
    h = h % n
    recovered = _mod_pow(signature, e, n)
    return recovered == h


def encrypt(text: str) -> dict:
    """
    Demonstrate digital signing: generate keys, sign the input, verify.

    Steps shown:
    1. Generate RSA key pair
    2. Hash the message
    3. Sign with private key
    4. Verify with public key
    """
    # Step 1: Generate key pair
    keys = _generate_keypair(256)

    # Step 2: Hash the message
    msg_hash = _simple_hash(text) % keys["n"]

    # Step 3: Sign with private key (d)
    signature = sign(text, keys["d"], keys["n"])

    # Step 4: Verify with public key (e)
    is_valid = verify(text, signature, keys["e"], keys["n"])

    # Step 5: Tamper test — modify message and verify again
    tampered_valid = verify(text + "!", signature, keys["e"], keys["n"])

    return {
        "output": f"Signature {'VALID ✓' if is_valid else 'INVALID ✗'}",
        "message_hash": str(msg_hash),
        "signature": str(signature)[:60] + "...",
        "verified": is_valid,
        "tamper_test": f"Modified message → {'VALID (bad!)' if tampered_valid else 'INVALID ✓ (tamper detected)'}",
        "key_bits": keys["n"].bit_length(),
        "algorithm": "Digital Signature (RSA)",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "digital-signature",
    "name": "Digital Signature",
    "category": "Asymmetric",
    "difficulty": 4,
    "complexity": "O(n³)",
    "description": "A mathematical scheme for verifying the authenticity of digital messages or documents.",
    "parameters": [],
    "encrypt_fn": encrypt,
}
