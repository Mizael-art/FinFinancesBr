/**
 * FinFinance — Frontend JS
 * State · API · Renders · Charts · Dicas · Animations
 */

// ══════════ STATE ══════════
const S = {
  ano: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
  dash: null,
  despesas: [],
  cartoes: [],
  tema: localStorage.getItem('ff-tema') || 'dark'
};

let CHARTS = { cat: null, evo: null, hist: null };
let despesasRaw = [];

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_BR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CAT_ICONS = {
  'Alimentação':'🍔','Moradia':'🏠','Transporte':'🚗','Saúde':'💊',
  'Educação':'📚','Lazer':'🎮','Vestuário':'👗','Tecnologia':'💻',
  'Viagem':'✈️','Delivery':'🛵','Assinaturas':'📱','Investimento':'📈','Outros':'📦'
};

const CAT_COLORS = {
  'Alimentação':'rgba(251,146,60,0.18)','Moradia':'rgba(139,92,246,0.18)',
  'Transporte':'rgba(96,165,250,0.18)','Saúde':'rgba(248,113,113,0.18)',
  'Educação':'rgba(52,211,153,0.18)','Lazer':'rgba(252,211,77,0.18)',
  'Vestuário':'rgba(236,72,153,0.18)','Tecnologia':'rgba(14,165,233,0.18)',
  'Viagem':'rgba(6,182,212,0.18)','Delivery':'rgba(234,179,8,0.18)',
  'Assinaturas':'rgba(167,139,250,0.18)','Investimento':'rgba(74,222,128,0.18)',
  'Outros':'rgba(148,163,184,0.18)'
};

// ══════════ SPLASH + BOOT ══════════
window.addEventListener('DOMContentLoaded', async () => {
  applyTema(S.tema);
  animateSplash();
  
  // Inicializar IndexedDB
  await DB.init();
  
  setTimeout(async () => {
    const p = await api('/api/profile');
    hideSplash();
    if (!p.onboarding_done || !p.salario) {
      showOnboarding();
    } else {
      bootApp(p);
    }
  }, 2800);
});

function animateSplash() {
  const msgs = ['Carregando dados...', 'Preparando análises...', 'Quase pronto...'];
  let i = 0;
  const el = document.getElementById('splash-status');
  setInterval(() => { if (el && i < msgs.length) { el.textContent = msgs[i++]; } }, 800);
}

function hideSplash() {
  const s = document.getElementById('splash');
  s.classList.add('out');
  setTimeout(() => s.remove(), 700);
}

function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
}

function bootApp(p) {
  document.getElementById('onboarding')?.classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  updateMonthLabel();
  // Aplicar tema salvo
  const modo = p.tema_modo || 'escuro';
  S.tema = modo === 'escuro' ? 'dark' : 'light';
  applyTema(S.tema);
  loadDashboard();
  // loadCartoes é alias seguro (pode não estar na view de cartões ainda)
}

async function loadCartoes() {
  S.cartoes = await api('/api/cartoes');
}

// Onboarding steps
function nextOnb(step) {
  document.querySelector('.onb-step.active')?.classList.remove('active');
  document.getElementById(`onb-${step}`)?.classList.add('active');
}

async function finishOnb() {
  const nome = document.getElementById('onb-nome')?.value || 'Usuário';
  const salario = parseFloat(document.getElementById('onb-salario')?.value || 0);
  await api('/api/profile', 'POST', { nome, salario, outras_rendas: 0, dia_pagamento: 5, tema: S.tema });
  document.getElementById('onboarding').classList.add('hidden');
  const p = await api('/api/profile');
  bootApp(p);
}

// ══════════ TEMA ══════════
async function toggleTema() {
  const profile = await api('/api/profile');
  const modoAtual = profile.tema_modo || (S.tema === 'dark' ? 'escuro' : 'claro');
  const novoModo = modoAtual === 'escuro' ? 'claro' : 'escuro';
  S.tema = novoModo === 'escuro' ? 'dark' : 'light';
  localStorage.setItem('ff-tema', S.tema);
  await api('/api/profile', 'POST', { ...profile, tema_modo: novoModo });
  applyTema(S.tema);
  // Atualizar configs se estiver aberta
  const configView = document.getElementById('v-config');
  if (configView?.classList.contains('active')) loadConfig();
}

function applyTema(t) {
  document.documentElement.setAttribute('data-theme', t);
  const icon = document.getElementById('tema-icon');
  if (icon) icon.textContent = t === 'dark' ? '☀' : '🌙';
  S.tema = t;
  if (S.dash) setTimeout(() => drawCharts(S.dash), 80);
}

// ══════════ NAV ══════════
function goto(view, el) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  const vEl = document.getElementById('v-' + view);
  if (vEl) vEl.classList.add('active');
  if (el) el.classList.add('active');
  else {
    const found = document.querySelector(`[data-view="${view}"]`);
    if (found) found.classList.add('active');
  }
  closeAlerts();
  switch (view) {
    case 'dashboard': loadDashboard(); break;
    case 'dicas': loadDicas(); break;
    case 'cartoes': loadCartoesView(); break;
    case 'despesas': loadDespesasView(); break;
    case 'gastos': loadGastosView(); break;
    case 'contas': loadContasView(); break;
    case 'historico': loadHistorico(); break;
    case 'perfil': loadPerfil(); break;
    case 'investimentos': loadInvestimentos(); break;
  }
  return false;
}

function changeMonth(d) {
  S.mes += d;
  if (S.mes > 12) { S.mes = 1; S.ano++; }
  if (S.mes < 1) { S.mes = 12; S.ano--; }
  updateMonthLabel();
  const av = document.querySelector('.nav-link.active');
  const view = av?.dataset?.view || 'dashboard';
  goto(view, av);
}

function updateMonthLabel() {
  const el = document.getElementById('month-lbl');
  if (el) el.textContent = `${MESES[S.mes - 1]} ${S.ano}`;
}

// ══════════ API (INDEXEDDB) ══════════
async function api(url, method = 'GET', body = null) {
  try {
    // Dashboard
    if (url.includes('/api/dashboard')) {
      const params = new URLSearchParams(url.split('?')[1]);
      const ano = parseInt(params.get('ano'));
      const mes = parseInt(params.get('mes'));
      return await DB.getDashboard(ano, mes);
    }
    
    // Dicas
    if (url.includes('/api/dicas')) {
      const params = new URLSearchParams(url.split('?')[1]);
      const ano = parseInt(params.get('ano'));
      const mes = parseInt(params.get('mes'));
      return await DB.getDicas(ano, mes);
    }
    
    // Profile
    if (url.includes('/api/profile')) {
      if (method === 'POST') {
        return await DB.updateProfile(body);
      }
      return await DB.getProfile();
    }
    
    // Cartões
    if (url.includes('/api/cartoes')) {
      if (method === 'POST') {
        return await DB.addCartao(body);
      }
      if (method === 'PUT') {
        const id = parseInt(url.split('/').pop());
        return await DB.updateCartao(id, body);
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        return await DB.deleteCartao(id);
      }
      return await DB.getCartoes();
    }
    
    // Despesas
    if (url.includes('/api/despesas')) {
      if (method === 'POST') {
        return await DB.addDespesa(body);
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        return await DB.deleteDespesa(id);
      }
      const params = new URLSearchParams(url.split('?')[1]);
      const ano = parseInt(params.get('ano'));
      const mes = parseInt(params.get('mes'));
      return await DB.getDespesas(ano, mes);
    }
    
    // Contas Fixas
    if (url.includes('/api/contas-fixas')) {
      if (method === 'POST') {
        return await DB.addConta(body);
      }
      if (method === 'PUT') {
        const id = parseInt(url.split('/').pop());
        return await DB.updateConta(id, body);
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        return await DB.deleteConta(id);
      }
      return await DB.getContas();
    }
    
    // Histórico
    if (url.includes('/api/historico')) {
      return await DB.getHistorico();
    }
    
    // Alertas
    if (url.includes('/api/alertas/limpar')) {
      return await DB.limparAlertas();
    }
    
    // Investimentos
    if (url.includes('/api/investimentos')) {
      if (url.includes('/aporte')) {
        const id = parseInt(url.split('/').slice(-2)[0]);
        return await DB.addAporteInvestimento(id, body.valor);
      }
      if (method === 'POST') return await DB.addInvestimento(body);
      if (method === 'PUT') {
        const id = parseInt(url.split('/').pop());
        return await DB.updateInvestimento(id, body);
      }
      if (method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        return await DB.deleteInvestimento(id);
      }
      return await DB.getInvestimentos();
    }
    
    return {};
  } catch (e) {
    console.error('API error', e);
    return {};
  }
}

