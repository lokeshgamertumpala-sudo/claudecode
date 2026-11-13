"""
NVIDIA NIM Provider Implementation
Supports all verified NVIDIA-hosted models via integrate.api.nvidia.com
"""
import asyncio
import json
import os
import time
from typing import Any, Optional
import httpx

from providers.base import (
    BaseProvider, ProviderConfig, ModelConfig, ChatRequest, ChatResponse,
    ProviderType, ModelRole, ProviderHealth
)


class NVIDIAProvider(BaseProvider):
    """NVIDIA NIM API provider for all NVIDIA-hosted models."""

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.client: Optional[httpx.AsyncClient] = None
        self._api_key = os.environ.get("NVIDIA_API_KEY")
        if not self._api_key:
            raise ValueError("NVIDIA_API_KEY environment variable not set")

    async def _get_client(self, read_timeout: float = 60.0) -> httpx.AsyncClient:
        """Get or create HTTP client with connection pooling."""
        if self.client is None or self.client.is_closed:
            self.client = httpx.AsyncClient(
                base_url=self.config.base_url,
                timeout=httpx.Timeout(
                    connect=10.0,
                    read=read_timeout,
                    write=10.0,
                    pool=5.0
                ),
                limits=httpx.Limits(
                    max_connections=20,
                    max_keepalive_connections=10,
                    keepalive_expiry=30.0
                ),
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
        return self.client

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Execute chat completion via NVIDIA NIM API."""
        client = await self._get_client()
        model_config = self.get_model_config(request.model)
        if not model_config:
            raise ValueError(f"Unknown model: {request.model}")

        start_time = time.time()
        payload = {
            "model": model_config.id,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "top_p": request.top_p,
            "stream": request.stream
        }

        if request.tools:
            payload["tools"] = request.tools
            if request.tool_choice:
                payload["tool_choice"] = request.tool_choice

        try:
            response = await client.post("/chat/completions", json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code == 200:
                data = response.json()
                self.record_success(request.model, latency_ms)
                return self._parse_response(data, model_config.id, latency_ms)

            elif response.status_code == 429:
                self.record_failure(request.model)
                retry_after = response.headers.get("Retry-After", "60")
                raise RateLimitError(
                    f"Rate limited. Retry after {retry_after}s",
                    retry_after=int(retry_after)
                )

            elif response.status_code == 401:
                self.record_failure(request.model)
                raise AuthenticationError("Invalid NVIDIA API key")

            elif response.status_code == 404:
                self.record_failure(request.model)
                raise ModelNotFoundError(f"Model not found: {model_config.id}")

            elif 500 <= response.status_code < 600:
                self.record_failure(request.model)
                raise ServerError(f"Server error: {response.status_code}")

            else:
                self.record_failure(request.model)
                raise APIError(f"HTTP {response.status_code}: {response.text}")

        except httpx.TimeoutException:
            self.record_failure(request.model)
            raise TimeoutError("Request timed out")
        except httpx.NetworkError as e:
            self.record_failure(request.model)
            raise NetworkError(f"Network error: {e}")

    def _parse_response(self, data: dict, model_id: str, latency_ms: float) -> ChatResponse:
        """Parse NVIDIA API response into ChatResponse."""
        choice = data.get("choices", [{}])[0]
        message = choice.get("message", {})
        # NVIDIA API may return content in 'content' or 'reasoning_content'
        content = message.get("content") or message.get("reasoning_content", "")
        tool_calls = message.get("tool_calls")
        finish_reason = choice.get("finish_reason")
        usage = data.get("usage")

        return ChatResponse(
            content=content,
            model=model_id,
            provider=ProviderType.NVIDIA,
            usage=usage,
            finish_reason=finish_reason,
            tool_calls=tool_calls,
            raw_response=data
        )

    async def health_check(self, model_key: str) -> bool:
        """Check model availability via a lightweight request."""
        model_config = self.get_model_config(model_key)
        if not model_config:
            return False

        client = await self._get_client(read_timeout=30.0)
        try:
            response = await client.post(
                "/chat/completions",
                json={
                    "model": model_config.id,
                    "messages": [{"role": "user", "content": "ping"}],
                    "max_tokens": 1
                },
                timeout=httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=5.0)
            )
            healthy = response.status_code == 200
            health = self.get_health(model_key)
            if health:
                health.healthy = healthy
            return healthy
        except Exception:
            health = self.get_health(model_key)
            if health:
                health.healthy = False
            return False

    async def close(self):
        """Close the HTTP client."""
        if self.client and not self.client.is_closed:
            await self.client.aclose()


# Custom Exceptions
class APIError(Exception):
    pass


class RateLimitError(APIError):
    def __init__(self, message: str, retry_after: int = 60):
        super().__init__(message)
        self.retry_after = retry_after


class AuthenticationError(APIError):
    pass


class ModelNotFoundError(APIError):
    pass


class ServerError(APIError):
    pass


class TimeoutError(APIError):
    pass


class NetworkError(APIError):
    pass