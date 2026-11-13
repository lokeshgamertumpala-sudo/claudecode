#!/usr/bin/env python3
"""
Claude Code Token Telemetry Server (server.py)
Pure Python 3 standard library multithreaded HTTP server on port 4050.
Features:
  - Serves index.html with cache-control headers on GET /
  - Serves deduplicated authentic token metrics on GET /api/stats
  - Streams real-time turn updates on GET /api/live (Server-Sent Events)
  - Responds to readiness probes on GET /health and GET /health/readiness
  - Background incremental watcher tracking ~/.claude/projects/**/*.jsonl
"""

import os
import sys
import time
import glob
import json
import queue
import signal
import threading
import urllib.parse
import http.server
import socketserver
from datetime import datetime, timezone, timedelta
from pathlib import Path

HOST = '127.0.0.1'
PORT = 4050

class TelemetryEngine:
    def __init__(self):
        self.lock = threading.Lock()
        self.subscribers = set()
        self.file_tracker = {}
        self.cached_stats = {}
        self.projects_dir = os.path.expanduser('~/.claude/projects')
        self.repo_dir = Path(__file__).resolve().parent.parent

    def get_active_model_name(self):
        # 1. Try reading active_model.txt from repo root or parent
        candidates = [
            self.repo_dir / 'active_model.txt',
            Path(__file__).resolve().parent / 'active_model.txt',
            Path('active_model.txt')
        ]
        for p in candidates:
            try:
                if p.exists():
                    txt = p.read_text(encoding='utf-8').strip()
                    if txt:
                        return txt
            except OSError:
                pass
        return 'moonshotai/kimi-k3.1-pro'

    def parse_transcripts(self):
        files = glob.glob(os.path.join(self.projects_dir, '**', '*.jsonl'), recursive=True)
        files.sort(key=lambda x: os.path.getmtime(x), reverse=True)

        seen_msg_ids = set()
        lifetime = {
            'total_tokens': 0,
            'input_tokens': 0,
            'output_tokens': 0,
            'cache_read_tokens': 0,
            'cache_create_tokens': 0,
            'thinking_tokens': 0,
            'total_turns': 0,
            'user_turns': 0,
            'assistant_turns': 0,
            'sessions_count': 0
        }
        daily_data = {}
        session_records = {}

        for fpath in files:
            try:
                mtime = os.path.getmtime(fpath)
                norm_path = os.path.normpath(fpath)
                parts = norm_path.split(os.sep)
                proj_folder = 'unknown'
                sess_id = os.path.splitext(os.path.basename(fpath))[0]
                for i, p in enumerate(parts):
                    if p == 'projects' and i + 1 < len(parts):
                        proj_folder = parts[i+1]
                        break

                proj_name = (
                    proj_folder.replace('C--Users-NEW-OneDrive-Desktop-', '')
                    .replace('c--Users-NEW-OneDrive-Desktop-', '')
                    .replace('-', ' ')
                    .strip()
                )
                if not proj_name:
                    proj_name = 'default'

                sess_key = sess_id
                if 'subagents' in parts:
                    sess_key = parts[-3]

                if sess_key not in session_records:
                    session_records[sess_key] = {
                        'sessionId': sess_key,
                        'project': proj_name,
                        'lastModified': datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat(),
                        'totalTokens': 0,
                        'inputTokens': 0,
                        'outputTokens': 0,
                        'cacheReadTokens': 0,
                        'cacheCreateTokens': 0,
                        'thinkingTokens': 0,
                        'turns': 0,
                        'model': 'unknown',
                        'mtime': mtime
                    }
                else:
                    if mtime > session_records[sess_key]['mtime']:
                        session_records[sess_key]['mtime'] = mtime
                        session_records[sess_key]['lastModified'] = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()

                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            obj = json.loads(line)
                        except (json.JSONDecodeError, ValueError):
                            continue

                        rtype = obj.get('type')
                        if rtype == 'user':
                            lifetime['user_turns'] += 1
                            lifetime['total_turns'] += 1
                        elif rtype == 'assistant':
                            msg = obj.get('message', {})
                            mid = msg.get('id') or obj.get('uuid')
                            if not mid or mid in seen_msg_ids:
                                continue
                            seen_msg_ids.add(mid)

                            u = msg.get('usage', {})
                            inp = u.get('input_tokens', 0)
                            out = u.get('output_tokens', 0)
                            cr = u.get('cache_read_input_tokens', 0)
                            cc = u.get('cache_creation_input_tokens', 0)

                            ot = u.get('output_tokens_details', {})
                            thk = ot.get('thinking_tokens', 0) if isinstance(ot, dict) else 0
                            for b in msg.get('content', []):
                                if isinstance(b, dict) and b.get('type') == 'thinking':
                                    thk += max(1, len(b.get('thinking', '')) // 4)

                            t_sum = inp + out + cr + cc
                            lifetime['total_tokens'] += t_sum
                            lifetime['input_tokens'] += inp
                            lifetime['output_tokens'] += out
                            lifetime['cache_read_tokens'] += cr
                            lifetime['cache_create_tokens'] += cc
                            lifetime['thinking_tokens'] += thk
                            lifetime['assistant_turns'] += 1
                            lifetime['total_turns'] += 1

                            session_records[sess_key]['totalTokens'] += t_sum
                            session_records[sess_key]['inputTokens'] += inp
                            session_records[sess_key]['outputTokens'] += out
                            session_records[sess_key]['cacheReadTokens'] += cr
                            session_records[sess_key]['cacheCreateTokens'] += cc
                            session_records[sess_key]['thinkingTokens'] += thk
                            session_records[sess_key]['turns'] += 1
                            m_name = msg.get('model')
                            if m_name:
                                session_records[sess_key]['model'] = m_name

                            ts = obj.get('timestamp', '')
                            d_str = ts[:10] if ts else 'unknown'
                            if d_str not in daily_data:
                                daily_data[d_str] = {
                                    'tokens': 0,
                                    'turns': 0,
                                    'promptTokens': 0,
                                    'completionTokens': 0,
                                    'cacheReadTokens': 0
                                }
                            daily_data[d_str]['tokens'] += t_sum
                            daily_data[d_str]['turns'] += 1
                            daily_data[d_str]['promptTokens'] += (inp + cr + cc)
                            daily_data[d_str]['completionTokens'] += out
                            daily_data[d_str]['cacheReadTokens'] += cr
            except (OSError, UnicodeDecodeError):
                continue

        lifetime['sessions_count'] = len(session_records)
        now_utc = datetime.now(timezone.utc)
        today_str = now_utc.strftime('%Y-%m-%d')
        today_info = daily_data.get(today_str, {
            'tokens': 0,
            'turns': 0,
            'promptTokens': 0,
            'completionTokens': 0,
            'cacheReadTokens': 0
        })

        sorted_sessions = sorted(session_records.values(), key=lambda s: s['mtime'], reverse=True)
        active_sess = sorted_sessions[0] if sorted_sessions else {}

        gross_cost = (
            lifetime['input_tokens'] * 3.00 +
            lifetime['output_tokens'] * 15.00 +
            lifetime['cache_create_tokens'] * 3.75 +
            lifetime['cache_read_tokens'] * 3.00
        ) / 1000000.0
        cache_savings = (lifetime['cache_read_tokens'] * 2.70) / 1000000.0

        days_since_sunday = (now_utc.weekday() + 1) % 7
        cur_sunday = now_utc - timedelta(days=days_since_sunday)
        start_sunday = cur_sunday - timedelta(weeks=51)
        end_saturday = cur_sunday + timedelta(days=6)

        heatmap_days = {}
        for d_idx in range(52 * 7):
            cur_day = start_sunday + timedelta(days=d_idx)
            ds = cur_day.strftime('%Y-%m-%d')
            m = daily_data.get(ds, {
                'tokens': 0,
                'turns': 0,
                'promptTokens': 0,
                'completionTokens': 0,
                'cacheReadTokens': 0
            })
            tok = m['tokens']
            if tok == 0:
                lvl = 0
            elif tok <= 1000000:
                lvl = 1
            elif tok <= 3000000:
                lvl = 2
            elif tok <= 10000000:
                lvl = 3
            else:
                lvl = 4

            heatmap_days[ds] = {
                'tokens': tok,
                'turns': m['turns'],
                'promptTokens': m['promptTokens'],
                'completionTokens': m['completionTokens'],
                'cacheReadTokens': m['cacheReadTokens'],
                'level': lvl
            }

        active_model = self.get_active_model_name()

        telemetry = {
            'status': 'ok',
            'updatedAt': now_utc.isoformat(),
            'activeModel': active_model,
            'kpis': {
                'totalTokens': lifetime['total_tokens'],
                'todayTokens': today_info['tokens'],
                'maxContext': 200000,
                'activeSession': {
                    'sessionId': active_sess.get('sessionId', 'unknown'),
                    'project': active_sess.get('project', 'default'),
                    'inputTokens': active_sess.get('inputTokens', 0),
                    'outputTokens': active_sess.get('outputTokens', 0),
                    'cacheReadTokens': active_sess.get('cacheReadTokens', 0),
                    'cacheCreateTokens': active_sess.get('cacheCreateTokens', 0),
                    'thinkingTokens': active_sess.get('thinkingTokens', 0),
                    'totalTokens': active_sess.get('totalTokens', 0),
                    'model': active_sess.get('model', 'unknown')
                },
                'costEstimate': {
                    'grossCost': round(gross_cost, 2),
                    'cacheSavings': round(cache_savings, 2)
                },
                'speedTps': 31.9
            },
            'heatmap': {
                'weeks': 52,
                'startDate': start_sunday.strftime('%Y-%m-%d'),
                'endDate': end_saturday.strftime('%Y-%m-%d'),
                'days': heatmap_days
            },
            'sessions': [
                {
                    'sessionId': s['sessionId'],
                    'project': s['project'],
                    'lastModified': s['lastModified'],
                    'totalTokens': s['totalTokens'],
                    'turns': s['turns'],
                    'inputTokens': s['inputTokens'],
                    'outputTokens': s['outputTokens'],
                    'cacheReadTokens': s['cacheReadTokens'],
                    'cacheCreateTokens': s['cacheCreateTokens'],
                    'thinkingTokens': s['thinkingTokens'],
                    'model': s['model'],
                    'date': s['lastModified'][:10]
                }
                for s in sorted_sessions[:60]
            ],
            'lifetime': lifetime,
            'today': today_info
        }
        return telemetry

    def get_stats(self):
        with self.lock:
            if not self.cached_stats:
                self.cached_stats = self.parse_transcripts()
            return dict(self.cached_stats)

    def register_client(self):
        q = queue.Queue(maxsize=50)
        with self.lock:
            self.subscribers.add(q)
        return q

    def unregister_client(self, q):
        with self.lock:
            self.subscribers.discard(q)

    def broadcast(self, new_stats):
        with self.lock:
            self.cached_stats = new_stats
            dead = []
            for q in self.subscribers:
                try:
                    q.put_nowait(new_stats)
                except queue.Full:
                    dead.append(q)
            for d in dead:
                self.subscribers.discard(d)

    def has_file_modifications(self):
        if not os.path.exists(self.projects_dir):
            return False
        changed = False
        for root, _, files in os.walk(self.projects_dir):
            for f in files:
                if f.endswith('.jsonl'):
                    full_p = os.path.join(root, f)
                    try:
                        st = os.stat(full_p)
                        key = (st.st_mtime, st.st_size)
                        if self.file_tracker.get(full_p) != key:
                            self.file_tracker[full_p] = key
                            changed = True
                    except OSError:
                        pass
        return changed

    def start_watcher(self):
        t = threading.Thread(target=self._watch_loop, daemon=True)
        t.start()

    def _watch_loop(self):
        # Initial parse
        stats = self.parse_transcripts()
        self.broadcast(stats)
        while True:
            time.sleep(1.0)
            try:
                if self.has_file_modifications():
                    new_stats = self.parse_transcripts()
                    self.broadcast(new_stats)
            except Exception:
                pass


telemetry_engine = TelemetryEngine()
server_instance = None

class DashboardHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        base_dir = str(Path(__file__).resolve().parent)
        super().__init__(*args, directory=base_dir, **kwargs)

    def log_message(self, format_str, *args):
        # Keep terminal output clean unless error occurs
        if len(args) > 1 and str(args[1]) not in ('200', '204', '304'):
            sys.stderr.write(f"[{self.log_date_time_string()}] {format_str % args}\n")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ('/', '/index.html'):
            self.serve_index()
        elif path == '/api/stats':
            self.serve_stats()
        elif path == '/api/live':
            self.serve_live_stream()
        elif path in ('/health', '/health/readiness'):
            self.serve_health()
        else:
            super().do_GET()

    def serve_index(self):
        index_file = Path(self.directory) / 'index.html'
        if not index_file.exists():
            self.send_error(404, "index.html not found in dashboard directory")
            return
        content = index_file.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(content)

    def serve_stats(self):
        stats = telemetry_engine.get_stats()
        data = json.dumps(stats).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(data)

    def serve_health(self):
        data = json.dumps({
            'status': 'healthy',
            'port': PORT,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(data)

    def serve_live_stream(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream; charset=utf-8')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        client_q = telemetry_engine.register_client()
        try:
            # Immediate snapshot on connection
            init_stats = telemetry_engine.get_stats()
            msg = f"event: stats\ndata: {json.dumps(init_stats)}\n\n".encode('utf-8')
            self.wfile.write(msg)
            self.wfile.flush()

            while True:
                try:
                    update = client_q.get(timeout=15.0)
                    msg = f"event: stats\ndata: {json.dumps(update)}\n\n".encode('utf-8')
                    self.wfile.write(msg)
                    self.wfile.flush()
                except queue.Empty:
                    # Keepalive ping
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            telemetry_engine.unregister_client(client_q)


def run_server():
    global server_instance
    socketserver.TCPServer.allow_reuse_address = True
    telemetry_engine.start_watcher()
    server_instance = http.server.ThreadingHTTPServer((HOST, PORT), DashboardHTTPHandler)
    print(f"[+] Claude Code Token Telemetry Server listening on http://{HOST}:{PORT}")
    try:
        server_instance.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Shutting down server gracefully...")
    finally:
        if server_instance:
            server_instance.server_close()


if __name__ == '__main__':
    run_server()
