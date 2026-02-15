# 🔧 Correção v2.0.1 — Campos Numéricos

## 🐛 Problema Identificado

Alguns campos numéricos ainda tinham `step` restritivo que não permitia valores exatos:

### Campos Afetados:
- ❌ **Limite do Cartão:** `step="100"` → Só aceitava 900, 1000, 1100...
- ❌ **Salário (Onboarding):** `step="100"` → Mesma restrição
- ❌ **Salário (Perfil):** `step="100"` → Mesma restrição  
- ❌ **Outras Rendas:** `step="100"` → Mesma restrição
- ❌ **Valor Conta Fixa:** `step="10"` → Só múltiplos de 10

## ✅ Correção Aplicada

Todos os campos agora aceitam **qualquer valor**:

```html
<!-- ANTES -->
<input type="number" step="100" />  ❌ Só 900, 1000, 1100...

<!-- AGORA -->
<input type="number" step="0.01" /> ✅ Aceita 1000, 2500, 1234.56...
<input type="number" step="1" />    ✅ Aceita 1000, 2500, 1234...
```

### Campos Corrigidos:

1. **Limite do Cartão:**
   - Antes: `step="100"`
   - Agora: `step="1"` (inteiros)
   - ✅ Aceita: 1000, 1500, 2000, 2500, 3000...

2. **Salário (Onboarding + Perfil):**
   - Antes: `step="100"`
   - Agora: `step="0.01"` (com centavos)
   - ✅ Aceita: 5000, 2500, 3750.50, 4321.99...

3. **Outras Rendas:**
   - Antes: `step="100"`
   - Agora: `step="0.01"` (com centavos)
   - ✅ Aceita: Qualquer valor

4. **Valor Conta Fixa:**
   - Antes: `step="10"`
   - Agora: `step="0.01"` (com centavos)
   - ✅ Aceita: 1200, 1250, 1234.56...

## 🎯 Resultado

Agora você pode inserir:
- ✅ 1000 (exato)
- ✅ 1500 (exato)
- ✅ 2000 (exato)
- ✅ 2500 (exato)
- ✅ 1234.56 (com centavos)
- ✅ **Qualquer valor válido**

## 📱 CSS Adicional

Também melhorei o feedback visual:
- ✅ Campo inválido: borda vermelha
- ✅ Campo válido: borda normal
- ✅ Sem setas de incremento (mais limpo)
- ✅ Fonte 16px (evita zoom no iOS)

## 🚀 Como Atualizar

Substitua os arquivos:
- `index.html` — 5 campos corrigidos
- `mobile.css` — Validação visual adicionada

Ou baixe o novo ZIP completo.

---

**Versão:** v2.0.1  
**Bug:** CORRIGIDO ✅  
**Compatibilidade:** 100% compatível com v2.0
