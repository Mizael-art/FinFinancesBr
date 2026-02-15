/**
 * FinFinance PWA v2.0 — Database Module (IndexedDB)
 * Atualização: Temas personalizados + Ganhos extras
 */

const DB_NAME = 'FinFinanceDB';
const DB_VERSION = 2; // ← Atualizado para v2
let db = null;

// ══════════════════════════════════════════════
//  INICIALIZAÇÃO DO BANCO
// ══════════════════════════════════════════════

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      
      // Profile
      if (!db.objectStoreNames.contains('profile')) {
        const profileStore = db.createObjectStore('profile', { keyPath: 'id' });
        profileStore.add({
          id: 1,
          nome: 'Usuário',
          salario: 0,
          outras_rendas: 0,
          dia_pagamento: 5,
          tema: 'dark',
          onboarding_done: 0,
          // v2: Novos campos
          tema_cor: 'roxo',
          tema_modo: 'escuro'
        });
      } else if (oldVersion < 2) {
        // Migração v1 → v2: Adicionar novos campos sem perder dados
        const tx = event.target.transaction;
        const profileStore = tx.objectStore('profile');
        const getRequest = profileStore.get(1);
        
        getRequest.onsuccess = () => {
          const profile = getRequest.result;
          if (profile) {
            // Adicionar novos campos mantendo os existentes
            profile.tema_cor = profile.tema_cor || 'roxo';
            profile.tema_modo = profile.tema_modo || (profile.tema === 'dark' ? 'escuro' : 'claro');
            profileStore.put(profile);
          }
        };
      }
      
      // Ganhos Extras (nova tabela v2)
      if (!db.objectStoreNames.contains('ganhos_extras')) {
        const ganhosStore = db.createObjectStore('ganhos_extras', { keyPath: 'id', autoIncrement: true });
        ganhosStore.createIndex('ativo', 'ativo', { unique: false });
      }
      
      // Cartões
      if (!db.objectStoreNames.contains('cartoes')) {
        const cartoesStore = db.createObjectStore('cartoes', { keyPath: 'id', autoIncrement: true });
        cartoesStore.createIndex('ativo', 'ativo', { unique: false });
      }
      
      // Despesas
      if (!db.objectStoreNames.contains('despesas')) {
        const despesasStore = db.createObjectStore('despesas', { keyPath: 'id', autoIncrement: true });
        despesasStore.createIndex('data', 'data', { unique: false });
        despesasStore.createIndex('grupo_id', 'grupo_id', { unique: false });
      }
      
      // Contas Fixas
      if (!db.objectStoreNames.contains('contas_fixas')) {
        const contasStore = db.createObjectStore('contas_fixas', { keyPath: 'id', autoIncrement: true });
        contasStore.createIndex('ativo', 'ativo', { unique: false });
      }
      
      // Alertas
      if (!db.objectStoreNames.contains('alertas')) {
        const alertasStore = db.createObjectStore('alertas', { keyPath: 'id', autoIncrement: true });
        alertasStore.createIndex('lido', 'lido', { unique: false });
      }
    };
  });
}

// ══════════════════════════════════════════════
//  HELPERS DE ACESSO AO BANCO
// ══════════════════════════════════════════════

