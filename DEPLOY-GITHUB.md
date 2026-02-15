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
