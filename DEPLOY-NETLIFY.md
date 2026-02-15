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
