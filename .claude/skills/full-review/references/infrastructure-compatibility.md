# Infrastructure Compatibility Review

Code that is correct in isolation but breaks when deployed against managed services,
connection poolers, or cloud auth providers. These issues are invisible to traditional
code review — they require knowledge of the **deployment topology**.

## When to Trigger This Pass

Run this pass when the codebase involves ANY of:
- Managed database services (Supabase, Neon, PlanetScale, AWS RDS Proxy, Azure SQL)
- Connection poolers (PgBouncer, Supavisor, ProxySQL, Odyssey)
- External auth/JWT providers (Supabase Auth, Firebase Auth, Auth0, Cognito, Clerk)
- ORM models with migrations managed separately from the ORM (raw SQL DDL, external tools)

---

## 1. Database Connection Pooler Compatibility

### asyncpg + PgBouncer/Supavisor (Transaction Mode)

Connection poolers in **transaction mode** reassign backend connections between requests.
This breaks any feature that depends on session-level state persistence.

#### Must Check

| Pattern to grep | Red flag condition | Severity |
|---|---|---|
| `create_async_engine("postgresql+asyncpg` | Missing `connect_args={"statement_cache_size": 0, "prepared_statement_cache_size": 0}` when URL contains pooler host (port 6543 or `*.pooler.supabase.com`) | **High** |
| `asyncpg.connect(` or `create_pool(` | Missing `statement_cache_size=0` with pooler URL | **High** |
| `connection.prepare(` | Named prepared statements always break behind transaction-mode pooler | **High** |
| `statement_cache_size=0` WITHOUT `prepared_statement_cache_size=0` | Incomplete fix — some asyncpg versions create statements despite cache=0 | **Medium** |
| `pool_pre_ping=True` + asyncpg | SQLAlchemy < 2.0.4 has a bug where ping uses prepared statements | **Medium** |
| No `poolclass=NullPool` with external pooler URL | Double pooling — SQLAlchemy's QueuePool + external pooler causes connection exhaustion | **Low** |

#### Session-State Features That Break in Transaction Mode

These silently misbehave (no error raised) behind transaction-mode poolers:

| Pattern | Problem |
|---|---|
| `SET search_path` (without `LOCAL`) | Setting lost when connection reassigned |
| `LISTEN` / `NOTIFY` | Requires persistent connection |
| `pg_advisory_lock` | Lock tied to backend connection, may be reassigned |
| `CREATE TEMPORARY TABLE` | Temp table may vanish on connection swap |
| `PREPARE` / `EXECUTE` | Named prepared statements don't persist |

**Fix:** Use `SET LOCAL` (transaction-scoped), or use the direct connection (port 5432) for these operations.

---

## 2. JWT / Auth Provider Compatibility

### Clock Skew (All JWT Libraries)

| Pattern | Red flag | Severity |
|---|---|---|
| `jwt.decode(` without `leeway=` parameter | Strict `iat`/`nbf` validation fails with 1-2s clock skew between issuer and verifier | **Medium** |
| `leeway=0` explicitly set | Same issue, intentionally strict | **Medium** |
| PyJWT >= 2.6.0 without `options={"verify_iat": False}` or `leeway` | v2.6.0 re-introduced strict `iat <= now` validation (beyond RFC spec) | **Medium** |

**Fix:** Add `leeway=10` (or `leeway=timedelta(seconds=10)`) to all `jwt.decode()` calls.

### Algorithm Safety (Critical)

| Pattern | Red flag | Severity |
|---|---|---|
| `jwt.decode(` without `algorithms=` | Algorithm confusion attack (CVE-2022-29217) | **Critical** |
| `algorithms=` list contains both symmetric + asymmetric (e.g., `["HS256", "RS256"]`) | Algorithm confusion | **Critical** |
| Algorithm read from token header (`header["alg"]`) used in `algorithms=` | Attacker controls algorithm selection | **Critical** |
| `verify_signature.*False` or `verify=False` | Signature verification disabled — token forgery | **Critical** |
| `verify_exp.*False` | Expired tokens accepted | **High** |
| `verify_aud.*False` | Cross-service token reuse | **High** |

### Claim Validation

| Pattern | Red flag | Severity |
|---|---|---|
| `jwt.decode(` without `audience=` | Missing audience validation | **Medium** |
| `jwt.decode(` without `issuer=` | Missing issuer validation | **Medium** |
| No `options={"require": ["exp", ...]}` | Claims not enforced to be present | **Medium** |

### Supabase-Specific

