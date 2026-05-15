import pytest
from app.crypto.engines.caesar import _shift_char, encrypt, decrypt, brute_force

def test_shift_char():
    # Test uppercase
    assert _shift_char('A', 3) == 'D'
    assert _shift_char('Z', 1) == 'A'
    assert _shift_char('Z', 3) == 'C'

    # Test lowercase
    assert _shift_char('a', 3) == 'd'
    assert _shift_char('z', 1) == 'a'
    assert _shift_char('z', 3) == 'c'

    # Test punctuation and numbers (should remain unchanged)
    assert _shift_char('!', 5) == '!'
    assert _shift_char('1', 5) == '1'
    assert _shift_char(' ', 5) == ' '

    # Test zero shift
    assert _shift_char('A', 0) == 'A'
    assert _shift_char('m', 0) == 'm'

    # Test negative shift
    assert _shift_char('D', -3) == 'A'
    assert _shift_char('A', -1) == 'Z'
    assert _shift_char('c', -3) == 'z'

def test_encrypt():
    # Test default shift (3)
    result = encrypt("HELLO")
    assert result["ciphertext"] == "KHOOR"
    assert result["shift"] == 3
    assert result["input_length"] == 5
    assert result["algorithm"] == "Caesar Cipher"

    # Test custom shift
    result = encrypt("HELLO", shift=5)
    assert result["ciphertext"] == "MJQQT"
    assert result["shift"] == 5

    # Test wrap around
    result = encrypt("XYZ", shift=3)
    assert result["ciphertext"] == "ABC"

    # Test large shift (should normalize)
    result = encrypt("ABC", shift=27)
    assert result["ciphertext"] == "BCD"
    assert result["shift"] == 1

    # Test mixed characters
    result = encrypt("Hello, World!", shift=3)
    assert result["ciphertext"] == "Khoor, Zruog!"

    # Test empty string
    result = encrypt("")
    assert result["ciphertext"] == ""

def test_decrypt():
    # Test default shift
    result = decrypt("KHOOR")
    assert result["ciphertext"] == "HELLO"
    assert result["shift"] == 3
    assert result["algorithm"] == "Caesar Cipher (decrypt)"

    # Test custom shift
    result = decrypt("MJQQT", shift=5)
    assert result["ciphertext"] == "HELLO"
    assert result["shift"] == 5

    # Test large shift (should normalize)
    result = decrypt("BCD", shift=27)
    assert result["ciphertext"] == "ABC"
    assert result["shift"] == 1

    # Test mixed characters
    result = decrypt("Khoor, Zruog!", shift=3)
    assert result["ciphertext"] == "Hello, World!"

def test_brute_force():
    # Encrypt a message with an unknown shift
    plaintext = "SECRET MESSAGE"
    ciphertext = encrypt(plaintext, shift=12)["ciphertext"]

    # Brute force the ciphertext
    result = brute_force(ciphertext)

    assert result["ciphertext"] == ciphertext
    assert result["algorithm"] == "Caesar Cipher (brute-force)"
    assert "candidates" in result

    # Check that we have exactly 25 candidates (1-25)
    candidates = result["candidates"]
    assert len(candidates) == 25

    # Verify shifts are 1 to 25
    shifts = [c["shift"] for c in candidates]
    assert shifts == list(range(1, 26))

    # Ensure our original plaintext is one of the candidates
    found_plaintext = False
    for candidate in candidates:
        if candidate["plaintext"] == plaintext:
            assert candidate["shift"] == 12
            found_plaintext = True
            break

    assert found_plaintext, "Original plaintext was not found in brute force candidates"