// ══════════ DASHBOARD ══════════
async function loadDashboard() {
  const d = await api(`/api/dashboard?ano=${S.ano}&mes=${S.mes}`);
  S.dash = d;
  const p = d.profile || {};
  const nome = p.nome || 'Usuário';

  // Topbar
  setEl('user-av', nome.charAt(0).toUpperCase());
  setEl('user-nm', nome.split(' ')[0]);

  // KPIs
  setEl('k-renda', 'R$ ' + fmt(d.renda));
  setEl('k-gasto', 'R$ ' + fmt(d.total_gasto));
  setEl('k-saldo', 'R$ ' + fmt(d.saldo));
  setEl('k-cred', 'R$ ' + fmt(d.total_credito));
  setEl('k-renda-sub', `Salário + R$ ${fmt(p.outras_rendas)}`);
  setEl('k-gasto-sub', `${d.por_categoria?.length || 0} categorias`);
  setEl('k-cred-sub', `${d.cartoes?.length || 0} cartão(ões)`);

  const sEl = document.getElementById('k-saldo');
  if (sEl) sEl.style.color = d.saldo < 0 ? 'var(--v-red)' : 'var(--v-green)';

  // Progress
  const pct = Math.min(d.pct_comprometido || 0, 100);
  const fill = document.getElementById('prog-fill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.classList.toggle('crit', d.pct_comprometido > 85);
  }
  setEl('prog-pct', (d.pct_comprometido || 0) + '%');
  setEl('prog-foot', d.renda > 0
    ? `R$ ${fmt(d.total_gasto)} de R$ ${fmt(d.renda)} comprometidos`
    : 'Configure sua renda no Perfil');

  // Score (from dicas)
  loadScorePreview();
  renderDashCards(d.cartoes || []);
  renderDashContas(d.contas || [], d.total_fixo || 0);
  renderDashTxs();
  renderAlerts(d.alertas || []);
  drawCharts(d);
}

async function loadScorePreview() {
  const dicas = await api(`/api/dicas?ano=${S.ano}&mes=${S.mes}`);
  const score = dicas.score || 0;
  setEl('score-num', score);
  setEl('score-desc', dicas.diagnostico?.texto?.substring(0, 60) + '...' || '');
  setEl('nav-score-badge', score);
  // Arc animation
  const arc = document.getElementById('score-arc');
  if (arc) {
    const circ = 213.6;
    arc.style.strokeDashoffset = circ - (circ * score / 100);
  }
}

function renderDashCards(cartoes) {
  const el = document.getElementById('dash-cards');
  if (!el) return;
  if (!cartoes.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">💳</div><p>Nenhum cartão</p></div>';
    return;
  }
  el.innerHTML = cartoes.map(c => {
    const comprometido = c.total_comprometido || c.fatura || 0;
    const disponivel = c.disponivel != null ? c.disponivel : (c.limite_total - comprometido);
    return `
    <div class="dash-card-row">
      <div class="dcr-dot" style="background:${c.cor}"></div>
      <div class="dcr-name">${c.nome}</div>
      <div class="dcr-pct">${c.pct}%</div>
      <div style="text-align:right">
        <div class="dcr-val">R$ ${fmt(comprometido)}</div>
        <div style="font-size:0.68rem;color:var(--v-green)">disp. R$ ${fmt(disponivel)}</div>
      </div>
    </div>`;
  }).join('');
}

function renderDashContas(contas, total) {
  const el = document.getElementById('dash-contas');
  const tot = document.getElementById('dash-contas-total');
  if (!el) return;
  const hoje = new Date().getDate();
  if (!contas.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">📋</div><p>Nenhuma conta fixa</p></div>';
    if (tot) tot.innerHTML = '';
    return;
  }
  el.innerHTML = contas.map(c => {
    const dias = c.dia_vencimento - hoje;
    const urg = dias >= 0 && dias <= 3;
    return `
    <div class="conta-row">
      <div class="cr-info">
        <div class="cr-name">${c.nome} ${urg ? '⚠️' : ''}</div>
        <div class="cr-day">Dia ${c.dia_vencimento} · ${c.categoria}</div>
      </div>
      <div class="cr-val" style="${urg ? 'color:var(--v-orange)' : ''}">R$ ${fmt(c.valor)}</div>
    </div>`;
  }).join('');
  if (tot) tot.innerHTML = `Total mensal: <strong>R$ ${fmt(total)}</strong>`;
}

async function renderDashTxs() {
  const desp = await api(`/api/despesas?ano=${S.ano}&mes=${S.mes}`);
  const el = document.getElementById('dash-txs');
  if (!el) return;
  const recent = desp.slice(0, 6);
  if (!recent.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">📊</div><p>Nenhuma transação este mês</p></div>';
    return;
  }
  el.innerHTML = recent.map(d => {
    const ic = CAT_ICONS[d.categoria] || '📦';
    const bg = CAT_COLORS[d.categoria] || 'rgba(139,92,246,0.1)';
    const dt = new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
    return `
    <div class="tx-row">
      <div class="tx-ico" style="background:${bg}">${ic}</div>
      <div class="tx-inf">
        <div class="tx-nm">${d.nome}</div>
        <div class="tx-meta">${d.categoria} · ${formaBadge(d.forma_pagamento, false)}</div>
      </div>
      <div style="text-align:right">
        <div class="tx-amt">−R$ ${fmt(d.valor)}</div>
        <div class="tx-dt">${dt}</div>
      </div>
    </div>`;
  }).join('');
}

// ══════════ CHARTS ══════════
function drawCharts(d) {
  if (!d) return;
  const dark = S.tema === 'dark';
  const gc = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tc = dark ? '#9490B8' : '#5B4F80';
  Chart.defaults.color = tc;
  Chart.defaults.font.family = "'Outfit', sans-serif";

  // DONUT — categorias
  const catCanvas = document.getElementById('ch-cat');
  if (catCanvas && d.por_categoria?.length) {
    if (CHARTS.cat) CHARTS.cat.destroy();
    const colors = palette(d.por_categoria.length);
    CHARTS.cat = new Chart(catCanvas, {
      type: 'doughnut',
      data: {
        labels: d.por_categoria.map(c => c.cat),
        datasets: [{
          data: d.por_categoria.map(c => c.total),
          backgroundColor: colors,
          borderColor: dark ? '#16161f' : '#fff',
          borderWidth: 3, hoverOffset: 6
        }]
      },
      options: {
        cutout: '72%',
        plugins: {
          legend: { position: 'right', labels: { padding: 12, boxWidth: 10, font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => ` R$ ${fmt(ctx.raw)}` } }
        },
        animation: { duration: 700 }
      }
    });
  }

  // BARS — evolução (ganhos verde, gastos vermelho)
  const evoCanvas = document.getElementById('ch-evo');
  if (evoCanvas && d.historico?.length) {
    if (CHARTS.evo) CHARTS.evo.destroy();
    const labels = d.historico.map(h => h.label);
    const gastos = d.historico.map(h => h.total);
    const renda = (d.historico_renda || []).map(h => h.total);
    const rendaVal = d.renda || 0;
    const ganhos = labels.map(() => rendaVal);
    
    CHARTS.evo = new Chart(evoCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ganhos',
            data: ganhos,
            backgroundColor: 'rgba(52,211,153,0.55)',
            borderColor: 'rgba(52,211,153,0.9)',
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Gastos',
            data: gastos,
            backgroundColor: gastos.map((_, i) =>
              i === gastos.length - 1 ? 'rgba(248,113,113,0.9)' : 'rgba(248,113,113,0.5)'),
            borderColor: 'rgba(248,113,113,0.9)',
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: gc }, ticks: { callback: v => 'R$ ' + fmt(v), font: { size: 10 } } }
        },
        plugins: {
          legend: { display: true, labels: { boxWidth: 10, font: { size: 11 } } },
          tooltip: { callbacks: { label: c => ` ${c.dataset.label}: R$ ${fmt(c.raw)}` } }
        },
        animation: { duration: 500 }
      }
    });
  }
}

