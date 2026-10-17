// Dossiê Eleitoral Oficial TRE-DF / TSE - Marcela Passamani (15555) & 35 RAs do DF
// Integrado com a Abrangência Territorial Oficial da 18ª Zona Eleitoral e os 37 Colégios Eleitorais

window.dfGlobalData = null;
window.selectedRaId = 'all';
window.selectedZona = 'all';
window.selectedTipo = 'all';
window.currentTab = 'marcela';
window.viewModeZ18 = 'locais'; // 'locais' ou 'secoes'

// Abrangência Territorial Oficial da 18ª Zona Eleitoral (Decreto TRE-DF)
window.ZONA_18_ABRANGENCIA = {
  lagoSul: [
    "QIs", "QLs", "Setor de Chácaras do Lago Sul", "Mansões Dom Bosco do Lago Sul", 
    "Mini Chácaras do Lago Sul", "Núcleo Rural PADF", "Pousada das Andorinhas", 
    "Villages Alvorada", "Condomínio Parque do Mirante", "Condomínio Del Rey", 
    "Condomínio Santa Bárbara", "Condomínio Santa Mônica", "Condomínio Residencial Mônaco", 
    "Privê Morada Sul", "Solar da Serra", "Solar de Brasília"
  ],
  jardimBotanico: [
    "Vila do Boa", "Carlos Teóphilo de Souza", "Chácaras Lago Sul", "Ecológico Village III", 
    "Estância Jardim Botânico", "Estância Quintas da Alvorada", "Jardim Botânico I, V e VI", 
    "Jardim do Lago Quadras 01, 02 e 09", "Lago Sul I", "Mansões Belvedere Green", 
    "Mansões Brauna", "Mansões Califórnia", "Mansões Itapú", "Mansões Lago Sul II", 
    "Mansões Serrana-Chácaras", "Mirantes das Paineiras", "Morada de Deus", 
    "Ouro Vermelho I e II", "Parque dos Pinheiros", "Parque Jardim das Paineiras", 
    "Portal do Lago Sul", "Prive Morada Sul Etapas A, B e C", "Quinta dos Ipês-Chácaras", 
    "Quintas Bela Vista", "Quintas da Alvorada I, II e III", "Quintas das Colinas", 
    "Quintas do Sol", "Quintas Interlagos", "Residencial Jardim dos Eucaliptos", 
    "Rural Itaipu", "San Diego", "São Mateus", "Solar da Serra I, II e III", 
    "Solar de Brasília", "Verde", "Via Gênova", "Vila da Mata", "Vila Vitória", 
    "Village da Alvorada I e II", "Ville de Montagne", "Vivendas Del Rey"
  ],
  saoSebastiao: [
    "Bela Vista", "Bom Sucesso", "Central", "João Cândido", "Residencial do Bosque", 
    "Residencial Oeste", "São Bartolomeu", "São Francisco", "São José", "Tradicional", 
    "Vila Nova", "Chácaras Barreiros I e II", "Mont Alverne", "Morro Azul", 
    "Núcleo Rural Jardim II", "Café sem Troco", "Morro da Cruz", 
    "Privê Residencial Mônaco", "Residencial Vitória RA XIV", "Jardins Mangueiral", 
    "Mansões Itaipu", "Fazenda Taboquinha", "Núcleo Rural Barreiros"
  ]
};

async function initDfData() {
  try {
    const res = await fetch('/api/df/distritais');
    window.dfGlobalData = await res.json();
    populateDfSelectors();
    renderDfView();
  } catch(e) {
    console.warn('[DF Distritais] Erro ao carregar dados:', e);
  }
}

