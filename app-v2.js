/**
 * FinFinance v2.0 — Extensões Mobile & Temas
 * Este arquivo adiciona novas funcionalidades sem quebrar o app.js original
 */

// ══════════════════════════════════════════════
//  SISTEMA DE TEMAS
// ══════════════════════════════════════════════

const TEMAS = {
  cores: ['roxo', 'verde', 'vermelho', 'branco', 'preto'],
  modos: ['claro', 'escuro']
};

async function aplicarTema() {
  const profile = await DB.getProfile();
  const cor = profile.tema_cor || 'roxo';
  const modo = profile.tema_modo || 'escuro';
  
  document.documentElement.setAttribute('data-tema-cor', cor);
  document.documentElement.setAttribute('data-tema-modo', modo);
  
  // Manter compatibilidade com código antigo
  document.documentElement.setAttribute('data-theme', modo === 'escuro' ? 'dark' : 'light');
}

async function mudarTema(cor, modo) {
  const profile = await DB.getProfile();
  profile.tema_cor = cor;
  profile.tema_modo = modo;
  await DB.updateProfile(profile);
  await aplicarTema();
}

// ══════════════════════════════════════════════
//  BOTTOM NAVIGATION
// ══════════════════════════════════════════════

function criarBottomNav() {
  // Verificar se já existe
  if (document.querySelector('.bottom-nav')) return;
  
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <a href="#" class="bottom-nav-item active" data-view="dashboard" onclick="gotoMobile('dashboard', this); return false;">
      <div class="icon">🏠</div>
      <span>Início</span>
    </a>
    <a href="#" class="bottom-nav-item" data-view="cartoes" onclick="gotoMobile('cartoes', this); return false;">
      <div class="icon">💳</div>
      <span>Cartões</span>
    </a>
    <a href="#" class="bottom-nav-item" data-view="dicas" onclick="gotoMobile('dicas', this); return false;">
      <div class="icon">📊</div>
      <span>Análise</span>
      <span class="badge" id="bottom-score-badge" style="display:none"></span>
    </a>
    <a href="#" class="bottom-nav-item" data-view="despesas" onclick="gotoMobile('despesas', this); return false;">
      <div class="icon">🧾</div>
      <span>Despesas</span>
    </a>
    <a href="#" class="bottom-nav-item" data-view="config" onclick="gotoMobile('config', this); return false;">
      <div class="icon">⚙️</div>
      <span>Config</span>
    </a>
  `;
  
  document.body.appendChild(nav);
}

function gotoMobile(view, el) {
  // Atualizar bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  if (el) el.classList.add('active');
  
  // Redirecionar para função goto original ou criar nova view
  if (view === 'config') {
    loadConfig();
  } else {
    goto(view, null);
  }
}

// ══════════════════════════════════════════════
//  TELA DE CONFIGURAÇÕES (NOVA)
// ══════════════════════════════════════════════

async function loadConfig() {
  // Esconder todas as views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  
  // Verificar se view de config existe, senão criar
  let configView = document.getElementById('v-config');
  if (!configView) {
    configView = document.createElement('div');
    configView.id = 'v-config';
    configView.className = 'view';
    document.querySelector('.main').appendChild(configView);
  }
  
  configView.classList.add('active');
  
  const profile = await DB.getProfile();
  const ganhosExtras = await DB.getGanhosExtras();
  
  configView.innerHTML = `
    <div class="mobile-container">
      <div class="view-head">
        <h1>⚙️ Configurações</h1>
      </div>
      
      <!-- Perfil -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-head">
          <h3>👤 Perfil</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" id="cfg-nome" class="form-input" value="${profile.nome || ''}" placeholder="Seu nome">
          </div>
          <div class="form-group">
            <label>Salário Mensal</label>
            <input type="number" id="cfg-salario" class="form-input" value="${profile.salario || 0}" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Outras Rendas</label>
            <input type="number" id="cfg-outras" class="form-input" value="${profile.outras_rendas || 0}" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Dia de Pagamento</label>
            <input type="number" id="cfg-dia" class="form-input" value="${profile.dia_pagamento || 5}" min="1" max="31">
          </div>
          <button class="btn-primary full" onclick="salvarConfigPerfil()">Salvar Perfil</button>
        </div>
      </div>
      
      <!-- Ganhos Extras -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-head">
          <h3>💰 Ganhos Extras</h3>
          <button class="btn-sm btn-edit" onclick="abrirModalGanhoExtra()">+ Adicionar</button>
        </div>
        <div class="card-body">
          <div id="lista-ganhos-extras">
            ${ganhosExtras.length === 0 ? 
              '<p style="color: var(--txt3); text-align: center; padding: 1rem;">Nenhum ganho extra cadastrado</p>' :
              ganhosExtras.map(g => `
                <div class="mobile-category-item" style="margin-bottom: 0.5rem;">
                  <div class="icon">💵</div>
                  <div class="info">
                    <div class="name">${g.nome}</div>
                    <div class="amount">R$ ${fmt(g.valor)}</div>
                  </div>
                  <button class="btn-sm btn-del" onclick="deletarGanhoExtra(${g.id}, '${g.nome}')">🗑️</button>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
      
      <!-- Tema -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-head">
          <h3>🎨 Tema</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Cor do Tema</label>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
              ${TEMAS.cores.map(cor => `
                <button 
                  class="tema-cor-btn ${(profile.tema_cor || 'roxo') === cor ? 'active' : ''}" 
                  data-cor="${cor}"
                  onclick="selecionarTemaCor('${cor}')"
                  style="
                    height: 50px;
                    border-radius: 10px;
                    border: 2px solid ${(profile.tema_cor || 'roxo') === cor ? 'var(--acc)' : 'var(--bdr)'};
                    background: ${getCorTema(cor)};
                    cursor: pointer;
                    transition: all var(--trans);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                  "
                >
                  ${(profile.tema_cor || 'roxo') === cor ? '✓' : ''}
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="form-group" style="margin-top: 1rem;">
            <label>Modo</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
              <button 
                class="tema-modo-btn ${(profile.tema_modo || 'escuro') === 'claro' ? 'active' : ''}"
                onclick="selecionarTemaModo('claro')"
                style="
                  padding: 0.75rem;
                  border-radius: 10px;
                  border: 2px solid ${(profile.tema_modo || 'escuro') === 'claro' ? 'var(--acc)' : 'var(--bdr)'};
                  background: var(--surf);
                  cursor: pointer;
                  transition: all var(--trans);
                  font-weight: 600;
                "
              >
                ☀️ Claro
              </button>
              <button 
                class="tema-modo-btn ${(profile.tema_modo || 'escuro') === 'escuro' ? 'active' : ''}"
                onclick="selecionarTemaModo('escuro')"
                style="
                  padding: 0.75rem;
                  border-radius: 10px;
                  border: 2px solid ${(profile.tema_modo || 'escuro') === 'escuro' ? 'var(--acc)' : 'var(--bdr)'};
                  background: var(--surf);
                  cursor: pointer;
                  transition: all var(--trans);
                  font-weight: 600;
                "
              >
                🌙 Escuro
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sobre -->
      <div class="card">
        <div class="card-head">
          <h3>ℹ️ Sobre</h3>
        </div>
        <div class="card-body" style="text-align: center;">
          <p style="color: var(--txt2); font-size: 0.85rem; margin-bottom: 0.5rem;">
            <strong>FinFinance v2.0</strong>
          </p>
          <p style="color: var(--txt3); font-size: 0.75rem;">
            Controle financeiro pessoal inteligente
          </p>
        </div>
      </div>
    </div>
  `;
}

function getCorTema(cor) {
  const cores = {
    'roxo': 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    'verde': 'linear-gradient(135deg, #10B981, #34D399)',
    'vermelho': 'linear-gradient(135deg, #EF4444, #F87171)',
    'branco': 'linear-gradient(135deg, #F4F4F5, #FFFFFF)',
    'preto': 'linear-gradient(135deg, #18181B, #09090B)'
  };
  return cores[cor] || cores.roxo;
}

async function selecionarTemaCor(cor) {
  const profile = await DB.getProfile();
  await mudarTema(cor, profile.tema_modo || 'escuro');
  loadConfig(); // Recarregar para atualizar UI
  toast('Tema atualizado!', 'ok');
}

async function selecionarTemaModo(modo) {
  const profile = await DB.getProfile();
  await mudarTema(profile.tema_cor || 'roxo', modo);
  loadConfig(); // Recarregar para atualizar UI
  toast('Modo atualizado!', 'ok');
}

async function salvarConfigPerfil() {
  const profile = await DB.getProfile();
  profile.nome = document.getElementById('cfg-nome').value || 'Usuário';
  profile.salario = parseFloat(document.getElementById('cfg-salario').value) || 0;
  profile.outras_rendas = parseFloat(document.getElementById('cfg-outras').value) || 0;
  profile.dia_pagamento = parseInt(document.getElementById('cfg-dia').value) || 5;
  
  await DB.updateProfile(profile);
  toast('Perfil atualizado!', 'ok');
  
  // Atualizar nome no header se existir
  const userNm = document.getElementById('user-nm');
  if (userNm) userNm.textContent = profile.nome.split(' ')[0];
  
  const userAv = document.getElementById('user-av');
  if (userAv) userAv.textContent = profile.nome.charAt(0).toUpperCase();
}

// ══════════════════════════════════════════════
//  GANHOS EXTRAS
// ══════════════════════════════════════════════

function abrirModalGanhoExtra() {
  let modal = document.getElementById('m-ganho-extra');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'm-ganho-extra';
    modal.className = 'overlay';
    modal.onclick = (e) => { if (e.target === e.currentTarget) fecharModal('m-ganho-extra'); };
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-head">
          <h2>Adicionar Ganho Extra</h2>
          <button class="close-btn" onclick="fecharModal('m-ganho-extra')">✕</button>
        </div>
        <form onsubmit="salvarGanhoExtra(event)">
          <div class="form-group">
            <label>Descrição *</label>
            <input type="text" id="ge-nome" class="form-input" required placeholder="Ex: Freelance, Brique, Comissão">
          </div>
          <div class="form-group">
            <label>Valor *</label>
            <input type="number" id="ge-valor" class="form-input" required min="0.01" step="0.01" placeholder="0,00">
          </div>
          <button type="submit" class="btn-primary full">Adicionar</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Limpar campos
  document.getElementById('ge-nome').value = '';
  document.getElementById('ge-valor').value = '';
  
  modal.classList.add('open');
}

function fecharModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

async function salvarGanhoExtra(e) {
  e.preventDefault();
  
  const nome = document.getElementById('ge-nome').value;
  const valor = parseFloat(document.getElementById('ge-valor').value);
  
  await DB.addGanhoExtra({ nome, valor });
  
  fecharModal('m-ganho-extra');
  toast('Ganho extra adicionado!', 'ok');
  loadConfig(); // Recarregar lista
}

async function deletarGanhoExtra(id, nome) {
  if (!confirm(`Remover "${nome}"?`)) return;
  
  await DB.deleteGanhoExtra(id);
  toast('Ganho extra removido!', 'ok');
  loadConfig();
}

// ══════════════════════════════════════════════
//  INICIALIZAÇÃO V2
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  // Aguardar inicialização do DB original
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Aplicar tema
  await aplicarTema();
  
  // Criar bottom navigation (apenas mobile)
  if (window.innerWidth <= 768) {
    criarBottomNav();
  }
  
  // Adicionar container mobile nas views
  document.querySelectorAll('.view').forEach(view => {
    if (!view.querySelector('.mobile-container')) {
      const content = view.innerHTML;
      view.innerHTML = `<div class="mobile-container">${content}</div>`;
    }
  });
});

// Recriar bottom nav ao redimensionar
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768 && !document.querySelector('.bottom-nav')) {
    criarBottomNav();
  } else if (window.innerWidth > 768 && document.querySelector('.bottom-nav')) {
    document.querySelector('.bottom-nav')?.remove();
  }
});