async function getStore(storeName, mode = 'readonly') {
  if (!db) await initDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

async function getAll(storeName, indexName = null, query = null) {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    let request;
    if (indexName) {
      const index = store.index(indexName);
      request = query !== null ? index.getAll(query) : index.getAll();
    } else {
      request = store.getAll();
    }
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getOne(storeName, id) {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function add(storeName, data) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function update(storeName, data) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function remove(storeName, id) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function clear(storeName) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ══════════════════════════════════════════════
//  MOTOR DE ANÁLISE INTELIGENTE
// ══════════════════════════════════════════════

const METAS = {
  "Alimentação":   { ideal: 15, max: 20, tipo: "essencial" },
  "Moradia":       { ideal: 25, max: 35, tipo: "essencial" },
  "Transporte":    { ideal: 10, max: 15, tipo: "essencial" },
  "Saúde":         { ideal: 5,  max: 10, tipo: "essencial" },
  "Educação":      { ideal: 5,  max: 10, tipo: "investimento" },
  "Lazer":         { ideal: 10, max: 15, tipo: "variavel" },
  "Vestuário":     { ideal: 5,  max: 10, tipo: "variavel" },
  "Tecnologia":    { ideal: 5,  max: 8,  tipo: "variavel" },
  "Viagem":        { ideal: 5,  max: 10, tipo: "variavel" },
  "Delivery":      { ideal: 5,  max: 8,  tipo: "superfluo" },
  "Assinaturas":   { ideal: 3,  max: 5,  tipo: "superfluo" },
  "Investimento":  { ideal: 20, max: 99, tipo: "investimento" },
  "Outros":        { ideal: 5,  max: 10, tipo: "variavel" }
};

function fmt(v) {
  if (v == null || isNaN(v)) return '0,00';
  return parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function analiseFinanceira(ano, mes) {
  const profile = await getOne('profile', 1);
  const ganhosExtras = await getAll('ganhos_extras', 'ativo', 1);
  const totalGanhosExtras = ganhosExtras.reduce((total, g) => total + (g.valor || 0), 0);
  const renda = (profile.salario || 0) + (profile.outras_rendas || 0) + totalGanhosExtras;
  
  // Período do mês
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const ini = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = `${ano}-${String(mes).padStart(2, '0')}-${daysInMonth}`;
  
  // Buscar despesas do período
  const todasDespesas = await getAll('despesas');
  const despesasMes = todasDespesas.filter(d => d.data >= ini && d.data <= fim);
  
  // Agrupar por categoria
  const cats = {};
  despesasMes.forEach(d => {
    cats[d.categoria] = (cats[d.categoria] || 0) + d.valor;
  });
  
  const total_gasto = Object.values(cats).reduce((a, b) => a + b, 0);
  
  // Contas fixas
  const contasFixas = await getAll('contas_fixas', 'ativo', 1);
  const contas_fixas = contasFixas.reduce((a, b) => a + b.valor, 0);
  
  // Total crédito
  const total_credito = despesasMes
    .filter(d => d.forma_pagamento === 'credito' || d.forma_pagamento === 'parcelado')
    .reduce((a, b) => a + b.valor, 0);
  
  // ── PONTUAÇÃO FINANCEIRA ──
  let score = 100;
  const dicas = [];
  const pontos_fortes = [];
  const alertas_analise = [];
  
  const pct_gasto = renda > 0 ? (total_gasto / renda * 100) : 0;
  const pct_credito = renda > 0 ? (total_credito / renda * 100) : 0;
  const saldo = renda - total_gasto;
  
  // ── ANÁLISE POR CATEGORIA ──
  const cats_analise = [];
  let total_superfluo = 0;
  let total_essencial = 0;
  let total_variavel = 0;
  
  for (const [cat, valor] of Object.entries(cats)) {
    const pct = renda > 0 ? (valor / renda * 100) : 0;
    const meta = METAS[cat] || { ideal: 5, max: 10, tipo: "variavel" };
    let status = "ok";
    
    if (pct > meta.max) {
      status = "alto";
      score -= Math.min(10, (pct - meta.max) * 1.5);
    } else if (pct > meta.ideal) {
      status = "atenção";
      score -= Math.min(5, (pct - meta.ideal) * 0.8);
    }
    
    const tipo = meta.tipo;
    if (tipo === "superfluo") total_superfluo += valor;
    else if (tipo === "essencial") total_essencial += valor;
    else total_variavel += valor;
    
    cats_analise.push({
      categoria: cat,
      valor: valor,
      pct: Math.round(pct * 10) / 10,
      ideal: meta.ideal,
      max: meta.max,
      status: status,
      tipo: tipo
    });
  }
  
  // ── GERAÇÃO DE DICAS ──
  
  // 1. Visão geral do orçamento
  if (renda > 0) {
    if (pct_gasto > 100) {
      const delta = total_gasto - renda;
      dicas.push({
        icone: "🚨",
        nivel: "critico",
        titulo: "Orçamento estourado!",
        texto: `Você gastou R$ ${fmt(delta)} a mais do que ganhou este mês. Revise seus gastos urgentemente.`,
        economia_possivel: Math.round(delta * 100) / 100
      });
      score -= 25;
    } else if (pct_gasto > 85) {
      dicas.push({
        icone: "⚠️",
        nivel: "alto",
        titulo: "Você está no limite",
        texto: `Já comprometeu ${Math.round(pct_gasto)}% da renda. Sobram apenas R$ ${fmt(saldo)} para imprevistos.`,
        economia_possivel: Math.round(total_gasto * 0.15 * 100) / 100
      });
      score -= 15;
    } else if (pct_gasto > 70) {
      dicas.push({
        icone: "⚠️",
        nivel: "medio",
        titulo: "Gastos elevados",
        texto: `Você comprometeu ${Math.round(pct_gasto)}% da renda. Cuidado para não estourar o orçamento.`,
        economia_possivel: Math.round(total_gasto * 0.1 * 100) / 100
      });
      score -= 8;
    } else if (pct_gasto < 50) {
      pontos_fortes.push("Você está gastando apenas " + Math.round(pct_gasto) + "% da renda — excelente controle!");
      score += 5;
    }
  }
  
  // 2. Análise de crédito
  if (pct_credito > 40) {
    dicas.push({
      icone: "💳",
      nivel: "alto",
      titulo: "Uso excessivo de crédito",
      texto: `${Math.round(pct_credito)}% da sua renda está no cartão de crédito. Isso pode gerar juros e endividamento.`,
      economia_possivel: Math.round(total_credito * 0.3 * 100) / 100
    });
    score -= 12;
  } else if (pct_credito > 25) {
    dicas.push({
      icone: "💳",
      nivel: "medio",
      titulo: "Crédito em atenção",
      texto: `${Math.round(pct_credito)}% da renda está no cartão. Tente usar débito ou dinheiro quando possível.`,
        economia_possivel: Math.round(total_credito * 0.2 * 100) / 100
    });
    score -= 6;
  } else if (pct_credito < 15) {
    pontos_fortes.push("Uso consciente do crédito — apenas " + Math.round(pct_credito) + "% da renda");
  }
  
  // 3. Gastos supérfluos
  const pct_superfluo = renda > 0 ? (total_superfluo / renda * 100) : 0;
  if (pct_superfluo > 15) {
    dicas.push({
      icone: "🛍️",
      nivel: "medio",
      titulo: "Gastos supérfluos altos",
      texto: `Delivery e assinaturas estão consumindo ${Math.round(pct_superfluo)}% da renda. Avalie cortes possíveis.`,
      economia_possivel: Math.round(total_superfluo * 0.4 * 100) / 100
    });
    score -= 7;
  }
  
  // 4. Análise por categoria
  for (const c of cats_analise) {
    if (c.status === "alto") {
      dicas.push({
        icone: "📊",
        nivel: "medio",
        titulo: `${c.categoria} acima do ideal`,
        texto: `Você gastou ${c.pct}% da renda com ${c.categoria}. O ideal seria até ${c.ideal}%. Tente reduzir.`,
        economia_possivel: Math.round((c.valor - (renda * c.ideal / 100)) * 100) / 100
      });
    }
  }
  
  // 5. Reserva de emergência
  if (saldo > 0) {
    const meses_reserva = saldo / total_gasto;
    if (meses_reserva < 0.5) {
      dicas.push({
        icone: "🏦",
        nivel: "medio",
        titulo: "Reserva de emergência baixa",
        texto: `Seu saldo livre (R$ ${fmt(saldo)}) cobre menos de 15 dias. Tente poupar mais.`,
        economia_possivel: Math.round(total_gasto * 0.2 * 100) / 100
      });
      score -= 5;
    } else if (meses_reserva >= 3) {
      pontos_fortes.push("Excelente reserva financeira — seu saldo cobre mais de 3 meses de gastos!");
      score += 8;
    }
  }
  
  // 6. Recomendações específicas
  if (cats['Alimentação'] && cats['Delivery']) {
    const total_comida = cats['Alimentação'] + cats['Delivery'];
    const pct_comida = renda > 0 ? (total_comida / renda * 100) : 0;
    if (pct_comida > 25) {
      dicas.push({
        icone: "🍔",
        nivel: "medio",
        titulo: "Gastos com alimentação altos",
        texto: `Alimentação + Delivery = ${Math.round(pct_comida)}% da renda. Cozinhar em casa pode economizar muito.`,
        economia_possivel: Math.round(cats['Delivery'] * 0.7 * 100) / 100
      });
    }
  }
  
  // Garantir score entre 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Diagnóstico textual
  let diagnostico = { texto: "", icone: "" };
  if (score >= 85) {
    diagnostico = {
      icone: "🏆",
      texto: "Finanças exemplares! Você está gerenciando seu dinheiro com maestria."
    };
  } else if (score >= 70) {
    diagnostico = {
      icone: "✅",
      texto: "Finanças saudáveis. Continue assim e aplique as dicas para melhorar ainda mais."
    };
  } else if (score >= 50) {
    diagnostico = {
      icone: "⚠️",
      texto: "Finanças precisam de atenção. Siga as dicas para retomar o controle."
    };
  } else {
    diagnostico = {
      icone: "🚨",
      texto: "Situação crítica. Tome medidas urgentes para evitar endividamento."
    };
  }
  
  return {
    score,
    diagnostico,
    dicas: dicas.slice(0, 8), // Top 8 dicas
    pontos_fortes,
    alertas: alertas_analise,
    categorias: cats_analise.sort((a, b) => b.valor - a.valor),
    resumo: {
      renda,
      total_gasto,
      total_credito,
      saldo,
      pct_gasto: Math.round(pct_gasto * 10) / 10,
      pct_credito: Math.round(pct_credito * 10) / 10,
      total_superfluo,
      total_essencial,
      total_variavel
    }
  };
}

// ══════════════════════════════════════════════
//  GERAÇÃO DE ALERTAS
// ══════════════════════════════════════════════

async function gerarAlertas(ano, mes) {
  // Limpar alertas antigos
  await clear('alertas');
  
  const profile = await getOne('profile', 1);
  const renda = (profile.salario || 0) + (profile.outras_rendas || 0);
  
  // Buscar cartões próximos do vencimento
  const cartoes = await getAll('cartoes', 'ativo', 1);
  const hoje = new Date();
  const diaHoje = hoje.getDate();
  
  for (const cartao of cartoes) {
    const diasAteVenc = cartao.dia_vencimento - diaHoje;
    if (diasAteVenc > 0 && diasAteVenc <= 5) {
      await add('alertas', {
        tipo: 'vencimento',
        mensagem: `💳 ${cartao.nome} vence em ${diasAteVenc} dia(s)`,
        prioridade: 1,
        lido: 0,
        created_at: new Date().toISOString()
      });
    }
  }
  
  // Alertas de contas fixas
  const contas = await getAll('contas_fixas', 'ativo', 1);
  for (const conta of contas) {
    const diasAteConta = conta.dia_vencimento - diaHoje;
    if (diasAteConta > 0 && diasAteConta <= 3) {
      await add('alertas', {
        tipo: 'conta_fixa',
        mensagem: `⚡ ${conta.nome} vence em ${diasAteConta} dia(s) — R$ ${fmt(conta.valor)}`,
        prioridade: 1,
        lido: 0,
        created_at: new Date().toISOString()
      });
    }
  }
  
  // Alerta de limite de cartão
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const ini = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = `${ano}-${String(mes).padStart(2, '0')}-${daysInMonth}`;
  
  const todasDespesas = await getAll('despesas');
  const despesasMes = todasDespesas.filter(d => d.data >= ini && d.data <= fim);
  
  for (const cartao of cartoes) {
    const usadoCartao = despesasMes
      .filter(d => d.cartao_id === cartao.id)
      .reduce((a, b) => a + b.valor, 0);
    
    const pctLimite = (usadoCartao / cartao.limite_total) * 100;
    
    if (pctLimite > 80) {
      await add('alertas', {
        tipo: 'limite',
        mensagem: `⚠️ ${cartao.nome}: ${Math.round(pctLimite)}% do limite usado`,
        prioridade: pctLimite > 95 ? 1 : 2,
        lido: 0,
        created_at: new Date().toISOString()
      });
    }
  }
  
  // Alerta de orçamento estourado
  const analise = await analiseFinanceira(ano, mes);
  if (analise.resumo.pct_gasto > 85) {
    await add('alertas', {
      tipo: 'orcamento',
      mensagem: `🚨 Você já gastou ${Math.round(analise.resumo.pct_gasto)}% da renda do mês`,
      prioridade: 1,
      lido: 0,
      created_at: new Date().toISOString()
    });
  }
}

// ══════════════════════════════════════════════
//  API SIMULADA (compatível com o frontend)
// ══════════════════════════════════════════════

window.DB = {
  init: initDB,
  
  // Profile
  getProfile: async () => {
    return await getOne('profile', 1);
  },
  
  updateProfile: async (data) => {
    const profile = await getOne('profile', 1);
    await update('profile', { ...profile, ...data, id: 1, onboarding_done: 1 });
    return { ok: true };
  },
  
  // Dashboard
  getDashboard: async (ano, mes) => {
    const profile = await getOne('profile', 1);
    const ganhosExtras = await getAll('ganhos_extras', 'ativo', 1);
    const totalGanhosExtras = ganhosExtras.reduce((total, g) => total + (g.valor || 0), 0);
    const renda = (profile.salario || 0) + (profile.outras_rendas || 0) + totalGanhosExtras;
    
    const daysInMonth = new Date(ano, mes, 0).getDate();
    const ini = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${daysInMonth}`;
    
    const todasDespesas = await getAll('despesas');
    const despesasMes = todasDespesas.filter(d => d.data >= ini && d.data <= fim);
    
    // Por categoria
    const por_categoria = {};
    despesasMes.forEach(d => {
      por_categoria[d.categoria] = (por_categoria[d.categoria] || 0) + d.valor;
    });
    
    const por_cat = Object.entries(por_categoria).map(([categoria, total]) => ({
      categoria,
      t: total
    }));
    
    const total_gasto = despesasMes.reduce((a, b) => a + b.valor, 0);
    
    // Cartões com fatura
    const cartoes = await getAll('cartoes', 'ativo', 1);
    const cartoes_data = [];
    
    for (const cartao of cartoes) {
      const usadoCartao = despesasMes
        .filter(d => d.cartao_id === cartao.id)
        .reduce((a, b) => a + b.valor, 0);
      
      cartoes_data.push({
        ...cartao,
        fatura: Math.round(usadoCartao * 100) / 100,
        disponivel: Math.round((cartao.limite_total - usadoCartao) * 100) / 100,
        pct: Math.round((usadoCartao / cartao.limite_total * 100) * 10) / 10
      });
    }
    
    const contas = await getAll('contas_fixas', 'ativo', 1);
    const total_fixo = contas.reduce((a, b) => a + b.valor, 0);
    
    // Histórico 6 meses
    const historico = [];
    const MESES_BR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ano, mes - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const days = new Date(y, m, 0).getDate();
      
      const h0 = `${y}-${String(m).padStart(2, '0')}-01`;
      const h1 = `${y}-${String(m).padStart(2, '0')}-${days}`;
      
      const despesasHist = todasDespesas.filter(d => d.data >= h0 && d.data <= h1);
      const totalHist = despesasHist.reduce((a, b) => a + b.valor, 0);
      
      historico.push({
        label: `${MESES_BR[m-1]}/${String(y).slice(2)}`,
        total: Math.round(totalHist * 100) / 100
      });
    }
    
    await gerarAlertas(ano, mes);
    const alertas = await getAll('alertas', 'lido', 0);
    
    const total_credito = despesasMes
      .filter(d => d.forma_pagamento === 'credito' || d.forma_pagamento === 'parcelado')
      .reduce((a, b) => a + b.valor, 0);
    
    const saldo = renda - total_gasto;
    const pct_comprometido = renda > 0 ? Math.round((total_gasto / renda * 100) * 10) / 10 : 0;
    
    return {
      profile,
      renda: Math.round(renda * 100) / 100,
      total_gasto: Math.round(total_gasto * 100) / 100,
      saldo: Math.round(saldo * 100) / 100,
      pct_comprometido,
      por_categoria: por_cat,
      cartoes: cartoes_data,
      contas,
      total_fixo: Math.round(total_fixo * 100) / 100,
      historico,
      alertas: alertas.slice(0, 15),
      total_credito: Math.round(total_credito * 100) / 100
    };
  },
  
  // Dicas
  getDicas: async (ano, mes) => {
    return await analiseFinanceira(ano, mes);
  },
  
  // Cartões
  getCartoes: async () => {
    return await getAll('cartoes', 'ativo', 1);
  },
  
  addCartao: async (data) => {
    await add('cartoes', {
      ...data,
      ativo: 1,
      created_at: new Date().toISOString()
    });
    return { ok: true };
  },
  
  updateCartao: async (id, data) => {
    await update('cartoes', { ...data, id });
    return { ok: true };
  },
  
  deleteCartao: async (id) => {
    const cartao = await getOne('cartoes', id);
    await update('cartoes', { ...cartao, ativo: 0 });
    return { ok: true };
  },
  
  // Despesas
  getDespesas: async (ano, mes) => {
    const daysInMonth = new Date(ano, mes, 0).getDate();
    const ini = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${daysInMonth}`;
    
    const despesas = await getAll('despesas');
    const cartoes = await getAll('cartoes');
    
    return despesas
      .filter(d => d.data >= ini && d.data <= fim)
      .map(d => {
        const cartao = cartoes.find(c => c.id === d.cartao_id);
        return {
          ...d,
          cn: cartao?.nome || null,
          cc: cartao?.cor || null
        };
      })
      .sort((a, b) => {
        if (a.data === b.data) return b.id - a.id;
        return b.data.localeCompare(a.data);
      });
  },
  
  addDespesa: async (data) => {
    const forma = data.forma_pagamento;
    const parcelas = parseInt(data.parcelas) || 1;
    const valor = parseFloat(data.valor);
    const dataBase = new Date(data.data);
    
    if (forma === 'parcelado' && parcelas > 1) {
      const gid = Math.random().toString(36).substring(2, 12);
      const vparcela = Math.round((valor / parcelas) * 100) / 100;
      
      for (let i = 0; i < parcelas; i++) {
        const dp = new Date(dataBase);
        dp.setMonth(dp.getMonth() + i);
        const dataStr = dp.toISOString().split('T')[0];
        
        await add('despesas', {
          nome: `${data.nome} (${i+1}/${parcelas})`,
          valor: vparcela,
          data: dataStr,
          categoria: data.categoria,
          forma_pagamento: forma,
          cartao_id: data.cartao_id || null,
          parcelas_total: parcelas,
          parcela_atual: i + 1,
          grupo_id: gid,
          observacao: data.observacao || '',
          created_at: new Date().toISOString()
        });
      }
    } else {
      await add('despesas', {
        nome: data.nome,
        valor: valor,
        data: data.data,
        categoria: data.categoria,
        forma_pagamento: forma,
        cartao_id: data.cartao_id || null,
        parcelas_total: 1,
        parcela_atual: 1,
        grupo_id: null,
        observacao: data.observacao || '',
        created_at: new Date().toISOString()
      });
    }
    
    return { ok: true };
  },
  
  deleteDespesa: async (id) => {
    const despesa = await getOne('despesas', id);
    if (despesa && despesa.grupo_id) {
      // Remover todas as parcelas
      const todas = await getAll('despesas');
      const grupo = todas.filter(d => d.grupo_id === despesa.grupo_id);
      for (const d of grupo) {
        await remove('despesas', d.id);
      }
    } else {
      await remove('despesas', id);
    }
    return { ok: true };
  },
  
  // Contas Fixas
  getContas: async () => {
    return await getAll('contas_fixas', 'ativo', 1);
  },
  
  addConta: async (data) => {
    await add('contas_fixas', {
      ...data,
      ativo: 1
    });
    return { ok: true };
  },
  
  updateConta: async (id, data) => {
    await update('contas_fixas', { ...data, id });
    return { ok: true };
  },
  
  deleteConta: async (id) => {
    const conta = await getOne('contas_fixas', id);
    await update('contas_fixas', { ...conta, ativo: 0 });
    return { ok: true };
  },
  
  // Histórico
  getHistorico: async () => {
    const hoje = new Date();
    const MESES_BR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const result = [];
    const todasDespesas = await getAll('despesas');
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const days = new Date(y, m, 0).getDate();
      
      const h0 = `${y}-${String(m).padStart(2, '0')}-01`;
      const h1 = `${y}-${String(m).padStart(2, '0')}-${days}`;
      
      const despesasHist = todasDespesas.filter(d => d.data >= h0 && d.data <= h1);
      const totalHist = despesasHist.reduce((a, b) => a + b.valor, 0);
      
      const cats = {};
      despesasHist.forEach(d => {
        cats[d.categoria] = (cats[d.categoria] || 0) + d.valor;
      });
      
      result.push({
        ano: y,
        mes: m,
        label: `${MESES_BR[m-1]}/${String(y).slice(2)}`,
        total: Math.round(totalHist * 100) / 100,
        cats: Object.fromEntries(
          Object.entries(cats).map(([k, v]) => [k, Math.round(v * 100) / 100])
        )
      });
    }
    
    return result;
  },
  
  // Alertas
  limparAlertas: async () => {
    const alertas = await getAll('alertas');
    for (const alerta of alertas) {
      await update('alertas', { ...alerta, lido: 1 });
    }
    return { ok: true };
  },
  
  // Ganhos Extras (v2)
  getGanhosExtras: async () => {
    return await getAll('ganhos_extras', 'ativo', 1);
  },
  
  addGanhoExtra: async (data) => {
    await add('ganhos_extras', {
      ...data,
      ativo: 1,
      created_at: new Date().toISOString()
    });
    return { ok: true };
  },
  
  updateGanhoExtra: async (id, data) => {
    await update('ganhos_extras', { ...data, id });
    return { ok: true };
  },
  
  deleteGanhoExtra: async (id) => {
    const ganho = await getOne('ganhos_extras', id);
    await update('ganhos_extras', { ...ganho, ativo: 0 });
    return { ok: true };
  },
  
  // Calcular total de ganhos extras (para incluir na renda)
  getTotalGanhosExtras: async () => {
    const ganhos = await getAll('ganhos_extras', 'ativo', 1);
    return ganhos.reduce((total, g) => total + (g.valor || 0), 0);
  }
};
