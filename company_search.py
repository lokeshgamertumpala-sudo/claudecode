#!/usr/bin/env python3
"""
Company Intelligence & Universal Company Search Engine
Search across all public and private companies worldwide:
- SEC EDGAR: 10,400+ US public companies with CIK, SIC industry, and latest 10-K / 10-Q / 8-K filings
- Market & Equity Data: Stock ticker, live price, currency, exchange, 52-week range
- Corporate Knowledge: Wikipedia company profile, history, headquarters, founders, CEO
- Web Presence: Official website, Investor Relations, corporate portals
- Latest News: Real-time corporate headlines and developments
"""

import sys
import os
import re
import json
import time
import argparse
import urllib.parse
import xml.etree.ElementTree as ET
from html import unescape
from typing import Dict, Any, List, Optional
import requests

HEADERS = {
    "User-Agent": "CompanyIntelligenceBot/1.0 (Mozilla/5.0; Windows NT 10.0; Win64; x64) contact@domain.com",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
}

SEC_HEADERS = {
    "User-Agent": "CompanyIntelligenceBot admin@domain.com"
}

# In-memory SEC ticker cache
_SEC_TICKERS_CACHE: Optional[List[Dict[str, Any]]] = None

def get_sec_tickers() -> List[Dict[str, Any]]:
    global _SEC_TICKERS_CACHE
    if _SEC_TICKERS_CACHE is not None:
        return _SEC_TICKERS_CACHE
    try:
        url = "https://www.sec.gov/files/company_tickers.json"
        r = requests.get(url, headers=SEC_HEADERS, timeout=6)
        if r.status_code == 200:
            data = r.json()
            _SEC_TICKERS_CACHE = list(data.values())
            return _SEC_TICKERS_CACHE
    except Exception:
        pass
    return []

def match_sec_company(query: str) -> Optional[Dict[str, Any]]:
    tickers = get_sec_tickers()
    if not tickers:
        return None
    q = query.strip().upper()
    # 1. Exact ticker match
    for item in tickers:
        if item.get("ticker", "").upper() == q:
            return item
    # 2. Exact title match or title starts with query
    q_lower = query.strip().lower()
    for item in tickers:
        title = item.get("title", "").lower()
        if title == q_lower or title.startswith(q_lower + " ") or title.startswith(q_lower + ","):
            return item
    # 3. Substring match
    if len(q_lower) >= 3:
        for item in tickers:
            title = item.get("title", "").lower()
            if q_lower in title:
                return item
    return None

def get_sec_filings(cik: int) -> Dict[str, Any]:
    try:
        cik_padded = str(cik).zfill(10)
        url = f"https://data.sec.gov/submissions/CIK{cik_padded}.json"
        r = requests.get(url, headers=SEC_HEADERS, timeout=6)
        if r.status_code == 200:
            d = r.json()
            recent = d.get("filings", {}).get("recent", {})
            forms = recent.get("form", [])
            dates = recent.get("filingDate", [])
            accs = recent.get("accessionNumber", [])
            docs = recent.get("primaryDocument", [])
            descs = recent.get("primaryDocDescription", [])
            
            filings = []
            for form, dt, acc, doc, desc in zip(forms[:15], dates[:15], accs[:15], docs[:15], descs[:15]):
                acc_clean = acc.replace("-", "")
                link = f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc_clean}/{doc}"
                filings.append({
                    "form": form,
                    "filing_date": dt,
                    "description": desc or f"Form {form}",
                    "url": link
                })
            return {
                "sic": d.get("sic"),
                "sic_description": d.get("sicDescription"),
                "state_of_incorporation": d.get("stateOfIncorporation"),
                "fiscal_year_end": d.get("fiscalYearEnd"),
                "filings": filings,
                "edgar_url": f"https://www.sec.gov/edgar/browse/?CIK={cik}"
            }
    except Exception:
        pass
    return {}

