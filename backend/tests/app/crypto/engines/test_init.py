import pytest
from unittest.mock import patch, MagicMock
import importlib
import pkgutil

import app.crypto.engines as engines

@pytest.fixture(autouse=True)
def reset_algorithms():
    """Reset the _algorithms dict before each test."""
    original = engines._algorithms.copy()
    engines._algorithms.clear()
    yield
    engines._algorithms.clear()
    engines._algorithms.update(original)

def test_get_all_returns_copy():
    engines._algorithms["test_id"] = {"id": "test_id", "name": "Test Algo"}

    result = engines.get_all()
    assert result == {"test_id": {"id": "test_id", "name": "Test Algo"}}

    # Modifying result shouldn't modify the internal dict
    result["test_id"]["name"] = "Modified"
    result["new_id"] = {}

    # Original should be unchanged in keys
    assert "new_id" not in engines._algorithms

def test_discover_valid_module():
    # Store original functions
    orig_iter_modules = pkgutil.iter_modules
    orig_import_module = importlib.import_module

    calls_import = []

    def mock_iter_modules(path):
        return [(None, "dummy_algo", False)]

    def mock_import_module(name, package):
        calls_import.append((name, package))
        mock_module = MagicMock()
        mock_module.ALGORITHM = {"id": "dummy", "name": "Dummy Algorithm"}
        return mock_module

    # Monkey patch
    engines.pkgutil.iter_modules = mock_iter_modules
    engines.importlib.import_module = mock_import_module

    try:
        # Run discover
        engines._discover()

        # Verify module was imported
        assert calls_import == [(".dummy_algo", engines.__package__)]

        # Verify algorithm was registered
        assert "dummy" in engines._algorithms
        assert engines._algorithms["dummy"] == {"id": "dummy", "name": "Dummy Algorithm"}
    finally:
        # Restore
        engines.pkgutil.iter_modules = orig_iter_modules
        engines.importlib.import_module = orig_import_module

def test_discover_skip_private_module():
    orig_iter_modules = pkgutil.iter_modules
    orig_import_module = importlib.import_module

    calls_import = []

    def mock_iter_modules(path):
        return [(None, "_private_algo", False)]

    def mock_import_module(name, package):
        calls_import.append((name, package))
        return MagicMock()

    engines.pkgutil.iter_modules = mock_iter_modules
    engines.importlib.import_module = mock_import_module

    try:
        engines._discover()
        assert len(calls_import) == 0
        assert len(engines._algorithms) == 0
    finally:
        engines.pkgutil.iter_modules = orig_iter_modules
        engines.importlib.import_module = orig_import_module


def test_discover_module_without_algorithm():
    orig_iter_modules = pkgutil.iter_modules
    orig_import_module = importlib.import_module

    calls_import = []

    def mock_iter_modules(path):
        return [(None, "no_algo", False)]

    def mock_import_module(name, package):
        calls_import.append((name, package))
        mock_module = MagicMock()
        del mock_module.ALGORITHM
        return mock_module

    engines.pkgutil.iter_modules = mock_iter_modules
    engines.importlib.import_module = mock_import_module

    try:
        engines._discover()
        assert calls_import == [(".no_algo", engines.__package__)]
        assert len(engines._algorithms) == 0
    finally:
        engines.pkgutil.iter_modules = orig_iter_modules
        engines.importlib.import_module = orig_import_module
