from __future__ import annotations
import json
import logging
from anthropic import AsyncAnthropic

from app.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL
from app.models.actions import AIResponse
from app.models.graph import GraphState

logger = logging.getLogger(__name__)

client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# Static demo response returned when no API key is configured
_DEMO_RESPONSE = AIResponse.model_validate({
    "thought_process": "No API key configured. Returning a demo architecture.",
    "actions": [
        {
            "op": "add_node",
            "id": "node_gateway_api_01",
            "type": "gateway",
            "position": {"x": 0, "y": 200},
            "data": {"label": "API Gateway", "nodeType": "gateway", "tech": "nginx"},
        },
        {
            "op": "add_node",
            "id": "node_service_app_01",
            "type": "service",
            "position": {"x": 400, "y": 100},
            "data": {"label": "App Service", "nodeType": "service", "tech": "node"},
        },
        {
            "op": "add_node",
            "id": "node_database_main_01",
            "type": "database",
            "position": {"x": 800, "y": 100},
            "data": {"label": "Main DB", "nodeType": "database", "tech": "postgres"},
        },
        {
            "op": "add_node",
            "id": "node_cache_session_01",
            "type": "cache",
            "position": {"x": 800, "y": 300},
            "data": {"label": "Session Cache", "nodeType": "cache", "tech": "redis"},
        },
        {
            "op": "add_edge",
            "id": "edge_gateway_app_01",
            "source": "node_gateway_api_01",
            "target": "node_service_app_01",
            "data": {"label": "routes traffic", "protocol": "http"},
        },
        {
            "op": "add_edge",
            "id": "edge_app_db_01",
            "source": "node_service_app_01",
            "target": "node_database_main_01",
            "data": {"label": "reads/writes", "protocol": "tcp"},
        },
        {
            "op": "add_edge",
            "id": "edge_app_cache_01",
            "source": "node_service_app_01",
            "target": "node_cache_session_01",
            "data": {"label": "caches sessions", "protocol": "tcp"},
        },
    ],
    "summary": "Demo architecture: Gateway → App Service → Postgres + Redis (no API key configured)",
})

