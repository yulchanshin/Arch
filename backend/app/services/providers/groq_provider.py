"""Groq LLM provider with streaming support."""
from __future__ import annotations
import json
import logging
from typing import AsyncIterator

from groq import AsyncGroq

from app.models.actions import AIResponse
from .base import (
    LLMProvider,
    StreamEvent,
    TokenEvent,
    ToolCallStartEvent,
    ToolCallEndEvent,
    DoneEvent,
    strip_markdown_fences,
)

logger = logging.getLogger(__name__)


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.client = AsyncGroq(api_key=api_key)
        self.model = model

    async def generate_text(self, system: str, user_content: str) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        return strip_markdown_fences(response.choices[0].message.content or "")

    async def generate(self, system: str, user_content: str) -> AIResponse:
        text = await self.generate_text(system, user_content)
        return AIResponse.model_validate(json.loads(text, strict=False))

    async def stream(self, system: str, user_content: str) -> AsyncIterator[StreamEvent]:
        yield ToolCallStartEvent(
            tool_name="analyze_architecture",
            tool_input={"prompt_length": len(user_content)},
        )

        full_text = ""
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,
            max_tokens=4096,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                full_text += delta.content
                yield TokenEvent(token=delta.content)

        yield ToolCallEndEvent(
            tool_name="analyze_architecture",
            tool_output={"status": "complete", "length": len(full_text)},
        )

        cleaned = strip_markdown_fences(full_text)
        parsed = json.loads(cleaned, strict=False)
        yield DoneEvent(response=AIResponse.model_validate(parsed))
