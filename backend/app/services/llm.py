from __future__ import annotations
import json
import logging
import os
from typing import AsyncIterator

from app.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL
from app.models.actions import AIResponse
from app.models.graph import GraphState
from app.services.providers.base import (
    LLMProvider,
    StreamEvent,
    TokenEvent,
    ToolCallStartEvent,
    ToolCallEndEvent,
    DoneEvent,
)

logger = logging.getLogger(__name__)


# ── Provider factory ───────────────────────────────────────


def _create_provider() -> LLMProvider | None:
    """Create LLM provider based on environment configuration.

    Default is Gemini (free tier). Falls back to Anthropic if
    LLM_PROVIDER=anthropic is set.  Returns None when no API key
    is configured (demo mode).
    """
    provider_name = os.getenv("LLM_PROVIDER", "groq")

    if provider_name == "anthropic":
        if not ANTHROPIC_API_KEY:
            return None
        from app.services.providers.anthropic_provider import AnthropicProvider
        return AnthropicProvider(api_key=ANTHROPIC_API_KEY, model=ANTHROPIC_MODEL)
    elif provider_name == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return None
        from app.services.providers.gemini_provider import GeminiProvider
        model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        return GeminiProvider(api_key=api_key, model=model)
    else:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return None
        from app.services.providers.groq_provider import GroqProvider
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        return GroqProvider(api_key=api_key, model=model)


provider = _create_provider()

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

## CONVERSATION MODE (VERY IMPORTANT)
You operate in two modes:

### 1. DISCUSSION MODE (default for new conversations)
When the user describes a system they want to build, or asks a question:
- DO NOT immediately generate the architecture diagram
- PROPOSE a specific architecture: list the components you'd use, the tech stack, and how they connect
- Ask 2-3 clarifying questions about requirements, scale, or trade-offs
- ALWAYS end your reply by asking: "Should I go ahead and generate the diagram?" (or similar)
- Return an empty actions array: "actions": []
- Put your full conversational reply in the "summary" field (multiple sentences, markdown formatting OK)

### 2. BUILD MODE (only when user explicitly approves)
Switch to build mode ONLY when the user says something like:
- "generate it", "build it", "go ahead", "create the diagram"
- "looks good", "let's do it", "implement it", "yes", "approved"
- Or gives a direct command like "Add a Redis cache" (specific modification)
- Or there is already a graph and they want a specific change

When in build mode, generate the full architecture with actions.

