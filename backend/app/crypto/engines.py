"""
CryptoForge — Cryptographic Algorithm Engines
Implements real cryptographic operations using PyCryptodome.
"""
import os
import base64
import hashlib
import hmac
from Crypto.Cipher import AES, Blowfish, DES3, ChaCha20 as ChaCha20Cipher
from Crypto.PublicKey import RSA
from Crypto.Util.Padding import pad, unpad


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode()


def _hex(data: bytes) -> str:
    return data.hex()


def _format_output(data: bytes, fmt: str = "hex") -> str:
    if fmt == "base64":
        return _b64(data)
    elif fmt == "raw":
        return data.decode("latin-1")
    return _hex(data)


# ── AES ──────────────────────────────────────────────────────

def aes_encrypt(plaintext: str, key_size: int = 256, mode: str = "CBC", output_format: str = "hex") -> dict:
    """Encrypt plaintext using AES."""
    key = os.urandom(key_size // 8)
    pt_bytes = plaintext.encode("utf-8")

    if mode == "ECB":
        cipher = AES.new(key, AES.MODE_ECB)
        ct = cipher.encrypt(pad(pt_bytes, AES.block_size))
        return {
            "ciphertext": _format_output(ct, output_format),
            "key": _hex(key),
            "mode": mode,
            "key_size": key_size,
        }
    elif mode == "CBC":
        iv = os.urandom(16)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        ct = cipher.encrypt(pad(pt_bytes, AES.block_size))
        return {
            "ciphertext": _format_output(ct, output_format),
            "key": _hex(key),
            "iv": _hex(iv),
            "mode": mode,
            "key_size": key_size,
        }
    elif mode == "CTR":
        cipher = AES.new(key, AES.MODE_CTR)
        ct = cipher.encrypt(pt_bytes)
        return {
            "ciphertext": _format_output(ct, output_format),
            "key": _hex(key),
            "nonce": _hex(cipher.nonce),
            "mode": mode,
            "key_size": key_size,
        }
    elif mode == "GCM":
        cipher = AES.new(key, AES.MODE_GCM)
        ct, tag = cipher.encrypt_and_digest(pt_bytes)
        return {
            "ciphertext": _format_output(ct, output_format),
            "key": _hex(key),
            "nonce": _hex(cipher.nonce),
            "tag": _hex(tag),
            "mode": mode,
            "key_size": key_size,
        }
    raise ValueError(f"Unsupported AES mode: {mode}")


def aes_decrypt(ciphertext_hex: str, key_hex: str, mode: str = "CBC", iv_hex: str = None, nonce_hex: str = None, tag_hex: str = None) -> dict:
    """Decrypt AES ciphertext."""
    ct = bytes.fromhex(ciphertext_hex)
    key = bytes.fromhex(key_hex)

    if mode == "ECB":
        cipher = AES.new(key, AES.MODE_ECB)
        pt = unpad(cipher.decrypt(ct), AES.block_size)
    elif mode == "CBC":
        iv = bytes.fromhex(iv_hex)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        pt = unpad(cipher.decrypt(ct), AES.block_size)
    elif mode == "CTR":
        nonce = bytes.fromhex(nonce_hex)
        cipher = AES.new(key, AES.MODE_CTR, nonce=nonce)
        pt = cipher.decrypt(ct)
    elif mode == "GCM":
        nonce = bytes.fromhex(nonce_hex)
        tag = bytes.fromhex(tag_hex)
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        pt = cipher.decrypt_and_verify(ct, tag)
    else:
        raise ValueError(f"Unsupported mode: {mode}")

    return {"plaintext": pt.decode("utf-8")}


# ── RSA ──────────────────────────────────────────────────────

def rsa_generate_keypair(bits: int = 2048) -> dict:
    """Generate an RSA key pair."""
    key = RSA.generate(bits)
    return {
        "public_key": key.publickey().export_key().decode(),
        "private_key": key.export_key().decode(),
        "bits": bits,
        "n": hex(key.n),
        "e": key.e,
    }


# ── SHA-256 ──────────────────────────────────────────────────

def sha256_hash(data: str, output_format: str = "hex") -> dict:
    """Compute SHA-256 hash."""
    h = hashlib.sha256(data.encode("utf-8")).digest()
    return {
        "hash": _format_output(h, output_format),
        "algorithm": "SHA-256",
        "input_length": len(data),
        "output_length": 256,
    }


# ── HMAC-SHA256 ──────────────────────────────────────────────

def hmac_sha256(data: str, key: str = None, output_format: str = "hex") -> dict:
    """Compute HMAC-SHA256."""
    if key is None:
        key = os.urandom(32).hex()
    h = hmac.new(key.encode(), data.encode(), hashlib.sha256).digest()
    return {
        "hmac": _format_output(h, output_format),
        "key": key,
        "algorithm": "HMAC-SHA256",
    }


# ── Caesar Cipher ────────────────────────────────────────────

def caesar_encrypt(plaintext: str, shift: int = 3) -> dict:
    """Encrypt using Caesar cipher."""
    result = []
    for ch in plaintext:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return {
        "ciphertext": "".join(result),
        "shift": shift,
        "algorithm": "Caesar Cipher",
    }


def caesar_decrypt(ciphertext: str, shift: int = 3) -> dict:
    """Decrypt Caesar cipher."""
    return caesar_encrypt(ciphertext, -shift)


# ── Blowfish ─────────────────────────────────────────────────

def blowfish_encrypt(plaintext: str, output_format: str = "hex") -> dict:
    """Encrypt using Blowfish."""
    key = os.urandom(16)
    iv = os.urandom(8)
    cipher = Blowfish.new(key, Blowfish.MODE_CBC, iv)
    ct = cipher.encrypt(pad(plaintext.encode(), Blowfish.block_size))
    return {
        "ciphertext": _format_output(ct, output_format),
        "key": _hex(key),
        "iv": _hex(iv),
        "algorithm": "Blowfish",
    }


# ── ChaCha20 ─────────────────────────────────────────────────

def chacha20_encrypt(plaintext: str, output_format: str = "hex") -> dict:
    """Encrypt using ChaCha20."""
    key = os.urandom(32)
    cipher = ChaCha20Cipher.new(key=key)
    ct = cipher.encrypt(plaintext.encode())
    return {
        "ciphertext": _format_output(ct, output_format),
        "key": _hex(key),
        "nonce": _hex(cipher.nonce),
        "algorithm": "ChaCha20",
    }


# ── Base64 / Hex Encoding ───────────────────────────────────

def base64_encode(data: str) -> dict:
    return {"output": _b64(data.encode()), "algorithm": "Base64 Encode"}


def base64_decode(data: str) -> dict:
    return {"output": base64.b64decode(data).decode(), "algorithm": "Base64 Decode"}


def hex_encode(data: str) -> dict:
    return {"output": data.encode().hex(), "algorithm": "Hex Encode"}


def hex_decode(data: str) -> dict:
    return {"output": bytes.fromhex(data).decode(), "algorithm": "Hex Decode"}


# ── ROT13 ────────────────────────────────────────────────────

def rot13(text: str) -> dict:
    import codecs
    return {"output": codecs.encode(text, "rot_13"), "algorithm": "ROT13"}




# ── Stubs for User Implementation ────────────────────────────

def vigenere(text: str, key: str) -> dict:
    """Implement Vigenere Cipher logic here."""
    return {"output": "Not implemented"}

def polybius(text: str) -> dict:
    """Implement Polybius Square logic here."""
    return {"output": "Not implemented"}

def des_encrypt(text: str, key: str) -> dict:
    """Implement DES Encryption logic here."""
    return {"output": "Not implemented"}

def multiplicative(text: str, key: int) -> dict:
    """Implement Multiplicative Cipher logic here."""
    return {"output": "Not implemented"}

def affine(text: str, a: int, b: int) -> dict:
    """Implement Affine Cipher logic here."""
    return {"output": "Not implemented"}

def autokey(text: str, key: str) -> dict:
    """Implement Autokey Cipher logic here."""
    return {"output": "Not implemented"}

def playfair(text: str, key: str) -> dict:
    """Implement Playfair Cipher logic here."""
    return {"output": "Not implemented"}

def railfence(text: str, key: int) -> dict:
    """Implement Rail Fence Cipher logic here."""
    return {"output": "Not implemented"}

def columnar(text: str, key: str) -> dict:
    """Implement Columnar Transposition Cipher logic here."""
    return {"output": "Not implemented"}

def double_transposition(text: str, key1: str, key2: str) -> dict:
    """Implement Double Transposition Cipher logic here."""
    return {"output": "Not implemented"}

def gcd(a: int, b: int) -> dict:
    """Implement Greatest Common Divisor logic here."""
    return {"output": "Not implemented"}

def eea(a: int, b: int) -> dict:
    """Implement Extended Euclidean Algorithm logic here."""
    return {"output": "Not implemented"}

def ecc(text: str) -> dict:
    """Implement Elliptic Curve Cryptography logic here."""
    return {"output": "Not implemented"}

def diffie_hellman(p: int, g: int, private_key: int) -> dict:
    """Implement Diffie-Hellman Key Exchange logic here."""
    return {"output": "Not implemented"}

def digital_signature(text: str) -> dict:
    """Implement Digital Signature logic here."""
    return {"output": "Not implemented"}

def generic_hash(text: str) -> dict:
    """Implement a generic Hash Function logic here."""
    return {"output": "Not implemented"}

def md5(text: str) -> dict:
    """Implement MD5 logic here."""
    return {"output": "Not implemented"}

def sha1(text: str) -> dict:
    """Implement SHA-1 logic here."""
    return {"output": "Not implemented"}

def sha3(text: str) -> dict:
    """Implement SHA-3 logic here."""
    return {"output": "Not implemented"}
