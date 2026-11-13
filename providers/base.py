"""
Base provider interface for all LLM providers.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional
from enum import Enum


class ProviderType(Enum):
    NVIDIA = "nvidia"
    MINIMAX = "minimax"
    STEPFUN = "stepfun"
    ANTHROPIC = "anthropic"
    OPENAI = "openai"


class ModelRole(Enum):
    FAST_CODING = "fast_coding"
    CREATIVE_REASONING = "creative_reasoning"
    RAPID_EXECUTION = "rapid_execution"
    ADVANCED_REASONING = "advanced_reasoning"


@dataclass
class ModelConfig:
    id: str
    role: ModelRole
    max_tokens: int = 8192
    context_window: int = 128000
    temperature_default: float = 0.3
    capabilities: list[str] = field(default_factory=list)
    aliases: list[str] = field(default_factory=list)


@dataclass
class ProviderConfig:
    provider_type: ProviderType
    base_url: str
    auth_header: str
    models: dict[str, ModelConfig]


@dataclass
class ChatMessage:
    role: str
    content: str
    name: Optional[str] = None


@dataclass
class ChatRequest:
    model: str
    messages: list[ChatMessage]
    max_tokens: int = 8192
    temperature: float = 0.3
    top_p: float = 1.0
    stream: bool = False
    tools: Optional[list[dict]] = None
    tool_choice: Optional[str] = None


@dataclass
class ChatResponse:
    content: str
    model: str
    provider: ProviderType
    usage: Optional[dict] = None
    finish_reason: Optional[str] = None
    tool_calls: Optional[list] = None
    raw_response: Optional[dict] = None


@dataclass
class ProviderHealth:
    provider_type: ProviderType
    model_id: str
    healthy: bool = True
    consecutive_failures: int = 0
    last_success: Optional[float] = None
    last_failure: Optional[float] = None
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    avg_latency_ms: float = 0.0


class BaseProvider(ABC):
    """Abstract base class for all LLM providers."""

    def __init__(self, config: ProviderConfig):
        self.config = config
        self.health: dict[str, ProviderHealth] = {}
        for model_key, model_config in config.models.items():
            self.health[model_key] = ProviderHealth(
                provider_type=config.provider_type,
                model_id=model_config.id
            )

    @abstractmethod
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Execute a chat completion request."""
        pass

    @abstractmethod
    async def health_check(self, model_key: str) -> bool:
        """Check if a specific model is healthy/available."""
        pass

    def get_model_config(self, model_key: str) -> Optional[ModelConfig]:
        """Get model configuration by key or alias."""
        if model_key in self.config.models:
            return self.config.models[model_key]
        for key, model in self.config.models.items():
            if model_key in model.aliases:
                return model
        return None

    def get_health(self, model_key: str) -> Optional[ProviderHealth]:
        """Get health status for a model."""
        return self.health.get(model_key)

    def record_success(self, model_key: str, latency_ms: float):
        """Record a successful request."""
        health = self.health.get(model_key)
        if health:
            health.total_requests += 1
            health.successful_requests += 1
            health.consecutive_failures = 0
            health.last_success = latency_ms
            health.avg_latency_ms = (
                (health.avg_latency_ms * (health.successful_requests - 1) + latency_ms)
                / health.successful_requests
            )
            health.healthy = True

    def record_failure(self, model_key: str):
        """Record a failed request."""
        health = self.health.get(model_key)
        if health:
            health.total_requests += 1
            health.failed_requests += 1
            health.consecutive_failures += 1
            if health.consecutive_failures >= 5:
                health.healthy = False

    def get_available_models(self, role: Optional[ModelRole] = None) -> list[ModelConfig]:
        """Get all available models, optionally filtered by role."""
        models = list(self.config.models.values())
        if role:
            models = [m for m in models if m.role == role]
        return [m for m in models if self.health.get(list(self.config.models.keys())[
            list(self.config.models.values()).index(m)]).healthy]