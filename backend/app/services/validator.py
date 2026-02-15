from __future__ import annotations
import logging
from app.models.actions import AIResponse, GraphAction
from app.models.graph import GraphState

logger = logging.getLogger(__name__)


def validate_actions(response: AIResponse, current_graph: GraphState | None = None) -> AIResponse:
    """Validate AI response actions for reference integrity and duplicates."""

    # Build a virtual node/edge set from current graph
    node_ids: set[str] = set()
    edge_ids: set[str] = set()

    if current_graph:
        node_ids = {n.id for n in current_graph.nodes}
        edge_ids = {e.id for e in current_graph.edges}

    valid_actions: list[GraphAction] = []
    existing_positions: list[tuple[float, float]] = []

    if current_graph:
        existing_positions = [(n.position.x, n.position.y) for n in current_graph.nodes]

    for action in response.actions:
        match action.op:
            case "add_node":
                if action.id in node_ids:
                    logger.warning(f"Duplicate node ID: {action.id}, skipping")
                    continue

                # Collision detection: shift if too close to existing
                pos_x, pos_y = action.position.x, action.position.y
                for ex, ey in existing_positions:
                    if abs(pos_x - ex) < 150 and abs(pos_y - ey) < 150:
                        pos_x += 200
                        pos_y += 50

                action.position.x = pos_x
                action.position.y = pos_y
                existing_positions.append((pos_x, pos_y))
                node_ids.add(action.id)
                valid_actions.append(action)

            case "remove_node":
                if action.id not in node_ids:
                    logger.warning(f"Node not found for removal: {action.id}, skipping")
                    continue
                node_ids.discard(action.id)
                valid_actions.append(action)

            case "update_node":
                if action.id not in node_ids:
                    logger.warning(f"Node not found for update: {action.id}, skipping")
                    continue
                valid_actions.append(action)

            case "move_node":
                if action.id not in node_ids:
                    logger.warning(f"Node not found for move: {action.id}, skipping")
                    continue
                valid_actions.append(action)

            case "add_edge":
                if action.id in edge_ids:
                    logger.warning(f"Duplicate edge ID: {action.id}, skipping")
                    continue
                if action.source not in node_ids:
                    logger.warning(f"Edge source not found: {action.source}, skipping")
                    continue
                if action.target not in node_ids:
                    logger.warning(f"Edge target not found: {action.target}, skipping")
                    continue
                edge_ids.add(action.id)
                valid_actions.append(action)

            case "remove_edge":
                if action.id not in edge_ids:
                    logger.warning(f"Edge not found for removal: {action.id}, skipping")
                    continue
                edge_ids.discard(action.id)
                valid_actions.append(action)

            case "update_edge":
                if action.id not in edge_ids:
                    logger.warning(f"Edge not found for update: {action.id}, skipping")
                    continue
                valid_actions.append(action)

    response.actions = valid_actions
    return response
