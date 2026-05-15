"""
CryptoForge Engine — AES-256

Advanced Encryption Standard with 256-bit key — the gold standard for symmetric encryption.
Category: Symmetric | Difficulty: 4/5 | Complexity: O(1) per block
"""
import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

def encrypt(plaintext: str, key_size: int = 256, mode: str = "CBC", output_format: str = "hex") -> dict:
    """
    Implement AES-256 logic here.

    Return a dict with at least a "result" key containing the output.
    Example: {"result": "<encrypted_text>", "details": {...}}
    """
    key_bytes = key_size // 8
    key = os.urandom(key_bytes)

    backend = default_backend()

    if mode == "CBC":
        iv = os.urandom(16)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
        encryptor = cipher.encryptor()

        padder = padding.PKCS7(algorithms.AES.block_size).padder()
        padded_data = padder.update(plaintext.encode('utf-8')) + padder.finalize()

        ciphertext = encryptor.update(padded_data) + encryptor.finalize()

        if output_format == "hex":
            return {
                "result": ciphertext.hex(),
                "ciphertext": ciphertext.hex(),
                "key": key.hex(),
                "iv": iv.hex(),
                "mode": mode,
                "algorithm": "AES"
            }
        elif output_format == "base64":
            return {
                "result": base64.b64encode(ciphertext).decode('utf-8'),
                "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
                "key": base64.b64encode(key).decode('utf-8'),
                "iv": base64.b64encode(iv).decode('utf-8'),
                "mode": mode,
                "algorithm": "AES"
            }
        else:
            raise ValueError(f"Unsupported output format: {output_format}")

    elif mode == "ECB":
        cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=backend)
        encryptor = cipher.encryptor()

        padder = padding.PKCS7(algorithms.AES.block_size).padder()
        padded_data = padder.update(plaintext.encode('utf-8')) + padder.finalize()

        ciphertext = encryptor.update(padded_data) + encryptor.finalize()

        if output_format == "hex":
            return {
                "result": ciphertext.hex(),
                "ciphertext": ciphertext.hex(),
                "key": key.hex(),
                "mode": mode,
                "algorithm": "AES"
            }
        elif output_format == "base64":
            return {
                "result": base64.b64encode(ciphertext).decode('utf-8'),
                "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
                "key": base64.b64encode(key).decode('utf-8'),
                "mode": mode,
                "algorithm": "AES"
            }
        else:
            raise ValueError(f"Unsupported output format: {output_format}")

    elif mode == "GCM":
        nonce = os.urandom(12) # GCM standard nonce size is 12 bytes
        cipher = Cipher(algorithms.AES(key), modes.GCM(nonce), backend=backend)
        encryptor = cipher.encryptor()

        ciphertext = encryptor.update(plaintext.encode('utf-8')) + encryptor.finalize()
        tag = encryptor.tag

        if output_format == "hex":
            return {
                "result": ciphertext.hex(),
                "ciphertext": ciphertext.hex(),
                "key": key.hex(),
                "nonce": nonce.hex(),
                "tag": tag.hex(),
                "mode": mode,
                "algorithm": "AES"
            }
        elif output_format == "base64":
            return {
                "result": base64.b64encode(ciphertext).decode('utf-8'),
                "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
                "key": base64.b64encode(key).decode('utf-8'),
                "nonce": base64.b64encode(nonce).decode('utf-8'),
                "tag": base64.b64encode(tag).decode('utf-8'),
                "mode": mode,
                "algorithm": "AES"
            }
        else:
            raise ValueError(f"Unsupported output format: {output_format}")
    else:
        raise ValueError(f"Unsupported mode: {mode}")

def decrypt(ciphertext_hex: str, key_hex: str, mode: str = "CBC",
            iv_hex: str = None, nonce_hex: str = None, tag_hex: str = None,
            input_format: str = "hex") -> dict:
    """Implement AES decryption logic here."""
    try:
        def decode_val(val: str) -> bytes:
            if not val:
                return None
            if input_format == "hex":
                return bytes.fromhex(val)
            elif input_format == "base64":
                return base64.b64decode(val)
            else:
                raise ValueError(f"Unsupported input format: {input_format}")

        key = decode_val(key_hex)
        ciphertext = decode_val(ciphertext_hex)
        backend = default_backend()

        if mode == "CBC":
            if not iv_hex:
                raise ValueError("IV is required for CBC mode")
            iv = decode_val(iv_hex)

            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
            decryptor = cipher.decryptor()

            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

            unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
            plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()

            return {"result": plaintext.decode('utf-8'), "plaintext": plaintext.decode('utf-8'), "algorithm": "AES"}

        elif mode == "ECB":
            cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=backend)
            decryptor = cipher.decryptor()

            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

            unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
            plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()

            return {"result": plaintext.decode('utf-8'), "plaintext": plaintext.decode('utf-8'), "algorithm": "AES"}

        elif mode == "GCM":
            if not nonce_hex or not tag_hex:
                raise ValueError("Nonce and Tag are required for GCM mode")
            nonce = decode_val(nonce_hex)
            tag = decode_val(tag_hex)

            cipher = Cipher(algorithms.AES(key), modes.GCM(nonce, tag), backend=backend)
            decryptor = cipher.decryptor()

            plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            return {"result": plaintext.decode('utf-8'), "plaintext": plaintext.decode('utf-8'), "algorithm": "AES"}

        else:
            raise ValueError(f"Unsupported mode: {mode}")
    except ValueError as e:
        return {"error": str(e), "algorithm": "AES"}
    except Exception as e:
        return {"error": f"Decryption failed: {str(e)}", "algorithm": "AES"}

# ─── Algorithm Registration ─────────────────────────────────────────────────
# This dict is auto-discovered by the engine loader. Just define it and the
# algorithm will appear in the Explore page and be available in the Lab.

ALGORITHM = {
    "id": "aes-256",
    "name": "AES-256",
    "category": "Symmetric",
    "difficulty": 4,
    "complexity": "O(1) per block",
    "description": "Advanced Encryption Standard with 256-bit key — the gold standard for symmetric encryption.",
    "parameters": ["key_size", "mode", "output_format"],
    "encrypt_fn": encrypt,
    "decrypt_fn": decrypt,
}
