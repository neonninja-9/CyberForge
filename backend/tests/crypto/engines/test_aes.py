import pytest
import base64
from app.crypto.engines.aes import encrypt, decrypt

def test_aes_encrypt_decrypt_cbc():
    plaintext = "Hello, AES World!"
    # Encrypt
    enc_result = encrypt(plaintext, mode="CBC", output_format="hex")
    assert "ciphertext" in enc_result
    assert "key" in enc_result
    assert "iv" in enc_result

    # Decrypt
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=enc_result["key"],
        mode="CBC",
        iv_hex=enc_result["iv"]
    )
    assert "plaintext" in dec_result
    assert dec_result["plaintext"] == plaintext

def test_aes_encrypt_decrypt_ecb():
    plaintext = "Hello, ECB Mode!"
    # Encrypt
    enc_result = encrypt(plaintext, mode="ECB", output_format="hex")
    assert "ciphertext" in enc_result
    assert "key" in enc_result
    assert "iv" not in enc_result  # ECB shouldn't have IV

    # Decrypt
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=enc_result["key"],
        mode="ECB"
    )
    assert "plaintext" in dec_result
    assert dec_result["plaintext"] == plaintext

def test_aes_encrypt_decrypt_gcm():
    plaintext = "Authenticated Encryption!"
    # Encrypt
    enc_result = encrypt(plaintext, mode="GCM", output_format="hex")
    assert "ciphertext" in enc_result
    assert "key" in enc_result
    assert "nonce" in enc_result
    assert "tag" in enc_result

    # Decrypt
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=enc_result["key"],
        mode="GCM",
        nonce_hex=enc_result["nonce"],
        tag_hex=enc_result["tag"]
    )
    assert "plaintext" in dec_result
    assert dec_result["plaintext"] == plaintext

def test_aes_unsupported_mode():
    with pytest.raises(ValueError, match="Unsupported mode"):
        encrypt("test", mode="UNSUPPORTED")

def test_aes_decrypt_invalid_key():
    enc_result = encrypt("test", mode="ECB", output_format="hex")
    # Mess up the key
    bad_key = "00" * (len(enc_result["key"]) // 2)
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=bad_key,
        mode="ECB"
    )
    assert "error" in dec_result

def test_aes_decrypt_gcm_tampered():
    enc_result = encrypt("test", mode="GCM", output_format="hex")
    # Mess up the ciphertext
    tampered_ct = enc_result["ciphertext"][:-2] + "00"
    dec_result = decrypt(
        ciphertext_hex=tampered_ct,
        key_hex=enc_result["key"],
        mode="GCM",
        nonce_hex=enc_result["nonce"],
        tag_hex=enc_result["tag"]
    )
    assert "error" in dec_result
    assert "MAC check failed" in dec_result["error"] or "Decryption failed" in dec_result["error"]

def test_aes_decrypt_cbc_missing_iv():
    enc_result = encrypt("test", mode="CBC", output_format="hex")
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=enc_result["key"],
        mode="CBC"
        # Missing IV
    )
    assert "error" in dec_result
    assert "IV is required" in dec_result["error"]

def test_aes_decrypt_gcm_missing_nonce():
    enc_result = encrypt("test", mode="GCM", output_format="hex")
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=enc_result["key"],
        mode="GCM",
        # Missing nonce
        tag_hex=enc_result["tag"]
    )
    assert "error" in dec_result
    assert "Nonce and Tag are required" in dec_result["error"]

def test_aes_encrypt_decrypt_base64():
    plaintext = "Testing base64!"
    # Encrypt
    enc_result = encrypt(plaintext, mode="CBC", output_format="base64")
    assert "ciphertext" in enc_result

    # Decrypt
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=enc_result["key"],
        mode="CBC",
        iv_hex=enc_result["iv"],
        input_format="base64"
    )
    assert "plaintext" in dec_result
    assert dec_result["plaintext"] == plaintext

def test_aes_decrypt_invalid_input_format():
    enc_result = encrypt("test", mode="CBC", output_format="hex")
    dec_result = decrypt(
        ciphertext_hex=enc_result["ciphertext"],
        key_hex=enc_result["key"],
        mode="CBC",
        iv_hex=enc_result["iv"],
        input_format="UNSUPPORTED"
    )
    assert "error" in dec_result
    assert "Unsupported input format" in dec_result["error"]

def test_aes_encrypt_invalid_output_format():
    with pytest.raises(ValueError, match="Unsupported output format"):
        encrypt("test", mode="CBC", output_format="UNSUPPORTED")
