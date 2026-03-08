from __future__ import annotations
from typing import Optional
from pydantic import BaseModel

from .graph import GraphState
from .actions import AIResponse


class ChatMessage(BaseModel):
    role: str
    content: str


class GenerateRequest(BaseModel):
    prompt: str
    history: list[ChatMessage] = []


class ModifyRequest(BaseModel):
    graph: GraphState
    prompt: str
    history: list[ChatMessage] = []


class GenerateResponse(BaseModel):
    ai_response: AIResponse


class ModifyResponse(BaseModel):
    ai_response: AIResponse


class ErrorResponse(BaseModel):
    detail: str


# ── Review / Scoring Models ──────────────────────────────

class CostComponent(BaseModel):
    name: str
    tech: str
    provider: str | None = None
    monthly_cost: float
    notes: str = ""


class CostEstimate(BaseModel):
    total_monthly: float
    components: list[CostComponent] = []


class ReviewFinding(BaseModel):
    severity: str  # "critical" | "warning" | "info"
    title: str
    description: str
    suggestion: str = ""


class ArchReview(BaseModel):
    overall_score: int
    categories: dict[str, int]  # e.g. {"scalability": 75, ...}
    cost_estimate: CostEstimate
    findings: list[ReviewFinding] = []
    summary: str


class ReviewRequest(BaseModel):
    graph: GraphState


class ReviewResponse(BaseModel):
    review: ArchReview

