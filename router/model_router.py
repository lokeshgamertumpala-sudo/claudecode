"""
Intelligent Model Router with task-based routing, fallback, and health tracking.
"""
import asyncio
import time
import yaml
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
import logging

from providers.base import (
    BaseProvider, ProviderConfig, ModelConfig, ChatRequest, ChatResponse,
    ProviderType, ModelRole, ProviderHealth
)
from providers.nvidia import NVIDIAProvider
from providers.minimax import MiniMaxProvider
from providers.stepfun import StepFunProvider


logger = logging.getLogger(__name__)


class RoutingStrategy(Enum):
    AUTO = "auto"
    MANUAL = "manual"
    TASK_BASED = "task_based"
    ROLE_BASED = "role_based"


@dataclass
class RoutingDecision:
    model_key: str
    provider: BaseProvider
    model_config: ModelConfig
    strategy: RoutingStrategy
    reason: str
    fallback_from: Optional[str] = None
    retry_count: int = 0


@dataclass
class FallbackResult:
    success: bool
    response: Optional[ChatResponse] = None
    original_model: Optional[str] = None
    fallback_model: Optional[str] = None
    reason: Optional[str] = None
    retry_count: int = 0
    error: Optional[str] = None


class ModelRouter:
    """
    Intelligent model router with:
    - Task-based routing
    - Role-based routing
    - Manual override
    - Automatic fallback chain
    - Health tracking
    - Latency tracking
    """

    def __init__(self, config_path: str = "config/models.yaml"):
        self.config_path = config_path
        self.config = self._load_config(config_path)
        self.providers: Dict[ProviderType, BaseProvider] = {}
        self.routing_keywords = self.config.get("routing", {}).get("task_keywords", {})
        self.default_roles = self.config.get("routing", {}).get("default_roles", {})
        self.fallback_chains = self.config.get("routing", {}).get("fallback_chain", {})
        self.reliability_config = self.config.get("reliability", {})
        self._initialize_providers()

    def _load_config(self, path: str) -> dict:
        with open(path, 'r') as f:
            return yaml.safe_load(f)

    def _initialize_providers(self):
        """Initialize all configured providers."""
        providers_config = self.config.get("providers", {})

        # NVIDIA Provider (primary)
        if "nvidia" in providers_config:
            nvidia_config = providers_config["nvidia"]
            model_configs = {}
            for key, model_data in nvidia_config.get("models", {}).items():
                model_configs[key] = ModelConfig(
                    id=model_data["id"],
                    role=ModelRole(model_data["role"]),
                    max_tokens=model_data.get("max_tokens", 8192),
                    context_window=model_data.get("context_window", 128000),
                    temperature_default=model_data.get("temperature_default", 0.3),
                    capabilities=model_data.get("capabilities", []),
                    aliases=model_data.get("aliases", [])
                )
            provider_config = ProviderConfig(
                provider_type=ProviderType.NVIDIA,
                base_url=nvidia_config["base_url"],
                auth_header=nvidia_config["auth_header"],
                models=model_configs
            )
            self.providers[ProviderType.NVIDIA] = NVIDIAProvider(provider_config)

        # MiniMax Provider (external)
        if "minimax" in providers_config:
            minimax_config = providers_config["minimax"]
            model_configs = {}
            for key, model_data in minimax_config.get("models", {}).items():
                model_configs[key] = ModelConfig(
                    id=model_data["id"],
                    role=ModelRole(model_data["role"]),
                    max_tokens=model_data.get("max_tokens", 8192),
                    context_window=model_data.get("context_window", 128000),
                    capabilities=model_data.get("capabilities", []),
                    aliases=model_data.get("aliases", [])
                )
            provider_config = ProviderConfig(
                provider_type=ProviderType.MINIMAX,
                base_url=minimax_config["base_url"],
                auth_header=minimax_config["auth_header"],
                models=model_configs
            )
            self.providers[ProviderType.MINIMAX] = MiniMaxProvider(provider_config)

        # StepFun Provider (external)
        if "stepfun" in providers_config:
            stepfun_config = providers_config["stepfun"]
            model_configs = {}
            for key, model_data in stepfun_config.get("models", {}).items():
                model_configs[key] = ModelConfig(
                    id=model_data["id"],
                    role=ModelRole(model_data["role"]),
                    max_tokens=model_data.get("max_tokens", 8192),
                    context_window=model_data.get("context_window", 128000),
                    capabilities=model_data.get("capabilities", []),
                    aliases=model_data.get("aliases", [])
                )
            provider_config = ProviderConfig(
                provider_type=ProviderType.STEPFUN,
                base_url=stepfun_config["base_url"],
                auth_header=stepfun_config["auth_header"],
                models=model_configs
            )
            self.providers[ProviderType.STEPFUN] = StepFunProvider(provider_config)

    def select_model(self, task: str, role: Optional[ModelRole] = None,
                     strategy: RoutingStrategy = RoutingStrategy.AUTO,
                     manual_model: Optional[str] = None) -> RoutingDecision:
        """
        Select the best model for a task.
        """
        if strategy == RoutingStrategy.MANUAL and manual_model:
            return self._resolve_manual_model(manual_model)

        if role is None:
            role = self._infer_role_from_task(task)

        # Try role-based selection first
        model_key = self.default_roles.get(role.value)
        if model_key:
            provider, model_config = self._find_model(model_key)
            if provider and model_config:
                health = provider.get_health(model_key)
                if health and health.healthy:
                    return RoutingDecision(
                        model_key=model_key,
                        provider=provider,
                        model_config=model_config,
                        strategy=RoutingStrategy.ROLE_BASED,
                        reason=f"Default model for role: {role.value}"
                    )

        # Fallback chain for the role
        fallback_chain = self.fallback_chains.get(role.value, [])
        for fallback_key in fallback_chain:
            provider, model_config = self._find_model(fallback_key)
            if provider and model_config:
                health = provider.get_health(fallback_key)
                if health and health.healthy:
                    return RoutingDecision(
                        model_key=fallback_key,
                        provider=provider,
                        model_config=model_config,
                        strategy=RoutingStrategy.ROLE_BASED,
                        reason=f"Fallback model for role: {role.value}",
                        fallback_from=model_key
                    )

        raise ValueError(f"No healthy model available for role: {role.value}")

    def _infer_role_from_task(self, task: str) -> ModelRole:
        """Infer the best role based on task keywords."""
        task_lower = task.lower()
        scores = {role: 0 for role in ModelRole}

        for role, keywords in self.routing_keywords.items():
            for keyword in keywords:
                if keyword in task_lower:
                    scores[ModelRole(role)] += 1

        # Return role with highest score, default to fast_coding
        best_role = max(scores, key=scores.get)
        return best_role if scores[best_role] > 0 else ModelRole.FAST_CODING

    def _find_model(self, model_key: str) -> tuple[Optional[BaseProvider], Optional[ModelConfig]]:
        """Find a model across all providers."""
        for provider in self.providers.values():
            model_config = provider.get_model_config(model_key)
            if model_config:
                return provider, model_config
        return None, None

    def _resolve_manual_model(self, model_key: str) -> RoutingDecision:
        """Resolve a manually specified model."""
        provider, model_config = self._find_model(model_key)
        if not provider or not model_config:
            raise ValueError(f"Model not found: {model_key}")
        health = provider.get_health(model_key)
        if health and not health.healthy:
            logger.warning(f"Manual model {model_key} is unhealthy, using anyway")
        return RoutingDecision(
            model_key=model_key,
            provider=provider,
            model_config=model_config,
            strategy=RoutingStrategy.MANUAL,
            reason="Manual model selection"
        )

    async def chat_with_fallback(self, request: ChatRequest,
                                  role: Optional[ModelRole] = None,
                                  strategy: RoutingStrategy = RoutingStrategy.AUTO,
                                  manual_model: Optional[str] = None) -> FallbackResult:
        """
        Execute chat with automatic fallback on failure.
        """
        decision = self.select_model(
            task=request.messages[-1].content if request.messages else "",
            role=role,
            strategy=strategy,
            manual_model=manual_model
        )

        original_model = decision.model_key
        retry_count = 0
        max_retries = self.reliability_config.get("retries", {}).get("max_attempts", 3)
        last_error = None

        while retry_count <= max_retries:
            try:
                response = await decision.provider.chat(request)
                return FallbackResult(
                    success=True,
                    response=response,
                    original_model=original_model,
                    fallback_model=decision.model_key,
                    retry_count=retry_count
                )

            except Exception as e:
                last_error = str(e)
                logger.warning(f"Model {decision.model_key} failed (attempt {retry_count + 1}): {e}")

                # Check if error is retryable
                if not self._is_retryable_error(e):
                    break

                retry_count += 1
                if retry_count <= max_retries:
                    delay = self._calculate_backoff(retry_count)
                    logger.info(f"Retrying in {delay:.1f}s...")
                    await asyncio.sleep(delay)

        # All retries exhausted, try fallback chain
        fallback_chain = self.fallback_chains.get(decision.model_config.role.value, [])
        current_idx = fallback_chain.index(decision.model_key) if decision.model_key in fallback_chain else -1

        for i in range(current_idx + 1, len(fallback_chain)):
            fallback_key = fallback_chain[i]
            provider, model_config = self._find_model(fallback_key)
            if provider and model_config:
                health = provider.get_health(fallback_key)
                if health and health.healthy:
                    try:
                        request.model = fallback_key
                        response = await provider.chat(request)
                        return FallbackResult(
                            success=True,
                            response=response,
                            original_model=original_model,
                            fallback_model=fallback_key,
                            reason=f"Fallback after {retry_count} retries on {original_model}: {last_error}",
                            retry_count=retry_count
                        )
                    except Exception as e:
                        logger.warning(f"Fallback model {fallback_key} also failed: {e}")
                        continue

        return FallbackResult(
            success=False,
            original_model=original_model,
            fallback_model=None,
            reason=f"All models failed. Last error: {last_error}",
            retry_count=retry_count,
            error=last_error
        )

    def _is_retryable_error(self, error: Exception) -> bool:
        """Determine if an error is worth retrying."""
        error_str = str(error).lower()
        # Don't retry authentication errors, model not found, or bad requests
        non_retryable = ["authentication", "unauthorized", "401", "403",
                         "not found", "404", "invalid", "malformed"]
        return not any(nr in error_str for nr in non_retryable)

    def _calculate_backoff(self, attempt: int) -> float:
        """Calculate exponential backoff with jitter."""
        base_delay = self.reliability_config.get("retries", {}).get("base_delay", 1.0)
        max_delay = self.reliability_config.get("retries", {}).get("max_delay", 30.0)
        jitter = self.reliability_config.get("retries", {}).get("jitter", 0.3)

        import random
        delay = min(base_delay * (2 ** (attempt - 1)), max_delay)
        delay += random.uniform(-jitter * delay, jitter * delay)
        return max(0, delay)

    def get_provider_health(self) -> Dict[str, Any]:
        """Get health status for all models across all providers."""
        health = {}
        for provider_type, provider in self.providers.items():
            for model_key in provider.config.models:
                h = provider.get_health(model_key)
                if h:
                    health[f"{provider_type.value}:{model_key}"] = {
                        "healthy": h.healthy,
                        "consecutive_failures": h.consecutive_failures,
                        "total_requests": h.total_requests,
                        "successful_requests": h.successful_requests,
                        "failed_requests": h.failed_requests,
                        "avg_latency_ms": round(h.avg_latency_ms, 2)
                    }
        return health

    async def health_check_all(self) -> Dict[str, bool]:
        """Run health checks on all models."""
        results = {}
        for provider in self.providers.values():
            for model_key in provider.config.models:
                try:
                    healthy = await provider.health_check(model_key)
                    results[f"{provider.config.provider_type.value}:{model_key}"] = healthy
                except Exception as e:
                    results[f"{provider.config.provider_type.value}:{model_key}"] = False
        return results

    async def close(self):
        """Close all provider connections."""
        for provider in self.providers.values():
            await provider.close()