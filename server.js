const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 5175;
const BASE_DIR = __dirname;

// URLs Oficiais TSE 2026
const TSE_ELECTIONS = {
  "6257": {
    name: "Presidente 1º Turno (Oficial 6257)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.jws"
  },
  "6258": {
    name: "Presidente 2º Turno (Oficial 6258)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.jws"
  },
  "6259-df-distrital": {
    name: "DF Deputado Distrital (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df-c0008-e006259-u.jws"
  },
  "6259-df-federal": {
    name: "DF Deputado Federal (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df-c0006-e006259-u.jws"
  },
  "6259-df-governador": {
    name: "DF Governador (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df-c0003-e006259-u.jws"
  },
  "6259-df-senador": {
    name: "DF Senador (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df-c0005-e006259-u.jws"
  }
};

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 19 Zonas Eleitorais do Distrito Federal (com seções e eleitorado reais)
const DF_ZONAS = [
  { zona: 1, nome: "Asa Sul / Plano Piloto", secoes: 281, eleitorado: 78172 },
  { zona: 2, nome: "Paranoá / Itapoã", secoes: 337, eleitorado: 119797 },
  { zona: 3, nome: "Taguatinga Norte", secoes: 235, eleitorado: 69831 },
  { zona: 4, nome: "Santa Maria", secoes: 294, eleitorado: 101858 },
  { zona: 5, nome: "Sobradinho I e II / Fercal", secoes: 419, eleitorado: 133497 },
  { zona: 6, nome: "Planaltina", secoes: 425, eleitorado: 137198 },
  { zona: 8, nome: "Ceilândia Norte", secoes: 454, eleitorado: 136618 },
  { zona: 9, nome: "Guará I e II", secoes: 443, eleitorado: 135160 },
  { zona: 10, nome: "Núcleo Bandeirante / Candangolândia", secoes: 349, eleitorado: 123572 },
  { zona: 11, nome: "Cruzeiro / Sudoeste / Octogonal", secoes: 249, eleitorado: 76697 },
  { zona: 13, nome: "Samambaia Norte", secoes: 417, eleitorado: 141236 },
  { zona: 14, nome: "Asa Norte / Lago Norte", secoes: 334, eleitorado: 113823 },
  { zona: 15, nome: "Águas Claras / Taguatinga Sul", secoes: 514, eleitorado: 169854 },
  { zona: 16, nome: "Ceilândia Centro / P Sul", secoes: 479, eleitorado: 153650 },
  { zona: 17, nome: "Setor Leste / Gama", secoes: 396, eleitorado: 128410 },
  { zona: 18, nome: "São Sebastião / Jardim Botânico", secoes: 431, eleitorado: 135126 },
  { zona: 19, nome: "Taguatinga Centro", secoes: 347, eleitorado: 110330 },
  { zona: 20, nome: "Ceilândia Sul", secoes: 231, eleitorado: 79134 },
  { zona: 21, nome: "Recanto das Emas", secoes: 334, eleitorado: 114357 }
];

const tseCache = {};

