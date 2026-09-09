---
name: database-architect
description: Design normalized relational schemas, NoSQL document models, composite indexes, safe migration scripts, and performant SQL queries. Use when planning database tables, foreign keys, or query plans.
---

# Database Architect Skill

This skill guides relational data modeling, normalization/denormalization trade-offs, indexing strategies, and zero-downtime migration scripts.

## Core Modeling Principles

1. **Normalization vs Performance**:
   - Strive for 3rd Normal Form (3NF) for transactional data (OLTP) to prevent update anomalies.
   - Denormalize judiciously only for high-throughput read paths, backing with database triggers or application transactions.
2. **Key & Indexing Strategies**:
   - **Primary Keys**: Prefer UUIDv7 (time-ordered UUIDs) or `BIGSERIAL`/`IDENTITY` over random UUIDv4 to avoid B-Tree page fragmentation.
   - **Foreign Keys**: Always define explicit `ON DELETE` behavior (`CASCADE`, `RESTRICT`, `SET NULL`).
   - **Composite Indexes**: Follow the Leftmost Prefix Rule: place high-cardinality equality columns first, followed by range/sort columns (`WHERE status = 'ACTIVE' ORDER BY created_at DESC` -> index on `(status, created_at DESC)`).
   - **Index Overhead**: Avoid over-indexing columns with low cardinality (e.g., boolean flags) unless using partial indexes (`WHERE is_deleted = false`).
3. **Safe Zero-Downtime Migrations**:
   - Never rename or drop active columns in a single step (use Expand and Contract pattern).
   - Add new columns as `NULLABLE` first, backfill in batches, then enforce `NOT NULL`.
   - Create indexes concurrently in PostgreSQL (`CREATE INDEX CONCURRENTLY`).

## Schema Blueprint Template (PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_status_created 
ON orders (user_id, status, created_at DESC);
```

## Invocation Examples
- `/database-architect Design a schema for a multi-tenant SaaS with teams and role-based permissions`
- "Write a migration script to split the user's name column into first_name and last_name with zero downtime."
- "Analyze this EXPLAIN ANALYZE query output and propose necessary indexes."
