---
name: api-architect
description: Design clean, consistent, secure, and scalable RESTful and GraphQL APIs with schema validation (Zod, Pydantic), OpenAPI specs, idempotent mutations, and standardized error envelopes.
---

# API Architect Skill

This skill guides the design, contract definition, validation, and implementation of production-grade APIs.

## Core API Design Rules

1. **RESTful Resource Naming**:
   - Use plural nouns for resources: `/api/v1/users`, `/api/v1/projects/{id}/tasks`.
   - Never use verbs in paths (`/getUsers` ❌ -> `GET /users` ✅; `/createItem` ❌ -> `POST /items` ✅).
   - Use HTTP methods semantically: `GET` (read-only), `POST` (create/action), `PUT` (full replace), `PATCH` (partial update), `DELETE` (remove).
2. **Predictable Status Codes**:
   - `200 OK` (standard read/update), `201 Created` (successful resource creation with `Location` header).
   - `204 No Content` (successful deletion or mutation without body).
   - `400 Bad Request` (schema/validation failure), `401 Unauthorized` (missing/invalid auth).
   - `403 Forbidden` (authenticated but lacks permissions), `404 Not Found` (resource missing).
   - `409 Conflict` (duplicate unique constraint / state conflict), `422 Unprocessable Entity`.
   - `429 Too Many Requests` (rate limited), `500 Internal Server Error`.
3. **Standardized Response Envelopes**:
   ```json
   {
     "success": true,
     "data": { "id": "usr_123", "name": "Alex" },
     "meta": { "page": 1, "pageSize": 20, "total": 142 }
   }
   ```
   Error format:
   ```json
   {
     "success": false,
     "error": {
       "code": "VALIDATION_FAILED",
       "message": "Email address format is invalid",
       "details": [{ "field": "email", "issue": "Invalid email string" }]
     }
   }
   ```
4. **Validation & Idempotency**:
   - Use strict runtime validation schemas (Zod, Pydantic, Joi).
   - Support `Idempotency-Key` headers for financial or non-idempotent mutations.

## Invocation Examples
- `/api-architect Design the REST API endpoints for an e-commerce order management system`
- "Write Zod validation schemas and route handlers for user registration and JWT refresh."
- "Generate an OpenAPI 3.1 specification for our payment webhook."
