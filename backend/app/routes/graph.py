from __future__ import annotations
import logging
from fastapi import APIRouter, HTTPException

from app.models.api import (
    GenerateRequest,
    GenerateResponse,
    ModifyRequest,
    ModifyResponse,
)
from app.services.llm import call_llm_generate, call_llm_modify
from app.services.validator import validate_actions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.post("/generate", response_model=GenerateResponse)
async def generate_graph(req: GenerateRequest):
    try:
        ai_response = await call_llm_generate(req.prompt)
        ai_response = validate_actions(ai_response, current_graph=None)
        return GenerateResponse(ai_response=ai_response)
    except Exception as e:
        logger.error(f"Generate failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")


@router.post("/modify", response_model=ModifyResponse)
async def modify_graph(req: ModifyRequest):
    try:
        history = [{"role": m.role, "content": m.content} for m in req.history]
        ai_response = await call_llm_modify(req.graph, req.prompt, history)
        ai_response = validate_actions(ai_response, current_graph=req.graph)
        return ModifyResponse(ai_response=ai_response)
    except Exception as e:
        logger.error(f"Modify failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI modification failed: {str(e)}")
