"""
CryptoForge — Engine Auto-Discovery

Automatically discovers and registers all algorithm modules in this package.
To add a new algorithm, simply create a new .py file in this directory
with an ALGORITHM dict — no other files need to be edited.
"""

import importlib
import pkgutil

_algorithms: dict = {}


def _discover():
    """Scan all sibling modules for an ALGORITHM dict and register them."""
    for finder, module_name, is_pkg in pkgutil.iter_modules(__path__):
        # Skip private/internal modules
        if module_name.startswith("_"):
            continue

        module = importlib.import_module(f".{module_name}", __package__)

        if hasattr(module, "ALGORITHM"):
            algo = module.ALGORITHM
            _algorithms[algo["id"]] = algo


# Run discovery on import
_discover()


def get_all() -> dict:
    """Return a copy of all discovered algorithms."""
    return dict(_algorithms)
