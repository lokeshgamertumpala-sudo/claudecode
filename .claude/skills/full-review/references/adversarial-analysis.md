# Adversarial Vulnerability Analysis

Structured methodology for finding vulnerabilities through attacker modeling. Apply to all HIGH risk changes after deep context analysis.

## 1. Define Attacker Model

**WHO is the attacker?**
- Unauthenticated external user
- Authenticated regular user
- Malicious administrator
- Compromised service/dependency
- Automated bot / scanner

**WHAT access do they have?**
- Public API access only
- Authenticated user role
- Specific permissions/tokens
- Network-level access

**WHERE do they interact?**
- HTTP endpoints
- WebSocket connections
- File uploads
- API integrations
- CLI / admin interfaces

---

## 2. Identify Attack Vectors

```
ENTRY POINT: [Exact function/endpoint attacker can access]

ATTACK SEQUENCE:
1. [Specific API call/request with parameters]
2. [How this reaches the vulnerable code]
3. [What happens in the vulnerable code]
4. [Impact achieved]

PROOF OF ACCESSIBILITY:
- Show the function is public/reachable
- Demonstrate attacker has required permissions
- Prove attack path exists through actual interfaces
```

---

## 3. Rate Exploitability

**EASY:** Single request, public API, common user access, no special conditions
**MEDIUM:** Multiple steps, elevated privileges, specific system state needed
**HARD:** Admin access required, rare edge case, significant resources needed

---

## 4. Build Complete Exploit Scenario

```
ATTACKER STARTING POSITION:
[What the attacker has at the beginning]

STEP-BY-STEP EXPLOITATION:
Step 1: [Concrete action]
  - Request: [Exact HTTP method, URL, body]
  - Expected result: [What happens]

Step 2: [Next action]
  - Request: [Exact details]
  - Why this works: [Reference to code]
  - State change: [What changed]

CONCRETE IMPACT:
[Specific, measurable harm — not "could cause issues"]
- Data exposed/modified
- Privileges escalated
- System compromised
- Business impact
```

---

## 5. Cross-Reference with Baseline

Check each finding against:
- Does this violate a system invariant?
- Does this break a trust boundary?
- Does this bypass a validation pattern?
- Is this a regression of a previous fix?

```bash
# Check if removed code was from security fixes
git log -S "removed_pattern" --all --grep="security\|fix\|CVE\|vuln"
git blame <baseline> -- file.py | grep "pattern"
```

---

## Vulnerability Report Template

```markdown
## [SEVERITY] Vulnerability Title

**Attacker Model:**
- WHO: [Specific attacker type]
- ACCESS: [Exact privileges]
- INTERFACE: [Specific entry point]

**Attack Vector:**
[Step-by-step exploit through accessible interfaces]

**Exploitability:** EASY / MEDIUM / HARD
**Justification:** [Why this rating]

**Concrete Impact:**
[Specific, measurable harm]

**Proof of Concept:**
```code
// Exact request/code to reproduce
```

**Root Cause:**
[Reference specific code at file:line]

**Blast Radius:** [N callers affected]
**Regression Check:** [Was this previously fixed?]
```

---

## Common Attack Patterns

### Authentication Bypass
- Missing auth middleware on endpoints
- JWT not verified (only decoded)
- Session fixation (no rotation after login)
- Password reset token reuse

### Authorization Bypass (IDOR)
- Object ID in URL without ownership check
- Bulk operations without per-item auth
- GraphQL nested queries bypassing field-level auth
- Tenant isolation gaps in multi-tenant systems

### Injection Chains
- Second-order SQL injection (stored input used later in query)
- Blind SSRF through webhook URLs
- Template injection through user-controlled templates
- Header injection through unsanitized values

### Business Logic Abuse
- Race conditions in balance/inventory checks (TOCTOU)
- Price manipulation through parameter tampering
- Workflow state skipping (jump to final step)
- Rate limit bypass through distributed requests

### Supply Chain
- Dependency confusion (internal package name on public registry)
- CI/CD pipeline injection through PR
- Compromised build tooling
- Malicious transitive dependencies
