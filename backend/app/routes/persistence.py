from __future__ import annotations
import logging
from fastapi import APIRouter, HTTPException, Request

from app.models.persistence import (
    GraphSaveRequest,
    GraphSaveResponse,
    GraphDetail,
    GraphListResponse,
)
from app.services.persistence import save_graph, get_graph, list_graphs, delete_graph
from app.middleware.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.post("/graphs", response_model=GraphSaveResponse)
@limiter.limit("30/minute")
async def save(request: Request, req: GraphSaveRequest):
    try:
        return save_graph(req)
    except Exception as e:
        logger.error(f"Save failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save graph: {str(e)}")


@router.get("/graphs", response_model=GraphListResponse)
@limiter.limit("30/minute")
async def list_all(request: Request):
    try:
        graphs = list_graphs()
        return GraphListResponse(graphs=graphs)
    except Exception as e:
        logger.error(f"List failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list graphs: {str(e)}")


@router.get("/graphs/{graph_id}", response_model=GraphDetail)
@limiter.limit("30/minute")
async def load(request: Request, graph_id: str):
    try:
        return get_graph(graph_id)
    except Exception as e:
        logger.error(f"Load failed: {e}")
        raise HTTPException(status_code=404, detail=f"Graph not found: {str(e)}")


@router.delete("/graphs/{graph_id}")
@limiter.limit("30/minute")
async def remove(request: Request, graph_id: str):
    try:
        delete_graph(graph_id)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete graph: {str(e)}")
