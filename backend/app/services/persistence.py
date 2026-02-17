from __future__ import annotations
import logging
from supabase import create_client, Client

from app.config import SUPABASE_URL, SUPABASE_KEY
from app.models.persistence import GraphSaveRequest, GraphSummary, GraphDetail, GraphSaveResponse

logger = logging.getLogger(__name__)

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def save_graph(req: GraphSaveRequest) -> GraphSaveResponse:
    client = _get_client()

    row = {
        "name": req.name,
        "nodes": req.nodes,
        "edges": req.edges,
        "version": req.version,
    }

    if req.id:
        row["id"] = req.id
        result = (
            client.table("graphs")
            .upsert(row, on_conflict="id")
            .execute()
        )
    else:
        result = client.table("graphs").insert(row).execute()

    data = result.data[0]
    return GraphSaveResponse(id=data["id"], name=data["name"], version=data["version"])


def get_graph(graph_id: str) -> GraphDetail:
    client = _get_client()
    result = (
        client.table("graphs")
        .select("*")
        .eq("id", graph_id)
        .single()
        .execute()
    )
    row = result.data
    return GraphDetail(
        id=row["id"],
        name=row["name"],
        nodes=row["nodes"],
        edges=row["edges"],
        version=row["version"],
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


def list_graphs() -> list[GraphSummary]:
    client = _get_client()
    result = (
        client.table("graphs")
        .select("id, name, nodes, edges, version, created_at, updated_at")
        .order("updated_at", desc=True)
        .limit(50)
        .execute()
    )
    summaries = []
    for row in result.data:
        summaries.append(
            GraphSummary(
                id=row["id"],
                name=row["name"],
                nodeCount=len(row["nodes"]) if row["nodes"] else 0,
                edgeCount=len(row["edges"]) if row["edges"] else 0,
                version=row["version"],
                createdAt=row["created_at"],
                updatedAt=row["updated_at"],
            )
        )
    return summaries


def delete_graph(graph_id: str) -> None:
    client = _get_client()
    client.table("graphs").delete().eq("id", graph_id).execute()
