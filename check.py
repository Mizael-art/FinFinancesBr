#!/usr/bin/env python3
"""
FinFinance PWA - Verificador de Integridade
Verifica se todos os arquivos necessários estão presentes e corretos
"""

import os
import json

def check_file(filename, required=True):
    exists = os.path.exists(filename)
    status = "✅" if exists else ("❌" if required else "⚠️")
    req_text = "OBRIGATÓRIO" if required else "Opcional"
    print(f"{status} {filename:<25} [{req_text}]")
    return exists

def check_manifest():
    if os.path.exists('manifest.json'):
        with open('manifest.json') as f:
            try:
                data = json.load(f)
                icons = data.get('icons', [])
                if len(icons) >= 2:
                    print("   ↳ Manifest válido com ícones configurados ✅")
                else:
                    print("   ↳ Faltam ícones no manifest ⚠️")
            except:
                print("   ↳ Manifest inválido ❌")

def check_service_worker():
    if os.path.exists('sw.js'):
        with open('sw.js') as f:
            content = f.read()
            if 'install' in content and 'fetch' in content:
                print("   ↳ Service Worker configurado corretamente ✅")
            else:
                print("   ↳ Service Worker incompleto ⚠️")

def main():
    print("\n" + "="*60)
    print("  🔍 FinFinance PWA — Verificador de Integridade")
    print("="*60 + "\n")
    
    print("📄 Arquivos HTML/CSS/JS:")
    check_file('index.html')
    check_file('style.css')
    check_file('app.js')
    check_file('db.js')
    
    print("\n📱 Arquivos PWA:")
    check_file('manifest.json')
    check_manifest()
    check_file('sw.js')
    check_service_worker()
    
    print("\n🎨 Ícones:")
    has_192 = check_file('icon-192.png')
    has_512 = check_file('icon-512.png')
    
    print("\n📚 Documentação:")
    check_file('README.md', False)
    check_file('DEPLOY-GITHUB.md', False)
    check_file('DEPLOY-NETLIFY.md', False)
    check_file('DEPLOY-VERCEL.md', False)
    
    print("\n" + "="*60)
    
    # Verificar integridade completa
    essentials = ['index.html', 'style.css', 'app.js', 'db.js', 'manifest.json', 'sw.js']
    all_present = all(os.path.exists(f) for f in essentials)
    
    if all_present and has_192 and has_512:
        print("  ✅ TUDO PRONTO! Você pode fazer deploy agora.")
        print("\n  📚 Consulte os guias de deploy:")
        print("     • DEPLOY-GITHUB.md (Recomendado)")
        print("     • DEPLOY-NETLIFY.md (Mais rápido)")
        print("     • DEPLOY-VERCEL.md (Mais rápido)")
        print("\n  🧪 Para testar localmente:")
        print("     python3 server.py")
    else:
        print("  ⚠️  Alguns arquivos essenciais estão faltando.")
        print("     Verifique os itens marcados com ❌")
    
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
