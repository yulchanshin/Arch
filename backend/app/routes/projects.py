from __future__ import annotations
import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.middleware.rate_limit import limiter
from app.services import projects as svc

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


# ── Request models ────────────────────────────────────────

class CreateProjectRequest(BaseModel):
    name: str
    description: str | None = None


class UpdateProjectRequest(BaseModel):
    name: str | None = None
    description: str | None = None


class CreateIterationRequest(BaseModel):
    name: str
    nodes: list = []
    edges: list = []


class SaveIterationRequest(BaseModel):
    nodes: list
    edges: list


# ── Projects ─────────────────────────────────────────────

@router.post("/projects")
@limiter.limit("30/minute")
async def create_project(request: Request, req: CreateProjectRequest, user_id: str = Depends(get_current_user)):
    try:
        return svc.create_project(user_id, req.name, req.description)
    except Exception as e:
        logger.error(f"Create project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects")
@limiter.limit("30/minute")
async def list_projects(request: Request, user_id: str = Depends(get_current_user)):
    try:
        projects = svc.list_projects(user_id)
        return {"projects": projects}
    except Exception as e:
        logger.error(f"List projects failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/projects/{project_id}")
@limiter.limit("30/minute")
async def update_project(request: Request, project_id: str, req: UpdateProjectRequest, user_id: str = Depends(get_current_user)):
    try:
        svc.update_project(project_id, user_id, req.name, req.description)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Update project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/projects/{project_id}")
@limiter.limit("30/minute")
async def delete_project(request: Request, project_id: str, user_id: str = Depends(get_current_user)):
    try:
        svc.delete_project(project_id, user_id)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Delete project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Iterations ────────────────────────────────────────────

@router.post("/projects/{project_id}/iterations")
@limiter.limit("30/minute")
async def create_iteration(request: Request, project_id: str, req: CreateIterationRequest, user_id: str = Depends(get_current_user)):
    try:
        return svc.create_iteration(project_id, req.name, req.nodes, req.edges)
    except Exception as e:
        logger.error(f"Create iteration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/iterations/{iteration_id}")
@limiter.limit("60/minute")
async def get_iteration(request: Request, iteration_id: str, user_id: str = Depends(get_current_user)):
    try:
        return svc.get_iteration(iteration_id)
    except Exception as e:
        logger.error(f"Get iteration failed: {e}")
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/iterations/{iteration_id}")
@limiter.limit("60/minute")
async def save_iteration(request: Request, iteration_id: str, req: SaveIterationRequest, user_id: str = Depends(get_current_user)):
    try:
        svc.save_iteration(iteration_id, req.nodes, req.edges)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Save iteration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
