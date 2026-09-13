Execute a comprehensive company intelligence search and analysis for the provided company name or stock ticker: $ARGUMENTS.

### 🏢 Execution Steps:
1. Run the local company intelligence tool:
   ```bash
   python company_search.py "$ARGUMENTS"
   ```
2. If additional details (competitors, leadership, products, recent developments) are needed, supplement using:
   - `WebSearch("$ARGUMENTS company profile revenue headquarters")`
   - `WebSearch("$ARGUMENTS competitors market share")`
   - `WebFetch(url)` for direct SEC filings or investor releases
3. Synthesize the findings into an executive report with:
   - **Overview & Identity**: Legal name, industry, headquarters, founders, CEO
   - **Market & Financial Position**: Ticker, exchange, stock price, 52-week range, revenue
   - **SEC EDGAR Regulatory Status**: CIK, SIC classification, recent 10-K/10-Q/8-K filings with links
   - **Competitors & Strategic Moats**: Direct peers and market differentiation
   - **Latest News & Developments**: Recent announcements and milestones
