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
