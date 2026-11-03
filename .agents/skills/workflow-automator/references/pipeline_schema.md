# Pipeline Schema & Workflow Automation Protocol

## 1. Pipeline Definition
A pipeline consists of an ordered sequence of discrete, independently verifiable execution steps:

```json
{
  "name": "BuildAndVerify",
  "steps": [
    {
      "name": "Compile",
      "action": "compiler_callable"
    },
    {
      "name": "Lint",
      "action": "linter_callable"
    },
    {
      "name": "Verify",
      "action": "verifier_callable"
    }
  ]
}
```

## 2. Workspace Parity
- Files excluded from sync: `.git`, `node_modules`, `__pycache__`, `dist`, `build`.
- All shared codebase modifications must be verified symmetrically across both target local clones.
