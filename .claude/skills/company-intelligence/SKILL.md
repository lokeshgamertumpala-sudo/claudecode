---
name: company-intelligence
description: Universal company search, financial analysis, SEC EDGAR regulatory filings, leadership, and competitive intelligence on any company worldwide.
---

# 🏢 Company Intelligence & Universal Search Skill

This skill empowers Claude Code to comprehensively search through, analyze, and synthesize intelligence on **any company worldwide**—including Fortune 500 enterprises, publicly traded corporations, high-growth startups, private companies, and international conglomerates.

---

## ⚡ 1. Primary Execution Methods

### Method A: Dedicated Company Search Engine (Fastest & Most Complete)
Run the local company intelligence tool via terminal / Bash:
```bash
python company_search.py "<Company Name or Stock Ticker>"
```
Or for machine-parseable JSON:
```bash
python company_search.py "<Company Name or Stock Ticker>" --json
```

**What it automatically extracts in a single sub-second run:**
1. **SEC EDGAR Regulatory Data**: Matches against 10,400+ public companies, returns official CIK, SIC industry classification, state of incorporation, and direct URLs to recent **Form 10-K (Annual)**, **Form 10-Q (Quarterly)**, and **Form 8-K (Major Events)**.
2. **Real-Time Market & Equity**: Live stock price, currency, primary exchange, previous close, and 52-week high/low range.
3. **Wikipedia Corporate Profile**: Official executive description, company history, headquarters, founders, and CEO.
4. **Official Web & Investor Relations**: Key verified corporate links and portals.
5. **Real-Time Breaking News**: Latest headlines and corporate milestones from Google News.

---

### Method B: Native `WebSearch` & `WebFetch`
Claude Code's built-in `WebSearch` and `WebFetch` tools are fully enabled and routed locally through the proxy daemon (`http://127.0.0.1:4000`):

1. **Company Discovery & Broad Search**:
   ```javascript
   WebSearch("<Company> company profile revenue headquarters")
   ```
2. **Leadership & Executive Team**:
   ```javascript
   WebSearch("<Company> CEO executive leadership board of directors")
   ```
3. **Competitors & Market Share**:
   ```javascript
   WebSearch("<Company> top competitors market share industry landscape")
   ```
4. **Startup Funding & Valuations**:
   ```javascript
   WebSearch("<Startup Name> funding valuation investors Crunchbase")
   ```
5. **Deep Document Fetching**:
   Use `WebFetch(url)` on investor relations releases, product announcements, and annual reports to retrieve full-text disclosures.

---

## 📋 2. Standard Company Dossier Framework

When presenting company intelligence to the user, always structure findings using this cohesive executive format:

1. **Executive Summary**: Legal name, industry, headquarters, founded year, key founders, current CEO.
2. **Financials & Market Position** (Public companies):
   - Ticker & Exchange
   - Stock price & 52-week range
   - Market capitalization & annual revenue
3. **SEC & Regulatory Status**:
   - CIK identifier & SIC industry code
   - Key recent filings (10-K, 10-Q, 8-K)
4. **Products, Technology & Business Model**:
   - Flagship offerings, monetization channels, proprietary IP / platforms
5. **Competitors & Market Landscape**:
   - Direct peers, emerging disruptors, and strategic moats
6. **Recent Milestones & News**:
   - Mergers, acquisitions, product launches, or leadership transitions

---

## 🛠️ 3. Quick Reference Commands
- Single company search: `python company_search.py "NVIDIA"`
- Ticker search: `python company_search.py "AAPL"`
- Private startup lookup: `python company_search.py "Stripe"`
- JSON data extraction: `python company_search.py "Microsoft" --json`
