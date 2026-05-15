import asyncio
import hashlib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


# Sample challenges (in production these would come from Supabase)
CHALLENGES = [
    {
        "id": "daily-1",
        "title": "Break the Substitution Cipher",
        "description": "You've intercepted an encrypted message. Using frequency analysis, decrypt the hidden text.",
        "difficulty": "Medium",
        "xp": 250,
        "type": "daily",
        "encrypted_text": "Khoor Zruog! Wklv lv d vhfuhw phvvdjh.",
        "answer_hash": "074f512a5137dba47a9aa18d18e687d604c2d86237ae2e4a2dc861ea6e0aa1aa",
        "hint": "This is a simple shift cipher. Try different shift values.",
    },
    {
        "id": "c1",
        "title": "Decrypt the Caesar Shift",
        "description": "Given a message shifted by an unknown key, find the plaintext.",
        "difficulty": "Easy",
        "xp": 50,
        "encrypted_text": "Wkh txlfn eurzq ira mxpsv ryhu wkh odcb grj",
        "answer_hash": "05c6e08f1d9fdafa03147fcb8f82f124c76d2f70e3d989dc8aadb5e7d7450bec",
        "hint": "The shift value is less than 5.",
    },
    {
        "id": "c2",
        "title": "ROT13 Roundtrip",
        "description": "Prove that ROT13 applied twice returns the original text.",
        "difficulty": "Easy",
        "xp": 50,
        "encrypted_text": "PelcgbSbetr",
        "answer_hash": "955a479d3c105a276536dbcef6db86fcab9d99f6c5694d472846f52f6a9be373",
        "hint": "ROT13 is its own inverse.",
    },
]


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
        for ch in CHALLENGES
    ]


@router.get("/{challenge_id}")
async def get_challenge(challenge_id: str):
    """Get a specific challenge."""
    ch = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
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

    ch = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")

    submission_hash = hashlib.sha256(submission.answer.strip().lower().encode()).hexdigest()
    correct = submission_hash == ch["answer_hash"]
    return {
        "correct": correct,
        "xp_earned": ch["xp"] if correct else 0,
        "message": "🎉 Correct! Well done!" if correct else "❌ Incorrect. Try again!",
    }