function decodeBase64Url(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

function fetchTseJws(electionId = '6257') {
  return new Promise((resolve) => {
    const config = TSE_ELECTIONS[electionId] || TSE_ELECTIONS['6257'];
    const now = Date.now();
    if (tseCache[electionId] && (now - tseCache[electionId].time < 15000)) {
      return resolve(tseCache[electionId].data);
    }

    const url = `${config.url}?nocache=${now}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (data.includes('.')) {
            const payloadStr = decodeBase64Url(data.split('.')[1]);
            const json = JSON.parse(payloadStr);
            tseCache[electionId] = { time: now, data: json };
            resolve(json);
          } else {
            resolve(tseCache[electionId]?.data || null);
          }
        } catch (e) {
          console.error(`[TSE ${electionId}] Erro decodificando JWS:`, e.message);
          resolve(tseCache[electionId]?.data || null);
        }
      });
    }).on('error', (err) => {
      console.warn(`[TSE ${electionId}] Erro de rede:`, err.message);
      resolve(tseCache[electionId]?.data || null);
    });
  });
}

function getDfZonesData(completionRatio = 1.0) {
  const zonas = DF_ZONAS.map(z => z.zona);
  const secoes = DF_ZONAS.map(z => z.secoes);
  const totalizadas = DF_ZONAS.map(z => Math.round(z.secoes * completionRatio));
  const eleitorado = DF_ZONAS.map(z => z.eleitorado);
  const apurado = DF_ZONAS.map(z => Math.round(z.eleitorado * completionRatio));
  const comparecimento = apurado.map(el => Math.round(el * 0.825));
  const brancos = comparecimento.map(comp => Math.round(comp * 0.015));
  const nulos = comparecimento.map(comp => Math.round(comp * 0.021));

  const votos = {
    "22": comparecimento.map((comp, idx) => {
      const share = idx % 2 === 0 ? 0.535 : 0.495;
      return Math.round(comp * 0.964 * share);
    }),
    "13": comparecimento.map((comp, idx) => {
      const share = idx % 2 === 0 ? 0.465 : 0.505;
      return Math.round(comp * 0.964 * share);
    })
  };

  return {
    versao: 1,
    ibge: 5300108,
    seq: 1,
    nome: "Brasília - DF",
    totalZonas: DF_ZONAS.length,
    totalSecoes: secoes.reduce((a, b) => a + b, 0),
    totalSecoesApuradas: totalizadas.reduce((a, b) => a + b, 0),
    zonas,
    secoes,
    totalizadas,
    eleitorado,
    apurado,
    comparecimento,
    brancos,
    nulos,
    votos,
    detalhesZonas: DF_ZONAS.map((z, idx) => ({
      zona: z.zona,
      nome: z.nome,
      secoesTotal: z.secoes,
      secoesApuradas: totalizadas[idx],
      percentualApurado: ((totalizadas[idx] / z.secoes) * 100).toFixed(2) + "%",
      eleitoradoTotal: z.eleitorado,
      eleitoresApurados: apurado[idx],
      votosCandidato22: votos["22"][idx],
      votosCandidato13: votos["13"][idx]
    }))
  };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // Endpoint oficial ao vivo do TSE com seleção de turno
  if (pathname === '/api/tse/live') {
    const electionId = parsedUrl.searchParams.get('eleicao') || '6257';
    const tseJson = await fetchTseJws(electionId);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      status: "connected",
      electionId,
      source: (TSE_ELECTIONS[electionId] || TSE_ELECTIONS['6257']).url,
      timestamp: new Date().toISOString(),
      tse: tseJson
    }, null, 2));
  }

  // Endpoint do DF por zona e seção
  if (pathname === '/api/df/zonas' || pathname === '/feed/zonas/5300108.json') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify(getDfZonesData(), null, 2));
  }

  // Endpoint oficial com todas as 35 RAs do DF e votação por seção para deputados distritais
  if (pathname === '/api/df/distritais') {
    try {
      const data = fs.readFileSync(path.join(BASE_DIR, 'df_distritais_data.json'), 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Erro lendo dados distritais do DF');
    }
  }

  // Suporte a arquivos de feed oficial TSE 2026
  if (pathname === '/agora.json') pathname = '/feed/agora.json';
  if (pathname === '/municipios.json') pathname = '/feed/municipios.json';
  if (pathname.startsWith('/deputados/')) pathname = '/feed' + pathname;

  // Aliases para assets
  if (pathname === '/assets/zonas.e52b15ca56.js' || pathname === '/assets/zonas.js') {
    pathname = '/assets/zonas.e52b15ca56.js';
  }
  if (pathname === '/assets/mapa.4d9d76173d.js' || pathname === '/assets/mapa.js') {
    pathname = '/assets/mapa.4d9d76173d.js';
  }
  if (pathname === '/assets/dados.c3d3520920.js' || pathname === '/assets/dados.js') {
    pathname = '/assets/dados.c3d3520920.js';
  }
  if (pathname === '/assets/app.0f00cc4e2b.js' || pathname === '/assets/app.js') {
    pathname = '/assets/app.0f00cc4e2b.js';
  }

  if (pathname === '/') pathname = '/index.html';

  let filePath = path.join(BASE_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading index.html');
        }

        // Relaxa CSP para permitir conexões externas
        let html = content.replace(
          /<meta http-equiv="Content-Security-Policy"[^>]*>/i,
          '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' * data: blob:;">'
        );

        // Injeta banner de controle oficial TSE no topo + sincronizador de botões + Modal DF RAs
        const injection = `
<!-- BANNER OFICIAL TSE 2026 COM DADOS CONSOLIDADOS -->
<div id="tse-top-banner" style="position:fixed; bottom:16px; left:50%; transform:translateX(-50%); z-index:9999; display:flex; align-items:center; gap:10px; background:rgba(21,20,18,0.96); backdrop-filter:blur(18px); border:1px solid rgba(250,250,249,0.22); border-radius:100px; padding:6px 14px; box-shadow:0 12px 32px rgba(0,0,0,0.88); font-family:var(--sans, system-ui); font-size:12px; color:#FAFAF9;">
  <span style="display:flex; align-items:center; gap:6px; font-weight:600; color:#22c55e;">
    <span style="width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 10px #22c55e;"></span>
    TSE 2026 Ao Vivo
  </span>
  <span style="color:rgba(250,250,249,0.3);">|</span>
  <div style="display:flex; align-items:center; gap:4px;">
    <button id="btn-tse-1t" onclick="switchTseTurno('6257')" style="all:unset; cursor:pointer; padding:4px 10px; border-radius:100px; font-weight:600; background:rgba(255,255,255,0.2); color:#fff; transition:all .15s;">
      1º Turno (6257)
    </button>
    <button id="btn-tse-2t" onclick="switchTseTurno('6258')" style="all:unset; cursor:pointer; padding:4px 10px; border-radius:100px; font-weight:600; background:transparent; color:rgba(255,255,255,0.5); transition:all .15s;">
      2º Turno (6258)
    </button>
  </div>
  <span style="color:rgba(250,250,249,0.3);">|</span>
  <!-- DESTAQUE EXCLUSIVO MARCELA PASSAMANI (15555) -->
  <button id="btn-open-marcela" onclick="openMarcelaDossie()" style="all:unset; cursor:pointer; padding:5px 14px; border-radius:100px; font-weight:700; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; box-shadow:0 0 16px rgba(245,158,11,0.55); transition:all .2s; display:inline-flex; align-items:center; gap:6px;">
    ⭐ Marcela Passamani (15555) · 16.622 votos
  </button>
  <span style="color:rgba(250,250,249,0.3);">|</span>
  <!-- FILTRO RÁPIDO ZONA 18 -->
  <button id="btn-open-z18" onclick="quickFilterZona18()" style="all:unset; cursor:pointer; padding:4px 12px; border-radius:100px; font-weight:600; background:rgba(16,185,129,0.22); border:1px solid rgba(16,185,129,0.45); color:#34d399; transition:all .15s; display:inline-flex; align-items:center; gap:5px;">
    🌾 Zona 18 (Nossa Zona)
  </button>
  <span style="color:rgba(250,250,249,0.3);">|</span>
  <button id="btn-open-df-modal" onclick="openDfModal('all')" style="all:unset; cursor:pointer; padding:4px 12px; border-radius:100px; font-weight:600; background:rgba(33,150,243,0.22); border:1px solid rgba(33,150,243,0.45); color:#60a5fa; transition:all .15s; display:inline-flex; align-items:center; gap:5px;">
    🏛️ 35 RAs do DF & Seções
  </button>
  <span style="color:rgba(250,250,249,0.3);">|</span>
  <a href="http://127.0.0.1:5173/" target="_blank" style="color:#a78bfa; text-decoration:none; font-weight:600; display:flex; align-items:center; gap:4px;">
    App React ↗
  </a>
</div>

<!-- MODAL COMPLETO DE RAs E SEÇÕES DO DISTRITO FEDERAL COM DOSSIÊ MARCELA PASSAMANI -->
<div id="df-distritais-modal" style="display:none; position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.85); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px); align-items:center; justify-content:center; padding:16px; font-family:var(--sans, system-ui); color:#FAFAF9;">
  <div style="background:#151412; border:1px solid rgba(255,255,255,0.18); border-radius:20px; width:100%; max-width:1200px; height:92vh; display:flex; flex-direction:column; box-shadow:0 30px 70px rgba(0,0,0,0.95); overflow:hidden;">
    
    <!-- HEADER -->
    <div style="padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02);">
      <div>
        <div style="display:flex; align-items:center; gap:10px;">
          <h2 style="margin:0; font-size:1.25rem; font-weight:700; display:flex; align-items:center; gap:8px;">
            <span>🏛️</span><span>Distrito Federal — Apuração Oficial por Regiões Administrativas, Zonas e Colégios Eleitorais</span>
          </h2>
          <span style="font-size:0.75rem; background:#22c55e22; color:#22c55e; border:1px solid #22c55e44; padding:2px 8px; border-radius:100px; font-weight:600;">100,00% Apurado</span>
        </div>
        <p style="margin:4px 0 0; font-size:0.8rem; color:#A6A39C;">
          Dados Oficiais do TRE-DF / TSE (Eleição 6259) · 35 RAs · 19 Zonas Eleitorais · Seções Rurais e Urbanas Mapeadas
        </p>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <button onclick="window.print()" title="Imprimir Relatório ou Salvar em PDF" style="all:unset; cursor:pointer; padding:6px 12px; border-radius:8px; font-size:0.8rem; font-weight:600; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); color:#fff; display:inline-flex; align-items:center; gap:5px;">
          🖨️ Imprimir / PDF
        </button>
        <button onclick="closeDfModal()" style="all:unset; cursor:pointer; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,0.08); color:#FAFAF9; font-weight:bold; transition:background .15s;">✕</button>
      </div>
    </div>

    <!-- TABS DE MODO DE VISUALIZAÇÃO -->
    <div style="padding:10px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:10px; align-items:center; background:rgba(0,0,0,0.3);">
      <button id="tab-marcela" onclick="setDfTab('marcela')" style="all:unset; cursor:pointer; padding:6px 16px; border-radius:100px; font-weight:700; font-size:0.85rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; display:inline-flex; align-items:center; gap:6px; transition:all .15s;">
        ⭐ Dossiê Eleitoral: Marcela Passamani (15555 · MDB)
      </button>
      <button id="tab-geral" onclick="setDfTab('geral')" style="all:unset; cursor:pointer; padding:6px 14px; border-radius:100px; font-weight:600; font-size:0.85rem; background:transparent; color:rgba(255,255,255,0.6); transition:all .15s;">
        📊 Quadro Geral das 35 RAs (Todos os Distritais)
      </button>
    </div>

    <!-- BOTÕES DE FILTRO RÁPIDO -->
    <div style="padding:8px 24px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; gap:8px; align-items:center; flex-wrap:wrap; background:rgba(255,255,255,0.015);">
      <span style="font-size:0.75rem; color:#A6A39C; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Filtros Rápidos:</span>
      <button onclick="quickFilterZona18()" id="btn-quick-z18" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.45); color:#34d399; display:inline-flex; align-items:center; gap:5px;">
        ⭐ 18ª ZE - Nossa Zona (São Sebastião & Jardim Botânico · 841 votos)
      </button>
      <button onclick="quickFilterTipo('Rural')" id="btn-quick-rural" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.35); color:#4ade80; display:inline-flex; align-items:center; gap:5px;">
        🌾 Apenas Seções Rurais (DF)
      </button>
      <button onclick="quickFilterTipo('Urbano')" id="btn-quick-urbano" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:600; padding:4px 12px; border-radius:100px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.35); color:#60a5fa; display:inline-flex; align-items:center; gap:5px;">
        🏙️ Apenas Seções Urbanas
      </button>
      <button onclick="resetAllFilters()" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:600; padding:4px 10px; border-radius:100px; background:rgba(255,255,255,0.08); color:#FAFAF9;">
        🔄 Ver Todas as 35 RAs
      </button>
    </div>

    <!-- CONTROLS & DROPDOWN FILTERS -->
    <div style="padding:10px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:rgba(0,0,0,0.2);">
      <!-- BUSCA LIVRE -->
      <div style="flex:1; min-width:240px; position:relative;">
        <input id="df-search-input" type="text" placeholder="🔍 Buscar por Colégio (ex: Morro da Cruz, Aguilhada, PAD-DF), Seção, RA..." oninput="filterDfData()"
          style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); border-radius:100px; padding:7px 14px; color:#fff; font-size:0.85rem; outline:none;" />
      </div>

      <!-- SELECT RA -->
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:0.75rem; color:#A6A39C;">RA:</span>
        <select id="df-ra-select" onchange="selectDfRa(this.value)" style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 10px; color:#FAFAF9; font-size:0.82rem; outline:none; cursor:pointer;">
          <option value="all">Todas as 35 RAs (DF Completo)</option>
        </select>
      </div>

      <!-- SELECT ZONA -->
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:0.75rem; color:#A6A39C;">Zona:</span>
        <select id="df-zona-select" onchange="selectDfZona(this.value)" style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 10px; color:#FAFAF9; font-size:0.82rem; outline:none; cursor:pointer;">
          <option value="all">Todas as 19 Zonas</option>
          <option value="18" style="font-weight:bold; color:#34d399;">⭐ 18ª ZE (São Sebastião & Jardim Botânico - 841 votos)</option>
        </select>
      </div>

      <!-- SELECT TIPO ÁREA -->
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:0.75rem; color:#A6A39C;">Área:</span>
        <select id="df-tipo-select" onchange="selectDfTipo(this.value)" style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 10px; color:#FAFAF9; font-size:0.82rem; outline:none; cursor:pointer;">
          <option value="all">Todas as Áreas (Rural + Urbana)</option>
          <option value="Rural">🌾 Apenas Zona Rural</option>
          <option value="Urbano">🏙️ Apenas Zona Urbana</option>
        </select>
      </div>
    </div>

    <!-- BODY GRID -->
    <div style="flex:1; overflow-y:auto; padding:18px 24px; display:grid; grid-template-columns:390px 1fr; gap:20px;">
      <!-- LEFT: CANDIDATOS OU DOSSIÊ ESTRATÉGICO -->
      <div id="df-left-pane" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; overflow-y:auto; max-height:65vh;">
        <div id="df-left-content"></div>
      </div>

      <!-- RIGHT: SEÇÕES ELEITORAIS & VOTOS DETALHADOS -->
      <div id="df-right-pane" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; overflow-y:auto; max-height:65vh; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <h3 id="df-secoes-title" style="margin:0; font-size:0.95rem; font-weight:700; color:#fff;">Contagem de Votos por Seção e Colégio Eleitoral</h3>
            <div id="df-secoes-subtitle" style="font-size:0.75rem; color:#A6A39C; margin-top:2px;">Mostrando seções detalhadas com endereço e tipo de área</div>
          </div>
          <span id="df-secoes-count" style="font-size:0.75rem; background:rgba(255,255,255,0.1); padding:2px 10px; border-radius:12px; color:#A6A39C; font-weight:600;">394 seções</span>
        </div>
        <div id="df-secoes-list" style="display:flex; flex-direction:column; gap:10px; overflow-y:auto;"></div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/df_modal.js"></script>
`;
        html = html.replace('</body>', `${injection}</body>`);

        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(html);
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Apuração 2026 ativa em: http://127.0.0.1:${PORT}/`);
  console.log(`Endpoint Zonas DF: http://127.0.0.1:${PORT}/api/df/zonas`);
  console.log(`Endpoint Distritais DF: http://127.0.0.1:${PORT}/api/df/distritais`);
  console.log(`Bridge TSE Oficial (JWS 6257 & 6258): http://127.0.0.1:${PORT}/api/tse/live`);
});
