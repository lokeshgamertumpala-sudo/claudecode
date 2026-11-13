"""
Reliability Engine - Circuit Breaker, Retry Logic, Timeout Management
"""
import asyncio
import time
import random
from typing import Callable, Any, Optional, TypeVar
from dataclasses import dataclass, field
from enum import Enum
from functools import wraps
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T')


class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing recovery


@dataclass
class CircuitBreakerConfig:
    failure_threshold: int = 5
    recovery_timeout: float = 60.0
    half_open_requests: int = 3
    success_threshold: int = 2


@dataclass
class CircuitBreaker:
    """Circuit breaker implementation for provider fault tolerance."""
    config: CircuitBreakerConfig
    state: CircuitState = CircuitState.CLOSED
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: Optional[float] = None
    half_open_successes: int = 0
    half_open_requests: int = 0

    def record_success(self):
        if self.state == CircuitState.HALF_OPEN:
            self.half_open_successes += 1
            if self.half_open_successes >= self.config.success_threshold:
                self._close()
        elif self.state == CircuitState.CLOSED:
            self.failure_count = 0

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.state == CircuitState.HALF_OPEN:
            self._open()
        elif self.state == CircuitState.CLOSED:
            if self.failure_count >= self.config.failure_threshold:
                self._open()

    def _open(self):
        self.state = CircuitState.OPEN
        self.half_open_successes = 0
        self.half_open_requests = 0
        logger.warning("Circuit breaker OPENED")

    def _close(self):
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        logger.info("Circuit breaker CLOSED")

    def can_execute(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
        elif self.state == CircuitState.OPEN:
            if self.last_failure_time and \
               time.time() - self.last_failure_time >= self.config.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                self.half_open_requests = 0
                self.half_open_successes = 0
                logger.info("Circuit breaker HALF_OPEN")
                return True
            return False
        elif self.state == CircuitState.HALF_OPEN:
            if self.half_open_requests < self.config.half_open_requests:
                self.half_open_requests += 1
                return True
            return False
        return False


@dataclass
class RetryConfig:
    max_attempts: int = 3
    base_delay: float = 1.0
    max_delay: float = 30.0
    jitter: float = 0.3
    retryable_exceptions: tuple = (Exception,)
    non_retryable_exceptions: tuple = ()


def is_retryable_error(error: Exception, config: RetryConfig) -> bool:
    """Check if an error should trigger a retry."""
    if isinstance(error, config.non_retryable_exceptions):
        return False
    if not isinstance(error, config.retryable_exceptions):
        return False
    error_str = str(error).lower()
    non_retryable_keywords = [
        "authentication", "unauthorized", "401", "403",
        "not found", "404", "invalid", "malformed", "bad request", "400"
    ]
    return not any(kw in error_str for kw in non_retryable_keywords)


def calculate_backoff(attempt: int, config: RetryConfig) -> float:
    """Calculate exponential backoff with jitter."""
    delay = min(config.base_delay * (2 ** (attempt - 1)), config.max_delay)
    jitter_range = delay * config.jitter
    delay += random.uniform(-jitter_range, jitter_range)
    return max(0, delay)


async def execute_with_retry(
    func: Callable[..., T],
    config: RetryConfig,
    circuit_breaker: Optional[CircuitBreaker] = None,
    *args,
    **kwargs
) -> T:
    """
    Execute a function with retry logic and optional circuit breaker.
    """
    last_error = None

    for attempt in range(1, config.max_attempts + 1):
        # Check circuit breaker
        if circuit_breaker and not circuit_breaker.can_execute():
            raise CircuitOpenError("Circuit breaker is open")

        try:
            result = await func(*args, **kwargs)
            if circuit_breaker:
                circuit_breaker.record_success()
            return result

        except Exception as e:
            last_error = e
            if circuit_breaker:
                circuit_breaker.record_failure()

            if attempt < config.max_attempts and is_retryable_error(e, config):
                delay = calculate_backoff(attempt, config)
                logger.warning(f"Attempt {attempt} failed: {e}. Retrying in {delay:.1f}s...")
                await asyncio.sleep(delay)
            else:
                break

    raise last_error


class CircuitOpenError(Exception):
    pass


class TimeoutManager:
    """Manages configurable timeouts for different operation types."""

    def __init__(self, connect_timeout: float = 10.0, read_timeout: float = 60.0,
                 write_timeout: float = 10.0, pool_timeout: float = 5.0):
        self.connect_timeout = connect_timeout
        self.read_timeout = read_timeout
        self.write_timeout = write_timeout
        self.pool_timeout = pool_timeout

    def get_httpx_timeout(self) -> 'httpx.Timeout':
        import httpx
        return httpx.Timeout(
            connect=self.connect_timeout,
            read=self.read_timeout,
            write=self.write_timeout,
            pool=self.pool_timeout
        )


class RequestDeduplicator:
    """Deduplicate identical concurrent requests."""

    def __init__(self):
        self._pending: dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()

    def _make_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        import hashlib
        key_data = f"{func_name}:{str(args)}:{str(sorted(kwargs.items()))}"
        return hashlib.md5(key_data.encode()).hexdigest()

    async def execute(self, func: Callable[..., T], *args, **kwargs) -> T:
        key = self._make_key(func.__name__, args, kwargs)

        async with self._lock:
            if key in self._pending:
                logger.debug(f"Deduplicating request: {key}")
                return await self._pending[key]

            task = asyncio.create_task(func(*args, **kwargs))
            self._pending[key] = task

        try:
            return await task
        finally:
            async with self._lock:
                self._pending.pop(key, None)