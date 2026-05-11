# Adding a New Algorithm

This folder contains the backend algorithm engine layer for CryptoForge.

## Architecture

```
crypto/
├── registry.py              # Auto-discovers all engines (you never edit this)
└── engines/
    ├── __init__.py           # Auto-discovery loader
    ├── _base.py              # Shared helpers
    ├── aes.py                # One file per algorithm
    ├── caesar.py
    ├── sha256.py
    └── your_new_algo.py      # ← Just create this file!
```

## Quick Start — Add a New Algorithm in One File

**1. Create a new file** in `engines/`, e.g. `engines/my_cipher.py`:

```python
"""
CryptoForge Engine — My Cipher

A brief description of what this algorithm does.
Category: Classical Ciphers | Difficulty: 2/5 | Complexity: O(n)
"""
from ._base import not_implemented


def encrypt(text: str, key: int = 5) -> dict:
    """
    Implement your algorithm here.
    Return a dict with a "result" key containing the output.
    """
    # Your implementation goes here
    result = ""
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - base + key) % 26 + base)
        else:
            result += char

    return {
        "ciphertext": result,
        "key": key,
        "algorithm": "My Cipher",
    }


# ─── Algorithm Registration ─────────────────────────────────
# This dict is auto-discovered. Just define it and the algorithm
# will appear in Explore and be available in the Lab.

ALGORITHM = {
    "id": "my-cipher",
    "name": "My Cipher",
    "category": "Classical Ciphers",
    "difficulty": 2,
    "complexity": "O(n)",
    "description": "Short explanation shown on the Explore page.",
    "parameters": ["key"],
    "encrypt_fn": encrypt,
}
```

**2. That's it!** Restart the backend and your algorithm will appear automatically.

No imports to add. No registry to edit. No other files to touch.

## ALGORITHM Dict Fields

| Field         | Type     | Description                                         |
|---------------|----------|-----------------------------------------------------|
| `id`          | `str`    | URL-safe unique ID. Becomes `/lab/<id>`.             |
| `name`        | `str`    | Display name in Explore.                             |
| `category`    | `str`    | Category for filtering (see supported list below).   |
| `difficulty`  | `int`    | 1–5 difficulty rating.                               |
| `complexity`  | `str`    | Big-O or short runtime note.                         |
| `description` | `str`    | Text shown on the Explore card.                      |
| `parameters`  | `list`   | Names of values accepted from the UI/API.            |
| `encrypt_fn`  | `func`   | The Python function to execute.                      |

## Supported Categories

Explore has badge styles for these categories:

- `Symmetric`
- `Asymmetric`
- `Hash Functions`
- `Key Exchange`
- `Digital Signatures`
- `Classical Ciphers`
- `Math Functions`
- `Encoding`

New category names will still appear, but may not have a matching badge color.

## Return Values for Pipeline Compatibility

Pipeline execution looks for one of these keys in the result dict:

- `ciphertext`
- `hash`
- `hmac`
- `output`

Use one of those keys so the algorithm can be chained in pipelines:

```python
return {"ciphertext": encrypted, "algorithm": "AES"}
return {"hash": digest, "algorithm": "SHA-256"}
return {"output": encoded, "algorithm": "Base64 Encode"}
```

## How API Execution Works

```
POST /api/algorithms/{algorithm_id}/execute
```

```json
{
  "input": "hello",
  "params": { "key": "secret" },
  "output_format": "hex"
}
```

The backend calls: `encrypt(request.input, **params)`

## Testing Your Algorithm

```bash
# Verify the registry loads
python -c "from app.crypto.registry import ALGORITHMS; print(len(ALGORITHMS))"

# Check your algorithm is discovered
python -c "from app.crypto.registry import ALGORITHMS; print(ALGORITHMS['my-cipher']['name'])"
```

## Common Mistakes

- Using a filename starting with `_` (these are skipped by auto-discovery).
- Forgetting to define the `ALGORITHM` dict at module level.
- Using parameter names in `ALGORITHM["parameters"]` that don't match the function signature.
- Returning only custom keys instead of `ciphertext`, `hash`, `hmac`, or `output`.
