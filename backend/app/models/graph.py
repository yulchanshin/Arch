from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

NodeType = Literal["service", "database", "cache", "queue", "gateway", "load_balancer"]
Provider = Literal["aws", "gcp", "azure", "supabase", "vercel", "cloudflare"]
Tech = Literal[
    # DB (SQL)
    "postgres", "mysql", "mariadb", "sqlite", "cockroachdb", "planetscale",
    # DB (NoSQL)
    "mongodb", "dynamodb", "cassandra", "couchdb", "firestore",
    # DB (Vector)
    "pinecone", "weaviate", "qdrant", "milvus", "chroma",
    # DB (Time-series)
    "influxdb", "timescaledb", "clickhouse",
    # Caches
    "redis", "memcached", "dragonfly", "valkey",
    # Brokers / Queues
    "kafka", "rabbitmq", "sqs", "nats", "pulsar",
    # Gateways / Load Balancers
    "nginx", "envoy", "kong", "traefik", "apisix", "haproxy",
    # Runtimes
    "python", "go", "node", "rust", "java", "dotnet", "elixir", "ruby", "php",
    # Search
    "elasticsearch", "opensearch", "meilisearch", "typesense", "algolia",
    # Object Storage
    "s3", "gcs", "minio", "r2",
    # Observability
    "prometheus", "grafana", "datadog", "jaeger", "sentry",
    # Auth
    "auth0", "clerk", "keycloak", "firebase_auth", "supabase_auth",
]
Protocol = Literal["http", "grpc", "ws", "tcp", "amqp", "kafka"]

# Valid sets for quick lookup
_VALID_TECH = {
    # DB (SQL)
    "postgres", "mysql", "mariadb", "sqlite", "cockroachdb", "planetscale",
    # DB (NoSQL)
    "mongodb", "dynamodb", "cassandra", "couchdb", "firestore",
    # DB (Vector)
    "pinecone", "weaviate", "qdrant", "milvus", "chroma",
    # DB (Time-series)
    "influxdb", "timescaledb", "clickhouse",
    # Caches
    "redis", "memcached", "dragonfly", "valkey",
    # Brokers / Queues
    "kafka", "rabbitmq", "sqs", "nats", "pulsar",
    # Gateways / Load Balancers
    "nginx", "envoy", "kong", "traefik", "apisix", "haproxy",
    # Runtimes
    "python", "go", "node", "rust", "java", "dotnet", "elixir", "ruby", "php",
    # Search
    "elasticsearch", "opensearch", "meilisearch", "typesense", "algolia",
    # Object Storage
    "s3", "gcs", "minio", "r2",
    # Observability
    "prometheus", "grafana", "datadog", "jaeger", "sentry",
    # Auth
    "auth0", "clerk", "keycloak", "firebase_auth", "supabase_auth",
}
_VALID_PROTOCOL = {"http", "grpc", "ws", "tcp", "amqp", "kafka"}

# Map common LLM variants to valid Tech values
_TECH_ALIASES: dict[str, str] = {
    # SQL
    "postgresql": "postgres",
    "pg": "postgres",
    "maria": "mariadb",
    "cockroach": "cockroachdb",
    # NoSQL
    "mongo": "mongodb",
    "dynamo": "dynamodb",
    "couch": "couchdb",
    # Vector
    "pine": "pinecone",
    "chromadb": "chroma",
    # Time-series
    "influx": "influxdb",
    "timescale": "timescaledb",
    # Caches
    "valkey": "valkey",
    # Queues
    "rabbit": "rabbitmq",
    "amazon_sqs": "sqs",
    "amazon-sqs": "sqs",
    # Gateways
    "ha_proxy": "haproxy",
    "ha-proxy": "haproxy",
    "api_six": "apisix",
    "apache_apisix": "apisix",
    # Runtimes
    "node.js": "node",
    "nodejs": "node",
    "golang": "go",
    ".net": "dotnet",
    "csharp": "dotnet",
    "c#": "dotnet",
    # Search
    "elastic": "elasticsearch",
    "elastic_search": "elasticsearch",
    "open_search": "opensearch",
    "meili": "meilisearch",
    "meili_search": "meilisearch",
    # Storage
    "amazon_s3": "s3",
    "aws_s3": "s3",
    "google_cloud_storage": "gcs",
    "cloudflare_r2": "r2",
    # Observability
    "prom": "prometheus",
    # Auth
    "firebase-auth": "firebase_auth",
    "supabase-auth": "supabase_auth",
}

_PROTOCOL_ALIASES: dict[str, str] = {
    "https": "http",
    "http/2": "http",
    "websocket": "ws",
    "websockets": "ws",
    "amqps": "amqp",
}


class NodeData(BaseModel):
    label: str
    node_type: NodeType = Field(alias="nodeType")
    provider: Optional[Provider] = None
    tech: Optional[Tech] = None
    replicas: Optional[int] = None
    region: Optional[str] = None
    description: Optional[str] = None
    port: Optional[int] = None

    model_config = {"populate_by_name": True}

    @field_validator("tech", mode="before")
    @classmethod
    def normalize_tech(cls, v: str | None) -> str | None:
        if v is None:
            return None
        lowered = v.strip().lower().replace(" ", "_")
        # Try exact match first
        if lowered in _VALID_TECH:
            return lowered
        # Try alias resolution
        resolved = _TECH_ALIASES.get(lowered)
        if resolved and resolved in _VALID_TECH:
            return resolved
        # Try stripping hyphens
        dehyphenated = lowered.replace("-", "_")
        if dehyphenated in _VALID_TECH:
            return dehyphenated
        resolved = _TECH_ALIASES.get(dehyphenated)
        if resolved and resolved in _VALID_TECH:
            return resolved
        # Unknown tech → drop to None
        return None


class EdgeData(BaseModel):
    label: Optional[str] = None
    protocol: Optional[Protocol] = None
    latency: Optional[str] = None
    throughput: Optional[str] = None
    animated: Optional[bool] = None

    @field_validator("protocol", mode="before")
    @classmethod
    def normalize_protocol(cls, v: str | None) -> str | None:
        if v is None:
            return None
        lowered = v.strip().lower()
        resolved = _PROTOCOL_ALIASES.get(lowered, lowered)
        return resolved if resolved in _VALID_PROTOCOL else None


class Position(BaseModel):
    x: float
    y: float


class GraphNode(BaseModel):
    id: str
    type: Optional[str] = None
    position: Position
    data: NodeData

    model_config = {"populate_by_name": True}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = None
    data: Optional[EdgeData] = None

    model_config = {"populate_by_name": True}


class GraphState(BaseModel):
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