def get_market_data(ticker: str) -> Dict[str, Any]:
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1d"
        r = requests.get(url, headers=HEADERS, timeout=5)
        if r.status_code == 200:
            data = r.json()
            results = data.get("chart", {}).get("result", [])
            if results:
                meta = results[0].get("meta", {})
                return {
                    "symbol": meta.get("symbol"),
                    "currency": meta.get("currency"),
                    "regular_market_price": meta.get("regularMarketPrice"),
                    "previous_close": meta.get("previousClose") or meta.get("chartPreviousClose"),
                    "fifty_two_week_high": meta.get("fiftyTwoWeekHigh"),
                    "fifty_two_week_low": meta.get("fiftyTwoWeekLow"),
                    "exchange_name": meta.get("exchangeName"),
                    "instrument_type": meta.get("instrumentType"),
                }
    except Exception:
        pass
    return {}

def get_wikipedia_profile(query: str) -> Dict[str, Any]:
    try:
        # Prioritize corporate matches
        queries_to_try = [
            f"{query}, Inc.",
            f"{query} Inc",
            f"{query} company",
            f"{query} (company)",
            f"{query} Corporation",
            query
        ]
        for q_try in queries_to_try:
            search_url = "https://en.wikipedia.org/w/api.php"
            params = {"action": "opensearch", "search": q_try, "limit": 4, "format": "json"}
            r = requests.get(search_url, params=params, headers=HEADERS, timeout=4)
            if r.status_code == 200:
                data = r.json()
                titles = data[1] if len(data) > 1 else []
                for title in titles:
                    sum_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
                    r_sum = requests.get(sum_url, headers=HEADERS, timeout=4)
                    if r_sum.status_code == 200:
                        d = r_sum.json()
                        extract = d.get("extract", "")
                        desc = d.get("description", "")
                        # Skip disambiguation pages or biological/animal species if looking for companies
                        if "refer to:" in extract or "disambiguation" in desc.lower() or d.get("type") == "disambiguation":
                            continue
                        if "species of" in extract.lower() or "species in" in extract.lower():
                            continue
                        return {
                            "title": d.get("title"),
                            "description": desc,
                            "extract": extract,
                            "url": d.get("content_urls", {}).get("desktop", {}).get("page") or f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title)}"
                        }
    except Exception:
        pass
    return {}

def get_company_news(query: str, max_items: int = 5) -> List[Dict[str, str]]:
    news = []
    try:
        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query + ' company')}&hl=en-US&gl=US&ceid=US:en"
        r = requests.get(url, headers=HEADERS, timeout=4)
        if r.status_code == 200:
            root = ET.fromstring(r.text)
            for item in root.findall(".//item")[:max_items]:
                title = item.find("title").text if item.find("title") is not None else ""
                link = item.find("link").text if item.find("link") is not None else ""
                pub_date = item.find("pubDate").text if item.find("pubDate") is not None else ""
                source = item.find("source").text if item.find("source") is not None else ""
                if link:
                    news.append({
                        "title": title,
                        "url": link,
                        "date": pub_date,
                        "source": source
                    })
    except Exception:
        pass
    return news

def get_web_references(query: str, max_items: int = 5) -> List[Dict[str, str]]:
    from search_engine import search_ddg
    return search_ddg(f"{query} company corporate overview", max_results=max_items)

def analyze_company(query: str) -> Dict[str, Any]:
    print(f"[*] Analyzing company data for '{query}'...", file=sys.stderr)
    dossier: Dict[str, Any] = {
        "query": query,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sec": None,
        "market": None,
        "wikipedia": None,
        "news": [],
        "web": []
    }

    # 1. SEC Match
    sec_match = match_sec_company(query)
    ticker = None
    if sec_match:
        cik = sec_match["cik_str"]
        ticker = sec_match.get("ticker")
        sec_details = get_sec_filings(cik)
        dossier["sec"] = {
            "title": sec_match.get("title"),
            "ticker": ticker,
            "cik": cik,
            **sec_details
        }
    
    # 2. Market Data (if ticker found or query is ticker)
    probe_ticker = ticker or (query.upper() if len(query.strip()) <= 5 and query.strip().isalpha() else None)
    if probe_ticker:
        mkt = get_market_data(probe_ticker)
        if mkt:
            dossier["market"] = mkt

    # 3. Wikipedia Profile
    wiki = get_wikipedia_profile(query)
    if wiki:
        dossier["wikipedia"] = wiki

    # 4. News
    dossier["news"] = get_company_news(query, max_items=5)

    # 5. Web Presence
    dossier["web"] = get_web_references(query, max_items=5)

    return dossier