// ══════════ DICAS INTELIGENTES ══════════
async function loadDicas() {
  const el = document.getElementById('v-dicas');
  if (!el) return;

  // Show loading
  document.getElementById('diag-score-big').textContent = '...';

  const data = await api(`/api/dicas?ano=${S.ano}&mes=${S.mes}`);
  renderDiagnostico(data);
  renderResumoCats(data.cats_analise || []);
  renderDicasList(data.dicas || []);
  renderPontosList(data.pontos_fortes || []);
  renderMetasTable(data.cats_analise || []);

  // Economia potencial
  const eco = data.resumo?.total_economia_possivel || 0;
  const ecoCard = document.getElementById('economia-card');
  if (ecoCard && eco > 0) {
    ecoCard.style.display = 'flex';
    setEl('eco-val', 'R$ ' + fmt(eco));
  }

  // Update score badge
  setEl('nav-score-badge', data.score || 0);
}

async function reloadDicas() {
  await loadDicas();
  toast('Análise atualizada!', 'ok');
}

function renderDiagnostico(data) {
  const score = data.score || 0;
  const diag = data.diagnostico || {};

  setEl('diag-score-big', score);
  setEl('diag-nivel', diag.texto?.split('!')[0] || '');
  setEl('diag-emoji', diag.emoji || '🤔');
  setEl('diag-texto', diag.texto || '');

  // Bar
  const bar = document.getElementById('diag-bar-fill');
  if (bar) {
    setTimeout(() => { bar.style.width = score + '%'; }, 100);
  }

  // Color score by value
  const scoreEl = document.getElementById('diag-score-big');
  if (scoreEl) {
    if (score >= 80) scoreEl.style.background = 'linear-gradient(135deg, #34D399, #A78BFA)';
    else if (score >= 60) scoreEl.style.background = 'linear-gradient(135deg, #FCD34D, #8B5CF6)';
    else scoreEl.style.background = 'linear-gradient(135deg, #F87171, #FB923C)';
    scoreEl.style.webkitBackgroundClip = 'text';
    scoreEl.style.webkitTextFillColor = 'transparent';
    scoreEl.style.backgroundClip = 'text';
  }
}

function renderResumoCats(cats) {
  const el = document.getElementById('resumo-cats');
  if (!el) return;
  if (!cats.length) { el.innerHTML = ''; return; }
  el.innerHTML = cats.slice(0, 8).map(c => {
    const st = c.status === 'ok' ? '✅' : c.status === 'alto' ? '🔴' : '🟡';
    const color = c.status === 'ok' ? '#34D399' : c.status === 'alto' ? '#F87171' : '#FCD34D';
    return `
    <div class="rcat-chip">
      <div class="rcat-dot" style="background:${color}"></div>
      <span class="rcat-name">${c.categoria}</span>
      <span class="rcat-pct">${c.pct}%</span>
      <span class="rcat-status">${st}</span>
    </div>`;
  }).join('');
}

function renderDicasList(dicas) {
  const el = document.getElementById('dicas-list');
  if (!el) return;
  if (!dicas.length) {
    el.innerHTML = `<div class="ponto-card">🎉 Nenhuma melhoria crítica identificada este mês!</div>`;
    return;
  }
  el.innerHTML = dicas.map(d => `
    <div class="dica-card ${d.nivel}">
      <div class="dica-head">
        <span class="dica-ico">${d.icone}</span>
        <span class="dica-title">${d.titulo}</span>
      </div>
      <div class="dica-txt">${d.texto}</div>
      ${d.economia_possivel > 0
        ? `<div class="dica-eco">💚 Economia potencial: R$ ${fmt(d.economia_possivel)}/mês</div>`
        : ''}
    </div>`).join('');
}

function renderPontosList(pontos) {
  const el = document.getElementById('pontos-list');
  if (!el) return;
  if (!pontos || !pontos.length) {
    el.innerHTML = `<div class="ponto-card" style="color:var(--txt3)">Continue registrando suas finanças para ver seus pontos fortes aqui.</div>`;
    return;
  }
  el.innerHTML = pontos.map(p => {
    // Aceita tanto objeto {icone, texto} quanto string simples
    if (typeof p === 'string') return `<div class="ponto-card">✅ ${p}</div>`;
    return `<div class="ponto-card">${p.icone || '✅'} ${p.texto || p}</div>`;
  }).join('');
}

function renderMetasTable(cats) {
  const el = document.getElementById('metas-table');
  if (!el) return;

  const METAS = {
    'Alimentação':{'ideal':15,'max':20},'Moradia':{'ideal':25,'max':35},
    'Transporte':{'ideal':10,'max':15},'Saúde':{'ideal':5,'max':10},
    'Educação':{'ideal':5,'max':10},'Lazer':{'ideal':10,'max':15},
    'Vestuário':{'ideal':5,'max':10},'Tecnologia':{'ideal':5,'max':8},
    'Delivery':{'ideal':5,'max':8},'Assinaturas':{'ideal':3,'max':5},
    'Investimento':{'ideal':20,'max':99},'Outros':{'ideal':5,'max':10}
  };

  const head = `<div class="meta-row head">
    <span>Categoria</span><span>Seu gasto</span>
    <span>Ideal</span><span>Máx.</span><span>Status</span>
  </div>`;

  const rows = cats.map(c => {
    const m = METAS[c.categoria] || { ideal: 5, max: 10 };
    const barColor = c.status === 'ok' ? '#34D399' : c.status === 'alto' ? '#F87171' : '#FCD34D';
    const barW = Math.min(c.pct / m.max * 100, 100);
    const badge = c.status === 'ok'
      ? '<span class="badge b-ok">OK</span>'
      : c.status === 'alto'
        ? '<span class="badge b-high">Alto</span>'
        : '<span class="badge b-att">Atenção</span>';
    return `
    <div class="meta-row">
      <span>${CAT_ICONS[c.categoria] || '📦'} ${c.categoria}</span>
      <div>
        <div class="meta-bar-wrap">
          <div class="meta-bar-fill" style="width:${barW}%;background:${barColor}"></div>
        </div>
        <span style="font-size:0.75rem;color:var(--txt3)">${c.pct}%</span>
      </div>
      <span style="font-size:0.8rem;color:var(--txt2)">${m.ideal}%</span>
      <span style="font-size:0.8rem;color:var(--txt2)">${m.max}%</span>
      ${badge}
    </div>`;
  }).join('');

  el.innerHTML = head + rows;
}

// ══════════ CARTÕES VIEW ══════════
async function loadCartoesView() {
  const [cartoes, dash] = await Promise.all([
    api('/api/cartoes'),
    api(`/api/dashboard?ano=${S.ano}&mes=${S.mes}`)
  ]);
  S.cartoes = cartoes;
  const dashCards = dash.cartoes || [];
  const grid = document.getElementById('cards-grid');
  const res = document.getElementById('cards-resumo');

  if (!cartoes.length) {
    if (grid) grid.innerHTML = `<div style="grid-column:1/-1" class="empty"><div class="empty-ico">💳</div><p>Nenhum cartão cadastrado</p></div>`;
    if (res) res.style.display = 'none';
    return;
  }

  const enriched = cartoes.map(c => {
    const dc = dashCards.find(d => d.id === c.id) || {};
    return {
      ...c,
      fatura: dc.fatura || 0,                                        // parcela deste mês
      total_comprometido: dc.total_comprometido || dc.fatura || 0,   // total de todas parcelas
      pct: dc.pct || 0,                                               // % baseado no total comprometido
      disponivel: dc.disponivel != null ? dc.disponivel : c.limite_total
    };
  });

  // Salvar versão enriquecida para verDetalheCartao usar
  S.cartoes = enriched;

  const bands = { Mastercard: '⊕', Visa: '◉', Elo: '◈', 'American Express': '✦', Hipercard: '✿' };

  if (grid) grid.innerHTML = enriched.map(c => `
    <div>
      <div class="credit-card" style="background:linear-gradient(140deg, ${c.cor}, ${darken(c.cor)})">
        <div class="cc-bank">${c.banco}</div>
        <div class="cc-name">${c.nome}</div>
        <div class="cc-dots">•••• •••• ••••</div>
        <div class="cc-pbar">
          <div class="cc-pbar-track">
            <div class="cc-pbar-fill" style="width:${Math.min(c.pct,100)}%"></div>
          </div>
          <div class="cc-pbar-stats">
            <span>${c.pct}% comprometido</span>
            <span>${c.bandeira} ${bands[c.bandeira] || '◉'}</span>
          </div>
        </div>
        <div class="cc-footer">
          <div class="cc-fl">
            <span class="cc-lbl2">Disponível</span>
            <span class="cc-val2">R$ ${fmt(c.disponivel)}</span>
          </div>
          <div class="cc-fl" style="text-align:right">
            <span class="cc-lbl2">Comprometido</span>
            <span class="cc-val2">R$ ${fmt(c.total_comprometido)}</span>
          </div>
        </div>
      </div>
      <div class="cc-detail">
        <div class="cc-stat"><div class="cc-stat-lbl">Limite total</div><div class="cc-stat-val">R$ ${fmt(c.limite_total)}</div></div>
        <div class="cc-stat"><div class="cc-stat-lbl">Fatura do mês</div><div class="cc-stat-val" style="color:var(--v-red)">R$ ${fmt(c.fatura)}</div></div>
        <div class="cc-stat"><div class="cc-stat-lbl">Vencimento</div><div class="cc-stat-val">Dia ${c.dia_vencimento}</div></div>
        <div class="cc-actions">
          <button class="btn-sm" style="background:rgba(52,211,153,0.15);color:#34D399" onclick="verDetalheCartao(${c.id})">📊 Ver detalhes</button>
          <button class="btn-sm btn-edit" onclick="editCartao(${c.id})">Editar</button>
          <button class="btn-sm btn-del" onclick="delCartao(${c.id},'${esc(c.nome)}')">Remover</button>
        </div>
      </div>
    </div>`).join('');

  const tot = enriched.reduce((a,c) => a + c.limite_total, 0);
  const totComp = enriched.reduce((a,c) => a + (c.total_comprometido || 0), 0);
  const totDisp = enriched.reduce((a,c) => a + c.disponivel, 0);
  if (res) {
    res.style.display = '';
    const rr = document.getElementById('cards-resumo-row');
    if (rr) rr.innerHTML = `
      <div><div class="resumo-stat-lbl">Limite total</div><div class="resumo-stat-val">R$ ${fmt(tot)}</div></div>
      <div><div class="resumo-stat-lbl">Comprometido</div><div class="resumo-stat-val" style="color:var(--acc2)">R$ ${fmt(totComp)}</div></div>
      <div><div class="resumo-stat-lbl">Disponível</div><div class="resumo-stat-val" style="color:var(--v-green)">R$ ${fmt(totDisp)}</div></div>`;
  }
}

