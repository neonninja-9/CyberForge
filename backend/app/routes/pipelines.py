from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.crypto.registry import ALGORITHMS

router = APIRouter()


class PipelineStep(BaseModel):
    algorithm_id: str
    params: dict = {}


class PipelineRequest(BaseModel):
    steps: List[PipelineStep]
    input: str
    output_format: str = "hex"


@router.post("/execute")
async def execute_pipeline(request: PipelineRequest):
    """Execute a pipeline of chained algorithms."""
    current_data = request.input
    results = []

    for i, step in enumerate(request.steps):
        algo = ALGORITHMS.get(step.algorithm_id)
        if not algo:
            raise HTTPException(
                status_code=400,
                detail=f"Step {i+1}: Algorithm '{step.algorithm_id}' not found"
            )

        try:
            fn = algo["encrypt_fn"]
            kwargs = {**step.params}

            # For the last step, use the requested output format
            if i == len(request.steps) - 1 and "output_format" in algo["parameters"]:
                kwargs["output_format"] = request.output_format

            result = fn(current_data, **kwargs)

            # Extract the output for the next step
            output_key = next(
                (k for k in ["ciphertext", "hash", "hmac", "output"] if k in result),
                None
            )
            if output_key:
                current_data = result[output_key]

            results.append({
                "step": i + 1,
                "algorithm": algo["name"],
                "result": result,
            })

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Step {i+1} ({algo['name']}): {str(e)}"
            )

    return {
        "success": True,
        "total_steps": len(request.steps),
        "final_output": current_data,
        "steps": results,
    }