SYSTEM_PROMPT = """You are Arch, an expert system design architect. You help users design distributed system architectures by generating and modifying node graphs.

CRITICAL: Return ONLY the raw JSON object. No markdown code fences. No text before or after. Your entire response must be valid JSON parseable by json.loads(). Do NOT wrap in ```json``` or any other markers.

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

## VALID TECHNOLOGIES PER NODE TYPE
You MUST only use tech values from this list. Any other value will be rejected.

- database: postgres, mysql, mariadb, sqlite, cockroachdb, planetscale, mongodb, dynamodb, cassandra, couchdb, firestore, pinecone, weaviate, qdrant, milvus, chroma, influxdb, timescaledb, clickhouse, elasticsearch, opensearch, meilisearch, typesense, algolia, s3, gcs, minio, r2
- cache: redis, memcached, dragonfly, valkey
- queue: kafka, rabbitmq, sqs, nats, pulsar
- gateway: nginx, envoy, kong, traefik, apisix
- load_balancer: nginx, envoy, traefik, haproxy
- service: python, go, node, rust, java, dotnet, elixir, ruby, php, prometheus, grafana, datadog, jaeger, sentry, auth0, clerk, keycloak, firebase_auth, supabase_auth

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

## AMBIGUITY RESOLUTION
- If the user says "add caching" without specifying a target, attach to the most recently discussed service in chat history. If no history, attach to the first service node in the graph.
- If the user references a node that doesn't exist, create it first, then perform the requested action.
- For scaling requests (e.g. "make it faster", "handle more traffic"), use update_node with the replicas field — never duplicate nodes.
- For vague requests like "improve performance", add caching (redis) and/or a load balancer as appropriate, and explain your reasoning in thought_process.

## EXAMPLES

### Example 1: Generate from scratch
User: "Build a URL shortener"
Response:
{"thought_process":"Building a URL shortener with: API gateway for entry, a shortener service, PostgreSQL for URL mappings, and Redis for caching hot URLs.","actions":[{"op":"add_node","id":"node_gateway_api_01","type":"gateway","position":{"x":0,"y":200},"data":{"label":"API Gateway","nodeType":"gateway","tech":"nginx"}},{"op":"add_node","id":"node_service_shortener_01","type":"service","position":{"x":500,"y":200},"data":{"label":"Shortener Service","nodeType":"service","tech":"node"}},{"op":"add_node","id":"node_database_urls_01","type":"database","position":{"x":750,"y":300},"data":{"label":"URL Store","nodeType":"database","tech":"postgres"}},{"op":"add_node","id":"node_cache_hot_01","type":"cache","position":{"x":750,"y":100},"data":{"label":"Hot URL Cache","nodeType":"cache","tech":"redis"}},{"op":"add_edge","id":"edge_gateway_shortener_01","source":"node_gateway_api_01","target":"node_service_shortener_01","data":{"label":"routes requests","protocol":"http"}},{"op":"add_edge","id":"edge_shortener_urls_01","source":"node_service_shortener_01","target":"node_database_urls_01","data":{"label":"stores/reads URLs","protocol":"tcp"}},{"op":"add_edge","id":"edge_shortener_cache_01","source":"node_service_shortener_01","target":"node_cache_hot_01","data":{"label":"caches popular URLs","protocol":"tcp"}}],"summary":"URL shortener with API Gateway, Shortener Service, Postgres, and Redis cache"}

### Example 2: Modify existing — add caching to a specific service
User: "Add caching to the auth service"
(Given graph has node_service_auth_01 at position {x:500, y:100})
Response:
{"thought_process":"User wants caching for the auth service. Adding a Redis cache node near the auth service and connecting them.","actions":[{"op":"add_node","id":"node_cache_auth_01","type":"cache","position":{"x":750,"y":0},"data":{"label":"Auth Cache","nodeType":"cache","tech":"redis"}},{"op":"add_edge","id":"edge_auth_cache_01","source":"node_service_auth_01","target":"node_cache_auth_01","data":{"label":"caches sessions","protocol":"tcp"}}],"summary":"Added Redis cache for Auth Service"}

### Example 3: Ambiguous request with multiple services
User: "Add caching" (graph has auth service and user service)
Response:
{"thought_process":"User said 'add caching' without specifying which service. No recent chat context to disambiguate. Adding a shared Redis cache connected to the first service (auth service). User can modify later if needed.","actions":[{"op":"add_node","id":"node_cache_shared_01","type":"cache","position":{"x":750,"y":0},"data":{"label":"Shared Cache","nodeType":"cache","tech":"redis"}},{"op":"add_edge","id":"edge_auth_cache_01","source":"node_service_auth_01","target":"node_cache_shared_01","data":{"label":"caches data","protocol":"tcp"}}],"summary":"Added shared Redis cache connected to Auth Service (first service in graph)"}
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
    if not ANTHROPIC_API_KEY:
        return _DEMO_RESPONSE
    if is_generate:
        user_content = _build_generate_prompt(prompt)
    else:
        raise ValueError("Use call_llm_modify for modifications")

    return await _call_anthropic(user_content)


async def call_llm_modify(
    graph: GraphState,
    prompt: str,
    history: list[dict[str, str]],
) -> AIResponse:
    if not ANTHROPIC_API_KEY:
        return _DEMO_RESPONSE
    user_content = _build_modify_prompt(graph, prompt, history)
    return await _call_anthropic(user_content)


async def call_llm_generate(prompt: str) -> AIResponse:
    if not ANTHROPIC_API_KEY:
        return _DEMO_RESPONSE
    user_content = _build_generate_prompt(prompt)
    return await _call_anthropic(user_content)


async def _call_anthropic(user_content: str, retry: bool = True) -> AIResponse:
    try:
        response = await client.messages.create(
            model=ANTHROPIC_MODEL,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,
            max_tokens=4096,
        )

        content = response.content[0].text
        if not content:
            raise ValueError("Empty response from LLM")

        # Strip markdown fences if present
        text = content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        parsed = json.loads(text)
        return AIResponse.model_validate(parsed)

    except Exception as e:
        if retry:
            logger.warning(f"LLM call failed, retrying: {e}")
            return await _call_anthropic(user_content, retry=False)
        logger.error(f"LLM call failed after retry: {e}")
        raise
