from __future__ import annotations
import json
import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.models.api import (
    GenerateRequest,
    GenerateResponse,
    ModifyRequest,
    ModifyResponse,
)
from app.services.llm import (
    call_llm_generate,
    call_llm_modify,
    stream_llm_generate,
    stream_llm_modify,
)
from app.services.providers.base import (
    TokenEvent,
    ToolCallStartEvent,
    ToolCallEndEvent,
    DoneEvent,
)
from app.services.validator import validate_actions
from app.middleware.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


# ── Non-streaming endpoints (preserved) ───────────────────


@router.post("/generate", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def generate_graph(request: Request, req: GenerateRequest):
    try:
        ai_response = await call_llm_generate(req.prompt)
        ai_response = validate_actions(ai_response, current_graph=None)
        return GenerateResponse(ai_response=ai_response)
    except Exception as e:
        logger.error(f"Generate failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")


@router.post("/modify", response_model=ModifyResponse)
@limiter.limit("15/minute")
async def modify_graph(request: Request, req: ModifyRequest):
    try:
        history = [{"role": m.role, "content": m.content} for m in req.history]
        ai_response = await call_llm_modify(req.graph, req.prompt, history)
        ai_response = validate_actions(ai_response, current_graph=req.graph)
        return ModifyResponse(ai_response=ai_response)
    except Exception as e:
        logger.error(f"Modify failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI modification failed: {str(e)}")


# ── SSE streaming endpoints (new) ─────────────────────────


@router.post("/generate/stream")
@limiter.limit("10/minute")
async def generate_stream(request: Request, req: GenerateRequest):
    async def event_generator():
        try:
            history = [{"role": m.role, "content": m.content} for m in req.history]
            async for event in stream_llm_generate(req.prompt, history):
                if isinstance(event, TokenEvent):
                    yield f"data: {json.dumps({'type': 'token', 'token': event.token})}\n\n"
                elif isinstance(event, ToolCallStartEvent):
                    yield f"data: {json.dumps({'type': 'tool_start', 'name': event.tool_name, 'input': event.tool_input})}\n\n"
                elif isinstance(event, ToolCallEndEvent):
                    yield f"data: {json.dumps({'type': 'tool_end', 'name': event.tool_name, 'output': event.tool_output})}\n\n"
                elif isinstance(event, DoneEvent):
                    validated = validate_actions(event.response, current_graph=None)
                    yield f"data: {json.dumps({'type': 'done', 'response': validated.model_dump(mode='json', by_alias=True)})}\n\n"
        except Exception as e:
            logger.error(f"Stream generate failed: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/modify/stream")
@limiter.limit("15/minute")
async def modify_stream(request: Request, req: ModifyRequest):
    async def event_generator():
        try:
            history = [{"role": m.role, "content": m.content} for m in req.history]
            async for event in stream_llm_modify(req.graph, req.prompt, history):
                if isinstance(event, TokenEvent):
                    yield f"data: {json.dumps({'type': 'token', 'token': event.token})}\n\n"
                elif isinstance(event, ToolCallStartEvent):
                    yield f"data: {json.dumps({'type': 'tool_start', 'name': event.tool_name, 'input': event.tool_input})}\n\n"
                elif isinstance(event, ToolCallEndEvent):
                    yield f"data: {json.dumps({'type': 'tool_end', 'name': event.tool_name, 'output': event.tool_output})}\n\n"
                elif isinstance(event, DoneEvent):
                    validated = validate_actions(event.response, current_graph=req.graph)
                    yield f"data: {json.dumps({'type': 'done', 'response': validated.model_dump(mode='json', by_alias=True)})}\n\n"
        except Exception as e:
            logger.error(f"Stream modify failed: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
