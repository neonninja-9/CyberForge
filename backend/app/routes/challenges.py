import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


# Sample challenges (in production these would come from Supabase)
CHALLENGES = {
    "daily-1": {
        "id": "daily-1",
        "title": "Break the Substitution Cipher",
        "description": "You've intercepted an encrypted message. Using frequency analysis, decrypt the hidden text.",
        "difficulty": "Medium",
        "xp": 250,
        "type": "daily",
        "encrypted_text": "Khoor Zruog! Wklv lv d vhfuhw phvvdjh.",
        "answer": "Hello World! This is a secret message.",
        "hint": "This is a simple shift cipher. Try different shift values.",
    },
    "c1": {
        "id": "c1",
        "title": "Decrypt the Caesar Shift",
        "description": "Given a message shifted by an unknown key, find the plaintext.",
        "difficulty": "Easy",
        "xp": 50,
        "encrypted_text": "Wkh txlfn eurzq ira mxpsv ryhu wkh odcb grj",
        "answer": "The quick brown fox jumps over the lazy dog",
        "hint": "The shift value is less than 5.",
    },
    "c2": {
        "id": "c2",
        "title": "ROT13 Roundtrip",
        "description": "Prove that ROT13 applied twice returns the original text.",
        "difficulty": "Easy",
        "xp": 50,
        "encrypted_text": "PelcgbSbetr",
        "answer": "CryptoForge",
        "hint": "ROT13 is its own inverse.",
    },
}


class ChallengeSubmission(BaseModel):
    answer: str = Field(..., max_length=1000)


@router.get("/")
async def list_challenges():
    """List all available challenges."""
    return [
        {
            "id": ch["id"],
            "title": ch["title"],
            "description": ch["description"],
            "difficulty": ch["difficulty"],
            "xp": ch["xp"],
            "type": ch.get("type", "standard"),
            "encrypted_text": ch["encrypted_text"],
            "hint": ch["hint"],
        }
        for ch in CHALLENGES.values()
    ]


@router.get("/{challenge_id}")
async def get_challenge(challenge_id: str):
    """Get a specific challenge."""
    ch = CHALLENGES.get(challenge_id)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return {
        "id": ch["id"],
        "title": ch["title"],
        "description": ch["description"],
        "difficulty": ch["difficulty"],
        "xp": ch["xp"],
        "encrypted_text": ch["encrypted_text"],
        "hint": ch["hint"],
    }


@router.post("/{challenge_id}/submit")
async def submit_challenge(challenge_id: str, submission: ChallengeSubmission):
    """Submit an answer for a challenge."""
    await asyncio.sleep(1)  # Anti-brute-force artificial delay

    ch = CHALLENGES.get(challenge_id)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")

    correct = submission.answer.strip().lower() == ch["answer"].strip().lower()
    return {
        "correct": correct,
        "xp_earned": ch["xp"] if correct else 0,
        "message": "🎉 Correct! Well done!" if correct else "❌ Incorrect. Try again!",
    }
