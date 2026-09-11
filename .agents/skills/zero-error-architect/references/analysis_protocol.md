# 🔍 Pre- & Post-Execution Analysis Protocol

## 1. Pre-Flight Analysis
- Inspect the existing codebase, configuration, and environment before authoring changes.
- Identify all downstream consumers of a modified file to ensure backwards compatibility.

## 2. Multi-Language Syntax Verification
- **JavaScript / TypeScript**: Validate syntax via 
ode --check <file> or Node AST parser.
- **Python**: Validate syntax via st.parse and byte compilation.
- **HTML**: Validate tag pairing, tag nesting, and inline <script> blocks using strict HTML parser.
- **JSON / YAML**: Validate using strict json.loads and yaml.safe_load.
- **CSS**: Validate brace balancing and token definitions.

## 3. Zero-Stub Verification
- Scan files for incomplete markers (// TODO: implement later, empty callbacks, placeholder returns).
- If an interactive element is created (button, link, form), it must be wired to live logic.