function populateDfSelectors() {
  if (!window.dfGlobalData) return;
  const selRa = document.getElementById('df-ra-select');
  if (selRa) {
    selRa.innerHTML = '<option value="all">Todas as 35 RAs (DF Completo)</option>';
    window.dfGlobalData.regioesAdministrativas.forEach(ra => {
      const opt = document.createElement('option');
      opt.value = String(ra.id);
      opt.textContent = ra.codigo + ' - ' + ra.nome + ' (' + (ra.votosMarcelaPassamani ? ra.votosMarcelaPassamani.toLocaleString('pt-BR') + ' votos Marcela' : '') + ')';
      selRa.appendChild(opt);
    });
  }

  const selZona = document.getElementById('df-zona-select');
  if (selZona) {
    selZona.innerHTML = '<option value="all">Todas as 19 Zonas Eleitorais</option>';
    selZona.innerHTML += '<option value="18" style="font-weight:bold; color:#34d399;">⭐ 18ª ZE (São Sebastião, Jardim Botânico & Lago Sul - 841 votos)</option>';
    window.dfGlobalData.marcelaPassamaniDossie.votosPorZona.forEach(z => {
      if (z.zona !== 18) {
        const opt = document.createElement('option');
        opt.value = String(z.zona);
        opt.textContent = 'Zona ' + z.zona + ' (' + z.nome + ') · ' + z.votos.toLocaleString('pt-BR') + ' votos';
        selZona.appendChild(opt);
      }
    });
  }
}

function selectDfRa(id) {
  window.selectedRaId = id;
  const sel = document.getElementById('df-ra-select');
  if (sel) sel.value = id;
  renderDfView();
  if (window.innerWidth <= 900) {
    setMobileSubTab('colegios');
  }
}

function selectDfZona(z) {
  window.selectedZona = z;
  const sel = document.getElementById('df-zona-select');
  if (sel) sel.value = z;
  renderDfView();
}

function selectDfTipo(tipo) {
  window.selectedTipo = tipo;
  const sel = document.getElementById('df-tipo-select');
  if (sel) sel.value = tipo;
  renderDfView();
}

function quickFilterZona18() {
  openDfModal('all');
  setDfTab('marcela');
  window.selectedZona = '18';
  window.selectedTipo = 'all';
  const selZ = document.getElementById('df-zona-select');
  if (selZ) selZ.value = '18';
  const selT = document.getElementById('df-tipo-select');
  if (selT) selT.value = 'all';
  renderDfView();
}

function quickFilterTipo(tipo) {
  openDfModal('all');
  setDfTab('marcela');
  window.selectedTipo = tipo;
  const selT = document.getElementById('df-tipo-select');
  if (selT) selT.value = tipo;
  renderDfView();
}

function resetAllFilters() {
  window.selectedRaId = 'all';
  window.selectedZona = 'all';
  window.selectedTipo = 'all';
  const s1 = document.getElementById('df-ra-select'); if (s1) s1.value = 'all';
  const s2 = document.getElementById('df-zona-select'); if (s2) s2.value = 'all';
  const s3 = document.getElementById('df-tipo-select'); if (s3) s3.value = 'all';
  const si = document.getElementById('df-search-input'); if (si) si.value = '';
  renderDfView();
}

function setDfTab(tab) {
  window.currentTab = tab;
  const bGeral = document.getElementById('tab-geral');
  const bMarcela = document.getElementById('tab-marcela');
  if (bGeral && bMarcela) {
    if (tab === 'marcela') {
      bMarcela.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      bMarcela.style.color = '#fff';
      bMarcela.style.border = 'none';
      bGeral.style.background = 'transparent';
      bGeral.style.color = 'rgba(255,255,255,0.6)';
    } else {
      bGeral.style.background = 'rgba(255,255,255,0.15)';
      bGeral.style.color = '#fff';
      bMarcela.style.background = 'transparent';
      bMarcela.style.color = '#f59e0b';
      bMarcela.style.border = '1px solid rgba(245,158,11,0.5)';
    }
  }
  renderDfView();
}