// ══════════ DESPESAS VIEW ══════════
async function loadDespesasView() {
  despesasRaw = await api(`/api/despesas?ano=${S.ano}&mes=${S.mes}`);
  // Sincronizar label de mês na view de despesas
  const lbl = document.getElementById('desp-month-lbl');
  if (lbl) lbl.textContent = `${MESES[S.mes - 1]} ${S.ano}`;
  renderDespesas(despesasRaw);
  updateCatFilter(despesasRaw);
}

function renderDespesas(list) {
  const tbody = document.getElementById('desp-tbody');
  const tot = document.getElementById('filter-total');
  if (!tbody) return;
  const total = list.reduce((a, d) => a + d.valor, 0);
  if (tot) tot.textContent = `${list.length} registros · Total: R$ ${fmt(total)}`;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2.5rem;color:var(--txt3)">Nenhuma despesa este mês 🎉</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(d => {
    const ic = CAT_ICONS[d.categoria] || '📦';
    const dt = new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR');
    const cn = d.cn ? `<div style="font-size:0.7rem;color:var(--txt3)">${d.cn}</div>` : '';
    return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.55rem">
          <span>${ic}</span>
          <div>
            <div style="font-weight:500">${d.nome}</div>
            ${d.observacao ? `<div style="font-size:0.7rem;color:var(--txt3)">${d.observacao}</div>` : ''}
          </div>
        </div>
      </td>
      <td><span class="badge" style="background:rgba(139,92,246,0.15);color:var(--acc2)">${d.categoria}</span></td>
      <td style="color:var(--txt2);font-size:0.83rem">${dt}</td>
      <td>${formaBadge(d.forma_pagamento)}${cn}</td>
      <td style="font-family:'JetBrains Mono';font-weight:700;color:var(--v-red)">R$ ${fmt(d.valor)}</td>
      <td><button class="btn-sm btn-del" onclick="delDespesa(${d.id},'${esc(d.nome)}')">✕</button></td>
    </tr>`;
  }).join('');
}

function updateCatFilter(list) {
  const cats = [...new Set(list.map(d => d.categoria))].sort();
  const sel = document.getElementById('f-cat');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todas as categorias</option>' +
    cats.map(c => `<option ${c===cur?'selected':''}>${c}</option>`).join('');
}

function filtrarDespesas() {
  const q = (document.getElementById('busca')?.value || '').toLowerCase();
  const cat = document.getElementById('f-cat')?.value || '';
  const forma = document.getElementById('f-forma')?.value || '';
  renderDespesas(despesasRaw.filter(d =>
    (!q || d.nome.toLowerCase().includes(q)) &&
    (!cat || d.categoria === cat) &&
    (!forma || d.forma_pagamento === forma)
  ));
}

// ══════════ CONTAS FIXAS ══════════
async function loadContasView() {
  const contas = await api('/api/contas-fixas');
  const grid = document.getElementById('contas-grid');
  if (!grid) return;
  const catIcons = {'Moradia':'🏠','Educação':'📚','Saúde':'💊','Tecnologia':'💻','Transporte':'🚗','Assinaturas':'📱','Outros':'📦'};
  if (!contas.length) {
    grid.innerHTML = `<div style="grid-column:1/-1" class="empty"><div class="empty-ico">📋</div><p>Nenhuma conta fixa cadastrada</p></div>`;
    return;
  }
  const hoje = new Date().getDate();
  grid.innerHTML = contas.map(c => {
    const dias = c.dia_vencimento - hoje;
    const urg = dias >= 0 && dias <= 5;
    return `
    <div class="conta-card">
      <div class="cc2-head">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <div class="cc2-icon">${catIcons[c.categoria] || '📦'}</div>
          <div><div class="cc2-name">${c.nome}</div><div class="cc2-cat">${c.categoria}</div></div>
        </div>
        ${urg ? '<span style="font-size:1.1rem">⚠️</span>' : ''}
      </div>
      <div class="cc2-val">R$ ${fmt(c.valor)}</div>
      <div class="cc2-foot">
        <span>Vence dia <strong>${c.dia_vencimento}</strong></span>
        <div style="display:flex;gap:0.4rem">
          <button class="btn-sm btn-edit" onclick="editConta(${c.id})">Editar</button>
          <button class="btn-sm btn-del" onclick="delConta(${c.id},'${esc(c.nome)}')">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ══════════ GASTOS TOTAIS (despesas + contas fixas) ══════════
let _gastosRaw = []; // {tipo:'despesa'|'fixa', ...campos}

async function loadGastosView() {
  // Atualizar label do mês
  const lbl = document.getElementById('gastos-month-lbl');
  if (lbl) lbl.textContent = `${MESES[S.mes - 1]} ${S.ano}`;

  // Buscar despesas do mês
  const despesas = await api(`/api/despesas?ano=${S.ano}&mes=${S.mes}`);
  
  // Buscar contas fixas (todas — são mensais)
  const contasFixas = await api('/api/contas-fixas');

  // Montar lista unificada
  const itensDesp = despesas.map(d => ({ ...d, _tipo: 'despesa' }));
  const itensFixas = contasFixas.map(c => ({
    id: c.id,
    nome: c.nome,
    valor: c.valor,
    data: `Dia ${c.dia_vencimento}`,
    categoria: c.categoria,
    forma_pagamento: 'fixa',
    _tipo: 'fixa',
    observacao: ''
  }));

  _gastosRaw = [...itensDesp, ...itensFixas];

  // KPIs
  const totalDesp = despesas.reduce((a, b) => a + b.valor, 0);
  const totalFixo = contasFixas.reduce((a, b) => a + b.valor, 0);
  const totalGeral = totalDesp + totalFixo;

  setEl('gt-desp', 'R$ ' + fmt(totalDesp));
  setEl('gt-desp-n', `${despesas.length} lançamento(s)`);
  setEl('gt-fixo', 'R$ ' + fmt(totalFixo));
  setEl('gt-fixo-n', `${contasFixas.length} conta(s) fixa(s)`);
  setEl('gt-total', 'R$ ' + fmt(totalGeral));

  // Filtro de categorias
  const cats = [...new Set(_gastosRaw.map(d => d.categoria))].sort();
  const sel = document.getElementById('gt-cat');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = '<option value="">Todas as categorias</option>' +
      cats.map(c => `<option ${c===cur?'selected':''}>${c}</option>`).join('');
  }

  renderGastos(_gastosRaw);
}

