from __future__ import annotations
from typing import Annotated, Literal, Optional, Union
from pydantic import BaseModel, Discriminator, Tag

from .graph import NodeData, EdgeData, Position


class AddNodeAction(BaseModel):
    op: Literal["add_node"]
    id: str
    type: str
    position: Position
    data: NodeData


class RemoveNodeAction(BaseModel):
    op: Literal["remove_node"]
    id: str


class UpdateNodeAction(BaseModel):
    op: Literal["update_node"]
    id: str
    data: dict  # Partial<NodeData>


class MoveNodeAction(BaseModel):
    op: Literal["move_node"]
    id: str
    position: Position


class AddEdgeAction(BaseModel):
    op: Literal["add_edge"]
    id: str
    source: str
    target: str
    data: Optional[EdgeData] = None


class RemoveEdgeAction(BaseModel):
    op: Literal["remove_edge"]
    id: str


class UpdateEdgeAction(BaseModel):
    op: Literal["update_edge"]
    id: str
    data: dict  # Partial<EdgeData>


def _get_discriminator_value(v: dict) -> str:
    if isinstance(v, dict):
        return v.get("op", "")
    return getattr(v, "op", "")


GraphAction = Annotated[
    Union[
        Annotated[AddNodeAction, Tag("add_node")],
        Annotated[RemoveNodeAction, Tag("remove_node")],
        Annotated[UpdateNodeAction, Tag("update_node")],
        Annotated[MoveNodeAction, Tag("move_node")],
        Annotated[AddEdgeAction, Tag("add_edge")],
        Annotated[RemoveEdgeAction, Tag("remove_edge")],
        Annotated[UpdateEdgeAction, Tag("update_edge")],
    ],
    Discriminator(_get_discriminator_value),
]


class AIResponse(BaseModel):
    thought_process: str
    actions: list[GraphAction]
    summary: str