| Pattern | Red flag | Severity |
|---|---|---|
| `algorithms=["HS256"]` in Supabase auth code | Legacy pattern — new projects use ES256 via JWKS | **Medium** |
| Hard-coded JWT secret used in `jwt.decode` | Should use JWKS endpoint for key rotation support | **Medium** |
| Missing `audience="authenticated"` | Supabase tokens use `aud: "authenticated"` | **Medium** |
| JWKS fetched on every request without caching | Performance — use `PyJWKClient(url, cache_keys=True)` | **Low** |
| No HS256 fallback after ES256 JWKS attempt | Breaks during migration from symmetric to asymmetric keys | **Low** |

### Firebase / Auth0 / Cognito Specific

| Pattern | Red flag | Severity |
|---|---|---|
| Firebase JWT verification without `issuer=` check | Accepts tokens from ANY Firebase project | **High** |
| `base64.b64decode` on JWT segments | Wrong variant — JWTs use `base64.urlsafe_b64decode` | **Medium** |

---

## 3. ORM ↔ Database Schema Drift

### SQLAlchemy Enum Types

| Pattern | Red flag | Severity |
|---|---|---|
| `Enum(MyEnum)` without `native_enum=False` when DDL was applied via raw SQL | SQLAlchemy expects a native PG enum type that doesn't exist | **High** |
| `Enum(..., native_enum=False)` without `create_constraint=True` | No DB-level validation — invalid values silently accepted | **Medium** |
| `Enum(..., create_constraint=True)` without `name=` parameter | Alembic cannot manage unnamed constraints | **Medium** |
| Python `Enum` class members changed without new migration file | DB constraint (if any) is now stale | **High** |

### Schema Drift Detection

| Pattern | Red flag | Severity |
|---|---|---|
| PR modifies `models/` files but adds no new migration in `alembic/versions/` | Model-DB divergence | **High** |
| Migration uses `op.execute("ALTER...")` without corresponding model update | Raw SQL change invisible to ORM | **Medium** |
| `op.execute()` in `upgrade()` with empty/pass `downgrade()` | Non-reversible migration | **Medium** |
| `op.drop_column` + `op.add_column` on same table with similar names | Likely a rename that autogenerate misinterpreted — data loss risk | **High** |
| `env.py` missing `compare_type=True` | Column type changes go undetected | **Low** |
| `env.py` missing `compare_server_default=True` | Server default changes go undetected | **Low** |

### Cross-ORM Schema Assumptions

| Pattern | Red flag | Severity |
|---|---|---|
| ORM model uses `server_default=` but migration `op.add_column` lacks it | Column exists but default not applied | **Medium** |
| ORM model declares `nullable=False` but migration doesn't set it | Constraint mismatch | **Medium** |
| ORM relationship references table in different schema (`schema="expenses"`) but DDL `CREATE TABLE` used default schema | Schema qualification mismatch | **High** |

---

## 4. Quick Reference: The Safe Configuration

### Supabase + Python (FastAPI/SQLAlchemy/asyncpg)

```python
# database.py — pooler-safe configuration
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

engine = create_async_engine(
    "postgresql+asyncpg://...pooler.supabase.com:6543/postgres",
    poolclass=NullPool,  # external pooler handles connection reuse
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)
```

```python
# auth.py — JWKS-safe JWT verification
from jwt import PyJWKClient

jwks_client = PyJWKClient(jwks_url, cache_keys=True, lifespan=3600)
signing_key = jwks_client.get_signing_key_from_jwt(token)
payload = jwt.decode(
    token,
    signing_key.key,
    algorithms=["ES256"],       # explicit algorithm
    audience="authenticated",   # Supabase audience
    leeway=10,                  # clock skew tolerance
)
```

---

## Reviewer Checklist

- [ ] **Deployment topology identified**: What sits between the app and the database? (pooler, proxy, managed service)
- [ ] **Connection pooler mode known**: Transaction mode? Session mode? Statement mode?
- [ ] **Prepared statement caching disabled** if using transaction-mode pooler
- [ ] **JWT `leeway` parameter present** on all `jwt.decode()` calls
- [ ] **JWT `algorithms` explicitly specified** (never derived from token header)
- [ ] **JWT signature verification enabled** (no `verify=False` or `verify_signature: False`)
- [ ] **Required claims enforced** (`exp`, `aud`, `iss` as appropriate)
- [ ] **ORM model changes paired with migrations** (no model-only or migration-only changes)
- [ ] **Enum types match between ORM and DDL** (native vs non-native)
- [ ] **Session-state features avoided** behind transaction-mode poolers