## OUTPUT FORMAT
You MUST return ONLY valid JSON matching this exact schema:
{
  "thought_process": "Your reasoning about what the user wants and how to implement it",
  "actions": [...array of graph actions, OR empty array [] for discussion mode...],
  "summary": "Your response to the user — either a conversational discussion or a description of what you built"
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
- DEFAULT TO DISCUSSION. When in doubt, discuss first rather than generating.
- Return MINIMAL patches. Only the actions needed. Never rewrite the entire graph.
- When removing a node, also emit remove_edge for ALL connected edges.
- When the user says "scale" or "replicas", update the replicas field, don't add duplicate nodes.
- If no changes are needed, return an empty actions array with explanation in summary.
- The "data" field in add_node MUST include "nodeType" matching the node type.

## AMBIGUITY RESOLUTION
- If the user says "add caching" without specifying a target, attach to the most recently discussed service in chat history. If no history, attach to the first service node in the graph.
- If the user references a node that doesn't exist, create it first, then perform the requested action.
- For scaling requests (e.g. "make it faster", "handle more traffic"), use update_node with the replicas field — never duplicate nodes.
- For vague requests like "improve performance", add caching (redis) and/or a load balancer as appropriate, and explain your reasoning in thought_process.

## EXAMPLES

### Example 1: Discussion mode — user describes a system (DO NOT BUILD YET)
User: "How would you design a URL shortener?"
Response:
{"thought_process":"User is asking about designing a URL shortener. I should propose a specific architecture, ask clarifying questions, and offer to generate the diagram.","actions":[],"summary":"Great question! Here's the architecture I'd propose for a URL shortener:\n\n**Proposed Components:**\n1. **API Gateway** (nginx) → entry point, handles rate limiting\n2. **Shortener Service** (Node.js) → creates short codes, handles redirects\n3. **PostgreSQL** → stores URL mappings (short code → original URL)\n4. **Redis Cache** → caches hot/popular URLs for sub-ms lookups\n\n**Flow:** Client → Gateway → Shortener Service → checks Redis first, falls back to Postgres\n\n**A few questions before I generate the diagram:**\n- Do you need click analytics (tracking, geographic data)?\n- What scale are you targeting (requests per second)?\n- Should short codes be custom or auto-generated?\n\nWould you like me to go ahead and generate this diagram, or do you want to adjust anything first?"}

### Example 2: Build mode — user approves
User: "Looks good, generate it"
Response:
{"thought_process":"User approved the URL shortener design. Generating the architecture.","actions":[{"op":"add_node","id":"node_gateway_api_01","type":"gateway","position":{"x":0,"y":200},"data":{"label":"API Gateway","nodeType":"gateway","tech":"nginx"}},{"op":"add_node","id":"node_service_shortener_01","type":"service","position":{"x":500,"y":200},"data":{"label":"Shortener Service","nodeType":"service","tech":"node"}},{"op":"add_node","id":"node_database_urls_01","type":"database","position":{"x":750,"y":300},"data":{"label":"URL Store","nodeType":"database","tech":"postgres"}},{"op":"add_node","id":"node_cache_hot_01","type":"cache","position":{"x":750,"y":100},"data":{"label":"Hot URL Cache","nodeType":"cache","tech":"redis"}},{"op":"add_edge","id":"edge_gateway_shortener_01","source":"node_gateway_api_01","target":"node_service_shortener_01","data":{"label":"routes requests","protocol":"http"}},{"op":"add_edge","id":"edge_shortener_urls_01","source":"node_service_shortener_01","target":"node_database_urls_01","data":{"label":"stores/reads URLs","protocol":"tcp"}},{"op":"add_edge","id":"edge_shortener_cache_01","source":"node_service_shortener_01","target":"node_cache_hot_01","data":{"label":"caches popular URLs","protocol":"tcp"}}],"summary":"Generated URL shortener architecture with API Gateway, Shortener Service, PostgreSQL, and Redis cache."}

### Example 3: Direct modification (build immediately, no discussion needed)
User: "Add caching to the auth service"
(Given graph has node_service_auth_01 at position {x:500, y:100})
Response:
{"thought_process":"User wants a specific modification — adding caching to auth service. This is a direct command so I'll build immediately.","actions":[{"op":"add_node","id":"node_cache_auth_01","type":"cache","position":{"x":750,"y":0},"data":{"label":"Auth Cache","nodeType":"cache","tech":"redis"}},{"op":"add_edge","id":"edge_auth_cache_01","source":"node_service_auth_01","target":"node_cache_auth_01","data":{"label":"caches sessions","protocol":"tcp"}}],"summary":"Added Redis cache for Auth Service."}
"""


def _build_generate_prompt(user_prompt: str, history: list[dict[str, str]] | None = None) -> str:
    history_text = ""
    if history:
        history_text = "\n\nRecent conversation:\n"
        for msg in history[-5:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"

    return f"""The canvas is currently empty. The user is starting a new conversation.
{history_text}
User's message: {user_prompt}

Remember: If the user is describing or asking about a system, DISCUSS IT FIRST (return empty actions []) and have a conversation. Only generate the architecture when they explicitly approve or say to build it."""


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


# ── Non-streaming API (preserved for fallback) ────────────


async def call_llm(prompt: str, is_generate: bool = False) -> AIResponse:
    if not provider:
        return _DEMO_RESPONSE
    if is_generate:
        user_content = _build_generate_prompt(prompt)
    else:
        raise ValueError("Use call_llm_modify for modifications")
    return await provider.generate(SYSTEM_PROMPT, user_content)


async def call_llm_modify(
    graph: GraphState,
    prompt: str,
    history: list[dict[str, str]],
) -> AIResponse:
    if not provider:
        return _DEMO_RESPONSE
    user_content = _build_modify_prompt(graph, prompt, history)
    return await provider.generate(SYSTEM_PROMPT, user_content)


async def call_llm_generate(prompt: str, history: list[dict[str, str]] | None = None) -> AIResponse:
    if not provider:
        return _DEMO_RESPONSE
    user_content = _build_generate_prompt(prompt, history)
    return await provider.generate(SYSTEM_PROMPT, user_content)


# ── Streaming API (new) ───────────────────────────────────


async def stream_llm_generate(prompt: str, history: list[dict[str, str]] | None = None) -> AsyncIterator[StreamEvent]:
    if not provider:
        yield DoneEvent(response=_DEMO_RESPONSE)
        return
    user_content = _build_generate_prompt(prompt, history)
    async for event in provider.stream(SYSTEM_PROMPT, user_content):
        yield event


async def stream_llm_modify(
    graph: GraphState,
    prompt: str,
    history: list[dict[str, str]],
) -> AsyncIterator[StreamEvent]:
    if not provider:
        yield DoneEvent(response=_DEMO_RESPONSE)
        return
    user_content = _build_modify_prompt(graph, prompt, history)
    async for event in provider.stream(SYSTEM_PROMPT, user_content):
        yield event


# ── Architecture Review ───────────────────────────────────

REVIEW_PROMPT = """You are an expert system architecture reviewer. Analyze the provided architecture graph and return a detailed review.

CRITICAL: Return ONLY the raw JSON object. No markdown code fences. No text before or after. Your entire response must be valid JSON parseable by json.loads().

## OUTPUT FORMAT
{
  "overall_score": 0-100,
  "categories": {
    "scalability": 0-100,
    "reliability": 0-100,
    "security": 0-100,
    "performance": 0-100,
    "simplicity": 0-100
  },
  "cost_estimate": {
    "total_monthly": number,
    "components": [
      {
        "name": "Component Name",
        "tech": "postgres",
        "provider": "aws",
        "monthly_cost": 50.00,
        "notes": "RDS db.t3.micro, single-AZ"
      }
    ]
  },
  "findings": [
    {
      "severity": "critical|warning|info",
      "title": "Short title",
      "description": "Detailed explanation",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief overall assessment"
}

## SCORING GUIDELINES
- **Scalability** (0-100): Can this handle 10x traffic? Horizontal scaling, caching, load balancers, queues.
- **Reliability** (0-100): Fault tolerance, redundancy, no single points of failure, proper DB backups.
- **Security** (0-100): Auth service present, API gateway for rate limiting, no direct DB exposure.
- **Performance** (0-100): Caching layers, CDN, async processing, efficient data flow.
- **Simplicity** (0-100): Not over-engineered, clear data flow, reasonable number of components.

## COST ESTIMATION GUIDELINES
Estimate monthly cloud costs using standard pricing tiers (e.g. AWS us-east-1):
- **postgres** (RDS db.t3.micro): ~$15-25/mo, (db.t3.medium): ~$50-80/mo
- **mysql** (RDS): similar to postgres
- **mongodb** (Atlas M10): ~$60/mo, (Atlas M0 free): $0
- **redis** (ElastiCache t3.micro): ~$12-25/mo
- **kafka** (MSK): ~$150-300/mo, (self-hosted): ~$50-100/mo
- **rabbitmq** (MQ): ~$30-60/mo
- **nginx/envoy** (gateway on EC2): ~$10-30/mo
- **node/python/go service** (ECS Fargate 0.25vCPU): ~$10-20/mo per instance
- **load_balancer** (ALB): ~$20-30/mo
- If provider is specified (aws/gcp/azure), use that provider's pricing. Otherwise default to AWS.
- Multiply by replicas if specified.

## FINDING SEVERITIES
- **critical**: Architecture will fail under production load or has security vulnerabilities
- **warning**: Suboptimal design that could cause issues at scale
- **info**: Nice-to-have improvements or best practices
"""


_DEMO_REVIEW = {
    "overall_score": 72,
    "categories": {"scalability": 65, "reliability": 70, "security": 80, "performance": 68, "simplicity": 85},
    "cost_estimate": {"total_monthly": 95.0, "components": [
        {"name": "API Gateway", "tech": "nginx", "provider": "aws", "monthly_cost": 15.0, "notes": "EC2 t3.micro"},
        {"name": "App Service", "tech": "node", "provider": "aws", "monthly_cost": 20.0, "notes": "ECS Fargate 0.25vCPU"},
        {"name": "Main DB", "tech": "postgres", "provider": "aws", "monthly_cost": 45.0, "notes": "RDS db.t3.micro"},
        {"name": "Session Cache", "tech": "redis", "provider": "aws", "monthly_cost": 15.0, "notes": "ElastiCache t3.micro"},
    ]},
    "findings": [
        {"severity": "warning", "title": "No load balancer", "description": "Traffic goes directly to API gateway without load balancing.", "suggestion": "Add an ALB or NLB in front of the gateway."},
        {"severity": "info", "title": "Consider adding monitoring", "description": "No monitoring service detected.", "suggestion": "Add Prometheus + Grafana or Datadog for observability."},
    ],
    "summary": "Solid basic architecture. Consider adding load balancing and monitoring for production readiness.",
}


async def call_llm_review(graph: GraphState) -> dict:
    """Analyze architecture and return review JSON dict."""
    import json as _json

    if not provider:
        return _DEMO_REVIEW

    graph_json = graph.model_dump_json(indent=2, by_alias=True)
    user_content = f"""Analyze this architecture and provide a detailed review with scores, cost estimates, and findings.

Architecture graph:
{graph_json}"""

    text = await provider.generate_text(REVIEW_PROMPT, user_content)
    try:
        return _json.loads(text, strict=False)
    except _json.JSONDecodeError:
        logger.warning("Review JSON parse failed, returning demo review")
        return _DEMO_REVIEW


