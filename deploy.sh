#!/bin/bash

# FinFinance PWA - Script de Deploy Rápido
# Este script ajuda você a fazer deploy do app

echo "🚀 FinFinance PWA - Deploy Rápido"
echo ""
echo "Escolha uma opção de hospedagem:"
echo ""
echo "1️⃣  GitHub Pages (Grátis, recomendado)"
echo "2️⃣  Netlify (Grátis, mais rápido)"
echo "3️⃣  Vercel (Grátis, mais rápido)"
echo ""

# GitHub Pages
cat > DEPLOY-GITHUB.md << 'GITHUB'
# Deploy no GitHub Pages

## Passo 1: Criar repositório
```bash
git init
git add .
git commit -m "FinFinance PWA - Deploy inicial"
git branch -M main
```

## Passo 2: Conectar ao GitHub
1. Vá em https://github.com/new
2. Crie um repositório chamado `finfinance-pwa`
3. Execute:
```bash
git remote add origin https://github.com/SEU-USUARIO/finfinance-pwa.git
git push -u origin main
```

## Passo 3: Habilitar GitHub Pages
1. Vá em `Settings` > `Pages`
2. Em `Source`, selecione `main branch`
3. Clique em `Save`

## Passo 4: Acessar
Aguarde 1-2 minutos e acesse:
```
https://SEU-USUARIO.github.io/finfinance-pwa
```

## No iPhone
1. Abra o Safari
2. Acesse a URL acima
3. Clique em 🔗 Compartilhar
4. Selecione "Adicionar à Tela de Início"
5. Pronto! O app está instalado ✅
GITHUB

# Netlify
cat > DEPLOY-NETLIFY.md << 'NETLIFY'
# Deploy no Netlify

## Opção 1: Drag & Drop (Mais Fácil)
1. Vá em https://app.netlify.com/drop
2. Arraste a pasta `finfinance-pwa` para a área indicada
3. Aguarde o upload e deploy
4. Copie a URL gerada (ex: `random-name.netlify.app`)

## Opção 2: GitHub Integration
1. Vá em https://app.netlify.com
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub
4. Deploy automático a cada push!

## Configuração Adicional
Crie um arquivo `netlify.toml`:
```toml
[build]
  publish = "."

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"
```

## No iPhone
1. Abra o Safari
2. Acesse sua URL `.netlify.app`
3. Clique em 🔗 Compartilhar
4. Selecione "Adicionar à Tela de Início"
5. Pronto! ✅
NETLIFY

# Vercel
cat > DEPLOY-VERCEL.md << 'VERCEL'
# Deploy no Vercel

## Opção 1: CLI (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd finfinance-pwa
vercel --prod
```

## Opção 2: GitHub Integration
1. Vá em https://vercel.com/new
2. Importe seu repositório GitHub
3. Deploy automático!

## Configuração
Crie um arquivo `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

## No iPhone
1. Abra o Safari
2. Acesse sua URL `.vercel.app`
3. Clique em 🔗 Compartilhar
4. Selecione "Adicionar à Tela de Início"
5. Pronto! ✅
VERCEL

echo "📚 Guias de deploy criados:"
echo "   - DEPLOY-GITHUB.md"
echo "   - DEPLOY-NETLIFY.md"
echo "   - DEPLOY-VERCEL.md"
echo ""
echo "✨ Recomendação: Use GitHub Pages para começar!"
