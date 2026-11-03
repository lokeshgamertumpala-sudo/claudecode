# Security Rules & Static Analysis Standards

## 1. Secrets & Credentials
- Hardcoded tokens, API keys, private passwords, and bearer headers are strictly prohibited in source code.
- Always load sensitive credentials from environment variables (`os.environ["API_KEY"]`) or secure stores.

## 2. Dynamic Code Execution
- Avoid `eval()` and `exec()`. Use explicit dictionary lookups, factory patterns, or structured serialization (e.g. `ast.literal_eval`).

## 3. Subprocess Execution
- Avoid `shell=True` in `subprocess.run` or `subprocess.Popen` where arguments originate from untrusted or user inputs to prevent shell injection.
- Pass commands as explicit argument arrays (`["git", "status"]`).

## 4. Circular Dependencies
- Circular module references (`A -> B -> A`) cause initialization stalls and fragile coupling.
- Decompose shared interfaces into standalone contracts or lightweight types.
