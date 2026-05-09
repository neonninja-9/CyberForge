# Implementing Algorithms

This folder contains the backend algorithm engine layer for CryptoForge.

- `engines.py` contains the actual Python functions for each algorithm.
- `registry.py` exposes algorithm metadata and connects each algorithm id to its engine function.
- The Explore page calls `GET /api/algorithms`, which returns data from `registry.py`.

If an algorithm is implemented in `engines.py` but not registered in `registry.py`, it will not appear in Explore.

## 1. Implement the Engine Function

Open `engines.py` and find the placeholder function for the algorithm you want to implement.

Example:

```python
def caesar_encrypt(plaintext: str, shift: int = 3) -> dict:
    """Implement Caesar cipher encryption logic here."""
    _not_implemented("Caesar cipher encryption")
```

Replace the placeholder with your implementation:

```python
def caesar_encrypt(plaintext: str, shift: int = 3) -> dict:
    result = []

    for char in plaintext:
        # Add your algorithm logic here.
        result.append(char)

    return {
        "ciphertext": "".join(result),
        "shift": shift,
        "algorithm": "Caesar Cipher",
    }
```

Keep the function signature compatible with the API:

- Use the first argument for the user input. Common names are `plaintext`, `data`, or `text`.
- Add extra user-configurable values as keyword arguments, such as `shift`, `key`, `mode`, `a`, or `b`.
- Return a `dict`.

## 2. Return a Pipeline-Compatible Output

Pipeline execution looks for one of these keys in the result:

- `ciphertext`
- `hash`
- `hmac`
- `output`

Use one of those keys for the main result so the algorithm can be chained in pipelines.

Good examples:

```python
return {"ciphertext": encrypted_text, "algorithm": "Caesar Cipher"}
return {"hash": digest, "algorithm": "SHA-256"}
return {"output": encoded_text, "algorithm": "Base64 Encode"}
```

You can include extra metadata too:

```python
return {
    "ciphertext": encrypted_text,
    "key": key,
    "mode": mode,
    "algorithm": "AES",
}
```

## 3. Register the Algorithm

Open `registry.py`.

Import the engine function at the top:

```python
from app.crypto.engines import (
    caesar_encrypt,
    my_new_algorithm,
)
```

Then add or update an entry in `ALGORITHMS`:

```python
"my-new-algorithm": {
    "id": "my-new-algorithm",
    "name": "My New Algorithm",
    "category": "Classical Ciphers",
    "difficulty": 2,
    "complexity": "O(n)",
    "description": "Short explanation shown on the Explore page.",
    "parameters": ["key"],
    "encrypt_fn": my_new_algorithm,
},
```

The registry fields are:

- `id`: URL-safe unique id. This becomes `/lab/<id>`.
- `name`: Display name in Explore.
- `category`: Display category and filter group in Explore.
- `difficulty`: Number from `1` to `5`.
- `complexity`: Big-O or short runtime note.
- `description`: Text shown on the Explore card.
- `parameters`: Names of values accepted from the UI/API.
- `encrypt_fn`: The Python function from `engines.py`.

## 4. Choose a Supported Category

Explore already has badge styles for these categories:

- `Symmetric`
- `Asymmetric`
- `Hash Functions`
- `Key Exchange`
- `Digital Signatures`
- `Classical Ciphers`
- `Math Functions`
- `Encoding`

Using one of these keeps the UI styled correctly. New category names will still appear, but may not have a matching badge style.

## 5. How API Execution Passes Arguments

The execute endpoint is:

```text
POST /api/algorithms/{algorithm_id}/execute
```

Request shape:

```json
{
  "input": "hello",
  "params": {
    "key": "secret"
  },
  "output_format": "hex"
}
```

The backend calls your function like this:

```python
result = fn(request.input, **kwargs)
```

If your registry entry includes `output_format` in `parameters`, the backend also passes `request.output_format`.

Example:

```python
def sha256_hash(data: str, output_format: str = "hex") -> dict:
    ...
```

Registry:

```python
"parameters": ["output_format"]
```

## 6. Test Your Change

From the `backend` folder, run:

```bash
python -m py_compile app/crypto/engines.py app/crypto/registry.py app/routes/algorithms.py app/routes/pipelines.py
```

Check that the registry imports:

```bash
python - <<'PY'
from app.crypto.registry import ALGORITHMS
print(len(ALGORITHMS))
print(ALGORITHMS["caesar"]["encrypt_fn"].__name__)
PY
```

Start the backend and frontend, then open Explore. If the algorithm is registered, it should appear automatically.

## 7. Common Mistakes

- Implementing a function in `engines.py` but forgetting to import it in `registry.py`.
- Importing a function in `registry.py` but forgetting to add it to `ALGORITHMS`.
- Using parameter names in `registry.py` that do not match the function signature.
- Returning only custom keys instead of `ciphertext`, `hash`, `hmac`, or `output`.
- Raising `NotImplementedError` after adding the algorithm to Explore.
