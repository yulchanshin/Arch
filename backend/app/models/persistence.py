from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class GraphSaveRequest(BaseModel):
    id: Optional[str] = None
    name: str = "Untitled Architecture"
    nodes: list = []
    edges: list = []
    version: int = 1


class GraphSummary(BaseModel):
    id: str
    name: str
    node_count: int = Field(alias="nodeCount", default=0)
    edge_count: int = Field(alias="edgeCount", default=0)
    version: int = 1
    created_at: str = Field(alias="createdAt", default="")
    updated_at: str = Field(alias="updatedAt", default="")

    model_config = {"populate_by_name": True}


class GraphDetail(BaseModel):
    id: str
    name: str
    nodes: list = []
    edges: list = []
    version: int = 1
    created_at: str = Field(alias="createdAt", default="")
    updated_at: str = Field(alias="updatedAt", default="")

    model_config = {"populate_by_name": True}


class GraphListResponse(BaseModel):
    graphs: list[GraphSummary]


class GraphSaveResponse(BaseModel):
    id: str
    name: str
    version: int