function setMobileSubTab(tab) {
  const left = document.getElementById('df-left-pane');
  const right = document.getElementById('df-right-pane');
  const bDossie = document.getElementById('btn-mobile-tab-dossie');
  const bColegios = document.getElementById('btn-mobile-tab-colegios');
  if (!left || !right) return;
  if (tab === 'dossie') {
    left.style.display = 'block';
    right.style.display = 'none';
    if (bDossie) {
      bDossie.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      bDossie.style.color = '#fff';
    }
    if (bColegios) {
      bColegios.style.background = 'rgba(255,255,255,0.08)';
      bColegios.style.color = '#D6D4CF';
    }
  } else {
    left.style.display = 'none';
    right.style.display = 'block';
    if (bColegios) {
      bColegios.style.background = '#10b981';
      bColegios.style.color = '#fff';
    }
    if (bDossie) {
      bDossie.style.background = 'rgba(255,255,255,0.08)';
      bDossie.style.color = '#D6D4CF';
    }
  }
}

function openMarcelaDossie() {
  openDfModal('all');
  setDfTab('marcela');
  if (window.innerWidth <= 900) {
    setMobileSubTab('dossie');
  }
}

function openDfModal(raId = 'all') {
  const m = document.getElementById('df-distritais-modal');
  if (m) {
    m.style.display = 'flex';
    window.selectedRaId = raId;
    const sel = document.getElementById('df-ra-select');
    if (sel) sel.value = raId;
    if (window.innerWidth <= 900) {
      setMobileSubTab('dossie');
    }
    if (!window.dfGlobalData) initDfData();
    else renderDfView();
  }
}

function closeDfModal() {
  const m = document.getElementById('df-distritais-modal');
  if (m) m.style.display = 'none';
}

function filterDfData() {
  const q = (document.getElementById('df-search-input').value || '').toLowerCase().trim();
  if (q.includes('marcela') || q.includes('15555')) {
    setDfTab('marcela');
  }
  renderDfView(q);
}

function setZ18ViewMode(mode) {
  window.viewModeZ18 = mode;
  renderDfView();
}

