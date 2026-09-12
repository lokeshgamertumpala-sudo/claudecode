# 🌐 Web Deliverable CORS & Runtime Compatibility Standards

## Why file:// Fails on Modern Browsers

1. **Same-Origin Policy on file:// Protocol**:
   Modern Chromium (Chrome, Edge) and Gecko (Firefox) browsers treat each file on `file://` as a distinct or opaque origin (`origin: null`). As a result:
   - `<script type="module" src="...">` triggers a CORS policy rejection:
     `Access to script at 'file:///...' from origin 'null' has been blocked by CORS policy`
   - `fetch()` requests to local JSON files (`fetch('./data.json')`) fail with CORS errors.

2. **Absolute vs. Relative Resolution**:
   - On a web server, `/assets/app.js` resolves to `http://localhost:3000/assets/app.js`.
   - On local disk `file:///C:/Users/.../index.html`, `/assets/app.js` resolves to `file:///C:/assets/app.js` (the root of the hard drive).

3. **Client-Side Routing on Static Files**:
   - `BrowserRouter` relies on HTML5 `history.pushState()`. When a user visits a route or refreshes, the browser tries to load `file:///C:/users/.../route`, causing a `File Not Found` error.
   - `HashRouter` puts routes behind the URL hash (`#/route`), which works seamlessly on both `file://` and static hosting.

## The 3 Robust Architecture Patterns

### Pattern A: 1-Click Zero-Dependency Batch Launcher (Recommended for Apps with Backends/APIs)
Provide `launch.bat`:
```cmd
@echo off
setlocal
cd /d "%~dp0"
start "" "http://localhost:5173"
python -m http.server 5173
```
Advantages: Full module support, zero CORS errors, works with any browser.

### Pattern B: Standalone IIFE Classic Script Bundle (Recommended for Single-Page Apps & Games)
Build using Esbuild or Vite Legacy:
- Bundle all modules into a single `bundle.js` with `format: 'iife'`.
- Reference in HTML via standard `<script src="./bundle.js"></script>` (no `type="module"`).
- All CSS and assets referenced with relative `./` paths.
- Double-clicking `index.html` opens instantly in any browser.

### Pattern C: Self-Contained Single-File HTML
Inline all JS and CSS directly into `index.html`. 100% portable, emailable, zero dependencies.
