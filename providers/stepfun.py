"""
StepFun Provider (External - requires separate API key)
"""
import os
import time
from typing import Optional
import httpx

from providers.base import (
    BaseProvider, ProviderConfig, ModelConfig, ChatRequest, ChatResponse,
    ProviderType, ModelRole
)


class StepFunProvider(BaseProvider):
    """StepFun API provider for rapid execution tasks."""

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.client: Optional[httpx.AsyncClient] = None
        self._api_key = os.environ.get("STEPFUN_API_KEY")

    async def _get_client(self) -> httpx.AsyncClient:
        if self.client is None or self.client.is_closed:
            headers = {"Content-Type": "application/json", "Accept": "application/json"}
            if self._api_key:
                headers["Authorization"] = f"Bearer {self._api_key}"
            self.client = httpx.AsyncClient(
                base_url=self.config.base_url,
                timeout=httpx.Timeout(connect=10.0, read=60.0),
                headers=headers
            )
        return self.client

    async def chat(self, request: ChatRequest) -> ChatResponse:
        if not self._api_key:
            raise ValueError("STEPFUN_API_KEY not configured")

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

        try:
            response = await client.post("/chat/completions", json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code == 200:
                data = response.json()
                self.record_success(request.model, latency_ms)
                return self._parse_response(data, model_config.id)
            elif response.status_code == 429:
                self.record_failure(request.model)
                raise RateLimitError("Rate limited", retry_after=60)
            else:
                self.record_failure(request.model)
                raise APIError(f"HTTP {response.status_code}: {response.text}")

        except httpx.TimeoutException:
            self.record_failure(request.model)
            raise TimeoutError("Request timed out")
        except httpx.NetworkError as e:
            self.record_failure(request.model)
            raise NetworkError(f"Network error: {e}")

    def _parse_response(self, data: dict, model_id: str) -> ChatResponse:
        choice = data.get("choices", [{}])[0]
        message = choice.get("message", {})
        return ChatResponse(
            content=message.get("content", ""),
            model=model_id,
            provider=ProviderType.STEPFUN,
            usage=data.get("usage"),
            finish_reason=choice.get("finish_reason"),
            raw_response=data
        )

    async def health_check(self, model_key: str) -> bool:
        if not self._api_key:
            return False
        model_config = self.get_model_config(model_key)
        if not model_config:
            return False
        client = await self._get_client()
        try:
            response = await client.post("/chat/completions", json={
                "model": model_config.id,
                "messages": [{"role": "user", "content": "ping"}],
                "max_tokens": 1
            }, timeout=10.0)
            return response.status_code == 200
        except Exception:
            return False

    async def close(self):
        if self.client and not self.client.is_closed:
            await self.client.aclose()


class APIError(Exception):
    pass


class RateLimitError(APIError):
    def __init__(self, message: str, retry_after: int = 60):
        super().__init__(message)
        self.retry_after = retry_after


class TimeoutError(APIError):
    pass


class NetworkError(APIError):
    pass