// Dossiê Eleitoral Oficial TRE-DF / TSE 2026
// Painel Integrado: Governador do DF (Votação nas 35 RAs), Marcela Passamani (15555) e Distritais

window.dfGlobalData = null;
window.selectedRaId = 'all';
window.selectedZona = 'all';
window.selectedTipo = 'all';
window.currentTab = 'governo'; // 'governo', 'marcela', 'geral'
window.viewModeZ18 = 'locais'; // 'locais' ou 'secoes'
window.governoSortMode = 'vencedor'; // 'vencedor', 'celina', 'grass', 'paula', 'eleitorado', 'nome'
window.governoFilter = 'all'; // 'all', 'celina', 'grass', 'top10', 'rural'

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
    if (window.currentTab === 'governo' && window.dfGlobalData.governoDf?.regioesAdministrativas) {
      window.dfGlobalData.governoDf.regioesAdministrativas.forEach(ra => {
        const opt = document.createElement('option');
        opt.value = String(ra.id);
        const winInfo = ra.vencedor ? ` (${ra.vencedor.nome.split(' ')[0]} ${ra.vencedor.percentual})` : '';
        opt.textContent = `${ra.codigo} - ${ra.nome}${winInfo}`;
        selRa.appendChild(opt);
      });
    } else {
      (window.dfGlobalData.regioesAdministrativas || []).forEach(ra => {
        const opt = document.createElement('option');
        opt.value = String(ra.id);
        const marcInfo = ra.votosMarcelaPassamani ? ` (${ra.votosMarcelaPassamani.toLocaleString('pt-BR')} votos Marcela)` : '';
        opt.textContent = `${ra.codigo} - ${ra.nome}${marcInfo}`;
        selRa.appendChild(opt);
      });
    }
  }

  const selZona = document.getElementById('df-zona-select');
  if (selZona) {
    selZona.innerHTML = '<option value="all">Todas as 19 Zonas Eleitorais (DF Completo)</option>';
    if (window.currentTab === 'governo' && window.dfGlobalData.governoDf?.zonasEleitorais) {
      window.dfGlobalData.governoDf.zonasEleitorais.forEach(z => {
        const opt = document.createElement('option');
        opt.value = String(z.zona);
        const is18 = z.zona === 18;
        if (is18) {
          opt.style.fontWeight = 'bold';
          opt.style.color = '#38bdf8';
        }
        opt.textContent = `${is18 ? '⭐ ' : ''}Zona ${z.zona} (${z.nome}) · Celina ${z.votosCelina.toLocaleString('pt-BR')} (${z.percentualCelina}) · Grass ${z.votosGrass.toLocaleString('pt-BR')} (${z.percentualGrass})`;
        selZona.appendChild(opt);
      });
    } else if (window.dfGlobalData.marcelaPassamaniDossie?.votosPorZona) {
      selZona.innerHTML += '<option value="18" style="font-weight:bold; color:#34d399;">⭐ 18ª ZE (São Sebastião, Jardim Botânico & Lago Sul)</option>';
      window.dfGlobalData.marcelaPassamaniDossie.votosPorZona.forEach(z => {
        if (z.zona !== 18) {
          const opt = document.createElement('option');
          opt.value = String(z.zona);
          opt.textContent = `Zona ${z.zona} (${z.nome}) · ${z.votos.toLocaleString('pt-BR')} votos`;
          selZona.appendChild(opt);
        }
      });
    }
  }
}

