"""Anthropic (Claude) LLM provider with streaming support."""
from __future__ import annotations
import json
import logging
from typing import AsyncIterator

from anthropic import AsyncAnthropic

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


class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str, model: str):
        self.client = AsyncAnthropic(api_key=api_key)
        self.model = model

    async def generate_text(self, system: str, user_content: str) -> str:
        response = await self.client.messages.create(
            model=self.model,
            system=system,
            messages=[{"role": "user", "content": user_content}],
            temperature=0.3,
            max_tokens=4096,
        )
        return strip_markdown_fences(response.content[0].text)

    async def generate(self, system: str, user_content: str) -> AIResponse:
        text = await self.generate_text(system, user_content)
        return AIResponse.model_validate(json.loads(text, strict=False))

    async def stream(self, system: str, user_content: str) -> AsyncIterator[StreamEvent]:
        # Synthetic tool-call for UI visualization
        yield ToolCallStartEvent(
            tool_name="analyze_architecture",
            tool_input={"prompt_length": len(user_content)},
        )

        full_text = ""
        async with self.client.messages.stream(
            model=self.model,
            system=system,
            messages=[{"role": "user", "content": user_content}],
            temperature=0.3,
            max_tokens=4096,
        ) as stream:
            async for text in stream.text_stream:
                full_text += text
                yield TokenEvent(token=text)

        # Parse the completed response
        yield ToolCallEndEvent(
            tool_name="analyze_architecture",
            tool_output={"status": "complete", "length": len(full_text)},
        )

        cleaned = strip_markdown_fences(full_text)
        parsed = json.loads(cleaned, strict=False)
        yield DoneEvent(response=AIResponse.model_validate(parsed))
