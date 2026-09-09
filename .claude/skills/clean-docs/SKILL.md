---
name: clean-docs
description: Write crystal-clear technical documentation, comprehensive READMEs, Architecture Decision Records (ADRs), API guides, and interactive quickstarts.
---

# Clean Docs Skill

This skill guides the creation of developer-friendly, concise, and structured technical documentation that reduces onboarding time and prevents knowledge silos.

## Documentation Archetypes

1. **Project README**:
   - One-sentence pitch: What problem does this solve?
   - Visual preview (screenshot, GIF, or terminal demo).
   - Quickstart: Exactly 3 commands to run the project locally.
   - Environment variables table with defaults and required flags.
   - Architecture & directory map.
2. **Architecture Decision Records (ADR)**:
   - **Context**: What problem or trade-off was faced?
   - **Decision**: What choice was made (e.g., PostgreSQL over MongoDB)?
   - **Consequences**: Positive, negative, and neutral trade-offs accepted.
3. **API Reference & Tutorials**:
   - Complete request/response snippets with real data (no `foo`/`bar`).
   - Highlight error scenarios and status codes.
   - Copy-paste ready `curl` or SDK snippets.

## README Standard Blueprint

```markdown
# Project Name

> High-impact, one-sentence description of what this project does.

## ⚡ Quickstart

```bash
git clone https://github.com/org/repo.git
cd repo
npm install
npm run dev
```

## 🛠 Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, PostgreSQL, Prisma
- **Infra**: Docker, GitHub Actions

## 🔑 Environment Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | string | - | PostgreSQL connection string |
| `PORT` | number | `3000` | Local server port |
```

## Invocation Examples
- `/clean-docs Generate a professional, modern README for this repository`
- "Write an ADR documenting why we migrated from REST to GraphQL."
- "Create an API reference document for our authentication endpoints."
