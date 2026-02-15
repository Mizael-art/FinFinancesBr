# 🚀 FinFinance PWA — Guia de Início Rápido

## ⚡ TL;DR (Muito Rápido)

```bash
# 1. Fazer upload para GitHub Pages
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU-USUARIO/finfinance-pwa.git
git push -u origin main

# 2. Habilitar Pages em Settings > Pages > main branch

# 3. No iPhone Safari, acesse:
https://SEU-USUARIO.github.io/finfinance-pwa

# 4. Compartilhar > Adicionar à Tela de Início
```

**Pronto!** App instalado e funcionando offline! 🎉

---

## 📋 Checklist Rápido

Antes de fazer deploy, certifique-se:

- [ ] Todos os arquivos estão na mesma pasta
- [ ] Os ícones `icon-192.png` e `icon-512.png` existem
- [ ] Execute `python3 check.py` para verificar integridade

---

## 🎯 Estrutura do Projeto

```
finfinance-pwa/
├── 📄 index.html              ← Interface do app
├── 🎨 style.css               ← Estilos (dark/light)
├── ⚙️  app.js                 ← Lógica do frontend
├── 💾 db.js                   ← Banco local + análises
├── 🔧 sw.js                   ← Funciona offline
├── 📱 manifest.json           ← Metadados PWA
├── 🖼️  icon-192.png           ← Ícone pequeno
├── 🖼️  icon-512.png           ← Ícone grande
│
├── 📚 README.md               ← Documentação completa
├── 📱 INSTALACAO-IPHONE.md    ← Guia visual iPhone
├── 🚀 DEPLOY-GITHUB.md        ← Deploy GitHub Pages
├── 🚀 DEPLOY-NETLIFY.md       ← Deploy Netlify
├── 🚀 DEPLOY-VERCEL.md        ← Deploy Vercel
│
└── 🔧 Utilitários:
    ├── server.py              ← Testar localmente
    ├── check.py               ← Verificar integridade
    └── deploy.sh              ← Gerar guias
```

---

## 🧪 Testar Localmente

### Opção 1: Python (Recomendado)
```bash
python3 server.py
# Acesse: http://localhost:8000
```

### Opção 2: PHP
```bash
php -S localhost:8000
```

### Opção 3: Node.js
```bash
npx serve
```

---

## 🌐 Deploy (3 opções)

### 🥇 GitHub Pages (Recomendado)
**Vantagens:** Grátis, estável, domínio `.github.io`

```bash
# Ver DEPLOY-GITHUB.md para detalhes
git init
git add .
git commit -m "Deploy FinFinance"
git push
# Habilitar Pages no repositório
```

### 🥈 Netlify
**Vantagens:** Mais rápido, domínio customizável grátis

```bash
# Ver DEPLOY-NETLIFY.md para detalhes
# Opção 1: Arrastar pasta no site
# Opção 2: CLI com `netlify deploy`
```

### 🥉 Vercel
**Vantagens:** Muito rápido, domínio customizável grátis

```bash
# Ver DEPLOY-VERCEL.md para detalhes
vercel --prod
```

---

## 📱 Instalação no iPhone

**Guia completo:** `INSTALACAO-IPHONE.md`

**Resumo:**
1. Abrir Safari (não Chrome!)
2. Acessar URL do app
3. Tocar em 🔗 (Compartilhar)
4. "Adicionar à Tela de Início"
5. Confirmar

**Pronto!** App instalado como nativo ✅

---

## 🔍 Verificar Tudo Está Certo

```bash
python3 check.py
```

Deve mostrar:
```
✅ TUDO PRONTO! Você pode fazer deploy agora.
```

---

## 💡 Recursos do App

### 💰 Dashboard
- KPIs: Renda, Gastos, Saldo, Crédito
- Cartões com limite e fatura
- Contas fixas
- Histórico 6 meses

### 🎯 Dicas Inteligentes
- **Score financeiro** (0-100)
- **Análise por categoria** vs metas ideais
- **Dicas personalizadas** baseadas no seu comportamento
- **Identificação de gastos supérfluos**
- **Cálculo de economia possível**

### 💳 Cartões
- Cadastro de múltiplos cartões
- Acompanhamento de limite
- Cálculo automático de fatura
- Alertas de vencimento

### 📊 Despesas
- Registro de gastos diários
- Categorização inteligente
- Suporte a parcelamento
- Filtros e busca

### 📅 Contas Fixas
- Aluguel, internet, etc
- Vencimentos automáticos
- Inclusão no orçamento

### 📈 Histórico
- 12 meses de dados
- Gráficos de tendências
- Comparação mensal

---

## 🔐 Privacidade & Segurança

- ✅ **100% offline** após instalação
- ✅ **Dados locais** no seu iPhone (IndexedDB)
- ✅ **Sem servidores externos**
- ✅ **Código aberto** — você pode auditar
- ✅ **Sem rastreamento** ou analytics

---

## 🆘 Ajuda Rápida

### Problema: "Adicionar à Tela" não aparece
**Solução:** Use Safari (não Chrome), verifique HTTPS

### Problema: Dados sumiram
**Solução:** Não limpe cache do Safari, não use modo privado

### Problema: App lento
**Solução:** Limpe despesas antigas, reinicie o app

### Problema: Não funciona offline
**Solução:** Abra com internet primeiro, aguarde carregamento completo

---

## 📞 Suporte

- 📚 **Documentação:** Leia `README.md`
- 📱 **Instalação iPhone:** Veja `INSTALACAO-IPHONE.md`
- 🚀 **Deploy:** Consulte `DEPLOY-*.md`
- 🔧 **Código:** Abra issue no GitHub

---

## 🎉 Pronto para Começar!

1. ✅ Execute `python3 check.py`
2. ✅ Escolha uma opção de deploy
3. ✅ Siga o guia correspondente
4. ✅ Instale no iPhone
5. ✅ Configure seu perfil
6. ✅ Comece a registrar despesas!

---

**FinFinance** — Controle suas finanças com inteligência. 💜

Feito com carinho para funcionar **100% offline** no seu iPhone.
