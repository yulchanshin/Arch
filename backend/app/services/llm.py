from __future__ import annotations
import json
import logging
from openai import AsyncOpenAI

from app.config import OPENAI_API_KEY, OPENAI_MODEL
from app.models.actions import AIResponse
from app.models.graph import GraphState

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = """You are Arch, an expert system design architect. You help users design distributed system architectures by generating and modifying node graphs.

## OUTPUT FORMAT
You MUST return ONLY valid JSON matching this exact schema:
{
  "thought_process": "Your reasoning about what the user wants and how to implement it",
  "actions": [...array of graph actions...],
  "summary": "A one-line summary of what you did"
}

## ACTION TYPES
Each action has an "op" field. Available operations:

1. add_node: Add a new node
   {"op": "add_node", "id": "node_{type}_{name}_{counter}", "type": "{nodeType}", "position": {"x": N, "y": N}, "data": {"label": "Human Name", "nodeType": "{type}", "tech": "optional", "provider": "optional"}}

2. remove_node: Remove a node (also removes connected edges)
   {"op": "remove_node", "id": "node_id"}

3. update_node: Update node properties
   {"op": "update_node", "id": "node_id", "data": {"label": "New Name", ...partial fields}}

4. move_node: Move a node
   {"op": "move_node", "id": "node_id", "position": {"x": N, "y": N}}

5. add_edge: Connect two nodes
   {"op": "add_edge", "id": "edge_{source}_{target}_{counter}", "source": "source_node_id", "target": "target_node_id", "data": {"label": "connection label", "protocol": "http|grpc|ws|tcp|amqp|kafka", "animated": false}}

6. remove_edge: Remove a connection
   {"op": "remove_edge", "id": "edge_id"}

7. update_edge: Update edge properties
   {"op": "update_edge", "id": "edge_id", "data": {"label": "new label", ...partial fields}}

## NODE TYPES
- service: Application services (APIs, workers, etc). Accent: cyan.
- database: Data stores (postgres, mysql, mongodb). Accent: amber.
- cache: Caching layers (redis, memcached). Accent: emerald.
- queue: Message queues (kafka, rabbitmq, sqs). Accent: violet.
- gateway: API gateways, entry points. Accent: blue.
- load_balancer: Load balancers, traffic distributors. Accent: orange.

## POSITIONING RULES (CRITICAL)
- Grid unit: 250px horizontal, 200px vertical.
- Left-to-right flow: Gateway → Load Balancer → Services → Databases/Caches/Queues.
- Gateway: x=0, y=200
- Load Balancer: x=250, y=200
- Services: x=500+, spaced vertically by 200px starting at y=100
- Databases: Same x as their service + 250, y + 100
- Caches: Same x as their service + 250, y - 100
- Queues: Between services horizontally, offset vertically
- When adding to an existing graph, place new nodes relative to related existing nodes.
- Avoid overlapping: check existing positions and offset by at least 200px.

## ID CONVENTION
- Nodes: node_{type}_{shortname}_{counter} (e.g., node_service_auth_01)
- Edges: edge_{source_short}_{target_short}_{counter} (e.g., edge_auth_redis_01)

## RULES
- Return MINIMAL patches. Only the actions needed. Never rewrite the entire graph.
- When removing a node, also emit remove_edge for ALL connected edges.
- When the user says "scale" or "replicas", update the replicas field, don't add duplicate nodes.
- If the user's request is unclear, make reasonable assumptions and explain in thought_process.
- If no changes are needed, return an empty actions array with explanation in summary.
- The "data" field in add_node MUST include "nodeType" matching the node type.
"""


def _build_generate_prompt(user_prompt: str) -> str:
    return f"""The user wants to create a NEW system architecture from scratch. The canvas is currently empty.

User's request: {user_prompt}

Generate a complete architecture with appropriate nodes and edges. Use the positioning rules to create a clean left-to-right layout. Include all necessary connections between components."""


def _build_modify_prompt(
    graph: GraphState,
    user_prompt: str,
    history: list[dict[str, str]],
) -> str:
    graph_json = graph.model_dump_json(indent=2, by_alias=True)

    history_text = ""
    if history:
        history_text = "\n\nRecent conversation:\n"
        for msg in history[-5:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"

    return f"""The user wants to MODIFY an existing architecture.

Current graph state:
{graph_json}
{history_text}
User's request: {user_prompt}

Analyze the current graph and return only the minimal actions needed to fulfill the user's request. Reference existing node IDs when connecting to existing nodes."""


async def call_llm(prompt: str, is_generate: bool = False) -> AIResponse:
    if is_generate:
        user_content = _build_generate_prompt(prompt)
    else:
        raise ValueError("Use call_llm_modify for modifications")

    return await _call_openai(user_content)


async def call_llm_modify(
    graph: GraphState,
    prompt: str,
    history: list[dict[str, str]],
) -> AIResponse:
    user_content = _build_modify_prompt(graph, prompt, history)
    return await _call_openai(user_content)


async def call_llm_generate(prompt: str) -> AIResponse:
    user_content = _build_generate_prompt(prompt)
    return await _call_openai(user_content)


async def _call_openai(user_content: str, retry: bool = True) -> AIResponse:
    try:
        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=4096,
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from LLM")

        parsed = json.loads(content)
        return AIResponse.model_validate(parsed)

    except Exception as e:
        if retry:
            logger.warning(f"LLM call failed, retrying: {e}")
            return await _call_openai(user_content, retry=False)
        logger.error(f"LLM call failed after retry: {e}")
        raise