function renderGastos(list) {
  const tbody = document.getElementById('gastos-tbody');
  const tot = document.getElementById('gt-filter-total');
  if (!tbody) return;

  const total = list.reduce((a, d) => a + d.valor, 0);
  if (tot) tot.textContent = `${list.length} registros · Total: R$ ${fmt(total)}`;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2.5rem;color:var(--txt3)">Nenhum gasto este mês 🎉</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(d => {
    const ic = CAT_ICONS[d.categoria] || '📦';
    const dt = d._tipo === 'fixa'
      ? `<span style="color:var(--txt3)">${d.data}</span>`
      : new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR');

    const tipoBadge = d._tipo === 'fixa'
      ? `<span class="badge" style="background:rgba(251,146,60,0.15);color:#FB923C">📋 Conta Fixa</span>`
      : formaBadge(d.forma_pagamento);

    const delBtn = d._tipo === 'despesa'
      ? `<button class="btn-sm btn-del" onclick="delDespesa(${d.id},'${esc(d.nome)}')">✕</button>`
      : `<button class="btn-sm btn-edit" onclick="goto('contas',document.querySelector('[data-view=contas]'))">✎</button>`;

    return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.55rem">
          <span>${ic}</span>
          <div>
            <div style="font-weight:500">${d.nome}</div>
            ${d.observacao ? `<div style="font-size:0.7rem;color:var(--txt3)">${d.observacao}</div>` : ''}
          </div>
        </div>
      </td>
      <td><span class="badge" style="background:rgba(139,92,246,0.15);color:var(--acc2)">${d.categoria}</span></td>
      <td style="color:var(--txt2);font-size:0.83rem">${dt}</td>
      <td>${tipoBadge}</td>
      <td style="font-family:'JetBrains Mono';font-weight:700;color:var(--v-red)">R$ ${fmt(d.valor)}</td>
      <td>${delBtn}</td>
    </tr>`;
  }).join('');
}

function filtrarGastos() {
  const q = (document.getElementById('gt-busca')?.value || '').toLowerCase();
  const cat = document.getElementById('gt-cat')?.value || '';
  const tipo = document.getElementById('gt-tipo')?.value || '';
  renderGastos(_gastosRaw.filter(d =>
    (!q || d.nome.toLowerCase().includes(q)) &&
    (!cat || d.categoria === cat) &&
    (!tipo || d._tipo === tipo)
  ));
}

// ══════════ HISTÓRICO ══════════
async function loadHistorico() {
  const hist = await api('/api/historico');
  const hoje = new Date();
  const canvas = document.getElementById('ch-hist');
  const cards = document.getElementById('hist-cards');

  if (CHARTS.hist) CHARTS.hist.destroy();
  const dark = S.tema === 'dark';
  const gc = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const ctx = canvas?.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(139,92,246,0.4)');
    grad.addColorStop(1, 'rgba(139,92,246,0.02)');

    CHARTS.hist = new Chart(canvas, {
      type: 'line',
      data: {
        labels: hist.map(h => h.label),
        datasets: [{
          data: hist.map(h => h.total),
          borderColor: '#8B5CF6',
          backgroundColor: grad,
          borderWidth: 2.5,
          pointBackgroundColor: hist.map((h) =>
            h.ano === hoje.getFullYear() && h.mes === hoje.getMonth() + 1 ? '#34D399' : '#8B5CF6'),
          pointRadius: 4.5, pointHoverRadius: 7,
          tension: 0.4, fill: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: gc }, ticks: { callback: v => 'R$ ' + fmt(v), font: { size: 11 } } }
        },
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: c => ` R$ ${fmt(c.raw)}` } } },
        animation: { duration: 700 }
      }
    });
  }

  if (cards) {
    // Montar janela: 1 mês antes do atual + atual + 3 meses depois
    // hist pode não ter meses futuros; gerar os futuros zerados
    const todosOsMeses = [];
    for (let i = -1; i <= 3; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = MESES_BR[m-1] + '/' + String(y).slice(2);
      const existing = hist.find(h => h.ano === y && h.mes === m);
      const isCurrent = (i === 0);
      todosOsMeses.push({ ano: y, mes: m, label, total: existing?.total || 0, isCurrent });
    }

    cards.innerHTML = todosOsMeses.map((m, i) => {
      const prev = todosOsMeses[i - 1];
      let diffHtml = '';
      if (prev && prev.total > 0 && m.total > 0) {
        const d = ((m.total - prev.total) / prev.total * 100).toFixed(1);
        const up = m.total >= prev.total;
        diffHtml = `<div class="hc-diff ${up?'up':'down'}">${up?'↑':'↓'} ${Math.abs(d)}%</div>`;
      }
      const futuroBadge = i > 1 ? `<div style="font-size:0.65rem;color:var(--txt3);margin-top:0.2rem">parcelas futuras</div>` : '';
      return `
      <div class="hist-card ${m.isCurrent?'current':''}" onclick="jumpToMonth(${m.ano},${m.mes})" style="cursor:pointer" title="Ver Gastos Totais de ${m.label}">
        <div class="hc-mes">${m.label}${m.isCurrent?' ●':''}</div>
        <div class="hc-val" style="color:${m.total>0?'var(--txt)':'var(--txt3)'}">R$ ${fmt(m.total)}</div>
        ${diffHtml}
        ${futuroBadge}
        <div style="font-size:0.65rem;color:var(--acc2);margin-top:0.3rem">→ ver gastos</div>
      </div>`;
    }).join('');
  }
}

function jumpToMonth(ano, mes) {
  S.ano = ano; S.mes = mes;
  updateMonthLabel();
  goto('gastos', document.querySelector('[data-view="gastos"]'));
}

// ══════════ PERFIL ══════════
async function loadPerfil() {
  const p = await api('/api/profile');
  setVal('p-nome', p.nome || '');
  setVal('p-sal', p.salario || '');
  setVal('p-out', p.outras_rendas || '');
  setVal('p-dia', p.dia_pagamento || 5);
  updatePerfilTotal();
  const av = document.getElementById('perfil-av');
  if (av) av.textContent = (p.nome || 'U').charAt(0).toUpperCase();
  ['p-sal','p-out'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePerfilTotal);
  });

  // Renderizar seletor de tema
  const coresDef = [
    { key: 'roxo',   bg: 'linear-gradient(135deg,#8B5CF6,#A78BFA)' },
    { key: 'verde',  bg: 'linear-gradient(135deg,#10B981,#34D399)' },
    { key: 'vermelho',bg: 'linear-gradient(135deg,#EF4444,#F87171)' },
    { key: 'branco', bg: 'linear-gradient(135deg,#E4E4E7,#F9FAFB)', textColor: '#18181B' },
    { key: 'preto',  bg: 'linear-gradient(135deg,#18181B,#09090B)' }
  ];
  const coresEl = document.getElementById('perfil-tema-cores');
  if (coresEl) {
    coresEl.innerHTML = coresDef.map(c => `
      <button class="perfil-tema-cor-btn ${(p.tema_cor||'roxo')===c.key?'active':''}"
        style="background:${c.bg};color:${c.textColor||'white'}"
        onclick="mudarPerfilTema('cor','${c.key}')">
        ${(p.tema_cor||'roxo')===c.key ? '✓' : ''}
      </button>`).join('');
  }
  const modosEl = document.getElementById('perfil-tema-modos');
  if (modosEl) {
    modosEl.innerHTML = `
      <button class="perfil-tema-modo-btn ${(p.tema_modo||'escuro')==='claro'?'active':''}" onclick="mudarPerfilTema('modo','claro')">☀️ Claro</button>
      <button class="perfil-tema-modo-btn ${(p.tema_modo||'escuro')==='escuro'?'active':''}" onclick="mudarPerfilTema('modo','escuro')">🌙 Escuro</button>
    `;
  }
}

async function mudarPerfilTema(tipo, valor) {
  const p = await api('/api/profile');
  if (tipo === 'cor') p.tema_cor = valor;
  else p.tema_modo = valor;
  await api('/api/profile', 'POST', p);
  if (typeof aplicarTema === 'function') await aplicarTema();
  else {
    const modo = p.tema_modo || 'escuro';
    applyTema(modo === 'escuro' ? 'dark' : 'light');
  }
  loadPerfil();
  toast('Tema atualizado!', 'ok');
}

function updatePerfilTotal() {
  const s = parseFloat(getVal('p-sal') || 0);
  const o = parseFloat(getVal('p-out') || 0);
  setVal('p-tot', 'R$ ' + fmt(s + o));
}

async function savePerfil() {
  const data = {
    nome: getVal('p-nome'),
    salario: parseFloat(getVal('p-sal')) || 0,
    outras_rendas: parseFloat(getVal('p-out')) || 0,
    dia_pagamento: parseInt(getVal('p-dia')) || 5,
    tema: S.tema
  };
  await api('/api/profile', 'POST', data);
  toast('Perfil salvo!', 'ok');
  loadDashboard();
}

// ══════════ MODALS ══════════
function openModal(tipo) {
  if (tipo === 'despesa') {
    setVal('d-data', new Date().toISOString().split('T')[0]);
    loadCartaoSelect();
    document.getElementById('m-despesa').classList.add('open');
  } else if (tipo === 'cartao') {
    setEl('m-cartao-title', 'Novo Cartão');
    clearCartaoForm();
    document.getElementById('m-cartao').classList.add('open');
  } else if (tipo === 'conta') {
    setEl('m-conta-title', 'Nova Conta Fixa');
    clearContaForm();
    document.getElementById('m-conta').classList.add('open');
  }
}

function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
function closeOverlay(e, id) { if (e.target === e.currentTarget) closeModal(id); }

async function loadCartaoSelect() {
  const c = await api('/api/cartoes');
  const s = document.getElementById('d-cartao');
  if (s) s.innerHTML = '<option value="">Selecionar</option>' +
    c.map(x => `<option value="${x.id}">${x.nome} — ${x.banco}</option>`).join('');
}

function onFormaChange() {
  const f = getVal('d-forma');
  const cr = document.getElementById('cartao-row');
  const pr = document.getElementById('parcela-row');
  if (cr) cr.style.display = (f==='credito'||f==='parcelado') ? '' : 'none';
  if (pr) pr.style.display = f==='parcelado' ? '' : 'none';
}

// ══════════ CRUD DESPESAS ══════════
async function saveDespesa(e) {
  e.preventDefault();
  const data = {
    nome: getVal('d-nome'), valor: parseFloat(getVal('d-val')),
    data: getVal('d-data'), categoria: getVal('d-cat'),
    forma_pagamento: getVal('d-forma'), cartao_id: getVal('d-cartao') || null,
    parcelas: parseInt(getVal('d-parc')) || 1, observacao: getVal('d-obs')
  };
  if (!data.nome || !data.valor || !data.categoria || !data.forma_pagamento) {
    toast('Preencha todos os campos obrigatórios', 'err'); return;
  }
  const r = await api('/api/despesas', 'POST', data);
  if (r.ok) {
    closeModal('m-despesa'); e.target.reset();
    document.getElementById('cartao-row').style.display = 'none';
    document.getElementById('parcela-row').style.display = 'none';
    toast('Despesa adicionada!', 'ok');
    loadDashboard();
    const av = document.querySelector('.nav-link.active');
    if (av?.dataset?.view === 'despesas') loadDespesasView();
    if (av?.dataset?.view === 'dicas') loadDicas();
  }
}

async function delDespesa(id, nome) {
  if (!confirm(`Remover "${nome}"?\n(Se parcelado, todas as parcelas serão removidas)`)) return;
  await api(`/api/despesas/${id}`, 'DELETE');
  toast('Despesa removida', 'ok');
  loadDashboard();
  loadDespesasView();
}

// ══════════ CRUD CARTÕES ══════════
function clearCartaoForm() {
  ['c-id','c-nome','c-banco','c-lim','c-fech','c-venc'].forEach(id => setVal(id,''));
  setVal('c-band','Mastercard'); setVal('c-cor','#8B5CF6');
  document.querySelectorAll('.col-opt').forEach((el,i) => {
    el.classList.toggle('sel',i===0); el.textContent = i===0?'✓':'';
  });
}

function pickColor(el) {
  document.querySelectorAll('.col-opt').forEach(o => { o.classList.remove('sel'); o.textContent=''; });
  el.classList.add('sel'); el.textContent='✓';
  setVal('c-cor', el.dataset.c);
}

async function saveCartao(e) {
  e.preventDefault();
  const id = getVal('c-id');
  const data = {
    nome: getVal('c-nome'), banco: getVal('c-banco'), bandeira: getVal('c-band'),
    limite_total: parseFloat(getVal('c-lim')), dia_fechamento: parseInt(getVal('c-fech')),
    dia_vencimento: parseInt(getVal('c-venc')), cor: getVal('c-cor')
  };
  const r = await api(id ? `/api/cartoes/${id}` : '/api/cartoes', id ? 'PUT' : 'POST', data);
  if (r.ok) {
    closeModal('m-cartao');
    toast(id ? 'Cartão atualizado!' : 'Cartão adicionado!', 'ok');
    loadCartoesView();
  }
}

async function editCartao(id) {
  const c = S.cartoes.find(x => x.id === id);
  if (!c) return;
  setVal('c-id',c.id); setVal('c-nome',c.nome); setVal('c-banco',c.banco);
  setVal('c-band',c.bandeira); setVal('c-lim',c.limite_total);
  setVal('c-fech',c.dia_fechamento); setVal('c-venc',c.dia_vencimento); setVal('c-cor',c.cor);
  document.querySelectorAll('.col-opt').forEach(el => {
    const s = el.dataset.c === c.cor;
    el.classList.toggle('sel',s); el.textContent = s ? '✓' : '';
  });
  setEl('m-cartao-title','Editar Cartão');
  document.getElementById('m-cartao').classList.add('open');
}

async function delCartao(id, nome) {
  if (!confirm(`Remover cartão "${nome}"?`)) return;
  await api(`/api/cartoes/${id}`, 'DELETE');
  toast('Cartão removido', 'ok');
  loadCartoesView();
}

// ══════════ CRUD CONTAS FIXAS ══════════
function clearContaForm() {
  ['cf-id','cf-nome','cf-val','cf-dia'].forEach(id => setVal(id,''));
  setVal('cf-cat','Moradia');
}

async function saveConta(e) {
  e.preventDefault();
  const id = getVal('cf-id');
  const data = {
    nome: getVal('cf-nome'), valor: parseFloat(getVal('cf-val')),
    dia_vencimento: parseInt(getVal('cf-dia')), categoria: getVal('cf-cat')
  };
  const r = await api(id ? `/api/contas-fixas/${id}` : '/api/contas-fixas', id?'PUT':'POST', data);
  if (r.ok) {
    closeModal('m-conta');
    toast(id ? 'Conta atualizada!' : 'Conta adicionada!', 'ok');
    loadContasView();
  }
}

async function editConta(id) {
  const c = await api('/api/contas-fixas');
  const f = c.find(x => x.id === id);
  if (!f) return;
  setVal('cf-id',f.id); setVal('cf-nome',f.nome); setVal('cf-val',f.valor);
  setVal('cf-dia',f.dia_vencimento); setVal('cf-cat',f.categoria);
  setEl('m-conta-title','Editar Conta Fixa');
  document.getElementById('m-conta').classList.add('open');
}

async function delConta(id, nome) {
  if (!confirm(`Remover "${nome}"?`)) return;
  await api(`/api/contas-fixas/${id}`, 'DELETE');
  toast('Conta removida', 'ok');
  loadContasView();
}

// ══════════ ALERTAS ══════════
function renderAlerts(alertas) {
  const badge = document.getElementById('alert-count');
  const list = document.getElementById('ap-list');
  if (badge) {
    badge.style.display = alertas.length ? 'flex' : 'none';
    badge.textContent = alertas.length;
  }
  if (list) list.innerHTML = alertas.length
    ? alertas.map(a => `<div class="ap-item">${a.mensagem}</div>`).join('')
    : '<div class="ap-item" style="color:var(--txt3);text-align:center">Sem alertas 🎉</div>';
}

function toggleAlerts() {
  const p = document.getElementById('alerts-panel');
  if (p) p.style.display = p.style.display === 'none' ? '' : 'none';
}

function closeAlerts() {
  const p = document.getElementById('alerts-panel');
  if (p) p.style.display = 'none';
}

async function clearAlerts() {
  await api('/api/alertas/limpar', 'POST');
  const badge = document.getElementById('alert-count');
  if (badge) badge.style.display = 'none';
  const list = document.getElementById('ap-list');
  if (list) list.innerHTML = '<div class="ap-item" style="color:var(--txt3);text-align:center">Sem alertas 🎉</div>';
}

document.addEventListener('click', e => {
  if (!e.target.closest('#alerts-panel') && !e.target.closest('#alert-btn')) closeAlerts();
});

// ══════════ TOAST ══════════
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type} on`;
  setTimeout(() => el.classList.remove('on'), 3200);
}

