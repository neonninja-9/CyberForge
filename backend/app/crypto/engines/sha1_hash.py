"""
CryptoForge Engine — SHA-1

SHA-1 (Secure Hash Algorithm 1) produces a 160-bit (20-byte) hash digest.
While deprecated for security-critical use (collision attacks exist since 2017),
it remains an excellent algorithm to study how cryptographic hash functions work.

First-principle implementation — no cryptographic libraries used.

╔═══════════════════════════════════════════════════════════════════╗
║  HOW SHA-1 WORKS (Merkle-Damgård construction)                   ║
║                                                                   ║
║  1. PADDING                                                       ║
║     - Append a '1' bit, then '0' bits until length ≡ 448 mod 512 ║
║     - Append original message length as 64-bit big-endian integer ║
║     - Result is always a multiple of 512 bits (64 bytes)          ║
║                                                                   ║
║  2. INITIAL HASH VALUES (h0–h4)                                   ║
║     - Five 32-bit words set to specific constants                 ║
║                                                                   ║
║  3. PROCESS EACH 512-BIT BLOCK                                    ║
║     a. Split block into 16 × 32-bit words (W[0..15])              ║
║     b. Extend to 80 words: W[i] = rotate_left(W[i-3] ^ W[i-8]    ║
║                              ^ W[i-14] ^ W[i-16], 1)              ║
║     c. Run 80 rounds of mixing with round-specific functions      ║
║     d. Add the compressed chunk to the running hash               ║
║                                                                   ║
║  4. OUTPUT                                                         ║
║     - Concatenate h0–h4 as 40-character hex string                ║
╚═══════════════════════════════════════════════════════════════════╝

Category: Hash Functions | Difficulty: 3/5 | Complexity: O(n)
"""

# ─── Bit manipulation helpers ───────────────────────────────────────────────

MASK_32 = 0xFFFFFFFF  # Keep values within 32 bits


def _left_rotate(n: int, b: int) -> int:
    """
    Circular left rotation of a 32-bit integer by b positions.

    Bits that "fall off" the left end wrap around to the right.
    Example: rotate_left(0b1100_0000...0001, 2) = 0b0000_0000...0110
    """
    return ((n << b) | (n >> (32 - b))) & MASK_32


# ─── SHA-1 round constants ─────────────────────────────────────────────────

# Each set of 20 rounds uses a different constant (derived from square roots)
K = [
    0x5A827999,  # Rounds  0-19: floor(2^30 × √2)
    0x6ED9EBA1,  # Rounds 20-39: floor(2^30 × √3)
    0x8F1BBCDC,  # Rounds 40-59: floor(2^30 × √5)
    0xCA62C1D6,  # Rounds 60-79: floor(2^30 × √10)
]

# Initial hash values (h0 through h4)
# These are fixed constants defined by the SHA-1 specification
H0_INIT = 0x67452301
H1_INIT = 0xEFCDAB89
H2_INIT = 0x98BADCFE
H3_INIT = 0x10325476
H4_INIT = 0xC3D2E1F0


def _pad_message(message_bytes: bytes) -> bytes:
    """
    Pad the message to a multiple of 512 bits (64 bytes).

    SHA-1 padding rules:
    1. Append byte 0x80 (a '1' bit followed by seven '0' bits)
    2. Append zero bytes until total length ≡ 56 mod 64
       (leaving room for the 8-byte length field)
    3. Append the original message length in bits as a 64-bit big-endian integer
    """
    original_length_bits = len(message_bytes) * 8

    # Step 1: Append the 0x80 byte
    message_bytes += b'\x80'

    # Step 2: Pad with zeros until length ≡ 56 mod 64
    # We need (current_length % 64) == 56
    while len(message_bytes) % 64 != 56:
        message_bytes += b'\x00'

    # Step 3: Append original length as 64-bit big-endian
    message_bytes += original_length_bits.to_bytes(8, byteorder='big')

    return message_bytes