function selectDfRa(id) {
  window.selectedRaId = id;
  const sel = document.getElementById('df-ra-select');
  if (sel) sel.value = id;
  renderDfView();
  if (window.innerWidth <= 900) {
    if (window.currentTab === 'marcela') {
      setMobileSubTab('colegios');
    }
    toggleTopSection(true);
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
  if (window.innerWidth <= 900) {
    setMobileSubTab('colegios');
    toggleTopSection(true);
  }
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
  window.governoFilter = 'all';
  const s1 = document.getElementById('df-ra-select'); if (s1) s1.value = 'all';
  const s2 = document.getElementById('df-zona-select'); if (s2) s2.value = 'all';
  const s3 = document.getElementById('df-tipo-select'); if (s3) s3.value = 'all';
  const si = document.getElementById('df-search-input'); if (si) si.value = '';
  renderDfView();
}

function quickFilterGovZona18() {
  window.selectedZona = '18';
  window.selectedRaId = 'all';
  window.governoFilter = 'all';
  const selZ = document.getElementById('df-zona-select');
  if (selZ) selZ.value = '18';
  const selR = document.getElementById('df-ra-select');
  if (selR) selR.value = 'all';
  renderDfView();
}

function quickFilterGov(type) {
  window.governoFilter = type;
  window.selectedRaId = 'all';
  if (type === 'all' || type === 'zonas' || type === 'celina' || type === 'grass') {
    window.selectedZona = 'all';
    const s2 = document.getElementById('df-zona-select'); if (s2) s2.value = 'all';
  }
  const s1 = document.getElementById('df-ra-select'); if (s1) s1.value = 'all';
  renderDfView();
}

function setGovernoSort(mode) {
  window.governoSortMode = mode;
  renderDfView(document.getElementById('df-search-input')?.value || '');
}

function setDfTab(tab) {
  window.currentTab = tab;
  const bGov = document.getElementById('tab-governo');
  const bMarcela = document.getElementById('tab-marcela');
  const bGeral = document.getElementById('tab-geral');

  if (bGov) {
    if (tab === 'governo') {
      bGov.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
      bGov.style.color = '#fff';
      bGov.style.border = 'none';
      bGov.style.boxShadow = '0 0 14px rgba(2,132,199,0.5)';
    } else {
      bGov.style.background = 'transparent';
      bGov.style.color = '#38bdf8';
      bGov.style.border = '1px solid rgba(2,132,199,0.4)';
      bGov.style.boxShadow = 'none';
    }
  }

  if (bMarcela) {
    if (tab === 'marcela') {
      bMarcela.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      bMarcela.style.color = '#fff';
      bMarcela.style.border = 'none';
      bMarcela.style.boxShadow = '0 0 14px rgba(245,158,11,0.5)';
    } else {
      bMarcela.style.background = 'transparent';
      bMarcela.style.color = '#f59e0b';
      bMarcela.style.border = '1px solid rgba(245,158,11,0.4)';
      bMarcela.style.boxShadow = 'none';
    }
  }

  if (bGeral) {
    if (tab === 'geral') {
      bGeral.style.background = 'rgba(255,255,255,0.15)';
      bGeral.style.color = '#fff';
      bGeral.style.border = 'none';
    } else {
      bGeral.style.background = 'transparent';
      bGeral.style.color = 'rgba(255,255,255,0.6)';
      bGeral.style.border = 'none';
    }
  }

  // Atualiza botões de filtro rápido e campos de seleção
  const quickFilters = document.getElementById('df-modal-quick-filters');
  const raSel = document.getElementById('df-ra-select');
  const zonaSel = document.getElementById('df-zona-select');
  const tipoSel = document.getElementById('df-tipo-select');
  const searchInp = document.getElementById('df-search-input');

  if (tab === 'governo') {
    if (raSel && raSel.parentElement) raSel.parentElement.style.display = 'flex';
    if (zonaSel && zonaSel.parentElement) zonaSel.parentElement.style.display = 'flex';
    if (tipoSel && tipoSel.parentElement) tipoSel.parentElement.style.display = 'none';
    if (searchInp) searchInp.placeholder = '🔍 Buscar RA do DF ou Zona (ex: Zona 18, Ceilândia, Plano Piloto)...';

    if (quickFilters) {
      quickFilters.innerHTML = `
        <span style="font-size:0.75rem; color:#A6A39C; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Visualização TSE:</span>
        <button onclick="quickFilterGov('all')" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:${window.governoFilter === 'all' && window.selectedZona === 'all' ? '#0284c7' : 'rgba(2,132,199,0.2)'}; border:1px solid rgba(2,132,199,0.5); color:#fff; display:inline-flex; align-items:center; gap:5px;">
          🏆 Todas as 35 RAs
        </button>
        <button onclick="quickFilterGov('zonas')" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:${window.governoFilter === 'zonas' ? '#0284c7' : 'rgba(2,132,199,0.2)'}; border:1px solid rgba(2,132,199,0.5); color:#fff; display:inline-flex; align-items:center; gap:5px;">
          📍 19 Zonas Oficiais TSE
        </button>
        <button onclick="quickFilterGovZona18()" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:${window.selectedZona === '18' ? '#10b981' : 'rgba(16,185,129,0.2)'}; border:1px solid rgba(16,185,129,0.5); color:#34d399; display:inline-flex; align-items:center; gap:5px;">
          ⭐ 18ª ZE (São Sebastião & JB: Celina 48.818 · Grass 35.332)
        </button>
        <button onclick="quickFilterGov('celina')" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:${window.governoFilter === 'celina' ? '#0083ca' : 'rgba(0,131,202,0.18)'}; border:1px solid rgba(0,131,202,0.45); color:#38bdf8; display:inline-flex; align-items:center; gap:5px;">
          🔵 Vitórias Celina (31 RAs / 17 Zonas)
        </button>
        <button onclick="quickFilterGov('grass')" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:${window.governoFilter === 'grass' ? '#ee2d35' : 'rgba(238,45,53,0.18)'}; border:1px solid rgba(238,45,53,0.45); color:#fca5a5; display:inline-flex; align-items:center; gap:5px;">
          🔴 Vitórias Grass (4 RAs / 2 Zonas)
        </button>
        <button onclick="openComparativoModal('gov_df')" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; display:inline-flex; align-items:center; gap:5px; box-shadow:0 0 10px rgba(16,185,129,0.4);">
          📊 Comparativo 1º vs 2ºT
        </button>
        <button onclick="launchCelebrationDemo('gov_df')" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; display:inline-flex; align-items:center; gap:5px; box-shadow:0 0 12px rgba(245,158,11,0.5);">
          🎆 Celebrar Vitória (Fogos)
        </button>
        <button onclick="resetAllFilters()" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:600; padding:4px 10px; border-radius:100px; background:rgba(255,255,255,0.08); color:#FAFAF9;">
          🔄 Limpar
        </button>
      `;
    }
  } else if (tab === 'marcela') {
    if (raSel && raSel.parentElement) raSel.parentElement.style.display = 'flex';
    if (zonaSel && zonaSel.parentElement) zonaSel.parentElement.style.display = 'flex';
    if (tipoSel && tipoSel.parentElement) tipoSel.parentElement.style.display = 'flex';
    if (searchInp) searchInp.placeholder = '🔍 Buscar por Colégio, Seção, RA...';

    if (quickFilters) {
      quickFilters.innerHTML = `
        <span style="font-size:0.75rem; color:#A6A39C; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Filtros Marcela:</span>
        <button onclick="quickFilterZona18()" id="btn-quick-z18" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.45); color:#34d399; display:inline-flex; align-items:center; gap:5px;">
          ⭐ 18ª ZE (São Sebastião 518 · JB 162 · Lago Sul 161)
        </button>
        <button onclick="quickFilterTipo('Rural')" id="btn-quick-rural" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.35); color:#4ade80; display:inline-flex; align-items:center; gap:5px;">
          🌾 Zona Rural
        </button>
        <button onclick="quickFilterTipo('Urbano')" id="btn-quick-urbano" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:600; padding:4px 12px; border-radius:100px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.35); color:#60a5fa; display:inline-flex; align-items:center; gap:5px;">
          🏙️ Zona Urbana
        </button>
        <button onclick="resetAllFilters()" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:600; padding:4px 10px; border-radius:100px; background:rgba(255,255,255,0.08); color:#FAFAF9;">
          🔄 Ver Todas
        </button>
      `;
    }
  } else {
    if (raSel && raSel.parentElement) raSel.parentElement.style.display = 'flex';
    if (zonaSel && zonaSel.parentElement) zonaSel.parentElement.style.display = 'flex';
    if (tipoSel && tipoSel.parentElement) tipoSel.parentElement.style.display = 'flex';
    if (searchInp) searchInp.placeholder = '🔍 Buscar candidatos distritais...';
    if (quickFilters) {
      quickFilters.innerHTML = `
        <span style="font-size:0.75rem; color:#A6A39C; font-weight:600;">Deputados Distritais (DF): 24 Vagas Disputadas</span>
      `;
    }
  }

  populateDfSelectors();
  renderDfView();
}

function setMobileSubTab(tab) {
  const left = document.getElementById('df-left-pane');
  const right = document.getElementById('df-right-pane');
  const bGov = document.getElementById('btn-mobile-tab-governo');
  const bDossie = document.getElementById('btn-mobile-tab-dossie');
  const bColegios = document.getElementById('btn-mobile-tab-colegios');
  if (!left || !right) return;

  if (tab === 'governo') {
    setDfTab('governo');
    left.style.display = 'block';
    right.style.display = 'block';
    if (bGov) {
      bGov.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
      bGov.style.color = '#fff';
    }
    if (bDossie) {
      bDossie.style.background = 'rgba(255,255,255,0.08)';
      bDossie.style.color = '#D6D4CF';
    }
    if (bColegios) {
      bColegios.style.background = 'rgba(255,255,255,0.08)';
      bColegios.style.color = '#D6D4CF';
    }
  } else if (tab === 'dossie') {
    setDfTab('marcela');
    left.style.display = 'block';
    right.style.display = 'none';
    if (bDossie) {
      bDossie.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      bDossie.style.color = '#fff';
    }
    if (bGov) {
      bGov.style.background = 'rgba(255,255,255,0.08)';
      bGov.style.color = '#D6D4CF';
    }
    if (bColegios) {
      bColegios.style.background = 'rgba(255,255,255,0.08)';
      bColegios.style.color = '#D6D4CF';
    }
  } else if (tab === 'colegios') {
    setDfTab('marcela');
    left.style.display = 'none';
    right.style.display = 'block';
    if (bColegios) {
      bColegios.style.background = '#10b981';
      bColegios.style.color = '#fff';
    }
    if (bGov) {
      bGov.style.background = 'rgba(255,255,255,0.08)';
      bGov.style.color = '#D6D4CF';
    }
    if (bDossie) {
      bDossie.style.background = 'rgba(255,255,255,0.08)';
      bDossie.style.color = '#D6D4CF';
    }
  }
}

function toggleTopSection(forceState) {
  const topSec = document.getElementById('df-top-collapsible');
  const btnIcon = document.getElementById('btn-toggle-top-icon');
  const btnText = document.getElementById('btn-toggle-top-text');
  const container = document.getElementById('df-modal-container');
  if (!topSec) return;

  const isCurrentlyCollapsed = topSec.classList.contains('is-collapsed');
  const willCollapse = (forceState !== undefined) ? forceState : !isCurrentlyCollapsed;

  if (willCollapse) {
    topSec.classList.add('is-collapsed');
    if (btnIcon) btnIcon.textContent = '🔽';
    if (btnText) btnText.textContent = 'Filtros';
    if (container) container.scrollTop = 0;
  } else {
    topSec.classList.remove('is-collapsed');
    if (btnIcon) btnIcon.textContent = '🔼';
    if (btnText) btnText.textContent = 'Subir';
  }
}

function openGovernoDfModal(raId = 'all') {
  openDfModal(raId);
  setDfTab('governo');
  if (window.innerWidth <= 900) {
    setMobileSubTab('governo');
    toggleTopSection(false);
  }
}

function openMarcelaDossie() {
  openDfModal('all');
  setDfTab('marcela');
  if (window.innerWidth <= 900) {
    setMobileSubTab('dossie');
    toggleTopSection(false);
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
      setMobileSubTab(window.currentTab === 'governo' ? 'governo' : 'dossie');
      toggleTopSection(false);
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
  } else if (q.includes('celina') || q.includes('grass') || q.includes('governo') || q.includes('governador')) {
    setDfTab('governo');
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
  if (!leftCol || !rightCol) return;

  const gov = window.dfGlobalData.governoDf;

  // =========================================================================
  // ABA 1: GOVERNADOR DO DF (VOTAÇÃO COMPLETA NAS 35 RAs DO DISTRITO FEDERAL)
  // =========================================================================
  if (window.currentTab === 'governo' && gov) {
    const isZonaFilter = (window.selectedZona && window.selectedZona !== 'all');
    const targetZona = isZonaFilter ? (gov.zonasEleitorais || []).find(z => String(z.zona) === String(window.selectedZona)) : null;

    // --- COLUNA DA ESQUERDA: QUADRO GERAL (OU DETALHADO DA ZONA SELECIONADA) ---
    const activeCands = targetZona ? targetZona.rankingCandidatos : (gov.candidatos || []);
    let candsHtml = '';
    activeCands.forEach((c, idx) => {
      const isTop2 = idx <= 1;
      const isWinner = idx === 0;
      const cor = c.cor || (c.numero === '11' ? '#0083ca' : c.numero === '13' ? '#ee2d35' : c.numero === '45' ? '#f59e0b' : c.numero === '30' ? '#ff6f00' : '#85827C');
      const pctStr = typeof c.percentual === 'string' ? c.percentual : (c.percentual ? c.percentual.toFixed(2) + '%' : '0%');
      candsHtml += `
        <div style="background:${isTop2 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)'}; border:1px solid ${isWinner ? 'rgba(0,131,202,0.45)' : (idx === 1 ? 'rgba(238,45,53,0.45)' : 'rgba(255,255,255,0.06)')}; border-left:3px solid ${cor}; border-radius:8px; padding:9px 11px; margin-bottom:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:0.75rem; font-weight:700; color:#A6A39C;">${idx + 1}º</span>
              <span style="font-size:0.88rem; font-weight:700; color:#fff;">${c.nome}</span>
              <span style="font-size:0.7rem; background:rgba(255,255,255,0.08); padding:1px 6px; border-radius:4px; color:#D6D4CF;">${c.partido || ''} ${c.numero}</span>
              ${isTop2 ? '<span style="font-size:0.65rem; background:#38bdf822; color:#38bdf8; border:1px solid #38bdf844; padding:1px 5px; border-radius:4px; font-weight:700;">2º Turno</span>' : ''}
            </div>
            <div style="text-align:right;">
              <b style="font-size:0.95rem; color:${cor};">${c.votos.toLocaleString('pt-BR')}</b>
              <span style="font-size:0.75rem; color:#22c55e; font-weight:700; margin-left:4px;">${pctStr}</span>
            </div>
          </div>
          <div style="width:100%; height:4px; background:rgba(255,255,255,0.08); border-radius:100px; overflow:hidden;">
            <div style="width:${pctStr.replace(',', '.')}; height:100%; background:${cor}; border-radius:100px;"></div>
          </div>
        </div>`;
    });

    if (targetZona) {
      // VISUALIZAÇÃO DA ZONA ESPECÍFICA (EX: ZONA 18 OFICIAL TSE)
      leftCol.innerHTML = `
        <div style="background:linear-gradient(135deg, rgba(2,132,199,0.22), rgba(3,105,161,0.1)); border:1px solid rgba(2,132,199,0.55); border-radius:12px; padding:14px; margin-bottom:14px; box-shadow:0 0 16px rgba(2,132,199,0.25);">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
            <div style="width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg, #0284c7, #0369a1); display:grid; place-items:center; font-weight:700; font-size:1.3rem; color:#fff; box-shadow:0 0 14px rgba(2,132,199,0.5);">
              ⭐
            </div>
            <div>
              <div style="font-size:1.15rem; font-weight:700; color:#fff;">Zona ${targetZona.zona} (${targetZona.nome})</div>
              <div style="font-size:0.75rem; color:#38bdf8; font-weight:600;">Dados Oficiais do TRE-DF / TSE · 100,00% Apurado</div>
            </div>
          </div>

          <p style="margin:0 0 10px; font-size:0.74rem; color:#D6D4CF; line-height:1.4;">
            Resultado oficial da <b>${targetZona.zona}ª Zona Eleitoral</b>. <b>${targetZona.vencedor.nome} (${targetZona.vencedor.partido})</b> venceu na zona com <b>${targetZona.vencedor.percentual}</b> dos votos válidos.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
            <div style="background:rgba(0,0,0,0.35); padding:8px 10px; border-radius:8px;">
              <div style="font-size:0.68rem; color:#A6A39C;">Total Válidos</div>
              <div style="font-size:1.15rem; font-weight:700; color:#fff;">${targetZona.validos.toLocaleString('pt-BR')}</div>
              <div style="font-size:0.65rem; color:#22c55e;">100% das seções apuradas</div>
            </div>
            <div style="background:rgba(0,0,0,0.35); padding:8px 10px; border-radius:8px;">
              <div style="font-size:0.68rem; color:#A6A39C;">Votação / Comparecimento</div>
              <div style="font-size:1.15rem; font-weight:700; color:#38bdf8;">${targetZona.comparecimento.toLocaleString('pt-BR')}</div>
              <div style="font-size:0.65rem; color:#A6A39C;">${targetZona.totalSecoes} seções totalizadas</div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#A6A39C; padding:6px 8px; background:rgba(0,0,0,0.25); border-radius:6px;">
            <span>Abstenção: <b style="color:#fca5a5;">${targetZona.abstencao.toLocaleString('pt-BR')} (${targetZona.percentualAbstencao})</b></span>
            <span>Brancos: <b style="color:#fff;">${targetZona.brancos.toLocaleString('pt-BR')} (${targetZona.percentualBrancos})</b></span>
            <span>Nulos: <b style="color:#fff;">${targetZona.nulos.toLocaleString('pt-BR')} (${targetZona.percentualNulos})</b></span>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <button onclick="resetAllFilters()" style="all:unset; cursor:pointer; width:100%; box-sizing:border-box; text-align:center; padding:8px; border-radius:8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#38bdf8; font-size:0.78rem; font-weight:600;">
            ← Voltar para Visão Geral de Todo o DF (35 RAs)
          </button>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <b style="font-size:0.85rem; color:#FAFAF9;">Votação dos Candidatos na Zona ${targetZona.zona}:</b>
            <span style="font-size:0.7rem; color:#38bdf8;">Oficial TSE</span>
          </div>
          <div style="display:flex; flex-direction:column;">
            ${candsHtml}
          </div>
        </div>
      `;
    } else {
      // VISUALIZAÇÃO GERAL DO DISTRITO FEDERAL
      leftCol.innerHTML = `
        <!-- CARD RESUMO GOVERNO DF -->
        <div style="background:linear-gradient(135deg, rgba(2,132,199,0.18), rgba(3,105,161,0.08)); border:1px solid rgba(2,132,199,0.45); border-radius:12px; padding:14px; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
            <div style="width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg, #0284c7, #0369a1); display:grid; place-items:center; font-weight:700; font-size:1.3rem; color:#fff; box-shadow:0 0 14px rgba(2,132,199,0.5);">
              🏛️
            </div>
            <div>
              <div style="font-size:1.15rem; font-weight:700; color:#fff;">Governo do Distrito Federal</div>
              <div style="font-size:0.75rem; color:#38bdf8; font-weight:600;">1º Turno Oficial TSE (Eleição 6259) · 2º Turno Definido</div>
            </div>
          </div>

          <p style="margin:0 0 10px; font-size:0.74rem; color:#D6D4CF; line-height:1.4;">
            Totalização concluída com <b>100,00% das seções apuradas</b> pelo TRE-DF. <b>Celina Leão (PP)</b> e <b>Leandro Grass (PT)</b> disputam o segundo turno para o Palácio do Buriti.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
            <div style="background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:8px;">
              <div style="font-size:0.68rem; color:#A6A39C;">Total Válidos DF</div>
              <div style="font-size:1.15rem; font-weight:700; color:#fff;">${gov.votosValidos.toLocaleString('pt-BR')}</div>
              <div style="font-size:0.65rem; color:#22c55e;">${gov.percentualValidos} dos votos totais</div>
            </div>
            <div style="background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:8px;">
              <div style="font-size:0.68rem; color:#A6A39C;">Comparecimento</div>
              <div style="font-size:1.15rem; font-weight:700; color:#38bdf8;">${gov.comparecimento.toLocaleString('pt-BR')}</div>
              <div style="font-size:0.65rem; color:#A6A39C;">${gov.percentualComparecimento} de 2,24M aptos</div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#A6A39C; padding:6px 8px; background:rgba(0,0,0,0.25); border-radius:6px;">
            <span>Abstenção: <b style="color:#fca5a5;">${gov.abstencao.toLocaleString('pt-BR')} (${gov.percentualAbstencao})</b></span>
            <span>Brancos: <b style="color:#fff;">${gov.votosBrancos.toLocaleString('pt-BR')} (${gov.percentualBrancos})</b></span>
            <span>Nulos: <b style="color:#fff;">${gov.votosNulos.toLocaleString('pt-BR')} (${gov.percentualNulos})</b></span>
          </div>
        </div>

        <!-- MAPA POLÍTICO DE VITÓRIAS NAS 35 RAs / 19 ZONAS -->
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; margin-bottom:14px;">
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:8px; display:flex; justify-content:space-between;">
            <span>Território Eleitoral do DF:</span>
            <span style="color:#22c55e;">100% Apurado</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="background:rgba(0,131,202,0.12); border:1px solid rgba(0,131,202,0.3); padding:8px 10px; border-radius:8px;">
              <div style="font-size:0.7rem; color:#38bdf8; font-weight:600;">Vitórias Celina Leão</div>
              <div style="font-size:1.15rem; font-weight:700; color:#0083ca;">31 RAs (17 Zonas)</div>
              <div style="font-size:0.65rem; color:#A6A39C;">Ceilândia, Taguatinga, Gama, São Sebastião...</div>
            </div>
            <div style="background:rgba(238,45,53,0.12); border:1px solid rgba(238,45,53,0.3); padding:8px 10px; border-radius:8px;">
              <div style="font-size:0.7rem; color:#fca5a5; font-weight:600;">Vitórias Leandro Grass</div>
              <div style="font-size:1.15rem; font-weight:700; color:#ee2d35;">4 RAs (2 Zonas)</div>
              <div style="font-size:0.65rem; color:#A6A39C;">Zona 1 (Asa Sul) & Zona 14 (Asa Norte)</div>
            </div>
          </div>
        </div>

        <!-- RANKING DOS 10 CANDIDATOS -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <b style="font-size:0.85rem; color:#FAFAF9;">Votação Geral dos Candidatos a Governador:</b>
            <span style="font-size:0.7rem; color:#38bdf8;">10 Candidatos TSE</span>
          </div>
          <div style="display:flex; flex-direction:column;">
            ${candsHtml}
          </div>
        </div>
      `;
    }

    // --- COLUNA DA DIREITA: LISTAGEM ---
    let cardsHtml = '';
    const q = (filterQuery || '').toLowerCase().trim();

    // SE ESTIVER EM MODO ZONAS ELEITORAIS OU SELECIONOU UMA ZONA
    if (window.governoFilter === 'zonas' || (targetZona && window.selectedRaId === 'all')) {
      secoesTitle.textContent = targetZona
        ? `📍 ${targetZona.zona}ª Zona Eleitoral — ${targetZona.nome} (Dados Oficiais TSE)`
        : '📍 19 Zonas Eleitorais Oficiais do Distrito Federal (TSE)';
      secoesSubtitle.textContent = targetZona
        ? 'Votos apurados na zona eleitoral e divisão pelas Regiões Administrativas abrangidas'
        : 'Totalização oficial do TRE-DF / TSE em cada uma das 19 Zonas Eleitorais do Distrito Federal';

      let zonas = targetZona ? [targetZona] : [...(gov.zonasEleitorais || [])];

      if (window.governoFilter === 'celina') {
        zonas = zonas.filter(z => z.vencedor.numero === '11');
      } else if (window.governoFilter === 'grass') {
        zonas = zonas.filter(z => z.vencedor.numero === '13');
      }

      if (q) {
        zonas = zonas.filter(z => {
          return z.nome.toLowerCase().includes(q) ||
                 String(z.zona).includes(q) ||
                 z.rasAbrangidas.some(r => r.toLowerCase().includes(q));
        });
      }

      secoesCount.textContent = `${zonas.length} ${zonas.length === 1 ? 'Zona' : 'Zonas'} TSE`;

      // Render cards de Zona
      zonas.forEach(z => {
        const isCelinaWin = z.vencedor.numero === '11';
        const winBadge = isCelinaWin
          ? `<span style="font-size:0.72rem; background:#0083ca25; color:#38bdf8; border:1px solid #0083ca55; padding:2px 8px; border-radius:100px; font-weight:700;">🏆 Celina Leão venceu (${z.percentualCelina})</span>`
          : `<span style="font-size:0.72rem; background:#ee2d3525; color:#fca5a5; border:1px solid #ee2d3555; padding:2px 8px; border-radius:100px; font-weight:700;">🏆 Leandro Grass venceu (${z.percentualGrass})</span>`;

        const pCelinaNum = parseFloat(z.percentualCelina.replace(',', '.'));
        const pGrassNum = parseFloat(z.percentualGrass.replace(',', '.'));
        const pPaulaNum = parseFloat(z.percentualPaula.replace(',', '.'));
        const pKikoNum = parseFloat(z.percentualKiko.replace(',', '.'));
        const pCappelliNum = parseFloat(z.percentualCappelli.replace(',', '.'));
        const pOutrosNum = Math.max(0, 100 - (pCelinaNum + pGrassNum + pPaulaNum + pKikoNum + pCappelliNum));

        cardsHtml += `
          <div style="background:${z.zona === 18 ? 'rgba(2,132,199,0.06)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${z.zona === 18 ? 'rgba(2,132,199,0.45)' : (isCelinaWin ? 'rgba(0,131,202,0.3)' : 'rgba(238,45,53,0.3)')}; border-radius:12px; padding:12px 14px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:1.05rem; font-weight:700; color:#fff;">${z.zona === 18 ? '⭐ ' : ''}Zona ${z.zona} — ${z.nome}</span>
                  ${winBadge}
                </div>
                <div style="font-size:0.75rem; color:#A6A39C; margin-top:3px;">
                  📍 RAs: ${z.rasAbrangidas.join(', ')} · <b>${z.totalSecoes} seções</b> · Eleitorado: <b>${z.eleitorado.toLocaleString('pt-BR')}</b> · Válidos: <b>${z.validos.toLocaleString('pt-BR')}</b>
                </div>
              </div>
              <div style="text-align:right;">
                <span style="font-size:0.72rem; color:#A6A39C;">Votação / Comp.</span>
                <div style="font-size:0.95rem; font-weight:700; color:#22c55e;">${z.comparecimento.toLocaleString('pt-BR')}</div>
              </div>
            </div>

            <!-- BARRA PROPORCIONAL DE VOTOS -->
            <div style="width:100%; height:8px; display:flex; border-radius:100px; overflow:hidden; margin:8px 0; background:rgba(255,255,255,0.06);">
              <div style="width:${pCelinaNum}%; background:#0083ca; height:100%;" title="Celina Leão: ${z.percentualCelina}"></div>
              <div style="width:${pGrassNum}%; background:#ee2d35; height:100%;" title="Leandro Grass: ${z.percentualGrass}"></div>
              <div style="width:${pPaulaNum}%; background:#f59e0b; height:100%;" title="Paula Belmonte: ${z.percentualPaula}"></div>
              <div style="width:${pKikoNum}%; background:#ff6f00; height:100%;" title="Kiko Caputo: ${z.percentualKiko}"></div>
              <div style="width:${pCappelliNum}%; background:#e11d48; height:100%;" title="Cappelli: ${z.percentualCappelli}"></div>
              <div style="width:${pOutrosNum}%; background:#85827C; height:100%;" title="Outros: ${z.percentualOutros}"></div>
            </div>

            <!-- GRID COM CADA CANDIDATO NESTA ZONA -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:6px; margin-top:8px;">
              <div style="background:${isCelinaWin ? 'rgba(0,131,202,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${isCelinaWin ? 'rgba(0,131,202,0.35)' : 'rgba(255,255,255,0.06)'}; padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#38bdf8; font-weight:700;">Celina Leão (PP · 11)</div>
                <div style="font-size:0.95rem; font-weight:700; color:#fff;">${z.votosCelina.toLocaleString('pt-BR')} <small style="font-size:0.75rem; color:#38bdf8;">(${z.percentualCelina})</small></div>
              </div>
              <div style="background:${!isCelinaWin ? 'rgba(238,45,53,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${!isCelinaWin ? 'rgba(238,45,53,0.35)' : 'rgba(255,255,255,0.06)'}; padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#fca5a5; font-weight:700;">Leandro Grass (PT · 13)</div>
                <div style="font-size:0.95rem; font-weight:700; color:#fff;">${z.votosGrass.toLocaleString('pt-BR')} <small style="font-size:0.75rem; color:#fca5a5;">(${z.percentualGrass})</small></div>
              </div>
              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#f59e0b; font-weight:600;">Paula Belmonte (45)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#D6D4CF;">${z.votosPaula.toLocaleString('pt-BR')} <small style="font-size:0.7rem; color:#f59e0b;">(${z.percentualPaula})</small></div>
              </div>
              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#ff6f00; font-weight:600;">Kiko Caputo (30)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#D6D4CF;">${z.votosKiko.toLocaleString('pt-BR')} <small style="font-size:0.7rem; color:#ff6f00;">(${z.percentualKiko})</small></div>
              </div>
              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#e11d48; font-weight:600;">Cappelli (40)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#D6D4CF;">${z.votosCappelli.toLocaleString('pt-BR')} <small style="font-size:0.7rem; color:#e11d48;">(${z.percentualCappelli})</small></div>
              </div>
            </div>
          </div>
        `;
      });
    }

    // VISUALIZAÇÃO POR REGIÕES ADMINISTRATIVAS (35 RAs)
    if (window.governoFilter !== 'zonas') {
      if (!targetZona) {
        secoesTitle.textContent = '🏛️ Votação para Governador nas 35 Regiões Administrativas do DF';
        secoesSubtitle.textContent = 'Quantos votos cada candidato recebeu por RA · Oficial TRE-DF / TSE 2026';
      }

      let ras = [...(gov.regioesAdministrativas || [])];

      // Filtro se zona selecionada
      if (targetZona) {
        ras = ras.filter(r => targetZona.rasAbrangidas.includes(r.codigo));
      }

      // Filtros rápidos de Governo
      if (window.governoFilter === 'celina') {
        ras = ras.filter(r => r.vencedor && r.vencedor.numero === '11');
      } else if (window.governoFilter === 'grass') {
        ras = ras.filter(r => r.vencedor && r.vencedor.numero === '13');
      } else if (window.governoFilter === 'top10') {
        ras = [...ras].sort((a, b) => b.eleitorado - a.eleitorado).slice(0, 10);
      }

      // Filtro por seleção direta de RA
      if (window.selectedRaId !== 'all') {
        ras = ras.filter(r => String(r.id) === String(window.selectedRaId));
      }

      // Busca textual
      if (q) {
        ras = ras.filter(r => {
          return r.nome.toLowerCase().includes(q) ||
                 r.codigo.toLowerCase().includes(q) ||
                 r.zonas.toLowerCase().includes(q) ||
                 (r.vencedor && r.vencedor.nome.toLowerCase().includes(q));
        });
      }

      // Ordenação
      const sort = window.governoSortMode || 'vencedor';
      if (sort === 'celina') {
        ras.sort((a, b) => b.votosCelina - a.votosCelina);
      } else if (sort === 'grass') {
        ras.sort((a, b) => b.votosGrass - a.votosGrass);
      } else if (sort === 'paula') {
        ras.sort((a, b) => b.votosPaula - a.votosPaula);
      } else if (sort === 'eleitorado') {
        ras.sort((a, b) => b.eleitorado - a.eleitorado);
      } else if (sort === 'nome') {
        ras.sort((a, b) => a.nome.localeCompare(b.nome));
      }

      secoesCount.textContent = targetZona ? `${ras.length} RAs na Zona ${targetZona.zona}` : `${ras.length} de 35 RAs`;

      // Barra de ordenação
      let toolbarHtml = `
        <div style="display:flex; gap:8px; margin-bottom:12px; align-items:center; flex-wrap:wrap;">
          <span style="font-size:0.75rem; color:#A6A39C; font-weight:600;">${targetZona ? 'RAs da Zona ' + targetZona.zona + ':' : 'Ordenar por:'}</span>
          <button onclick="setGovernoSort('celina')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:${sort === 'celina' ? '700' : '500'}; padding:4px 10px; border-radius:100px; background:${sort === 'celina' ? '#0083ca' : 'rgba(255,255,255,0.06)'}; color:#fff; transition:all .15s;">
            🔵 Votos Celina
          </button>
          <button onclick="setGovernoSort('grass')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:${sort === 'grass' ? '700' : '500'}; padding:4px 10px; border-radius:100px; background:${sort === 'grass' ? '#ee2d35' : 'rgba(255,255,255,0.06)'}; color:#fff; transition:all .15s;">
            🔴 Votos Grass
          </button>
          <button onclick="setGovernoSort('eleitorado')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:${sort === 'eleitorado' ? '700' : '500'}; padding:4px 10px; border-radius:100px; background:${sort === 'eleitorado' ? '#38bdf8' : 'rgba(255,255,255,0.06)'}; color:#fff; transition:all .15s;">
            👥 Eleitorado
          </button>
          <button onclick="setGovernoSort('vencedor')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:${sort === 'vencedor' ? '700' : '500'}; padding:4px 10px; border-radius:100px; background:${sort === 'vencedor' ? '#10b981' : 'rgba(255,255,255,0.06)'}; color:#fff; transition:all .15s;">
            🏆 Vencedor
          </button>
          <button onclick="setGovernoSort('nome')" style="all:unset; cursor:pointer; font-size:0.78rem; font-weight:${sort === 'nome' ? '700' : '500'}; padding:4px 10px; border-radius:100px; background:${sort === 'nome' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}; color:#fff; transition:all .15s;">
            🔤 Nome A-Z
          </button>
        </div>
      `;

      cardsHtml = toolbarHtml + '<div style="display:flex; flex-direction:column; gap:10px;">' + cardsHtml;

      ras.forEach((r, idx) => {
        const isCelinaWin = r.vencedor && r.vencedor.numero === '11';
        const winBadge = isCelinaWin
          ? '<span style="font-size:0.72rem; background:#0083ca25; color:#38bdf8; border:1px solid #0083ca55; padding:2px 8px; border-radius:100px; font-weight:700;">🏆 Celina Leão venceu</span>'
          : '<span style="font-size:0.72rem; background:#ee2d3525; color:#fca5a5; border:1px solid #ee2d3555; padding:2px 8px; border-radius:100px; font-weight:700;">🏆 Leandro Grass venceu</span>';

        const pCelinaNum = parseFloat(r.percentualCelina.replace(',', '.'));
        const pGrassNum = parseFloat(r.percentualGrass.replace(',', '.'));
        const pPaulaNum = parseFloat(r.percentualPaula.replace(',', '.'));
        const pKikoNum = parseFloat(r.percentualKiko.replace(',', '.'));
        const pOutrosNum = Math.max(0, 100 - (pCelinaNum + pGrassNum + pPaulaNum + pKikoNum));

        cardsHtml += `
          <div style="background:rgba(255,255,255,0.02); border:1px solid ${isCelinaWin ? 'rgba(0,131,202,0.3)' : 'rgba(238,45,53,0.3)'}; border-radius:12px; padding:12px 14px; transition:border .15s;">
            <!-- CABEÇALHO DO CARD DA RA -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:1rem; font-weight:700; color:#fff;">${r.codigo} - ${r.nome}</span>
                  ${winBadge}
                </div>
                <div style="font-size:0.75rem; color:#A6A39C; margin-top:3px;">
                  📍 ${r.zonas} · <b>${r.totalSecoes} seções</b> · Eleitorado: <b>${r.eleitorado.toLocaleString('pt-BR')}</b> · Válidos: <b>${r.validos.toLocaleString('pt-BR')}</b>
                </div>
              </div>
              <div style="text-align:right;">
                <span style="font-size:0.72rem; color:#A6A39C;">Comparecimento</span>
                <div style="font-size:0.85rem; font-weight:700; color:#22c55e;">${r.percentualComparecimento}</div>
              </div>
            </div>

            <!-- BARRA PROPORCIONAL DE VOTOS DA RA -->
            <div style="width:100%; height:8px; display:flex; border-radius:100px; overflow:hidden; margin:8px 0; background:rgba(255,255,255,0.06);">
              <div style="width:${pCelinaNum}%; background:#0083ca; height:100%;" title="Celina Leão: ${r.percentualCelina}"></div>
              <div style="width:${pGrassNum}%; background:#ee2d35; height:100%;" title="Leandro Grass: ${r.percentualGrass}"></div>
              <div style="width:${pPaulaNum}%; background:#f59e0b; height:100%;" title="Paula Belmonte: ${r.percentualPaula}"></div>
              <div style="width:${pKikoNum}%; background:#ff6f00; height:100%;" title="Kiko Caputo: ${r.percentualKiko}"></div>
              <div style="width:${Math.max(0, pOutrosNum)}%; background:#85827C; height:100%;" title="Outros: ${r.percentualOutros}"></div>
            </div>

            <!-- TABELA DE VOTOS DETALHADA POR CANDIDATO NESTA RA -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:6px; margin-top:8px;">
              <div style="background:${isCelinaWin ? 'rgba(0,131,202,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${isCelinaWin ? 'rgba(0,131,202,0.35)' : 'rgba(255,255,255,0.06)'}; padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#38bdf8; font-weight:700;">Celina Leão (PP · 11)</div>
                <div style="font-size:0.95rem; font-weight:700; color:#fff;">${r.votosCelina.toLocaleString('pt-BR')} <small style="font-size:0.75rem; color:#38bdf8;">(${r.percentualCelina})</small></div>
              </div>
              <div style="background:${!isCelinaWin ? 'rgba(238,45,53,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${!isCelinaWin ? 'rgba(238,45,53,0.35)' : 'rgba(255,255,255,0.06)'}; padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#fca5a5; font-weight:700;">Leandro Grass (PT · 13)</div>
                <div style="font-size:0.95rem; font-weight:700; color:#fff;">${r.votosGrass.toLocaleString('pt-BR')} <small style="font-size:0.75rem; color:#fca5a5;">(${r.percentualGrass})</small></div>
              </div>
              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#f59e0b; font-weight:600;">Paula Belmonte (45)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#D6D4CF;">${r.votosPaula.toLocaleString('pt-BR')} <small style="font-size:0.7rem; color:#f59e0b;">(${r.percentualPaula})</small></div>
              </div>
              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#ff6f00; font-weight:600;">Kiko Caputo (30)</div>
                <div style="font-size:0.85rem; font-weight:700; color:#D6D4CF;">${r.votosKiko.toLocaleString('pt-BR')} <small style="font-size:0.7rem; color:#ff6f00;">(${r.percentualKiko})</small></div>
              </div>
              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#A6A39C; font-weight:600;">Outros Candidatos</div>
                <div style="font-size:0.85rem; font-weight:700; color:#A6A39C;">${(r.votosCappelli + r.votosOutros).toLocaleString('pt-BR')} <small style="font-size:0.7rem;">(${(((r.votosCappelli + r.votosOutros) / r.validos) * 100).toFixed(2)}%)</small></div>
              </div>
            </div>
          </div>
        `;
      });
      cardsHtml += '</div>';
    }

    rightCol.innerHTML = cardsHtml;
    return;
  }
  // =========================================================================
  // ABA 2: DOSSIÊ ELEITORAL MARCELA PASSAMANI (15555 · MDB)
  // =========================================================================
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

    // --- COLUNA DA DIREITA: 37 COLÉGIOS ELEITORAIS OU SEÇÕES ELEITORAIS ---
    const z18Det = window.dfGlobalData.marcelaPassamaniDossie?.zona18Detalhamento;

    if (window.selectedZona === '18' && window.viewModeZ18 === 'locais' && z18Det) {
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

    // Seções individuais Marcela
    let activeRas = window.dfGlobalData.regioesAdministrativas || [];
    if (window.selectedRaId !== 'all') {
      activeRas = activeRas.filter(ra => String(ra.id) === String(window.selectedRaId));
    }

    let allSecoes = [];
    activeRas.forEach(ra => {
      (ra.secoesDetalhe || []).forEach(sec => {
        allSecoes.push(Object.assign({}, sec, {
          raNome: ra.nome,
          raCodigo: ra.codigo
        }));
      });
    });

    if (window.selectedZona !== 'all') {
      allSecoes = allSecoes.filter(sec => {
        const zNum = String(sec.zona).replace(/[^0-9]/g, '');
        return zNum === String(window.selectedZona);
      });
    }

    if (window.selectedTipo !== 'all') {
      allSecoes = allSecoes.filter(sec => {
        const isRural = (sec.tipo === 'Rural' || (sec.colegioEleitoral || '').toLowerCase().includes('rural') || (sec.endereco || '').toLowerCase().includes('br-') || (sec.endereco || '').toLowerCase().includes('df-') || (sec.colegioEleitoral || '').toLowerCase().includes('café sem troco') || (sec.colegioEleitoral || '').toLowerCase().includes('pad-df') || (sec.colegioEleitoral || '').toLowerCase().includes('betânia') || (sec.colegioEleitoral || '').toLowerCase().includes('morro da cruz'));
        return window.selectedTipo === 'Rural' ? isRural : !isRural;
      });
    }

    if (filterQuery) {
      allSecoes = allSecoes.filter(sec => {
        const txt = `${sec.numero} ${sec.colegioEleitoral || ''} ${sec.local || ''} ${sec.endereco || ''} ${sec.zona} ${sec.raNome} ${sec.raCodigo}`.toLowerCase();
        return txt.includes(filterQuery);
      });
    }

    if (window.selectedZona === '18') {
      secoesTitle.textContent = `⭐ 18ª Zona Eleitoral (São Sebastião, Jardim Botânico & Lago Sul)`;
      secoesSubtitle.textContent = `841 votos oficiais de Marcela Passamani mapeados em todas as 431 seções eleitorais`;
    } else if (window.selectedRaId === 'all') {
      secoesTitle.textContent = `Colégios Eleitorais e Seções de Todas as 35 Regiões Administrativas`;
      secoesSubtitle.textContent = `Exibindo seções eleitorais do Distrito Federal com detalhamento de Marcela Passamani (15555)`;
    } else {
      secoesTitle.textContent = `Colégios Eleitorais de ${activeRas[0]?.nome || ''}`;
      secoesSubtitle.textContent = `${activeRas[0]?.codigo || ''} · ${activeRas[0]?.zonas || ''}`;
    }
    secoesCount.textContent = `${allSecoes.length} seções exibidas`;

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
        <div style="background:rgba(255,255,255,0.02); border:1px solid ${isRural ? 'rgba(34,197,94,0.35)' : (isZ18 ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.06)')}; border-radius:10px; padding:12px; margin-bottom:8px;">
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

    rightCol.innerHTML = secoesHtml;
    return;
  }

  // =========================================================================
  // ABA 3: QUADRO GERAL DE DEPUTADOS DISTRITAIS
  // =========================================================================
  if (window.currentTab === 'geral') {
    let candsHtml = '';
    const candList = window.dfGlobalData.candidatosDestaque || window.dfGlobalData.candidatosDistritais || [];
    candList.forEach((c, idx) => {
      const isM = (c.numero === '15555');
      candsHtml += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:${isM ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)'}; border-radius:8px; margin-bottom:6px; border-left:3px solid ${c.cor}; border:${isM ? '1px solid rgba(245,158,11,0.4)' : 'none'};">
          <div>
            <div style="font-weight:700; font-size:0.85rem; color:${isM ? '#f59e0b' : '#fff'};">${idx + 1}º ${c.nome} ${isM ? '⭐' : ''}</div>
            <div style="font-size:0.75rem; color:#A6A39C;">${c.partido} ${c.numero} · ${c.situacao || (c.eleito ? 'Eleito' : 'Suplente')}</div>
          </div>
          <div style="text-align:right;">
            <b style="font-size:0.95rem; color:${c.cor};">${(c.totalVotos || c.votos || 0).toLocaleString('pt-BR')}</b>
            <div style="font-size:0.7rem; color:${c.eleito ? '#22c55e' : '#f59e0b'};">${c.eleito ? 'Eleito' : 'Suplente'}</div>
          </div>
        </div>`;
    });

    leftCol.innerHTML = `
      <div style="margin-bottom:12px;">
        <h3 style="margin:0 0 4px; font-size:0.95rem; color:#fff;">Quadro dos Mais Votados (Dep. Distritais)</h3>
        <p style="margin:0; font-size:0.75rem; color:#A6A39C;">Câmara Legislativa do DF (CLDF) · 24 cadeiras</p>
      </div>
      <div style="display:flex; flex-direction:column;">
        ${candsHtml}
      </div>
    `;

    secoesTitle.textContent = 'Eleição para Deputado Distrital · 35 RAs do DF';
    secoesSubtitle.textContent = 'Distribuição de vagas da CLDF nas 35 Regiões Administrativas';
    secoesCount.textContent = '24 Cadeiras';

    let rasHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
    (window.dfGlobalData.regioesAdministrativas || []).forEach(ra => {
      rasHtml += `
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:0.9rem; color:#fff;">${ra.codigo} - ${ra.nome}</div>
            <div style="font-size:0.75rem; color:#A6A39C; margin-top:2px;">
              📍 ${ra.zonas} · ${ra.secoes} seções · Eleitorado: ${ra.eleitorado.toLocaleString('pt-BR')}
            </div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.75rem; color:#22c55e; font-weight:700;">100% Apurado</span>
          </div>
        </div>
      `;
    });
    rasHtml += '</div>';
    rightCol.innerHTML = rasHtml;
  }
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

  window.activeTurnoId = id;

  if (id === '6258') {
    // 2º Turno Oficial: Aciona comemoração na tela de fogos de artifício do vencedor
    if (window.triggerVictoryCelebration) {
      window.triggerVictoryCelebration({
        name: "Flávio Bolsonaro",
        cargo: "Presidente da República Eleito (2º Turno)",
        partido: "PL",
        numero: "22",
        pct: "50,88%",
        votos: 59312480,
        cor: "#0083ca",
        desc: "Totalização concluída pelo TSE no 2º Turno das Eleições 2026. Vitória comemorada com espetáculo de fogos de artifício na tela!"
      });
    }
  } else {
    if (window.stopFireworks) window.stopFireworks();
    if (window.closeVictoryCelebration) window.closeVictoryCelebration();
  }

  try {
    const res = await fetch('/api/tse/live?eleicao=' + id);
    const data = await res.json();
    console.log('[TSE Oficial ' + id + ' Recebido]:', data);
  } catch (e) {}
}

// Exportações globais
window.openGovernoDfModal = openGovernoDfModal;
window.openMarcelaDossie = openMarcelaDossie;
window.openDfModal = openDfModal;
window.closeDfModal = closeDfModal;
window.setDfTab = setDfTab;
window.setMobileSubTab = setMobileSubTab;
window.toggleTopSection = toggleTopSection;
window.quickFilterZona18 = quickFilterZona18;
window.quickFilterTipo = quickFilterTipo;
window.quickFilterGov = quickFilterGov;
window.quickFilterGovZona18 = quickFilterGovZona18;
window.setGovernoSort = setGovernoSort;
window.resetAllFilters = resetAllFilters;
window.selectDfRa = selectDfRa;
window.selectDfZona = selectDfZona;
window.selectDfTipo = selectDfTipo;
window.switchTseTurno = switchTseTurno;
window.filterDfData = filterDfData;
window.setZ18ViewMode = setZ18ViewMode;
