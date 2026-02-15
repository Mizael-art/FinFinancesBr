# FinFinance PWA — Controle Financeiro para iPhone

## 🎯 Sobre

**FinFinance** é um aplicativo de controle financeiro pessoal que funciona **100% offline** no seu iPhone, sem necessidade de servidor ou PC.

### ✨ Recursos

- 💰 **Dashboard completo** com KPIs de renda, gastos e saldo
- 🎯 **Motor de análise inteligente** com score financeiro e dicas personalizadas
- 💳 **Gestão de cartões** com controle de limites e faturas
- 📊 **Análise por categorias** com comparação contra metas ideais
- 📅 **Histórico mensal** com visualizações de tendências
- 🔔 **Alertas automáticos** de vencimentos e limites
- 🌙 **Tema claro/escuro** adaptável
- 📱 **Funciona offline** — todos os dados ficam no seu iPhone

## 📲 Como Instalar no iPhone

### Passo 1: Hospedagem
Você precisa hospedar os arquivos em algum lugar. Opções gratuitas:

1. **GitHub Pages** (recomendado)
2. **Netlify**
3. **Vercel**
4. **Cloudflare Pages**

### Passo 2: Abrir no Safari
1. Abra o Safari no iPhone
2. Acesse a URL onde você hospedou o app
3. Clique no botão **Compartilhar** (quadrado com seta)
4. Role e selecione **"Adicionar à Tela de Início"**
5. Confirme o nome e clique em **Adicionar**

### Passo 3: Pronto!
O app agora está instalado como um aplicativo nativo no seu iPhone e funciona **completamente offline**.

## 🗂️ Estrutura de Arquivos

```
finfinance-pwa/
├── index.html          # Interface principal
├── style.css           # Estilos (tema dark/light)
├── app.js              # Lógica do frontend
├── db.js               # Banco de dados IndexedDB + análises
├── sw.js               # Service Worker (offline)
├── manifest.json       # Metadados PWA
├── icon-192.png        # Ícone 192x192
├── icon-512.png        # Ícone 512x512
└── generate-icons.html # Gerador de ícones (opcional)
```

## 🚀 Deploy no GitHub Pages

```bash
# 1. Criar repositório no GitHub
git init
git add .
git commit -m "Initial commit - FinFinance PWA"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/finfinance-pwa.git
git push -u origin main

# 2. Habilitar GitHub Pages
# Vá em: Settings > Pages > Source: main branch > Salvar

# 3. Acesse: https://SEU-USUARIO.github.io/finfinance-pwa
```

## 🔧 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Banco de Dados:** IndexedDB (armazenamento local)
- **Gráficos:** Chart.js
- **PWA:** Service Worker + Web App Manifest
- **Fontes:** Outfit (UI) + JetBrains Mono (números)

## 📊 Motor de Análise Inteligente

O FinFinance possui um sistema de análise que:

1. **Calcula score financeiro** (0-100) baseado em seus gastos
2. **Compara gastos por categoria** contra metas ideais (alimentação 15%, moradia 25%, etc)
3. **Identifica gastos supérfluos** (delivery, assinaturas)
4. **Gera dicas personalizadas** baseadas no seu comportamento
5. **Destaca pontos fortes** nas suas finanças
6. **Calcula economia possível** em cada categoria

## 🔐 Privacidade

- **Todos os dados ficam no seu iPhone** (IndexedDB)
- **Nenhum dado é enviado para servidores externos**
- **Funciona 100% offline** após a primeira instalação
- **Você tem controle total** dos seus dados financeiros

## 💡 Dicas de Uso

1. **Configure seu perfil primeiro** (renda mensal)
2. **Cadastre seus cartões de crédito** com limites e vencimentos
3. **Adicione contas fixas** (aluguel, internet, etc)
4. **Registre despesas diariamente** para análises precisas
5. **Consulte a aba "Dicas Inteligentes"** para insights

## 🆘 Resolução de Problemas

**O app não está salvando dados:**
- Verifique se está usando HTTPS (GitHub Pages usa automaticamente)
- Limpe o cache do Safari e reinstale o app

**O app não funciona offline:**
- Certifique-se de ter aberto o app pelo menos uma vez online
- Verifique se o Service Worker foi registrado (console do Safari)

**Os gráficos não aparecem:**
- Aguarde alguns segundos após abrir o app
- Adicione algumas despesas primeiro

## 📝 Licença

Este projeto é de código aberto. Você pode modificar e redistribuir livremente.

## 🤝 Contribuições

Melhorias são bem-vindas! Sinta-se à vontade para fazer fork e enviar PRs.

---

**FinFinance** — Seu dinheiro, inteligente. 💜
