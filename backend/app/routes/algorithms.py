from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.crypto.registry import ALGORITHMS
import inspect

router = APIRouter(redirect_slashes=False)


class ExecuteRequest(BaseModel):
    input: str
    params: dict = {}
    output_format: str = "hex"


class AlgorithmCodeRequest(BaseModel):
    algorithm_id: str


@router.get("")
@router.get("/")
async def list_algorithms():
    """List all available cryptographic algorithms."""
    return [
        {
            "id": algo["id"],
            "name": algo["name"],
            "category": algo["category"],
            "difficulty": algo["difficulty"],
            "complexity": algo["complexity"],
            "description": algo["description"],
            "parameters": algo["parameters"],
        }
        for algo in ALGORITHMS.values()
    ]


@router.get("/{algorithm_id}")
async def get_algorithm(algorithm_id: str):
    """Get details of a specific algorithm."""
    algo = ALGORITHMS.get(algorithm_id)
    if not algo:
        raise HTTPException(status_code=404, detail=f"Algorithm '{algorithm_id}' not found")
    return {
        "id": algo["id"],
        "name": algo["name"],
        "category": algo["category"],
        "difficulty": algo["difficulty"],
        "complexity": algo["complexity"],
        "description": algo["description"],
        "parameters": algo["parameters"],
    }


@router.post("/{algorithm_id}/execute")
async def execute_algorithm(algorithm_id: str, request: ExecuteRequest):
    """Execute a cryptographic algorithm on the given input."""
    algo = ALGORITHMS.get(algorithm_id)
    if not algo:
        raise HTTPException(status_code=404, detail=f"Algorithm '{algorithm_id}' not found")

    try:
        fn = algo["encrypt_fn"]
        # Build kwargs from params
        kwargs = {**request.params}
        if "output_format" in algo["parameters"]:
            kwargs["output_format"] = request.output_format

        # Call the function — some take 'plaintext', some take 'data', some take 'text'
        sig = inspect.signature(fn)
        param_names = list(sig.parameters.keys())
        first_param = param_names[0] if param_names else None

        if first_param in ("plaintext", "data", "text"):
            result = fn(request.input, **kwargs)
        elif first_param == "bits":
            bits = kwargs.get("bits", 2048)
            result = fn(bits=int(bits))
        else:
            result = fn(request.input, **kwargs)

        return {"success": True, "algorithm": algo["name"], "result": result}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{algorithm_id}/code")
async def get_algorithm_code(algorithm_id: str):
    """Get the Python source code of a cryptographic algorithm."""
    algo = ALGORITHMS.get(algorithm_id)
    if not algo:
        raise HTTPException(status_code=404, detail=f"Algorithm '{algorithm_id}' not found")

    try:
        source = inspect.getsource(algo["encrypt_fn"])
        return {
            "algorithm": algo["name"],
            "language": "python",
            "code": source,
        }
    except Exception:
        return {
            "algorithm": algo["name"],
            "language": "python",
            "code": "# Source code not available for this algorithm",
        }
