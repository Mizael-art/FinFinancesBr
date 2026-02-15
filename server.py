#!/usr/bin/env python3
"""
FinFinance PWA - Servidor Local de Testes
Execute: python3 server.py
Acesse: http://localhost:8000
"""

import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Adicionar headers para PWA
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("\n" + "="*60)
        print("  💜 FinFinance PWA — Servidor Local")
        print("="*60)
        print(f"\n  🌐 Acesse: http://localhost:{PORT}")
        print(f"  📱 No iPhone (mesma rede): http://SEU-IP:{PORT}")
        print("\n  Para descobrir seu IP:")
        print("     • Windows: ipconfig")
        print("     • Mac/Linux: ifconfig | grep inet")
        print("\n  ⌨  Ctrl+C para encerrar")
        print("="*60 + "\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✅ Servidor encerrado.\n")
