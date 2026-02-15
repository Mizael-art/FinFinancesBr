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