function renderDfView(filterQuery = '') {
  if (!window.dfGlobalData) return;
  const leftCol = document.getElementById('df-left-content');
  const rightCol = document.getElementById('df-secoes-list');
  const secoesTitle = document.getElementById('df-secoes-title');
  const secoesSubtitle = document.getElementById('df-secoes-subtitle');
  const secoesCount = document.getElementById('df-secoes-count');

  let activeRas = window.dfGlobalData.regioesAdministrativas;
  if (window.selectedRaId !== 'all') {
    activeRas = activeRas.filter(ra => String(ra.id) === String(window.selectedRaId));
  }

  // --- RENDER LEFT COLUMN ---
  if (window.currentTab === 'marcela') {
    const d = window.dfGlobalData.marcelaPassamaniDossie;
    let rasTableHtml = '';
    (d.votosPorRa || []).forEach((r, idx) => {
      const isZ18Ra = (r.id === 14 || r.id === 27 || r.id === 16);
      rasTableHtml += `
        <div onclick="selectDfRa('${r.id}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:${isZ18Ra ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)'}; border-radius:8px; margin-bottom:4px; border-left:3px solid ${isZ18Ra ? '#10b981' : '#f59e0b'}; transition:background .15s;">
          <div>
            <div style="font-weight:600; font-size:0.8rem; color:#fff;">${idx + 1}º ${r.codigo} - ${r.nome} ${isZ18Ra ? '⭐' : ''}</div>
            <div style="font-size:0.7rem; color:#A6A39C;">${r.zonas} · ${r.secoes} seções</div>
          </div>
          <div style="text-align:right;">
            <b style="font-size:0.85rem; color:#f59e0b;">${r.votosMarcela.toLocaleString('pt-BR')} votos</b>
            <div style="font-size:0.7rem; color:#22c55e;">${r.percentualRa}</div>
          </div>
        </div>`;
    });

    let zonasTableHtml = '';
    (d.votosPorZona || []).forEach(z => {
      const is18 = (z.zona === 18);
      zonasTableHtml += `
        <div onclick="selectDfZona('${z.zona}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:6px 8px; font-size:0.75rem; border-bottom:1px solid rgba(255,255,255,0.04); background:${is18 ? 'rgba(16,185,129,0.15)' : 'transparent'}; border-radius:6px;">
          <span style="color:${is18 ? '#34d399' : '#D6D4CF'}; font-weight:${is18 ? '700' : '500'};">
            ${is18 ? '⭐ ' : ''}Zona ${z.zona} (${z.nome})
          </span>
          <span><b style="color:#f59e0b;">${z.votos.toLocaleString('pt-BR')}</b> <span style="color:#A6A39C;">(${z.percentual})</span></span>
        </div>`;
    });

    // Bloco detalhado de Abrangência Territorial da Zona 18
    const z18TerritorialBox = `
      <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.35); border-radius:10px; padding:12px; margin-bottom:14px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <b style="font-size:0.82rem; color:#34d399; display:flex; align-items:center; gap:5px;">
            <span>📍</span><span>Abrangência Territorial Oficial · 18ª Zona (TRE-DF)</span>
          </b>
          <span style="font-size:0.7rem; background:#10b98125; color:#34d399; border:1px solid #10b98144; padding:2px 8px; border-radius:100px; font-weight:700;">841 votos oficiais</span>
        </div>
        <p style="margin:0 0 6px; font-size:0.72rem; color:#D6D4CF; line-height:1.4;">
          <b>São Sebastião (RA XIV - 518 votos reais em 28 colégios):</b> Bela Vista, Bom Sucesso, Central, João Cândido, Residencial do Bosque, Residencial Oeste, São Bartolomeu, São Francisco, São José, Tradicional, Vila Nova, Chácaras Barreiros I e II, Mont Alverne, Morro Azul, Núcleo Rural Jardim II, Café sem Troco, Morro da Cruz, Privê Residencial Mônaco, Residencial Vitória, Jardins Mangueiral, Mansões Itaipu, Fazenda Taboquinha, Núcleo Rural Barreiros, Cerâmica São Paulo, Cerâmica da Bênção, Vila do Boa, Nova Betânia, PAD-DF, Agrovila e Papuda.
        </p>
        <p style="margin:0 0 6px; font-size:0.72rem; color:#D6D4CF; line-height:1.4;">
          <b>Jardim Botânico (RA XXVII - 162 votos em 4 colégios):</b> Colégio Presbiteriano Mackenzie (73), Centro Educacional Jardins Mangueiral (48), Heavenly International School (31), Kingdom School (10). Condomínios: Estância Jardim Botânico, Quintas da Alvorada, Jardim Botânico I, V e VI, Jardim do Lago, Ouro Vermelho, Solar da Serra, Solar de Brasília e Ville de Montagne.
        </p>
        <p style="margin:0; font-size:0.72rem; color:#D6D4CF; line-height:1.4;">
          <b>Lago Sul (RA XVI na 18ª ZE - 161 votos em 5 colégios):</b> Escola das Nações (82), Centro Educacional Lago Sul - CEL (31), Escola Francesa François Mitterrand (28), Escola Classe 01 SHI Sul (10) e Colégio Maria Imaculada (10).
        </p>
      </div>
    `;

    leftCol.innerHTML = `
      <!-- PERFIL CARD MARCELA PASSAMANI -->
      <div style="background:linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.08)); border:1px solid rgba(245,158,11,0.45); border-radius:12px; padding:14px; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
          <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); display:grid; place-items:center; font-weight:700; font-size:1.1rem; color:#fff; box-shadow:0 0 12px rgba(245,158,11,0.5);">
            MP
          </div>
          <div>
            <div style="font-size:1.15rem; font-weight:700; color:#fff;">Marcela Passamani</div>
            <div style="font-size:0.8rem; color:#f59e0b; font-weight:600;">MDB · Número 15555 · 29ª Colocada Geral no DF (1ª Suplente)</div>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
          <div style="background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:8px;">
            <div style="font-size:0.7rem; color:#A6A39C;">Total Geral DF</div>
            <div style="font-size:1.15rem; font-weight:700; color:#fff;">${(d.totalVotos || 16622).toLocaleString('pt-BR')}</div>
            <div style="font-size:0.65rem; color:#22c55e;">Votação Consolidada Oficial</div>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:8px;">
            <div style="font-size:0.7rem; color:#A6A39C;">Posição Geral DF</div>
            <div style="font-size:1.15rem; font-weight:700; color:#f59e0b;">29º Lugar</div>
            <div style="font-size:0.65rem; color:#A6A39C;">29ª mais votada entre 800+ candidatos</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); padding:8px 10px; border-radius:8px;">
            <div style="font-size:0.7rem; color:#34d399;">Votos Zona Rural</div>
            <div style="font-size:1.05rem; font-weight:700; color:#4ade80;">1.439 votos</div>
            <div style="font-size:0.65rem; color:#A6A39C;">PAD-DF, Café s/ Troco, etc</div>
          </div>
          <div style="background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.3); padding:8px 10px; border-radius:8px;">
            <div style="font-size:0.7rem; color:#60a5fa;">Votos Zona Urbana</div>
            <div style="font-size:1.05rem; font-weight:700; color:#93c5fd;">15.183 votos</div>
            <div style="font-size:0.65rem; color:#A6A39C;">Centros Urbanos do DF</div>
          </div>
        </div>
      </div>

      ${z18TerritorialBox}

      <!-- VOTAÇÃO POR RA -->
      <div style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <b style="font-size:0.85rem; color:#FAFAF9;">Votação nas 35 RAs (Ranking):</b>
          <span style="font-size:0.7rem; color:#A6A39C;">Clique para filtrar</span>
        </div>
        <div style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:2px;">
          ${rasTableHtml}
        </div>
      </div>

      <!-- VOTAÇÃO POR ZONA ELEITORAL -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <b style="font-size:0.85rem; color:#FAFAF9;">Votação por Zona Eleitoral:</b>
          <span style="font-size:0.7rem; color:#34d399;">18ª ZE em destaque</span>
        </div>
        <div style="max-height:150px; overflow-y:auto;">
          ${zonasTableHtml}
        </div>
      </div>
    `;
  } else {
    // TAB QUADRO GERAL
    let candsHtml = '';
    const candList = window.dfGlobalData.candidatosDestaque || [];
    candList.forEach((c, idx) => {
      const isM = (c.numero === '15555');
      candsHtml += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:${isM ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)'}; border-radius:8px; margin-bottom:6px; border-left:3px solid ${c.cor}; border:${isM ? '1px solid rgba(245,158,11,0.4)' : 'none'};">
          <div>
            <div style="font-weight:700; font-size:0.85rem; color:${isM ? '#f59e0b' : '#fff'};">${idx + 1}º ${c.nome} ${isM ? '⭐' : ''}</div>
            <div style="font-size:0.75rem; color:#A6A39C;">${c.partido} ${c.numero} · ${c.situacao}</div>
          </div>
          <div style="text-align:right;">
            <b style="font-size:0.95rem; color:${c.cor};">${c.totalVotos.toLocaleString('pt-BR')}</b>
            <div style="font-size:0.7rem; color:${c.eleito ? '#22c55e' : '#f59e0b'};">${c.eleito ? 'Eleito' : c.situacao}</div>
          </div>
        </div>`;
    });

    leftCol.innerHTML = `
      <div style="margin-bottom:12px;">
        <h3 style="margin:0 0 4px; font-size:0.95rem; color:#fff;">Quadro dos Mais Votados (DF)</h3>
        <p style="margin:0; font-size:0.75rem; color:#A6A39C;">Total apurado: 1.684.210 votos nominais válidos</p>
      </div>
      <div style="display:flex; flex-direction:column;">
        ${candsHtml}
      </div>
    `;
  }

  // --- RENDER RIGHT COLUMN (COLÉGIOS ELEITORAIS E SEÇÕES) ---
  const z18Det = window.dfGlobalData.marcelaPassamaniDossie?.zona18Detalhamento;

  if (window.selectedZona === '18' && window.viewModeZ18 === 'locais' && z18Det) {
    // VISUALIZAÇÃO AGRUPADA DOS 37 COLÉGIOS ELEITORAIS DA ZONA 18
    let locais = z18Det.locais || [];

    if (window.selectedTipo !== 'all') {
      locais = locais.filter(l => l.tipo === window.selectedTipo);
    }

    if (filterQuery) {
      locais = locais.filter(l => {
        const q = filterQuery.toLowerCase();
        return l.local.toLowerCase().includes(q) || l.ra.toLowerCase().includes(q) || l.tipo.toLowerCase().includes(q);
      });
    }

    secoesTitle.textContent = `⭐ 37 Colégios Eleitorais da 18ª Zona Eleitoral (TRE-DF)`;
    secoesSubtitle.textContent = `841 votos oficiais de Marcela Passamani mapeados em todas as 431 seções eleitorais`;
    secoesCount.textContent = `${locais.length} colégios exibidos`;

    let html = `
      <div style="display:flex; gap:10px; margin-bottom:12px; align-items:center;">
        <button onclick="setZ18ViewMode('locais')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:700; padding:4px 12px; border-radius:100px; background:#10b981; color:#fff;">
          🏫 Ver os 37 Colégios (Ranking)
        </button>
        <button onclick="setZ18ViewMode('secoes')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:600; padding:4px 12px; border-radius:100px; background:rgba(255,255,255,0.08); color:#FAFAF9;">
          🗳️ Ver Todas as 431 Seções
        </button>
      </div>
    `;

    locais.forEach((loc, idx) => {
      const isRural = (loc.tipo === 'Rural');
      const badgeTipo = isRural
        ? '<span style="font-size:0.7rem; background:#22c55e22; color:#4ade80; border:1px solid #22c55e44; padding:2px 8px; border-radius:100px; font-weight:600;">🌾 Zona Rural</span>'
        : '<span style="font-size:0.7rem; background:#3b82f622; color:#60a5fa; border:1px solid #3b82f644; padding:2px 8px; border-radius:100px; font-weight:600;">🏙️ Zona Urbana</span>';

      html += `
        <div style="background:rgba(255,255,255,0.02); border:1px solid ${isRural ? 'rgba(34,197,94,0.35)' : 'rgba(16,185,129,0.3)'}; border-radius:10px; padding:12px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:0.95rem; font-weight:700; color:#fff;">${idx + 1}º ${loc.local}</span>
                ${badgeTipo}
              </div>
              <div style="font-size:0.75rem; color:#A6A39C; margin-top:3px;">
                📍 Região: <b>${loc.ra}</b> · 18ª Zona Eleitoral · <b>${loc.totalSecoes} seções</b>
              </div>
            </div>
            <div style="text-align:right;">
              <b style="font-size:1.05rem; color:#f59e0b;">${loc.totalVotosMarcela} votos</b>
              <div style="font-size:0.7rem; color:#22c55e;">Marcela Passamani (15555)</div>
            </div>
          </div>
        </div>`;
    });

    rightCol.innerHTML = html;
    return;
  }

  // MODO SEÇÕES INDIVIDUAIS
  let allSecoes = [];
  activeRas.forEach(ra => {
    (ra.secoesDetalhe || []).forEach(sec => {
      allSecoes.push(Object.assign({}, sec, {
        raNome: ra.nome,
        raCodigo: ra.codigo
      }));
    });
  });

  // Filtro por Zona
  if (window.selectedZona !== 'all') {
    allSecoes = allSecoes.filter(sec => {
      const zNum = String(sec.zona).replace(/[^0-9]/g, '');
      return zNum === String(window.selectedZona);
    });
  }

  // Filtro por Tipo de Área
  if (window.selectedTipo !== 'all') {
    allSecoes = allSecoes.filter(sec => {
      const isRural = (sec.tipo === 'Rural' || (sec.colegioEleitoral || '').toLowerCase().includes('rural') || (sec.endereco || '').toLowerCase().includes('br-') || (sec.endereco || '').toLowerCase().includes('df-') || (sec.colegioEleitoral || '').toLowerCase().includes('café sem troco') || (sec.colegioEleitoral || '').toLowerCase().includes('pad-df') || (sec.colegioEleitoral || '').toLowerCase().includes('betânia') || (sec.colegioEleitoral || '').toLowerCase().includes('morro da cruz'));
      return window.selectedTipo === 'Rural' ? isRural : !isRural;
    });
  }

  // Busca textual
  if (filterQuery) {
    allSecoes = allSecoes.filter(sec => {
      const txt = `${sec.numero} ${sec.colegioEleitoral || ''} ${sec.local || ''} ${sec.endereco || ''} ${sec.zona} ${sec.raNome} ${sec.raCodigo}`.toLowerCase();
      return txt.includes(filterQuery);
    });
  }

  if (window.selectedZona === '18') {
    secoesTitle.textContent = `⭐ 18ª Zona Eleitoral (Nossa Zona: São Sebastião, Jardim Botânico & Lago Sul)`;
    secoesSubtitle.textContent = `841 votos oficiais de Marcela Passamani mapeados em todas as 431 seções eleitorais`;
  } else if (window.selectedRaId === 'all') {
    secoesTitle.textContent = `Colégios Eleitorais e Seções de Todas as 35 Regiões Administrativas`;
    secoesSubtitle.textContent = `Exibindo seções eleitorais do Distrito Federal com detalhamento de Marcela Passamani (15555)`;
  } else {
    secoesTitle.textContent = `Colégios Eleitorais de ${activeRas[0]?.nome || ''}`;
    secoesSubtitle.textContent = `${activeRas[0]?.codigo || ''} · ${activeRas[0]?.zonas || ''}`;
  }
  secoesCount.textContent = `${allSecoes.length} seções exibidas`;

  if (allSecoes.length === 0) {
    rightCol.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#A6A39C;">
        <div style="font-size:2rem; margin-bottom:10px;">🔍</div>
        <div style="font-size:0.9rem; font-weight:600; color:#fff;">Nenhuma seção encontrada com estes filtros</div>
        <div style="font-size:0.8rem; margin-top:4px;">Tente remover o filtro de busca ou alternar entre Rural/Urbano</div>
        <button onclick="resetAllFilters()" style="all:unset; cursor:pointer; margin-top:14px; padding:6px 14px; border-radius:100px; background:rgba(255,255,255,0.1); color:#fff; font-size:0.8rem;">
          Restaurar Filtros Padrão
        </button>
      </div>`;
    return;
  }

  let toggleBtnHtml = '';
  if (window.selectedZona === '18') {
    toggleBtnHtml = `
      <div style="display:flex; gap:10px; margin-bottom:12px; align-items:center;">
        <button onclick="setZ18ViewMode('locais')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:600; padding:4px 12px; border-radius:100px; background:rgba(255,255,255,0.08); color:#FAFAF9;">
          🏫 Ver os 37 Colégios (Ranking)
        </button>
        <button onclick="setZ18ViewMode('secoes')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:700; padding:4px 12px; border-radius:100px; background:#10b981; color:#fff;">
          🗳️ Ver Todas as 431 Seções
        </button>
      </div>
    `;
  }

  let secoesHtml = toggleBtnHtml;
  allSecoes.slice(0, 100).forEach(sec => {
    const isRural = (sec.tipo === 'Rural' || (sec.colegioEleitoral || '').toLowerCase().includes('rural') || (sec.endereco || '').toLowerCase().includes('br-') || (sec.endereco || '').toLowerCase().includes('df-') || (sec.colegioEleitoral || '').toLowerCase().includes('café sem troco') || (sec.colegioEleitoral || '').toLowerCase().includes('pad-df') || (sec.colegioEleitoral || '').toLowerCase().includes('betânia') || (sec.colegioEleitoral || '').toLowerCase().includes('morro da cruz'));
    const isZ18 = (String(sec.zona).includes('18'));

    const badgeTipo = isRural 
      ? '<span style="font-size:0.7rem; background:#22c55e22; color:#4ade80; border:1px solid #22c55e44; padding:2px 8px; border-radius:100px; font-weight:600;">🌾 Zona Rural</span>'
      : '<span style="font-size:0.7rem; background:#3b82f622; color:#60a5fa; border:1px solid #3b82f644; padding:2px 8px; border-radius:100px; font-weight:600;">🏙️ Urbana</span>';

    const badgeZ18 = isZ18
      ? '<span style="font-size:0.7rem; background:#10b98125; color:#34d399; border:1px solid #10b98155; padding:2px 8px; border-radius:100px; font-weight:700;">⭐ 18ª ZE</span>'
      : '';

    secoesHtml += `
      <div style="background:rgba(255,255,255,0.02); border:1px solid ${isRural ? 'rgba(34,197,94,0.35)' : (isZ18 ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.06)')}; border-radius:10px; padding:12px; margin-bottom:8px; transition:border .15s;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.95rem; font-weight:700; color:#fff;">Seção ${sec.numero}</span>
              <span style="font-size:0.72rem; background:rgba(255,255,255,0.08); padding:2px 8px; border-radius:6px; color:#D6D4CF;">${sec.raCodigo || ''} - ${sec.raNome || ''}</span>
              ${badgeTipo}
              ${badgeZ18}
            </div>
            <div style="font-size:0.82rem; font-weight:600; color:#FAFAF9; margin-top:4px;">
              🏫 ${sec.colegioEleitoral || sec.local}
            </div>
            <div style="font-size:0.72rem; color:#A6A39C; margin-top:2px;">
              📍 ${sec.endereco || ''} · ${sec.zona}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.72rem; color:#A6A39C;">Comparecimento</div>
            <div style="font-size:0.85rem; font-weight:700; color:#fff;"><b style="color:#22c55e;">${sec.comparecimento || 0}</b> de ${sec.aptos || 0}</div>
          </div>
        </div>

        <div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:0.75rem; color:#f59e0b; font-weight:600; display:flex; align-items:center; gap:6px;">
            <span>⭐</span><span>Marcela Passamani (15555 · MDB):</span>
          </div>
          <div>
            <b style="font-size:0.85rem; color:#f59e0b;">${sec.votosMarcela || 0} votos apurados</b>
          </div>
        </div>
      </div>`;
  });

  if (allSecoes.length > 100) {
    secoesHtml += `
      <div style="text-align:center; padding:12px; color:#A6A39C; font-size:0.75rem;">
        Mostrando 100 seções de um total de ${allSecoes.length}. Use os filtros acima para refinar.
      </div>`;
  }

  rightCol.innerHTML = secoesHtml;
}

// Inicializa dados quando script carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDfData);
} else {
  initDfData();
}

async function switchTseTurno(id) {
  const b1 = document.getElementById('btn-tse-1t');
  const b2 = document.getElementById('btn-tse-2t');
  if (b1 && b2) {
    b1.style.background = id === '6257' ? 'rgba(255,255,255,0.2)' : 'transparent';
    b1.style.color = id === '6257' ? '#fff' : 'rgba(255,255,255,0.5)';
    b2.style.background = id === '6258' ? 'rgba(255,255,255,0.2)' : 'transparent';
    b2.style.color = id === '6258' ? '#fff' : 'rgba(255,255,255,0.5)';
  }
  const res = await fetch('/api/tse/live?eleicao=' + id);
  const data = await res.json();
  console.log('[TSE Oficial ' + id + ' Recebido]:', data);
}
