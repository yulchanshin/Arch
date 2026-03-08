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
)

logger = logging.getLogger(__name__)


def _strip_markdown_fences(text: str) -> str:
    """Remove ```json ... ``` wrappers if present."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    return text


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.client = AsyncGroq(api_key=api_key)
        self.model = model

    async def generate(self, system: str, user_content: str) -> AIResponse:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        text = _strip_markdown_fences(response.choices[0].message.content or "")
        parsed = json.loads(text)
        return AIResponse.model_validate(parsed)

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

        cleaned = _strip_markdown_fences(full_text)
        parsed = json.loads(cleaned)
        yield DoneEvent(response=AIResponse.model_validate(parsed))