def format_terminal_report(d: Dict[str, Any]) -> str:
    lines = []
    lines.append("=" * 65)
    lines.append(f"   🏢 COMPANY INTELLIGENCE REPORT: {d['query'].upper()}")
    lines.append("=" * 65)

    # Wikipedia Overview
    wiki = d.get("wikipedia")
    if wiki:
        lines.append("\n📌 OVERVIEW")
        if wiki.get("description"):
            lines.append(f"   Summary: {wiki['description']}")
        if wiki.get("extract"):
            lines.append(f"   Profile: {wiki['extract']}")
        if wiki.get("url"):
            lines.append(f"   Wikipedia: {wiki['url']}")

    # Market Data
    mkt = d.get("market")
    if mkt and mkt.get("regular_market_price"):
        lines.append("\n📈 MARKET & FINANCIAL DATA")
        curr = mkt.get("currency", "USD")
        lines.append(f"   Ticker: {mkt.get('symbol')} ({mkt.get('exchange_name', 'Exchange')})")
        lines.append(f"   Stock Price: {mkt.get('regular_market_price')} {curr}")
        if mkt.get("previous_close"):
            lines.append(f"   Previous Close: {mkt.get('previous_close')} {curr}")
        if mkt.get("fifty_two_week_high") and mkt.get("fifty_two_week_low"):
            lines.append(f"   52-Week Range: {mkt.get('fifty_two_week_low')} - {mkt.get('fifty_two_week_high')} {curr}")

    # SEC EDGAR Filings
    sec = d.get("sec")
    if sec:
        lines.append("\n🏛️ SEC EDGAR REGULATORY PROFILE")
        lines.append(f"   Legal Title: {sec.get('title')}")
        lines.append(f"   CIK: {sec.get('cik')} | Ticker: {sec.get('ticker')}")
        if sec.get("sic_description"):
            lines.append(f"   Industry (SIC): {sec.get('sic_description')} (Code: {sec.get('sic')})")
        if sec.get("state_of_incorporation"):
            lines.append(f"   State of Inc: {sec.get('state_of_incorporation')}")
        if sec.get("edgar_url"):
            lines.append(f"   EDGAR Browse: {sec.get('edgar_url')}")
        
        filings = sec.get("filings", [])
        if filings:
            lines.append("\n   Recent Official SEC Filings:")
            for f in filings[:6]:
                lines.append(f"     * Form {f['form']} ({f['filing_date']}): {f['url']}")

    # Web Presence
    web = d.get("web", [])
    if web:
        lines.append("\n🌐 OFFICIAL WEB & CORPORATE RESOURCES")
        for item in web[:4]:
            lines.append(f"   * {item['title']}")
            lines.append(f"     URL: {item['url']}")
            if item.get("snippet"):
                lines.append(f"     {item['snippet'][:100]}...")

    # Latest News
    news = d.get("news", [])
    if news:
        lines.append("\n📰 RECENT NEWS & DEVELOPMENTS")
        for n in news[:4]:
            src = f" ({n['source']})" if n.get("source") else ""
            lines.append(f"   * {n['title']}{src}")
            lines.append(f"     Link: {n['url']}")

    lines.append("\n" + "=" * 65)
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Universal Company Search & Intelligence Engine")
    parser.add_argument("query", nargs="*", help="Company name or stock ticker to analyze")
    parser.add_argument("--json", action="store_true", help="Output raw JSON data")
    args = parser.parse_args()

    q = " ".join(args.query).strip() if args.query else ""
    if not q:
        print("Usage: python company_search.py <Company Name or Ticker> [--json]")
        sys.exit(1)

    dossier = analyze_company(q)
    if args.json:
        print(json.dumps(dossier, indent=2))
    else:
        print(format_terminal_report(dossier))

if __name__ == "__main__":
    main()
