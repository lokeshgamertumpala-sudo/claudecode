#!/usr/bin/env python3
"""
Neutromstar - Python HTTP Server with Live Reload
Serves the interactive solar system explorer with auto-reload on file changes.
"""
import http.server
import socketserver
import threading
import time
import os
import sys
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

PORT = 8080
DIRECTORY = Path(__file__).parent

class ReloadHandler(FileSystemEventHandler):
    def __init__(self, server):
        self.server = server
        self.last_reload = 0

    def on_modified(self, event):
        if event.is_directory:
            return
        if time.time() - self.last_reload < 1:
            return
        self.last_reload = time.time()
        print(f"\n[Reload] {event.src_path} changed - refreshing clients...")
        self.server.reload_clients()

class LiveReloadServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    clients = []
    reload_script = """
    <script>
    (function() {
        const es = new EventSource('/__reload');
        es.onmessage = () => location.reload();
        es.onerror = () => setTimeout(() => location.reload(), 1000);
    })();
    </script>
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.clients = []

    def register_client(self, handler):
        self.clients.append(handler)

    def unregister_client(self, handler):
        if handler in self.clients:
            self.clients.remove(handler)

    def reload_clients(self):
        for client in self.clients[:]:
            try:
                client.send_reload()
            except:
                self.clients.remove(client)

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def do_GET(self):
        if self.path == '/__reload':
            self.handle_sse()
            return
        if self.path == '/' or self.path == '/index.html':
            self.serve_index_with_reload()
            return
        super().do_GET()

    def handle_sse(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.end_headers()
        self.server.register_client(self)
        try:
            while True:
                time.sleep(30)
                self.wfile.write(b': keepalive\n\n')
                self.wfile.flush()
        except:
            pass
        finally:
            self.server.unregister_client(self)

    def send_reload(self):
        try:
            self.wfile.write(b'data: reload\n\n')
            self.wfile.flush()
        except:
            pass

    def serve_index_with_reload(self):
        index_path = DIRECTORY / 'index.html'
        content = index_path.read_text(encoding='utf-8')
        if '</head>' in content:
            content = content.replace('</head>', f'{LiveReloadServer.reload_script}</head>')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(content.encode('utf-8'))

    def log_message(self, format, *args):
        if '__reload' not in args[0]:
            print(f"[{time.strftime('%H:%M:%S')}] {format % args}")

def main():
    os.chdir(DIRECTORY)

    has_watchdog = True
    try:
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler
    except ImportError:
        has_watchdog = False
        print("[Warn] watchdog not installed - live reload disabled")
        print("       Install with: pip install watchdog")

    server = LiveReloadServer(('', PORT), RequestHandler)

    observer = None
    if has_watchdog:
        observer = Observer()
        observer.schedule(ReloadHandler(server), str(DIRECTORY), recursive=False)
        observer.start()
        print(f"[Live Reload] Watching {DIRECTORY} for changes...")

    print(f"\n[Neutromstar] Server running at http://localhost:{PORT}")
    print(f"[Neutromstar] Serving from {DIRECTORY}")
    print("[Neutromstar] Press Ctrl+C to stop\n")

    try:
        import webbrowser
        webbrowser.open(f'http://localhost:{PORT}')
    except:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Neutromstar] Shutting down...")
    finally:
        if observer:
            observer.stop()
            observer.join()
        server.server_close()

if __name__ == '__main__':
    main()