def _sha1_compress(block: bytes, h0: int, h1: int, h2: int, h3: int, h4: int) -> tuple:
    """
    Process one 512-bit (64-byte) block through the SHA-1 compression function.

    This is the core of SHA-1: 80 rounds of bitwise mixing.
    """
    # ── Step A: Parse block into 16 × 32-bit big-endian words ──
    W = []
    for i in range(16):
        word = int.from_bytes(block[i*4:(i+1)*4], byteorder='big')
        W.append(word)

    # ── Step B: Extend from 16 words to 80 words ──
    # Each new word is derived from four previous words, XORed and rotated.
    # This "diffuses" small input changes across all 80 rounds.
    for i in range(16, 80):
        W.append(_left_rotate(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1))

    # ── Step C: Initialize working variables from current hash state ──
    a, b, c, d, e = h0, h1, h2, h3, h4

    # ── Step D: 80 rounds of compression ──
    for i in range(80):
        if 0 <= i <= 19:
            # Rounds 0-19: Ch (choice) function
            # "If b then c, else d" — b selects between c and d bit-by-bit
            f = (b & c) | ((~b) & d)
            k = K[0]
        elif 20 <= i <= 39:
            # Rounds 20-39: Parity function
            # Simple XOR — measures whether an odd number of bits are set
            f = b ^ c ^ d
            k = K[1]
        elif 40 <= i <= 59:
            # Rounds 40-59: Majority function
            # "At least 2 of 3 bits are set"
            f = (b & c) | (b & d) | (c & d)
            k = K[2]
        else:
            # Rounds 60-79: Parity again
            f = b ^ c ^ d
            k = K[3]

        # The main mixing step: combine everything and rotate
        temp = (_left_rotate(a, 5) + f + e + k + W[i]) & MASK_32
        e = d
        d = c
        c = _left_rotate(b, 30)  # Rotate b by 30 before storing as c
        b = a
        a = temp

    # ── Step E: Add compressed values back to the hash state ──
    # This addition is what makes the hash a one-way function
    h0 = (h0 + a) & MASK_32
    h1 = (h1 + b) & MASK_32
    h2 = (h2 + c) & MASK_32
    h3 = (h3 + d) & MASK_32
    h4 = (h4 + e) & MASK_32

    return h0, h1, h2, h3, h4


def sha1_hash(data: str) -> str:
    """
    Compute the SHA-1 hash of a string.

    Returns a 40-character hexadecimal digest (160 bits).
    """
    # Convert string to bytes
    message = data.encode('utf-8')

    # Pad message to multiple of 512 bits
    padded = _pad_message(message)

    # Initialize hash state with the SHA-1 constants
    h0, h1, h2, h3, h4 = H0_INIT, H1_INIT, H2_INIT, H3_INIT, H4_INIT

    # Process each 512-bit (64-byte) block
    for offset in range(0, len(padded), 64):
        block = padded[offset:offset + 64]
        h0, h1, h2, h3, h4 = _sha1_compress(block, h0, h1, h2, h3, h4)

    # Concatenate the five 32-bit hash values into a 160-bit digest
    digest = ''.join(f'{x:08x}' for x in [h0, h1, h2, h3, h4])
    return digest


def encrypt(text: str) -> dict:
    """
    Compute SHA-1 hash of the input text.

    Note: Hashing is a one-way function — there is no "decrypt".
    The same input always produces the same hash, but you can't
    recover the input from the hash.
    """
    digest = sha1_hash(text)

    return {
        "hash": digest,
        "input_length": len(text),
        "digest_bits": 160,
        "algorithm": "SHA-1",
        "warning": "SHA-1 is deprecated for security use — collisions found in 2017.",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "sha1",
    "name": "SHA-1",
    "category": "Hash Functions",
    "difficulty": 3,
    "complexity": "O(n)",
    "description": "A cryptographic hash function which takes an input and produces a 160-bit hash value known as a message digest.",
    "parameters": [],
    "encrypt_fn": encrypt,
}
