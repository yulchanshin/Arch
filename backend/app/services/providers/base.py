"""Base LLM provider abstraction with streaming event types."""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator

from app.models.actions import AIResponse


# ── Stream events ──────────────────────────────────────────


@dataclass
class StreamEvent:
    """Base class for SSE stream events."""
    pass


@dataclass
class TokenEvent(StreamEvent):
    """A chunk of text from the LLM."""
    token: str


@dataclass
class ToolCallStartEvent(StreamEvent):
    """Signals the start of a synthetic tool call (for UI visualization)."""
    tool_name: str
    tool_input: dict


@dataclass
class ToolCallEndEvent(StreamEvent):
    """Signals the end of a synthetic tool call."""
    tool_name: str
    tool_output: dict


@dataclass
class DoneEvent(StreamEvent):
    """Final event carrying the parsed AIResponse."""
    response: AIResponse


@dataclass
class ErrorEvent(StreamEvent):
    """An error during generation."""
    message: str


# ── LLM provider ABC ──────────────────────────────────────


class LLMProvider(ABC):
    """Abstract base class for LLM providers (Anthropic, Gemini, etc.)."""

    @abstractmethod
    async def generate(self, system: str, user_content: str) -> AIResponse:
        """Non-streaming generation. Returns a complete AIResponse."""
        ...

    @abstractmethod
    async def stream(self, system: str, user_content: str) -> AsyncIterator[StreamEvent]:
        """Streaming generation. Yields StreamEvents."""
        ...
