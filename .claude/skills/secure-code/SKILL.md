---
name: secure-code
description: Audit and harden source code against OWASP Top 10 vulnerabilities, SQL injection, XSS, CSRF, broken authentication, sensitive data leakage, and insecure dependencies.
---

# Secure Code Skill

This skill guides security audits, threat modeling, and defensive coding practices to ensure software systems are resilient against common attack vectors.

## OWASP Top 10 Defense Checklist

### 1. Injection (SQL, NoSQL, Command)
- **Rule**: NEVER interpolate or concatenate unescaped user input into database queries or shell execution strings.
- **Remedy**: Always use parameterized queries / prepared statements (e.g., ORMs, `$1`/`?` placeholders).

### 2. Broken Authentication & Session Management
- **Rule**: Hash passwords with modern adaptive hashing algorithms (Argon2id or bcrypt with cost factor >= 12).
- **Remedy**: Use short-lived access tokens (15m) + secure, `HttpOnly`, `SameSite=Strict`, `Secure` cookies for refresh tokens.
- **Remedy**: Implement rate limiting on login/auth endpoints (e.g., max 5 attempts/minute).

### 3. Cross-Site Scripting (XSS)
- **Rule**: Never use `dangerouslySetInnerHTML`, `v-html`, or `innerHTML` with unsanitized user inputs.
- **Remedy**: Use trusted sanitizers (DOMPurify) if HTML rendering is required. Enforce strict Content Security Policy (CSP) headers.

### 4. Broken Object-Level Authorization (BOLA / IDOR)
- **Rule**: Never trust client-supplied IDs without verifying ownership.
- **Remedy**: Always query resources with both the resource ID and current authenticated tenant/user ID:
  ```sql
  SELECT * FROM documents WHERE id = $1 AND organization_id = $2;
  ```

### 5. Secrets Management
- **Rule**: Never hardcode API keys, secrets, private keys, or passwords in Git repositories.
- **Remedy**: Load secrets exclusively via environment variables (`process.env`, `os.environ`), and keep `.env` in `.gitignore`.

## Invocation Examples
- `/secure-code Audit this authentication and session handling code for vulnerabilities`
- "Check this file upload handler against path traversal and malicious file execution."
- "Review our API middleware for CORS, rate limiting, and security headers."
