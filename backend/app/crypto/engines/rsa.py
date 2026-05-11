"""
CryptoForge Engine — RSA-2048

RSA (Rivest-Shamir-Adleman) is the foundational public-key cryptosystem.
Security relies on the difficulty of factoring large semiprimes.

First-principle implementation — no cryptographic libraries used.

Key Generation:
  1. Pick two large primes p and q
  2. n = p × q (modulus), φ(n) = (p-1)(q-1) (Euler's totient)
  3. Choose e coprime with φ(n) (commonly 65537)
  4. d = e⁻¹ mod φ(n) (private key via Extended Euclidean)

Encryption:  c = m^e mod n  |  Decryption: m = c^d mod n

Category: Asymmetric | Difficulty: 5/5 | Complexity: O(n³)
"""
import random

def _gcd(a, b):
    while b: a, b = b, a % b
    return a

def _mod_inverse(a, m):
    """Extended Euclidean Algorithm: find d where (a×d) mod m == 1."""
    if _gcd(a, m) != 1:
        raise ValueError(f"No inverse: gcd({a},{m})!=1")
    old_r, r = a, m
    old_s, s = 1, 0
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
    return old_s % m

def _mod_pow(base, exp, mod):
    """Fast modular exponentiation via repeated squaring: O(log exp)."""
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1: result = result * base % mod
        exp >>= 1
        base = base * base % mod
    return result

def _is_probable_prime(n, k=20):
    """Miller-Rabin: probabilistic primality test with k witnesses."""
    if n < 4: return n >= 2
    if n % 2 == 0: return False
    # Write n-1 = 2^r × d
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
    """Generate a random prime with given bit length."""
    while True:
        n = random.getrandbits(bits) | (1 << (bits-1)) | 1
        if _is_probable_prime(n): return n

def generate_keypair(bits=512):
    """Generate RSA key pair: public (n,e) and private (n,d)."""
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
    return {"public_key": {"n": n, "e": e}, "private_key": {"n": n, "d": d},
            "p": p, "q": q, "phi": phi, "bits": bits}

def encrypt(bits: int = 512) -> dict:
    """Generate key pair and demo encrypt/decrypt a sample number."""
    bits = min(int(bits), 1024)
    keys = generate_keypair(bits)
    pub, priv = keys["public_key"], keys["private_key"]
    msg = 42
    ct = _mod_pow(msg, pub["e"], pub["n"])
    pt = _mod_pow(ct, priv["d"], priv["n"])
    return {
        "output": f"RSA key pair generated ({bits}-bit)",
        "public_key_e": pub["e"], "public_key_n_bits": pub["n"].bit_length(),
        "sample_plaintext": msg, "sample_ciphertext": str(ct)[:60]+"...",
        "sample_decrypted": pt, "verified": msg == pt,
        "algorithm": "RSA",
    }

ALGORITHM = {
    "id": "rsa-2048", "name": "RSA-2048", "category": "Asymmetric",
    "difficulty": 5, "complexity": "O(n³)",
    "description": "Rivest-Shamir-Adleman public-key cryptosystem for secure key exchange and digital signatures.",
    "parameters": ["bits"], "encrypt_fn": encrypt,
}
