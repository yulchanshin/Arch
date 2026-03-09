from __future__ import annotations
import logging
from supabase import create_client, Client

from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

logger = logging.getLogger(__name__)

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


# ── Projects ─────────────────────────────────────────────

def _project_to_dict(row: dict, node_count: int = 0, iteration_count: int = 0, first_iteration_id: str | None = None) -> dict:
    result = {
        "id": row["id"],
        "name": row["name"],
        "description": row.get("description"),
        "nodeCount": node_count,
        "iterationCount": iteration_count,
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }
    if first_iteration_id:
        result["firstIterationId"] = first_iteration_id
    return result


def create_project(user_id: str, name: str, description: str | None = None) -> dict:
    client = _get_client()
    result = (
        client.table("projects")
        .insert({"user_id": user_id, "name": name, "description": description})
        .execute()
    )
    row = result.data[0]
    # Create first iteration
    iter_result = (
        client.table("iterations")
        .insert({"project_id": row["id"], "name": "v1", "ordinal": 1, "nodes": [], "edges": []})
        .execute()
    )
    first_iter = iter_result.data[0]
    return _project_to_dict(row, node_count=0, iteration_count=1, first_iteration_id=first_iter["id"])


def list_projects(user_id: str) -> list[dict]:
    client = _get_client()
    # Single query: projects + their iterations via nested select (avoids N+1)
    rows = (
        client.table("projects")
        .select("id, name, description, created_at, updated_at, iterations(id, nodes, ordinal)")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(50)
        .execute()
    ).data

    results = []
    for p in rows:
        iters = sorted(p.get("iterations") or [], key=lambda i: i.get("ordinal", 0))
        node_count = sum(len(i.get("nodes") or []) for i in iters)
        first = iters[0] if iters else None
        d = _project_to_dict(p, node_count=node_count, iteration_count=len(iters),
                             first_iteration_id=first["id"] if first else None)
        if first:
            d["previewNodes"] = [
                {"type": n.get("type", "service"), "x": n.get("position", {}).get("x", 0), "y": n.get("position", {}).get("y", 0)}
                for n in (first.get("nodes") or [])
            ]
        results.append(d)
    return results


def update_project(project_id: str, user_id: str, name: str | None = None, description: str | None = None) -> None:
    client = _get_client()
    updates = {}
    if name is not None:
        updates["name"] = name
    if description is not None:
        updates["description"] = description
    if not updates:
        return
    client.table("projects").update(updates).eq("id", project_id).eq("user_id", user_id).execute()


def delete_project(project_id: str, user_id: str) -> None:
    client = _get_client()
    client.table("projects").delete().eq("id", project_id).eq("user_id", user_id).execute()


# ── Iterations ────────────────────────────────────────────

def create_iteration(project_id: str, name: str, nodes: list, edges: list) -> dict:
    client = _get_client()
    existing = (
        client.table("iterations")
        .select("id")
        .eq("project_id", project_id)
        .execute()
    ).data
    ordinal = len(existing) + 1
    result = (
        client.table("iterations")
        .insert({"project_id": project_id, "name": name, "ordinal": ordinal, "nodes": nodes, "edges": edges})
        .execute()
    )
    row = result.data[0]
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "name": row["name"],
        "ordinal": row["ordinal"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def get_iteration(iteration_id: str) -> dict:
    client = _get_client()
    row = (
        client.table("iterations")
        .select("*")
        .eq("id", iteration_id)
        .single()
        .execute()
    ).data
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "name": row["name"],
        "ordinal": row["ordinal"],
        "nodes": row["nodes"] or [],
        "edges": row["edges"] or [],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def save_iteration(iteration_id: str, nodes: list, edges: list) -> None:
    client = _get_client()
    client.table("iterations").update({"nodes": nodes, "edges": edges}).eq("id", iteration_id).execute()


def list_iterations(project_id: str) -> list[dict]:
    client = _get_client()
    rows = (
        client.table("iterations")
        .select("id, project_id, name, ordinal, created_at, updated_at")
        .eq("project_id", project_id)
        .order("ordinal")
        .execute()
    ).data
    return [
        {
            "id": r["id"],
            "projectId": r["project_id"],
            "name": r["name"],
            "ordinal": r["ordinal"],
            "createdAt": r["created_at"],
            "updatedAt": r["updated_at"],
        }
        for r in rows
    ]