// ══════════ UTILS ══════════
function fmt(v) {
  if (v == null || isNaN(v)) return '0,00';
  return parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setEl(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
function setVal(id, v) { const e = document.getElementById(id); if (e) e.value = v; }
function getVal(id) { return document.getElementById(id)?.value || ''; }
function esc(s) { return (s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;'); }

function formaBadge(f, asHtml = true) {
  const map = { dinheiro:'💵 Dinheiro', debito:'💳 Débito', credito:'💳 Crédito', parcelado:'📦 Parcelado' };
  const cls = { dinheiro:'rgba(52,211,153,0.15):#34D399', debito:'rgba(96,165,250,0.15):#60A5FA',
    credito:'rgba(139,92,246,0.15):#A78BFA', parcelado:'rgba(251,146,60,0.15):#FB923C' };
  if (!asHtml) return map[f] || f;
  const [bg, col] = (cls[f] || 'rgba(148,163,184,0.15):#94A3B8').split(':');
  return `<span class="badge" style="background:${bg};color:${col}">${map[f]||f}</span>`;
}

function palette(n) {
  const cols = ['#8B5CF6','#34D399','#60A5FA','#FB923C','#F472B6',
                '#38BDF8','#A3E635','#FCD34D','#C084FC','#6EE7B7','#93C5FD','#FCA5A5'];
  return Array.from({length: n}, (_, i) => cols[i % cols.length]);
}

function darken(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.floor(r*.6)},${Math.floor(g*.6)},${Math.floor(b*.6)})`;
  } catch { return hex; }
}

// ══════════ INVESTIMENTOS ══════════
const INV_TIPOS = {
  renda_fixa: { icon: '🏦', label: 'Renda Fixa', color: '#34D399' },
  renda_variavel: { icon: '📊', label: 'Renda Variável', color: '#8B5CF6' },
  fii: { icon: '🏢', label: 'FII', color: '#60A5FA' },
  criptomoeda: { icon: '₿', label: 'Cripto', color: '#FB923C' },
  previdencia: { icon: '🛡️', label: 'Previdência', color: '#A78BFA' },
  poupanca: { icon: '🐷', label: 'Poupança', color: '#34D399' },
  outros: { icon: '💼', label: 'Outros', color: '#94A3B8' }
};

async function loadInvestimentos() {
  const invs = await api('/api/investimentos');
  const grid = document.getElementById('inv-grid');
  if (!grid) return;

  // Calcular totais
  const totalPatrimonio = invs.reduce((a, inv) => a + (inv.valor_atual || inv.valor_aportado || 0), 0);
  const totalAportado = invs.reduce((a, inv) => a + (inv.valor_aportado || 0), 0);
  const ganho = totalPatrimonio - totalAportado;
  const rentPct = totalAportado > 0 ? ((ganho / totalAportado) * 100).toFixed(2) : 0;

  setEl('inv-patrimonio', 'R$ ' + fmt(totalPatrimonio));
  setEl('inv-aportado', 'R$ ' + fmt(totalAportado));
  setEl('inv-rent', (ganho >= 0 ? '+' : '') + rentPct + '%');
  setEl('inv-rent-sub', ganho >= 0
    ? `+R$ ${fmt(ganho)} de rendimento`
    : `-R$ ${fmt(Math.abs(ganho))} de perda`);

  const rentEl = document.getElementById('inv-rent');
  if (rentEl) rentEl.style.color = ganho >= 0 ? 'var(--v-green)' : 'var(--v-red)';

  if (!invs.length) {
    grid.innerHTML = `<div class="empty"><div class="empty-ico">📈</div><p>Nenhum investimento cadastrado</p></div>`;
    return;
  }

  grid.innerHTML = invs.map(inv => {
    const tp = INV_TIPOS[inv.tipo] || INV_TIPOS.outros;
    const vAtual = inv.valor_atual || inv.valor_aportado || 0;
    const vAport = inv.valor_aportado || 0;
    const diff = vAtual - vAport;
    const diffPct = vAport > 0 ? ((diff / vAport) * 100).toFixed(2) : 0;
    const pct = Math.min((vAtual / (totalPatrimonio || 1)) * 100, 100).toFixed(1);
    const aportes = inv.aportes || [];

    return `
    <div class="inv-card">
      <div class="inv-card-head">
        <div class="inv-icon" style="background:${tp.color}22;color:${tp.color}">${tp.icon}</div>
        <div class="inv-info">
          <div class="inv-nome">${inv.nome}</div>
          <div class="inv-tipo-lbl">${tp.label}${inv.rentabilidade_info ? ' · ' + inv.rentabilidade_info : ''}</div>
        </div>
        <div class="inv-actions">
          <button class="btn-sm btn-edit" onclick="abrirAporte(${inv.id})">+ Aporte</button>
          <button class="btn-sm btn-edit" onclick="editInvestimento(${inv.id})">✎</button>
          <button class="btn-sm btn-del" onclick="delInvestimento(${inv.id},'${esc(inv.nome)}')">✕</button>
        </div>
      </div>
      <div class="inv-valores">
        <div class="inv-val-item">
          <div class="inv-val-lbl">Valor atual</div>
          <div class="inv-val-num" style="color:var(--v-green)">R$ ${fmt(vAtual)}</div>
        </div>
        <div class="inv-val-item">
          <div class="inv-val-lbl">Investido</div>
          <div class="inv-val-num">R$ ${fmt(vAport)}</div>
        </div>
        <div class="inv-val-item">
          <div class="inv-val-lbl">Rendimento</div>
          <div class="inv-val-num" style="color:${diff >= 0 ? 'var(--v-green)' : 'var(--v-red)'}">
            ${diff >= 0 ? '+' : ''}R$ ${fmt(diff)} (${diffPct}%)
          </div>
        </div>
      </div>
      <div class="inv-bar-wrap">
        <div class="inv-bar-fill" style="width:${pct}%;background:${tp.color}"></div>
      </div>
      <div style="font-size:0.72rem;color:var(--txt3);margin-top:0.25rem">${pct}% do portfólio · ${aportes.length} aporte(s)</div>
      ${inv.observacao ? `<div style="font-size:0.78rem;color:var(--txt2);margin-top:0.35rem">📝 ${inv.observacao}</div>` : ''}
    </div>`;
  }).join('');
}

function openModalInvestimento() {
  setEl('m-inv-title', 'Novo Investimento');
  ['inv-id','inv-nome','inv-atual','inv-rent-info','inv-obs'].forEach(id => setVal(id,''));
  setVal('inv-tipo',''); setVal('inv-aportado','');
  document.getElementById('m-investimento').classList.add('open');
}

async function editInvestimento(id) {
  const invs = await api('/api/investimentos');
  const inv = invs.find(x => x.id === id);
  if (!inv) return;
  setEl('m-inv-title','Editar Investimento');
  setVal('inv-id', inv.id);
  setVal('inv-nome', inv.nome);
  setVal('inv-tipo', inv.tipo);
  setVal('inv-aportado', inv.valor_aportado);
  setVal('inv-atual', inv.valor_atual || '');
  setVal('inv-rent-info', inv.rentabilidade_info || '');
  setVal('inv-obs', inv.observacao || '');
  document.getElementById('m-investimento').classList.add('open');
}

async function saveInvestimento(e) {
  e.preventDefault();
  const id = getVal('inv-id');
  const aportado = parseFloat(getVal('inv-aportado'));
  const atual = parseFloat(getVal('inv-atual')) || aportado;
  const hoje = new Date().toISOString().split('T')[0];
  const data = {
    nome: getVal('inv-nome'),
    tipo: getVal('inv-tipo'),
    valor_aportado: aportado,
    valor_atual: atual,
    rentabilidade_info: getVal('inv-rent-info'),
    observacao: getVal('inv-obs'),
    aportes: id ? undefined : [{ valor: aportado, data: hoje }]
  };

  if (id) {
    // Edição: atualiza só os metadados, não gera nova despesa
    await api(`/api/investimentos/${id}`, 'PUT', data);
    toast('Investimento atualizado!', 'ok');
  } else {
    // Novo investimento: salva + gera despesa na categoria Investimento
    await api('/api/investimentos', 'POST', data);
    await api('/api/despesas', 'POST', {
      nome: `Investimento: ${data.nome}`,
      valor: aportado,
      data: hoje,
      categoria: 'Investimento',
      forma_pagamento: 'debito',
      cartao_id: null,
      parcelas: 1,
      observacao: data.rentabilidade_info || data.observacao || ''
    });
    toast('Investimento adicionado e registrado nos gastos!', 'ok');
  }
  closeModal('m-investimento');
  loadInvestimentos();
  loadDashboard();
}

async function delInvestimento(id, nome) {
  if (!confirm(`Remover "${nome}"?`)) return;
  await api(`/api/investimentos/${id}`, 'DELETE');
  toast('Investimento removido', 'ok');
  loadInvestimentos();
}

function abrirAporte(id) {
  setVal('aporte-inv-id', id);
  setVal('aporte-val', '');
  document.getElementById('m-aporte').classList.add('open');
}

async function confirmarAporte() {
  const id = parseInt(getVal('aporte-inv-id'));
  const valor = parseFloat(getVal('aporte-val'));
  if (!valor || valor <= 0) { toast('Valor inválido', 'err'); return; }

  // Registrar aporte no investimento
  await api(`/api/investimentos/${id}/aporte`, 'POST', { valor });

  // Buscar nome do investimento para a despesa
  const invs = await api('/api/investimentos');
  const inv = invs.find(x => x.id === id);
  const nomeInv = inv ? inv.nome : 'Investimento';

  // Gerar despesa para aparecer nos gastos do mês
  const hoje = new Date().toISOString().split('T')[0];
  await api('/api/despesas', 'POST', {
    nome: `Aporte: ${nomeInv}`,
    valor: valor,
    data: hoje,
    categoria: 'Investimento',
    forma_pagamento: 'debito',
    cartao_id: null,
    parcelas: 1,
    observacao: 'Aporte em investimento'
  });

  closeModal('m-aporte');
  toast('Aporte registrado e lançado nos gastos!', 'ok');
  loadInvestimentos();
  loadDashboard();
}

// ══════════ DETALHE DO CARTÃO (mês a mês) ══════════
// Estado interno para navegação no detalhe do cartão
let _detalheCartaoId = null;
let _detalheCartaoBaseAno = null;
let _detalheCartaoBaseMes = null;

async function verDetalheCartao(cartaoId, baseAno, baseMes) {
  cartaoId = parseInt(cartaoId);
  _detalheCartaoId = cartaoId;

  // Mês base = parâmetro ou mês atual do S
  const anoBase = baseAno || S.ano;
  const mesBase = baseMes || S.mes;
  _detalheCartaoBaseAno = anoBase;
  _detalheCartaoBaseMes = mesBase;

  // Buscar cartão
  let cartao = S.cartoes.find(c => Number(c.id) === cartaoId);
  if (!cartao) {
    const todos = await api('/api/cartoes');
    const base = todos.find(c => Number(c.id) === cartaoId);
    if (!base) { toast('Cartão não encontrado', 'err'); return; }
    const dash = await api(`/api/dashboard?ano=${anoBase}&mes=${mesBase}`);
    const dc = (dash.cartoes || []).find(d => Number(d.id) === cartaoId) || {};
    cartao = { ...base, fatura: dc.fatura || 0, pct: dc.pct || 0, total_comprometido: dc.total_comprometido || 0, disponivel: dc.disponivel || base.limite_total };
  }

  // Montar view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  let detView = document.getElementById('v-cartao-detalhe');
  if (!detView) {
    detView = document.createElement('div');
    detView.id = 'v-cartao-detalhe';
    detView.className = 'view';
    document.querySelector('.main').appendChild(detView);
  }
  detView.classList.add('active');

  // Coletar: 1 mês antes + mês base + 3 meses depois
  const mesesData = [];
  for (let i = -1; i <= 3; i++) {
    const d = new Date(anoBase, mesBase - 1 + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const despesas = await api(`/api/despesas?ano=${y}&mes=${m}`);
    const doCartao = despesas.filter(x => Number(x.cartao_id) == cartaoId);
    const total = doCartao.reduce((a, b) => a + b.valor, 0);
    const isBase = (y === anoBase && m === mesBase);
    mesesData.push({ ano: y, mes: m, label: MESES_BR[m-1] + '/' + String(y).slice(2), total, despesas: doCartao, isBase });
  }

  const used = cartao.total_comprometido || cartao.fatura || 0;
  const pct = Math.min((used / cartao.limite_total) * 100, 100).toFixed(1);
  const bands = { Mastercard: '⊕', Visa: '◉', Elo: '◈', 'American Express': '✦', Hipercard: '✿' };

  // Calcular mês anterior/próximo para navegação
  const dPrev = new Date(anoBase, mesBase - 2, 1);
  const dNext = new Date(anoBase, mesBase, 1);

  detView.innerHTML = `
    <div class="view-head">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <button class="btn-ghost" onclick="goto('cartoes',document.querySelector('[data-view=cartoes]'))">← Voltar</button>
        <h1>${cartao.nome}</h1>
      </div>
    </div>

    <div class="credit-card" style="background:linear-gradient(140deg,${cartao.cor},${darken(cartao.cor)});max-width:380px;margin-bottom:1.5rem">
      <div class="cc-bank">${cartao.banco}</div>
      <div class="cc-name">${cartao.nome}</div>
      <div class="cc-dots">•••• •••• ••••</div>
      <div class="cc-pbar">
        <div class="cc-pbar-track"><div class="cc-pbar-fill" style="width:${pct}%"></div></div>
        <div class="cc-pbar-stats"><span>${pct}% comprometido</span><span>${cartao.bandeira} ${bands[cartao.bandeira]||'◉'}</span></div>
      </div>
      <div class="cc-footer">
        <div class="cc-fl"><span class="cc-lbl2">Disponível</span><span class="cc-val2">R$ ${fmt(cartao.disponivel)}</span></div>
        <div class="cc-fl" style="text-align:right"><span class="cc-lbl2">Comprometido</span><span class="cc-val2">R$ ${fmt(used)}</span></div>
      </div>
    </div>

    <div class="card mt">
      <div class="card-head">
        <h3>Gastos mês a mês</h3>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <button class="mnav" onclick="verDetalheCartao(${cartaoId},${dPrev.getFullYear()},${dPrev.getMonth()+1})">‹</button>
          <span style="font-size:0.82rem;color:var(--txt2);min-width:80px;text-align:center">${MESES_BR[mesBase-1]}/${String(anoBase).slice(2)}</span>
          <button class="mnav" onclick="verDetalheCartao(${cartaoId},${dNext.getFullYear()},${dNext.getMonth()+1})">›</button>
        </div>
      </div>
      <div style="padding:1rem">
        ${mesesData.map(md => `
        <div style="margin-bottom:1.5rem;${md.isBase ? 'border-left:3px solid '+cartao.cor+';padding-left:0.75rem;' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem">
            <span style="font-weight:${md.isBase?'700':'600'};color:${md.isBase?'var(--txt)':'var(--txt2)'};font-size:${md.isBase?'1rem':'0.9rem'}">${md.label}${md.isBase?' ← atual':''}</span>
            <span style="font-family:'JetBrains Mono';color:${md.total>0?'var(--v-red)':'var(--txt3)'};font-weight:700">R$ ${fmt(md.total)}</span>
          </div>
          <div style="background:var(--surf2);border-radius:4px;height:4px;margin-bottom:0.6rem">
            <div style="height:4px;border-radius:4px;background:${cartao.cor};width:${Math.min((md.total/cartao.limite_total)*100,100)}%"></div>
          </div>
          ${md.despesas.length
            ? md.despesas.map(dx => `
              <div class="tx-row" style="padding:0.4rem 0;border-bottom:1px solid var(--bdr)">
                <div class="tx-ico" style="background:${CAT_COLORS[dx.categoria]||'rgba(139,92,246,0.1)'}">${CAT_ICONS[dx.categoria]||'📦'}</div>
                <div class="tx-inf">
                  <div class="tx-nm">${dx.nome}</div>
                  <div class="tx-meta">${dx.categoria}</div>
                </div>
                <div style="text-align:right">
                  <div class="tx-amt">−R$ ${fmt(dx.valor)}</div>
                  <div class="tx-dt">${new Date(dx.data+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</div>
                </div>
              </div>`).join('')
            : `<div style="color:var(--txt3);font-size:0.82rem;padding:0.25rem 0">Nenhuma despesa neste mês</div>`
          }
        </div>`).join('')}
      </div>
    </div>
  `;
}
