"""Google Gemini LLM provider with streaming support."""
from __future__ import annotations
import json
import logging
from typing import AsyncIterator

from google import genai

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


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def generate_text(self, system: str, user_content: str) -> str:
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=user_content,
            config=genai.types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.3,
                max_output_tokens=4096,
            ),
        )
        return strip_markdown_fences(response.text)

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
        async for chunk in await self.client.aio.models.generate_content_stream(
            model=self.model,
            contents=user_content,
            config=genai.types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.3,
                max_output_tokens=4096,
            ),
        ):
            if chunk.text:
                full_text += chunk.text
                yield TokenEvent(token=chunk.text)

        # Parse the completed response
        yield ToolCallEndEvent(
            tool_name="analyze_architecture",
            tool_output={"status": "complete", "length": len(full_text)},
        )

        cleaned = strip_markdown_fences(full_text)
        parsed = json.loads(cleaned, strict=False)
        yield DoneEvent(response=AIResponse.model_validate(parsed))
