"""
CryptoForge — Algorithm Registry

Auto-discovers all algorithm engines from the engines/ package.
To add a new algorithm, just create a new .py file in engines/ with
an ALGORITHM dict — it will be picked up automatically.
"""

from app.crypto.engines import get_all

ALGORITHMS = get_all()
