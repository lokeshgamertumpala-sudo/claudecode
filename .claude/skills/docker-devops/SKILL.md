---
name: docker-devops
description: Create production-ready Dockerfiles, multi-stage builds, docker-compose orchestration, GitHub Actions CI/CD workflows, and deployment automation with minimal attack surfaces.
---

# Docker & DevOps Skill

This skill guides the creation of containerized applications, local orchestration environments, and automated CI/CD pipelines.

## Containerization Best Practices

1. **Multi-Stage Builds**:
   - Separate the build environment (Node, Rust, Go, Python build tools) from the lightweight runtime image (Alpine, Debian-slim, Distroless).
   - Minimizes image size by 70-90% and removes compilers, test tools, and source code from production.
2. **Security & Least Privilege**:
   - Never run containers as `root`. Always create and switch to an unprivileged user:
     ```dockerfile
     RUN addgroup -S appgroup && adduser -S appuser -G appgroup
     USER appuser
     ```
   - Keep `.dockerignore` updated (exclude `node_modules`, `.git`, `.env`, build artifacts).
3. **Layer Caching Optimization**:
   - Copy dependency manifests (`package.json`, `requirements.txt`, `go.mod`) and install dependencies *before* copying application source code.

## Multi-Stage Dockerfile Pattern (Node / Next.js)

```dockerfile
# 1. Base dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

## Invocation Examples
- `/docker-devops Create a production multi-stage Dockerfile and docker-compose.yml for this project`
- "Write a GitHub Actions CI pipeline that runs tests, builds docker images, and deploys to AWS/fly.io."
- "Optimize our existing Docker image build time with cache mounts."
