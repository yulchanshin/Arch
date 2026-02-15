from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field

NodeType = Literal["service", "database", "cache", "queue", "gateway", "load_balancer"]
Provider = Literal["aws", "gcp", "azure", "supabase", "vercel", "cloudflare"]
Tech = Literal[
    "postgres", "mysql", "mongodb", "redis", "memcached",
    "kafka", "rabbitmq", "sqs",
    "python", "go", "node", "rust", "java",
    "nginx", "envoy", "kong",
]
Protocol = Literal["http", "grpc", "ws", "tcp", "amqp", "kafka"]


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


class EdgeData(BaseModel):
    label: Optional[str] = None
    protocol: Optional[Protocol] = None
    latency: Optional[str] = None
    throughput: Optional[str] = None
    animated: Optional[bool] = None


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
