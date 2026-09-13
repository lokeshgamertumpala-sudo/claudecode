"""
Unified Multi-Source Web & Company Search Engine
Provides reliable, high-speed search across DuckDuckGo, Wikipedia, Yahoo Finance, and Google News.
Used by LiteLLM Proxy endpoint /v1/code/sessions/{session_id}/worker/web-search and company intelligence tools.
"""

import urllib.parse
import re
import xml.etree.ElementTree as ET
from html import unescape
from typing import List, Dict, Optional
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

def clean_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    return unescape(text).strip()

def search_ddg(query: str, max_results: int = 8, allowed_domains: Optional[List[str]] = None, blocked_domains: Optional[List[str]] = None) -> List[Dict[str, str]]:
    results = []
    # Try DDG Lite first
    try:
        url = "https://lite.duckduckgo.com/lite/"
        resp = requests.post(url, data={"q": query}, headers=HEADERS, timeout=5)
        if resp.status_code == 200:
            for match in re.finditer(r'<td\s+class=[\'"]result-snippet[\'"]\s*>(.*?)</td>', resp.text, re.DOTALL):
                snippet = clean_html(match.group(1))
                start = max(0, match.start() - 600)
                chunk = resp.text[start:match.start()]
                links = re.findall(r'<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', chunk, re.DOTALL)
                if links:
                    raw_url, raw_title = links[-1]
                    title = clean_html(raw_title)
                    clean_url = raw_url
                    if "uddg=" in raw_url:
                        qs = urllib.parse.parse_qs(urllib.parse.urlparse(raw_url).query)
                        clean_url = qs.get("uddg", [raw_url])[0]
                    
                    domain = urllib.parse.urlparse(clean_url).netloc.lower()
                    if allowed_domains and not any(ad.lower() in domain for ad in allowed_domains):
                        continue
                    if blocked_domains and any(bd.lower() in domain for bd in blocked_domains):
                        continue
                    
                    if clean_url and not any(r["url"] == clean_url for r in results):
                        results.append({"title": title, "url": clean_url, "snippet": snippet})
                        if len(results) >= max_results:
                            break
    except Exception:
        pass

    # Fallback to DDG HTML if Lite had 0 results
    if not results:
        try:
            html_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
            resp = requests.get(html_url, headers=HEADERS, timeout=5)
            if resp.status_code == 200:
                titles = re.findall(r'<a[^>]+class="result__url"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', resp.text)
                snippets = re.findall(r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>', resp.text)
                for i in range(min(len(titles), len(snippets))):
                    raw_url, title = titles[i]
                    clean_url = raw_url
                    if "uddg=" in raw_url:
                        qs = urllib.parse.parse_qs(urllib.parse.urlparse(raw_url).query)
                        clean_url = qs.get("uddg", [raw_url])[0]
                    domain = urllib.parse.urlparse(clean_url).netloc.lower()
                    if allowed_domains and not any(ad.lower() in domain for ad in allowed_domains):
                        continue
                    if blocked_domains and any(bd.lower() in domain for bd in blocked_domains):
                        continue
                    if clean_url and not any(r["url"] == clean_url for r in results):
                        results.append({
                            "title": clean_html(title),
                            "url": clean_url,
                            "snippet": clean_html(snippets[i])
                        })
                        if len(results) >= max_results:
                            break
        except Exception:
            pass

    return results

def search_wikipedia(query: str, max_results: int = 3) -> List[Dict[str, str]]:
    results = []
    try:
        url = "https://en.wikipedia.org/w/api.php"
        params = {"action": "opensearch", "search": query, "limit": max_results, "format": "json"}
        resp = requests.get(url, params=params, headers={"User-Agent": "CompanyIntelligence/1.0"}, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            titles = data[1] if len(data) > 1 else []
            descriptions = data[2] if len(data) > 2 else []
            urls = data[3] if len(data) > 3 else []
            for i in range(len(titles)):
                t = titles[i]
                u = urls[i]
                d = descriptions[i] if i < len(descriptions) and descriptions[i] else f"Wikipedia article for {t}."
                results.append({"title": f"{t} - Wikipedia", "url": u, "snippet": d})
    except Exception:
        pass
    return results

def search_google_news(query: str, max_results: int = 3) -> List[Dict[str, str]]:
    results = []
    try:
        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-US&gl=US&ceid=US:en"
        resp = requests.get(url, headers=HEADERS, timeout=4)
        if resp.status_code == 200:
            root = ET.fromstring(resp.text)
            for item in root.findall(".//item")[:max_results]:
                title = item.find("title").text if item.find("title") is not None else ""
                link = item.find("link").text if item.find("link") is not None else ""
                pub_date = item.find("pubDate").text if item.find("pubDate") is not None else ""
                source = item.find("source").text if item.find("source") is not None else "Google News"
                snippet = f"Published: {pub_date} | Source: {source}" if pub_date else f"Source: {source}"
                if link:
                    results.append({"title": title, "url": link, "snippet": snippet})
    except Exception:
        pass
    return results

def search_yahoo_finance(query: str) -> List[Dict[str, str]]:
    results = []
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(query)}&quotesCount=4&newsCount=2"
        resp = requests.get(url, headers={"User-Agent": "CompanyIntelligence/1.0"}, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            for q in data.get("quotes", []):
                symbol = q.get("symbol")
                name = q.get("shortname") or q.get("longname") or symbol
                qtype = q.get("quoteType", "EQUITY")
                exch = q.get("exchange", "")
                if symbol:
                    url = f"https://finance.yahoo.com/quote/{symbol}"
                    snippet = f"Ticker: {symbol} | Exchange: {exch} | Security Type: {qtype} | Corporate Name: {name}"
                    results.append({"title": f"{name} ({symbol}) - Yahoo Finance", "url": url, "snippet": snippet})
    except Exception:
        pass
    return results

def unified_web_search(query: str, max_results: int = 8, allowed_domains: Optional[List[str]] = None, blocked_domains: Optional[List[str]] = None) -> List[Dict[str, str]]:
    """
    Unified multi-engine search:
    Aggregates DuckDuckGo, Wikipedia, Yahoo Finance, and Google News into clean, deduplicated results.
    """
    seen_urls = set()
    combined = []

    # 1. Primary web search
    ddg_res = search_ddg(query, max_results=max_results, allowed_domains=allowed_domains, blocked_domains=blocked_domains)
    for r in ddg_res:
        if r["url"] not in seen_urls:
            seen_urls.add(r["url"])
            combined.append(r)

    # 2. If results are scarce (< 4) or query looks company-specific, enrich with Wikipedia & Yahoo Finance
    if len(combined) < 4:
        # Check Wikipedia
        wiki_res = search_wikipedia(query, max_results=3)
        for r in wiki_res:
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                combined.append(r)
        
        # Check Yahoo Finance if it might be a company / stock
        yf_res = search_yahoo_finance(query)
        for r in yf_res:
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                combined.append(r)

        # Check Google News if still needed
        if len(combined) < 3:
            news_res = search_google_news(query, max_results=3)
            for r in news_res:
                if r["url"] not in seen_urls:
                    seen_urls.add(r["url"])
                    combined.append(r)

    return combined[:max_results]

if __name__ == "__main__":
    import sys
    q = sys.argv[1] if len(sys.argv) > 1 else "Apple Inc company profile"
    print(f"Searching for: {q}")
    res = unified_web_search(q)
    for i, item in enumerate(res, 1):
        print(f"[{i}] {item['title']}\n    URL: {item['url']}\n    Snippet: {item['snippet']}\n")
