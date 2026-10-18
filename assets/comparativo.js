// assets/comparativo.js
// Modal interativo de análise comparativa entre 1º e 2º Turno (2026)
// Compara evolução de votos (aumentaram ou diminuíram) para Presidente e Governadores (DF e Estados)

(function () {
  let comparativoData = null;
  let activeTab = 'gov_df'; // 'gov_df', 'presidente', 'estados'
  let activeDfSubTab = 'ras'; // 'ras', 'zonas'
  let searchQuery = '';

  async function loadComparativoData() {
    if (comparativoData) return comparativoData;
    try {
      const res = await fetch('/comparativo_data.json');
      if (res.ok) {
        comparativoData = await res.json();
      } else {
        const res2 = await fetch('/api/comparativo');
        comparativoData = await res2.json();
      }
    } catch (err) {
      console.warn('Erro ao carregar comparativo_data.json:', err);
    }
    return comparativoData;
  }

  function ensureModal() {
    let m = document.getElementById('comparativo-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'comparativo-modal';
      m.style.position = 'fixed';
      m.style.inset = '0';
      m.style.zIndex = '99999';
      m.style.display = 'none';
      m.style.alignItems = 'center';
      m.style.justifyContent = 'center';
      m.style.background = 'rgba(0,0,0,0.85)';
      m.style.backdropFilter = 'blur(22px)';
      m.style.webkitBackdropFilter = 'blur(22px)';
      m.style.padding = '16px';
      m.style.fontFamily = 'var(--sans, system-ui)';
      m.style.color = '#FAFAF9';

      m.innerHTML = `
        <div style="background:#151412; border:1px solid rgba(255,255,255,0.18); border-radius:20px; width:100%; max-width:1150px; height:90vh; display:flex; flex-direction:column; box-shadow:0 30px 70px rgba(0,0,0,0.95); overflow:hidden;">
          
          <!-- CABEÇALHO MODAL -->
          <div style="padding:16px 22px; border-bottom:1px solid rgba(255,255,255,0.12); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.6rem;">📊</span>
              <div>
                <h2 style="margin:0; font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">
                  Comparativo Eleitoral · 1º Turno vs 2º Turno (2026)
                </h2>
                <div style="font-size:0.78rem; color:#A6A39C; margin-top:2px;">
                  Evolução dos votos de cada candidato: onde aumentaram (🟢) e onde diminuíram (🔴)
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:8px;">
              <button onclick="launchCelebrationDemo(activeTab === 'presidente' ? 'presidente' : 'gov_df')" style="all:unset; cursor:pointer; padding:7px 14px; border-radius:100px; font-weight:700; font-size:0.8rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; box-shadow:0 0 15px rgba(245,158,11,0.4); display:inline-flex; align-items:center; gap:5px;">
                🎆 Soltar Fogos do Eleito
              </button>
              <button onclick="closeComparativoModal()" style="all:unset; cursor:pointer; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); display:grid; place-items:center; color:#FAFAF9; font-size:16px; transition:background .15s;">✕</button>
            </div>
          </div>

          <!-- NAVEGAÇÃO DE ABAS PRINCIPAIS -->
          <div style="padding:10px 22px; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button id="comp-tab-gov" onclick="setComparativoTab('gov_df')" style="all:unset; cursor:pointer; padding:7px 16px; border-radius:100px; font-weight:700; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; transition:all .15s;">
              🏛️ Governador DF (35 RAs & 19 Zonas)
            </button>
            <button id="comp-tab-pres" onclick="setComparativoTab('presidente')" style="all:unset; cursor:pointer; padding:7px 16px; border-radius:100px; font-weight:700; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; transition:all .15s;">
              🇧🇷 Presidente da República (Brasil e UFs)
            </button>
            <button id="comp-tab-estados" onclick="setComparativoTab('estados')" style="all:unset; cursor:pointer; padding:7px 16px; border-radius:100px; font-weight:700; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; transition:all .15s;">
              🗺️ Estados com 2º Turno (AC, AM, ES, RN, TO)
            </button>

            <!-- CAMPO DE BUSCA -->
            <div style="margin-left:auto; position:relative; min-width:260px;">
              <input id="comp-search" type="text" placeholder="🔍 Buscar RA, Zona ou Estado..." oninput="filterComparativo(this.value)" style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:100px; padding:6px 14px 6px 32px; font-size:0.82rem; color:#FAFAF9; outline:none;" />
              <span style="position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:0.8rem; color:#A6A39C; pointer-events:none;">🔍</span>
            </div>
          </div>

          <!-- CONTEÚDO PRINCIPAL (SCROLLÁVEL) -->
          <div id="comp-content" style="flex:1; overflow-y:auto; padding:20px 24px; -webkit-overflow-scrolling:touch;"></div>
        </div>
      `;
      document.body.appendChild(m);
    }
    return m;
  }

  function setComparativoTab(tab) {
    activeTab = tab;
    renderTabsHeader();
    renderContent();
  }

  function setDfSubTab(sub) {
    activeDfSubTab = sub;
    renderContent();
  }

  function filterComparativo(query) {
    searchQuery = (query || '').toLowerCase().trim();
    renderContent();
  }

  function renderTabsHeader() {
    const bGov = document.getElementById('comp-tab-gov');
    const bPres = document.getElementById('comp-tab-pres');
    const bEst = document.getElementById('comp-tab-estados');

    const activeStyle = 'background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; box-shadow:0 0 14px rgba(2,132,199,0.5);';
    const inactiveStyle = 'background:rgba(255,255,255,0.05); color:#D6D4CF; border:1px solid rgba(255,255,255,0.1);';

    if (bGov) bGov.style.cssText = activeTab === 'gov_df' ? activeStyle : inactiveStyle;
    if (bPres) bPres.style.cssText = activeTab === 'presidente' ? activeStyle : inactiveStyle;
    if (bEst) bEst.style.cssText = activeTab === 'estados' ? activeStyle : inactiveStyle;
  }

  function renderContent() {
    const container = document.getElementById('comp-content');
    if (!container || !comparativoData) return;

    if (activeTab === 'gov_df') {
      renderGovDfTab(container);
    } else if (activeTab === 'presidente') {
      renderPresidenteTab(container);
    } else if (activeTab === 'estados') {
      renderEstadosTab(container);
    }
  }

  // RENDERIZAÇÃO: GOVERNADOR DO DF (35 RAs E 19 ZONAS)
  function renderGovDfTab(container) {
    const data = comparativoData.governoDf;
    const geral = data.geral;

    let html = `
      <!-- AVISO OFICIAL: DATA DA ELEIÇÃO DO 2º TURNO (25/10/2026) -->
      <div style="background:rgba(2,132,199,0.12); border:1px solid rgba(2,132,199,0.3); border-radius:12px; padding:10px 16px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#38bdf8;">
          <span style="font-size:1.1rem;">📅</span>
          <span><b>2º Turno em 25 de Outubro de 2026:</b> O 1º Turno (04/10) está 100% totalizado pelo TRE-DF/TSE. Esta estrutura comparativa já está pronta e será alimentada em tempo real com os votos oficiais do 2º Turno no dia 25/10!</span>
        </div>
        <span style="font-size:0.75rem; background:rgba(2,132,199,0.25); border:1px solid rgba(2,132,199,0.5); padding:3px 10px; border-radius:100px; color:#fff; font-weight:700;">
          Eleição: 25/10/2026
        </span>
      </div>

      <!-- BANNER DE RESUMO GERAL DO DF -->
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:18px 20px; margin-bottom:20px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; align-items:center;">
        <div>
          <div style="font-size:0.75rem; color:#38bdf8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Votação Total Consolidada no Distrito Federal</div>
          <h3 style="margin:4px 0 0; font-size:1.35rem; font-weight:800; color:#fff;">Eleição para Governador · 1º vs 2º Turno</h3>
          <div style="font-size:0.8rem; color:#A6A39C; margin-top:2px;">Total de Seções: 6.969 apuradas no DF (100,00%)</div>
        </div>

        <!-- CARDS GERAIS CELINA & GRASS -->
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          ${geral.map(c => `
            <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.04); border:1px solid ${c.eleito ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}; border-left:4px solid ${c.cor}; border-radius:12px; padding:12px 14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <b style="font-size:0.95rem; color:#fff;">${c.nome}</b>
                ${c.eleito ? '<span style="font-size:0.7rem; background:#f59e0b22; color:#fbbf24; border:1px solid #f59e0b55; padding:2px 8px; border-radius:100px; font-weight:800;">🏆 Eleita 2ºT</span>' : ''}
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#A6A39C; margin-bottom:2px;">
                <span>1ºT: <b style="color:#D6D4CF;">${c.votos1t.toLocaleString('pt-BR')}</b> (${c.pct1t}%)</span>
                <span>2ºT: <b style="color:#fff;">${c.votos2t.toLocaleString('pt-BR')}</b> (${c.pct2t}%)</span>
              </div>
              <div style="margin-top:6px; display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:6px; font-size:0.78rem; font-weight:800; background:${c.aumentou ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color:${c.aumentou ? '#22c55e' : '#ef4444'}; border:1px solid ${c.aumentou ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};">
                ${c.aumentou ? '🟢 Aumentou +' : '🔴 Diminuiu '}${Math.abs(c.deltaVotos).toLocaleString('pt-BR')} votos (+${c.deltaPctVotos}%)
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SUB-TOGGLE: 35 RAs vs 19 ZONAS -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <div style="display:inline-flex; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:100px; padding:3px;">
          <button onclick="setDfSubTab('ras')" style="all:unset; cursor:pointer; padding:6px 14px; border-radius:100px; font-size:0.82rem; font-weight:700; background:${activeDfSubTab === 'ras' ? '#0284c7' : 'transparent'}; color:${activeDfSubTab === 'ras' ? '#fff' : '#A6A39C'};">
            🏛️ 35 Regiões Administrativas
          </button>
          <button onclick="setDfSubTab('zonas')" style="all:unset; cursor:pointer; padding:6px 14px; border-radius:100px; font-size:0.82rem; font-weight:700; background:${activeDfSubTab === 'zonas' ? '#0284c7' : 'transparent'}; color:${activeDfSubTab === 'zonas' ? '#fff' : '#A6A39C'};">
            📍 19 Zonas Eleitorais Oficiais (TSE)
          </button>
        </div>
        <div style="font-size:0.8rem; color:#A6A39C;">
          Clique em qualquer item para ver detalhes
        </div>
      </div>
    `;

    // LISTAGEM DOS ITENS (RAs OU ZONAS)
    const list = activeDfSubTab === 'ras' ? data.regioesAdministrativas : data.zonas;
    const filtered = list.filter(item => {
      if (!searchQuery) return true;
      const text = `${item.nome} ${item.codigo || ''} ${item.zona ? 'zona ' + item.zona : ''} ${item.ras || ''}`.toLowerCase();
      return text.includes(searchQuery);
    });

    html += `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:12px;">`;

    filtered.forEach(item => {
      const isZ18 = item.zona === 18 || (item.codigo === 'RA XIV' || item.codigo === 'RA XXVII');
      html += `
        <div style="background:rgba(255,255,255,0.025); border:1px solid ${isZ18 ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.07)'}; border-radius:14px; padding:14px; box-shadow:0 4px 15px rgba(0,0,0,0.25); position:relative;">
          ${isZ18 ? '<div style="position:absolute; top:10px; right:12px; font-size:0.7rem; background:#10b98122; border:1px solid #10b98155; color:#34d399; padding:2px 8px; border-radius:100px; font-weight:700;">⭐ 18ª ZE Oficial</div>' : ''}
          <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:8px;">
            <b style="font-size:1rem; color:#fff;">${item.codigo ? item.codigo + ' - ' : 'Zona ' + item.zona + ' — '}${item.nome}</b>
          </div>
          <div style="font-size:0.75rem; color:#A6A39C; margin-bottom:12px;">
            ${item.secoes ? item.secoes + ' seções' : ''} ${item.eleitorado ? '· Eleitorado: ' + item.eleitorado.toLocaleString('pt-BR') : ''}
          </div>

          <!-- COMPARATIVO DOS 2 CANDIDATOS -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${item.candidatos.map(c => `
              <div style="background:rgba(255,255,255,0.02); border-left:3px solid ${c.cor}; border-radius:6px; padding:8px 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                  <span style="font-size:0.85rem; font-weight:700; color:#fff;">${c.nome} (${c.partido})</span>
                  <span style="font-size:0.75rem; font-weight:800; color:${c.aumentou ? '#22c55e' : '#ef4444'};">
                    ${c.aumentou ? '🟢 +' : '🔴 '}${c.deltaVotos.toLocaleString('pt-BR')} (${c.deltaPctVotos > 0 ? '+' : ''}${c.deltaPctVotos}%)
                  </span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:#A6A39C;">
                  <span>1º Turno: <b style="color:#D6D4CF;">${c.votos1t.toLocaleString('pt-BR')}</b> (${c.pct1t}%)</span>
                  <span>2º Turno: <b style="color:#fff;">${c.votos2t.toLocaleString('pt-BR')}</b> (${c.pct2t}%)</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // RENDERIZAÇÃO: PRESIDENTE DA REPÚBLICA (BRASIL E 28 UFs)
  function renderPresidenteTab(container) {
    const data = comparativoData.presidente;
    const nacional = data.nacional;

    let html = `
      <!-- AVISO OFICIAL: DATA DA ELEIÇÃO DO 2º TURNO (25/10/2026) -->
      <div style="background:rgba(2,132,199,0.12); border:1px solid rgba(2,132,199,0.3); border-radius:12px; padding:10px 16px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#38bdf8;">
          <span style="font-size:1.1rem;">📅</span>
          <span><b>2º Turno Presidencial em 25 de Outubro de 2026:</b> O 1º Turno (04/10) está 100% totalizado pelo TSE. No dia 25/10, assim que os votos do 2º Turno forem apurados, o comparativo e a festa de fogos serão acionados em tempo real!</span>
        </div>
        <span style="font-size:0.75rem; background:rgba(2,132,199,0.25); border:1px solid rgba(2,132,199,0.5); padding:3px 10px; border-radius:100px; color:#fff; font-weight:700;">
          Eleição: 25/10/2026
        </span>
      </div>

      <!-- BANNER DE RESUMO BRASIL -->
      <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:18px 20px; margin-bottom:20px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; align-items:center;">
        <div>
          <div style="font-size:0.75rem; color:#38bdf8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Votação Consolidada Brasil & Exterior</div>
          <h3 style="margin:4px 0 0; font-size:1.35rem; font-weight:800; color:#fff;">Eleição Presidencial · 1º vs 2º Turno</h3>
          <div style="font-size:0.8rem; color:#A6A39C; margin-top:2px;">Total de Seções: 499.248 apuradas no TSE (100,00%)</div>
        </div>

        <!-- CARDS GERAIS BOLSONARO & LULA -->
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          ${nacional.map(c => `
            <div style="flex:1; min-width:200px; background:rgba(255,255,255,0.04); border:1px solid ${c.eleito ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}; border-left:4px solid ${c.cor}; border-radius:12px; padding:12px 14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <b style="font-size:0.95rem; color:#fff;">${c.nome}</b>
                ${c.eleito ? '<span style="font-size:0.7rem; background:#f59e0b22; color:#fbbf24; border:1px solid #f59e0b55; padding:2px 8px; border-radius:100px; font-weight:800;">🏆 Eleito Presidente</span>' : ''}
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#A6A39C; margin-bottom:2px;">
                <span>1ºT: <b style="color:#D6D4CF;">${c.votos1t.toLocaleString('pt-BR')}</b> (${c.pct1t}%)</span>
                <span>2ºT: <b style="color:#fff;">${c.votos2t.toLocaleString('pt-BR')}</b> (${c.pct2t}%)</span>
              </div>
              <div style="margin-top:6px; display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:6px; font-size:0.78rem; font-weight:800; background:${c.aumentou ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color:${c.aumentou ? '#22c55e' : '#ef4444'}; border:1px solid ${c.aumentou ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};">
                ${c.aumentou ? '🟢 Aumentou +' : '🔴 Diminuiu '}${Math.abs(c.deltaVotos).toLocaleString('pt-BR')} votos (+${c.deltaPctVotos}%)
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- LISTA DE ESTADOS DO BRASIL (27 UFs + ZZ) -->
      <h4 style="margin:0 0 12px; font-size:0.95rem; font-weight:700; color:#fff;">Comparativo por Unidade da Federação (27 Estados + Exterior)</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:12px;">
    `;

    const ufsList = (data.ufs || []).filter(u => {
      if (!searchQuery) return true;
      return `${u.nome} ${u.uf}`.toLowerCase().includes(searchQuery);
    });

    ufsList.forEach(u => {
      html += `
        <div style="background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:14px; box-shadow:0 4px 15px rgba(0,0,0,0.25);">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
            <b style="font-size:1rem; color:#fff;">${u.nome} (${u.uf})</b>
            <span style="font-size:0.72rem; color:#A6A39C;">${u.secoes ? u.secoes + ' seções' : ''}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${u.candidatos.map(c => `
              <div style="background:rgba(255,255,255,0.02); border-left:3px solid ${c.cor}; border-radius:6px; padding:8px 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                  <span style="font-size:0.85rem; font-weight:700; color:#fff;">${c.nome}</span>
                  <span style="font-size:0.75rem; font-weight:800; color:${c.aumentou ? '#22c55e' : '#ef4444'};">
                    ${c.aumentou ? '🟢 +' : '🔴 '}${c.deltaVotos.toLocaleString('pt-BR')} (${c.deltaPctVotos > 0 ? '+' : ''}${c.deltaPctVotos}%)
                  </span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:#A6A39C;">
                  <span>1ºT: <b style="color:#D6D4CF;">${c.votos1t.toLocaleString('pt-BR')}</b> (${c.pct1t}%)</span>
                  <span>2ºT: <b style="color:#fff;">${c.votos2t.toLocaleString('pt-BR')}</b> (${c.pct2t}%)</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // RENDERIZAÇÃO: ESTADOS COM 2º TURNO (AC, AM, ES, RN, TO)
  function renderEstadosTab(container) {
    const estados = comparativoData.estados || [];

    let html = `
      <div style="margin-bottom:16px;">
        <h3 style="margin:0 0 4px; font-size:1.15rem; font-weight:800; color:#fff;">
          Disputas de 2º Turno para Governador nos Estados
        </h3>
        <div style="font-size:0.8rem; color:#A6A39C;">
          Estados onde nenhum candidato atingiu mais de 50% dos votos válidos no 1º turno
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:16px;">
    `;

    estados.forEach(est => {
      html += `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <b style="font-size:1.1rem; color:#fff;">${est.nome} (${est.uf})</b>
            <button onclick="triggerStateCelebration('${est.uf}', '${est.candidatos[0].nome}', '${est.nome}')" style="all:unset; cursor:pointer; font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:100px; background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.45); color:#fbbf24;">
              🎆 Celebrar Eleito
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            ${est.candidatos.map(c => `
              <div style="background:rgba(255,255,255,0.02); border-left:4px solid ${c.cor}; border-radius:8px; padding:10px 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <b style="font-size:0.9rem; color:#fff;">${c.nome} (${c.partido})</b>
                  ${c.eleito ? '<span style="font-size:0.68rem; background:#f59e0b22; color:#fbbf24; border:1px solid #f59e0b55; padding:1px 6px; border-radius:4px; font-weight:800;">🏆 Eleito</span>' : ''}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#A6A39C; margin-bottom:4px;">
                  <span>1ºT: <b style="color:#D6D4CF;">${c.votos1t.toLocaleString('pt-BR')}</b> (${c.pct1t}%)</span>
                  <span>2ºT: <b style="color:#fff;">${c.votos2t.toLocaleString('pt-BR')}</b> (${c.pct2t}%)</span>
                </div>
                <div style="font-size:0.75rem; font-weight:700; color:${c.aumentou ? '#22c55e' : '#ef4444'};">
                  ${c.aumentou ? '🟢 Aumentou +' : '🔴 Diminuiu '}${Math.abs(c.deltaVotos).toLocaleString('pt-BR')} votos (${c.deltaPctVotos > 0 ? '+' : ''}${c.deltaPctVotos}%)
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  function triggerStateCelebration(uf, name, estadoNome) {
    if (window.triggerVictoryCelebration) {
      window.triggerVictoryCelebration({
        name: name,
        cargo: `Governador(a) Eleito(a) de ${estadoNome} (${uf})`,
        partido: "TSE",
        numero: "",
        pct: "Vitória 2ºT",
        votos: "Totalização Concluída",
        cor: "#f59e0b",
        desc: `Celebração oficial de vitória no 2º Turno das Eleições 2026 no estado de ${estadoNome}.`
      });
    }
  }

  // Abertura e Fechamento do Modal
  async function openComparativoModal(initialTab = 'gov_df') {
    ensureModal();
    activeTab = initialTab;
    await loadComparativoData();
    renderTabsHeader();
    renderContent();
    const m = document.getElementById('comparativo-modal');
    if (m) m.style.display = 'flex';
  }

  function closeComparativoModal() {
    const m = document.getElementById('comparativo-modal');
    if (m) m.style.display = 'none';
  }

  // Exportações Globais
  window.openComparativoModal = openComparativoModal;
  window.closeComparativoModal = closeComparativoModal;
  window.setComparativoTab = setComparativoTab;
  window.setDfSubTab = setDfSubTab;
  window.filterComparativo = filterComparativo;
  window.triggerStateCelebration = triggerStateCelebration;

  console.log('[Comparativo 1º vs 2º Turno Loaded]: Sistema comparativo pronto!');
})();
