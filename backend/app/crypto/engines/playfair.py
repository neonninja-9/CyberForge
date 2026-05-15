"""
CryptoForge Engine — Playfair Cipher

A manual symmetric encryption technique that encrypts pairs of letters
(digraphs) using a 5×5 key matrix, significantly harder to break than
simple substitution ciphers.

First-principle implementation — no cryptographic libraries used.

How it works:
  1. Build a 5×5 grid from the keyword (I/J merged, no duplicates).
  2. Split plaintext into digraphs (pairs). Insert 'X' between duplicate
     letters and pad with 'X' if odd length.
  3. For each pair, apply Playfair rules:
     - Same row:    shift right (wrap around).
     - Same column: shift down (wrap around).
     - Rectangle:   swap columns.

Category: Classical Ciphers | Difficulty: 3/5 | Complexity: O(n)
"""

GRID_SIZE = 5


def _build_grid(key: str) -> list:
    """Build the 5×5 Playfair grid from a keyword."""
    key = key.upper().replace("J", "I")
    seen = set()
    ordered = []

    # Add key characters first (deduplicated)
    for ch in key:
        if ch.isalpha() and ch not in seen:
            seen.add(ch)
            ordered.append(ch)

    # Fill remaining alphabet (I/J merged)
    for ch in "ABCDEFGHIKLMNOPQRSTUVWXYZ":  # no J
        if ch not in seen:
            seen.add(ch)
            ordered.append(ch)

    # Build 5×5 grid
    return [ordered[i * GRID_SIZE : (i + 1) * GRID_SIZE] for i in range(GRID_SIZE)]


def _find_position(grid: list, char: str) -> tuple:
    """Find (row, col) of a character in the grid."""
    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            if grid[r][c] == char:
                return (r, c)
    raise ValueError(f"Character '{char}' not found in grid")


def _prepare_digraphs(text: str) -> list:
    """
    Prepare plaintext into digraphs:
    - Convert to uppercase, replace J with I
    - Insert X between duplicate letters in a pair
    - Pad with X if odd number of letters
    """
    clean = []
    for ch in text.upper():
        if ch.isalpha():
            clean.append("I" if ch == "J" else ch)

    # Build digraphs, inserting X between duplicates
    digraphs = []
    i = 0
    while i < len(clean):
        a = clean[i]
        if i + 1 < len(clean):
            b = clean[i + 1]
            if a == b:
                digraphs.append((a, "X"))
                i += 1  # only advance by 1
            else:
                digraphs.append((a, b))
                i += 2
        else:
            digraphs.append((a, "X"))  # pad odd length
            i += 1

    return digraphs


def _encrypt_pair(grid: list, a: str, b: str) -> tuple:
    """Encrypt a single digraph using Playfair rules."""
    r1, c1 = _find_position(grid, a)
    r2, c2 = _find_position(grid, b)

    if r1 == r2:
        # Same row → shift right
        return grid[r1][(c1 + 1) % GRID_SIZE], grid[r2][(c2 + 1) % GRID_SIZE]
    elif c1 == c2:
        # Same column → shift down
        return grid[(r1 + 1) % GRID_SIZE][c1], grid[(r2 + 1) % GRID_SIZE][c2]
    else:
        # Rectangle → swap columns
        return grid[r1][c2], grid[r2][c1]


def _decrypt_pair(grid: list, a: str, b: str) -> tuple:
    """Decrypt a single digraph (reverse of encrypt)."""
    r1, c1 = _find_position(grid, a)
    r2, c2 = _find_position(grid, b)

    if r1 == r2:
        return grid[r1][(c1 - 1) % GRID_SIZE], grid[r2][(c2 - 1) % GRID_SIZE]
    elif c1 == c2:
        return grid[(r1 - 1) % GRID_SIZE][c1], grid[(r2 - 1) % GRID_SIZE][c2]
    else:
        return grid[r1][c2], grid[r2][c1]


def encrypt(text: str, key: str = "MONARCHY") -> dict:
    """
    Encrypt text using the Playfair cipher.

    Args:
        text: Plaintext to encrypt.
        key:  Keyword to build the 5×5 grid.
    """
    grid = _build_grid(key)
    digraphs = _prepare_digraphs(text)

    encrypted_pairs = []
    for a, b in digraphs:
        ea, eb = _encrypt_pair(grid, a, b)
        encrypted_pairs.append(ea + eb)

    ciphertext = " ".join(encrypted_pairs)
    grid_display = "\n".join(" ".join(row) for row in grid)

    return {
        "ciphertext": ciphertext,
        "key": key.upper(),
        "digraphs": " ".join(f"{a}{b}" for a, b in digraphs),
        "grid": grid_display,
        "algorithm": "Playfair Cipher",
    }


def decrypt(ciphertext: str, key: str = "MONARCHY") -> dict:
    """Decrypt Playfair ciphertext."""
    grid = _build_grid(key)
    clean = [ch for ch in ciphertext.upper() if ch.isalpha()]

    # Build pairs
    pairs = [(clean[i], clean[i + 1]) for i in range(0, len(clean) - 1, 2)]

    decrypted = []
    for a, b in pairs:
        da, db = _decrypt_pair(grid, a, b)
        decrypted.append(da + db)

    return {
        "ciphertext": " ".join(decrypted),
        "key": key.upper(),
        "algorithm": "Playfair Cipher (decrypt)",
    }


# ─── Algorithm Registration ─────────────────────────────────────────────────

ALGORITHM = {
    "id": "playfair",
    "name": "Playfair Cipher",
    "category": "Classical Ciphers",
    "difficulty": 3,
    "complexity": "O(n)",
    "description": "A manual symmetric encryption technique that encrypts pairs of letters instead of single letters.",
    "parameters": ["key"],
    "encrypt_fn": encrypt,
    "decrypt_fn": decrypt,
}
