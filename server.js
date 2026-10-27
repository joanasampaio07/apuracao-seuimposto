const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const PORT = process.env.PORT || 5175;
const BASE_DIR = __dirname;

// URLs Oficiais TSE 2026 (Eleição 6258 & 6260 - 2º Turno; 6257 & 6259 - 1º Turno)
const TSE_ELECTIONS = {
  "6258": {
    name: "Presidente 2º Turno Brasil (Oficial 6258)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.jws"
  },
  "6258-df-presidente": {
    name: "DF Presidente 2º Turno (Oficial 6258)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6258/dados/df/df97012-c0001-e006258-u.jws"
  },
  "6260-df-governador": {
    name: "DF Governador 2º Turno (Oficial 6260)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6260/dados/df/df97012-c0003-e006260-u.jws"
  },
  "6257": {
    name: "Presidente 1º Turno Brasil (Oficial 6257)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.jws"
  },
  "6257-df-presidente": {
    name: "DF Presidente 1º Turno (Oficial 6257)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6257/dados/df/df97012-c0001-e006257-u.jws"
  },
  "6259-df-distrital": {
    name: "DF Deputado Distrital 1º Turno (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df97012-c0008-e006259-u.jws"
  },
  "6259-df-federal": {
    name: "DF Deputado Federal 1º Turno (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df97012-c0006-e006259-u.jws"
  },
  "6259-df-governador": {
    name: "DF Governador 1º Turno (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df97012-c0003-e006259-u.jws"
  },
  "6259-df-senador": {
    name: "DF Senador 1º Turno (Oficial 6259)",
    url: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df97012-c0005-e006259-u.jws"
  }
};

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

function fetchTseJws(electionId = '6258') {
  return new Promise((resolve) => {
    const config = TSE_ELECTIONS[electionId] || TSE_ELECTIONS['6258'];
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

function getDfZonesData(turno = 2) {
  try {
    const is2T = String(turno) === '2';
    const filePath = is2T && fs.existsSync(path.join(BASE_DIR, 'tse_cache', 'tse_df_zonas_2t.json'))
      ? path.join(BASE_DIR, 'tse_cache', 'tse_df_zonas_2t.json')
      : path.join(BASE_DIR, 'tse_cache', 'tse_zonas_governo_oficial.json');

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const zonas = [];
    const secoes = [];
    const totalizadas = [];
    const eleitorado = [];
    const apurado = [];
    const comparecimento = [];
    const brancos = [];
    const nulos = [];
    const votos11 = [];
    const votos13 = [];
    const votos22 = [];
    const detalhesZonas = [];

    const zoneList = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    for (const zNum of zoneList) {
      const zd = raw[String(zNum)];
      if (!zd) continue;
      zonas.push(zNum);
      const totalSec = zd.secoesTotal || zd.secoes || 0;
      const totSec = zd.secoesTotalizadas || zd.totalizadas || totalSec;
      secoes.push(totalSec);
      totalizadas.push(totSec);
      eleitorado.push(zd.eleitorado);
      apurado.push(zd.eleitorado);
      comparecimento.push(zd.comparecimento);
      brancos.push(zd.brancos || 0);
      nulos.push(zd.nulos || 0);

      let celina = 0;
      let grass = 0;
      let flavio = 0;
      if (zd.gov) {
        celina = zd.gov['11']?.votos || 0;
        grass = zd.gov['13']?.votos || 0;
        flavio = zd.pres?.['22']?.votos || 0;
      } else if (zd.candidatos) {
        celina = zd.candidatos.find(c => c.numero === '11')?.votos || 0;
        grass = zd.candidatos.find(c => c.numero === '13')?.votos || 0;
        flavio = celina;
      }
      votos11.push(celina);
      votos13.push(grass);
      votos22.push(flavio);

      detalhesZonas.push({
        zona: zNum,
        nome: zd.nome || `Zona ${zNum}`,
        secoesTotal: totalSec,
        secoesApuradas: totSec,
        percentualApurado: "100.00%",
        eleitoradoTotal: zd.eleitorado,
        eleitoresApurados: zd.eleitorado,
        votosCandidato11: celina,
        votosCandidato13: grass,
        votosCandidato22: flavio
      });
    }

    return {
      versao: is2T ? 2 : 1,
      turno: is2T ? 2 : 1,
      ibge: 5300108,
      seq: is2T ? 2 : 1,
      nome: "Brasília - DF",
      totalZonas: zonas.length,
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
      votos: {
        "11": votos11,
        "13": votos13,
        "22": votos22
      },
      detalhesZonas
    };
  } catch (err) {
    console.error("Erro em getDfZonesData:", err);
    return {};
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // Detecção precoce e robusta do turno ativo (Query > Referer > Cookie > Padrão: 2)
  const cookieTurno = (req.headers.cookie || '').match(/tse_turno=([12])/)?.[1];
  const queryTurno = parsedUrl.searchParams.get('turno');
  const refererTurno = (req.headers.referer || '').match(/[?&]turno=([12])/)?.[1];
  const activeTurno = queryTurno || refererTurno || cookieTurno || '2';

  // Endpoint oficial ao vivo do TSE com seleção de turno
  if (pathname === '/api/tse/live') {
    const electionId = parsedUrl.searchParams.get('eleicao') || (activeTurno === '1' ? '6257' : '6258');
    const tseJson = await fetchTseJws(electionId);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      status: "connected",
      electionId,
      source: (TSE_ELECTIONS[electionId] || TSE_ELECTIONS['6258']).url,
      timestamp: new Date().toISOString(),
      tse: tseJson
    }, null, 2));
  }

  // Endpoint do DF por zona e seção (com suporte a turno 1 e 2)
  if (pathname === '/api/df/zonas' || pathname === '/feed/zonas/5300108.json') {
    const turno = parsedUrl.searchParams.get('turno') || activeTurno;
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify(getDfZonesData(turno), null, 2));
  }

  // Download direto da Planilha de Auditoria Oficial TSE (.xlsx)
  if (pathname === '/download/planilha' || pathname === '/Auditoria_Eleitoral_DF_2026_Oficial_TSE.xlsx') {
    const xlsxPath = path.join(BASE_DIR, 'Auditoria_Eleitoral_DF_2026_Oficial_TSE.xlsx');
    if (fs.existsSync(xlsxPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Auditoria_Eleitoral_DF_2026_Oficial_TSE.xlsx"',
        'Access-Control-Allow-Origin': '*'
      });
      return fs.createReadStream(xlsxPath).pipe(res);
    }
  }

  function sendJsonGzip(dataObj) {
    const raw = typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj);
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip') && raw.length > 1024) {
      const gzipped = zlib.gzipSync(Buffer.from(raw));
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Encoding': 'gzip',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      return res.end(gzipped);
    }
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    return res.end(raw);
  }

  // Endpoint oficial com todas as 35 RAs do DF e votação por seção para deputados distritais
  if (pathname === '/api/df/distritais') {
    try {
      const data = fs.readFileSync(path.join(BASE_DIR, 'df_distritais_data.json'), 'utf8');
      return sendJsonGzip(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Erro lendo dados distritais do DF');
    }
  }

  // Endpoint oficial com dados de votação para Governador do DF nas 35 RAs
  if (pathname === '/api/df/governo') {
    try {
      const data = fs.readFileSync(path.join(BASE_DIR, 'df_distritais_data.json'), 'utf8');
      const json = JSON.parse(data);
      const govData = activeTurno === '1' ? (json.governoDf1t || json.governoDf) : (json.governoDf2t || json.governoDf);
      return sendJsonGzip(govData || {});
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Erro lendo dados de governo do DF');
    }
  }

  // Endpoint oficial com dados de votação de Marcela Passamani (15555)
  if (pathname === '/api/df/marcela') {
    try {
      const data = fs.readFileSync(path.join(BASE_DIR, 'df_distritais_data.json'), 'utf8');
      const json = JSON.parse(data);
      return sendJsonGzip(json.marcelaPassamaniDossie || {});
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Erro lendo dados de Marcela Passamani');
    }
  }

  // Endpoint oficial com dados comparativos de 1º e 2º Turno (Presidente, DF e Estados)
  if (pathname === '/api/comparativo' || pathname === '/comparativo_data.json') {
    try {
      const data = fs.readFileSync(path.join(BASE_DIR, 'comparativo_data.json'), 'utf8');
      return sendJsonGzip(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Erro lendo dados comparativos');
    }
  }

  // Suporte a arquivos de feed oficial TSE 2026 com chave de turno (1T vs 2T)

  if (pathname === '/agora.json' || pathname === '/feed/agora.json') {
    const targetFile = activeTurno === '1' ? 'feed/agora_1t.json' : 'feed/agora_2t.json';
    try {
      const data = fs.readFileSync(path.join(BASE_DIR, targetFile), 'utf8');
      return sendJsonGzip(data);
    } catch {
      pathname = '/feed/agora.json';
    }
  }
  if (pathname === '/municipios.json' || pathname === '/feed/municipios.json') {
    const targetFile = activeTurno === '1' ? 'feed/municipios_1t.json' : 'feed/municipios_2t.json';
    try {
      const data = fs.readFileSync(path.join(BASE_DIR, targetFile), 'utf8');
      return sendJsonGzip(data);
    } catch {
      pathname = '/feed/municipios.json';
    }
  }
  if (pathname === '/projecao.json' || pathname === '/feed/projecao.json') {
    const targetFile = activeTurno === '1' ? 'feed/projecao_1t.json' : 'feed/projecao_2t.json';
    const fallbackFile = 'feed/projecao.json';
    let fileToRead = path.join(BASE_DIR, targetFile);
    if (!fs.existsSync(fileToRead)) fileToRead = path.join(BASE_DIR, fallbackFile);
    if (fs.existsSync(fileToRead)) {
      const data = fs.readFileSync(fileToRead, 'utf8');
      return sendJsonGzip(data);
    }
  }

  // Handler oficial universal para todos os 27 estados do Brasil + Exterior (ZZ)
  const ufMatch = pathname.match(/^\/(?:feed\/)?uf\/([a-zA-Z]{2})\.json$/);
  if (ufMatch) {
    const ufCode = ufMatch[1].toLowerCase();
    const targetFile = activeTurno === '1' ? `feed/uf/${ufCode}_1t.json` : `feed/uf/${ufCode}_2t.json`;
    const fallbackFile = `feed/uf/${ufCode}.json`;
    let fileToRead = path.join(BASE_DIR, targetFile);
    if (!fs.existsSync(fileToRead)) fileToRead = path.join(BASE_DIR, fallbackFile);
    if (fs.existsSync(fileToRead)) {
      const data = fs.readFileSync(fileToRead, 'utf8');
      return sendJsonGzip(data);
    }
  }

  if (pathname.startsWith('/deputados/')) pathname = '/feed' + pathname;
  if (pathname.startsWith('/uf/')) pathname = '/feed' + pathname;

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

        // Injeta CSS responsivo para mobile, banner simplificado (apenas Marcela Passamani) e modal fluido
        const injection = `
<!-- ESTILOS EXCLUSIVOS RESPONSIVOS MOBILE (ANDROID & APPLE IOS) -->
<style id="mobile-responsive-rules">
  @keyframes dfModalSpin {
    to { transform: rotate(360deg); }
  }
  @media (max-width: 900px) {
    html, body {
      height: auto !important;
      min-height: 100% !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      overscroll-behavior-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
    }
    .hud {
      position: relative !important;
      height: auto !important;
      min-height: 100dvh !important;
      overflow: visible !important;
      padding-bottom: 90px !important;
    }
    .hud.phone .pcard {
      max-height: none !important;
      overflow: visible !important;
    }
    .hud.phone .mapwrap {
      min-height: 360px !important;
      height: 400px !important;
      touch-action: pan-y !important;
    }
    .hud canvas.map {
      touch-action: pan-y !important;
    }
    #tse-top-banner {
      left: 10px !important;
      right: 10px !important;
      bottom: max(12px, env(safe-area-inset-bottom)) !important;
      transform: none !important;
      width: calc(100vw - 20px) !important;
      max-width: calc(100vw - 20px) !important;
      padding: 6px 10px !important;
      gap: 6px !important;
      border-radius: 100px !important;
      overflow-x: auto !important;
      flex-wrap: nowrap !important;
      justify-content: flex-start !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: none !important;
    }
    #tse-top-banner::-webkit-scrollbar {
      display: none !important;
    }
    #btn-open-governo, #btn-open-marcela, #btn-open-comparativo, #btn-open-fogos {
      flex: 0 0 auto !important;
      min-height: 38px !important;
      justify-content: center !important;
      font-size: 11.5px !important;
      padding: 6px 12px !important;
      border-radius: 100px !important;
      white-space: nowrap !important;
    }
    #df-distritais-modal {
      padding: 0 !important;
      background: #0F0E0D !important;
    }
    #df-modal-container {
      max-width: 100vw !important;
      width: 100vw !important;
      height: 100dvh !important;
      max-height: 100dvh !important;
      border-radius: 0 !important;
      border: none !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      display: block !important;
      padding-bottom: max(20px, env(safe-area-inset-bottom)) !important;
    }
    #df-mobile-sticky-bar {
      display: flex !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 1000 !important;
      padding: max(10px, env(safe-area-inset-top)) 10px 8px 10px !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: none !important;
    }
    #df-mobile-sticky-bar::-webkit-scrollbar {
      display: none !important;
    }
    .mobile-only-subir-bar {
      display: block !important;
    }
    .desktop-only-btn {
      display: none !important;
    }
    #df-desktop-tabs {
      display: none !important;
    }
    #df-modal-header {
      padding: 12px 14px 10px 14px !important;
    }
    #df-modal-header h2 {
      font-size: 0.95rem !important;
      line-height: 1.25 !important;
    }
    #df-modal-header p {
      font-size: 0.72rem !important;
    }
    #df-modal-body-grid {
      grid-template-columns: 1fr !important;
      padding: 10px 12px max(80px, calc(80px + env(safe-area-inset-bottom))) 12px !important;
      gap: 12px !important;
      overflow-y: visible !important;
      height: auto !important;
    }
    #df-left-pane, #df-right-pane {
      max-height: none !important;
      overflow-y: visible !important;
      padding: 10px !important;
    }
    #df-secoes-list {
      max-height: none !important;
      overflow-y: visible !important;
    }
    #df-top-collapsible.is-collapsed {
      display: none !important;
    }
    #df-modal-quick-filters {
      padding: 8px 12px !important;
      gap: 6px !important;
    }
    #df-modal-controls {
      padding: 10px 12px !important;
      gap: 10px !important;
    }
    #df-search-wrapper {
      width: 100% !important;
      min-width: 100% !important;
      flex: 1 1 100% !important;
    }
    #df-search-btn {
      padding: 6px 12px !important;
    }
  }
  @media (min-width: 901px) {
    #tse-top-banner {
      display: flex !important;
      position: fixed !important;
      bottom: 48px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 9999 !important;
      transition: all 0.2s ease !important;
    }
    #tse-top-banner.is-collapsed #banner-full-content {
      display: none !important;
    }
    #tse-top-banner.is-collapsed #banner-mini-content {
      display: inline-flex !important;
    }
    #tse-top-banner.is-collapsed {
      padding: 3px 10px !important;
      background: rgba(21, 20, 18, 0.88) !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.7) !important;
    }
    #banner-mini-content {
      display: none;
    }
    .hud canvas.map, .hud .mapzoom, .hud canvas.prev, .hud canvas.hov, .hud canvas.fx, .hud .marks {
      transform: translateY(-8px) !important;
    }
    #df-mobile-sticky-bar {
      display: none !important;
    }
    .mobile-only-subir-bar {
      display: none !important;
    }
    .desktop-only-btn {
      display: inline-flex !important;
    }
    #df-top-collapsible {
      display: block !important;
    }
    #df-left-pane {
      display: block !important;
    }
    #df-right-pane {
      display: flex !important;
    }
  }
</style>

<!-- BARRA PRINCIPAL FLUTUANTE (DESIGN ULTRA-COMPACTO E RECOLHÍVEL, NÃO ATRAPALHA A TELA) -->
<div id="tse-top-banner" style="position:fixed; bottom:48px; left:50%; transform:translateX(-50%); z-index:9999; display:flex; align-items:center; gap:5px; background:rgba(21,20,18,0.94); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(250,250,249,0.18); border-radius:100px; padding:3px 10px; box-shadow:0 8px 25px rgba(0,0,0,0.85); font-family:var(--sans, system-ui); font-size:11px; color:#FAFAF9; white-space:nowrap;">
  
  <!-- CONTEÚDO COMPLETO QUANDO EXPANDIDO -->
  <div id="banner-full-content" style="display:flex; align-items:center; gap:5px;">
    <span id="tse-live-badge" style="display:flex; align-items:center; gap:5px; font-weight:700; font-size:11px; color:#22c55e;">
      <span style="width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;"></span>
      TSE
    </span>
    <span style="color:rgba(250,250,249,0.25);">|</span>
    <div style="display:flex; align-items:center; gap:2px;">
      <button id="btn-tse-bottom-1t" class="btn-tse-1t" data-turno="1" onclick="switchTseTurno('6257')" style="all:unset; cursor:pointer; padding:3px 8px; border-radius:100px; font-weight:${activeTurno === '1' ? '700' : '600'}; font-size:10.5px; background:${activeTurno === '1' ? 'rgba(255,255,255,0.22)' : 'transparent'}; color:${activeTurno === '1' ? '#fff' : 'rgba(255,255,255,0.5)'}; transition:all .15s;">
        1ºT
      </button>
      <button id="btn-tse-bottom-2t" class="btn-tse-2t" data-turno="2" onclick="switchTseTurno('6258')" style="all:unset; cursor:pointer; padding:3px 8px; border-radius:100px; font-weight:${activeTurno === '2' ? '700' : '600'}; font-size:10.5px; background:${activeTurno === '2' ? 'rgba(255,255,255,0.22)' : 'transparent'}; color:${activeTurno === '2' ? '#fff' : 'rgba(255,255,255,0.5)'}; transition:all .15s;">
        2ºT
      </button>
    </div>
    <span style="color:rgba(250,250,249,0.25);">|</span>
    <!-- BOTÃO GOVERNADOR DO DF -->
    <button id="btn-open-governo" onclick="openGovernoDfModal()" style="all:unset; cursor:pointer; padding:4px 10px; border-radius:100px; font-weight:700; font-size:11px; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; box-shadow:0 0 10px rgba(2,132,199,0.4); display:inline-flex; align-items:center; gap:4px;">
      🏛️ Gov DF
    </button>
    <!-- BOTÃO MARCELA PASSAMANI -->
    <button id="btn-open-marcela" onclick="openMarcelaDossie()" style="all:unset; cursor:pointer; padding:4px 10px; border-radius:100px; font-weight:700; font-size:11px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; box-shadow:0 0 10px rgba(245,158,11,0.4); display:inline-flex; align-items:center; gap:4px;">
      ⭐ Marcela (15555)
    </button>
    <!-- BOTÃO COMPARATIVO 1º VS 2º TURNO -->
    <button id="btn-open-comparativo" onclick="openComparativoModal()" style="all:unset; cursor:pointer; padding:4px 10px; border-radius:100px; font-weight:700; font-size:11px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; box-shadow:0 0 10px rgba(16,185,129,0.4); display:inline-flex; align-items:center; gap:4px;">
      📊 Comparativo
    </button>
    <!-- BOTÃO PROJEÇÃO OFICIAL & METODOLOGIA -->
    <button id="btn-open-projecao-banner" onclick="window.openProjecaoMetodologiaModal()" style="all:unset; cursor:pointer; padding:4px 10px; border-radius:100px; font-weight:700; font-size:11px; background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; box-shadow:0 0 10px rgba(239,68,68,0.4); display:inline-flex; align-items:center; gap:4px;">
      🎯 Projeção
    </button>
    <!-- BOTÃO FOGOS -->
    <button id="btn-open-fogos" onclick="launchCelebrationDemo('gov_df')" style="all:unset; cursor:pointer; padding:4px 8px; border-radius:100px; font-weight:700; font-size:11px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); color:#fff; display:inline-flex; align-items:center; gap:3px;">
      🎆 Fogos
    </button>
  </div>

  <!-- CONTEÚDO MINI (QUANDO RECOLHIDO) -->
  <div id="banner-mini-content" style="align-items:center; gap:6px;">
    <span style="font-weight:700; font-size:11px; color:#38bdf8;">🏛️ Ações DF · Projeção</span>
  </div>

  <!-- BOTÃO RECOLHER / EXPANDIR -->
  <button id="btn-toggle-banner" onclick="window.toggleFloatingBanner()" title="Recolher / Expandir barra" style="all:unset; cursor:pointer; width:18px; height:18px; border-radius:50%; background:rgba(255,255,255,0.12); color:#A6A39C; display:grid; place-items:center; font-size:9px; font-weight:bold; margin-left:2px; transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">
    ▼
  </button>
</div>

<script>
window.toggleFloatingBanner = function() {
  const b = document.getElementById('tse-top-banner');
  const btn = document.getElementById('btn-toggle-banner');
  if (!b) return;
  const isCol = b.classList.toggle('is-collapsed');
  if (btn) btn.textContent = isCol ? '▲' : '▼';
};
</script>

<!-- MODAL COMPLETO DE RAs E SEÇÕES DO DISTRITO FEDERAL (GOVERNO DO DF + MARCELA PASSAMANI) -->
<div id="df-distritais-modal" style="display:none; position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.85); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px); align-items:center; justify-content:center; padding:16px; font-family:var(--sans, system-ui); color:#FAFAF9;">
  <div id="df-modal-container" style="background:#151412; border:1px solid rgba(255,255,255,0.18); border-radius:20px; width:100%; max-width:1200px; height:92vh; display:flex; flex-direction:column; box-shadow:0 30px 70px rgba(0,0,0,0.95); overflow:hidden;">
    
    <!-- BARRA STICKY MOBILE (SUB-ABAS + BOTÃO SUBIR/EXPANDIR + FECHAR) -->
    <div id="df-mobile-sticky-bar" style="position:sticky; top:0; z-index:100; padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.14); background:rgba(21,20,18,0.98); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); display:none; gap:6px; align-items:center;">
      <button id="btn-mobile-tab-governo" onclick="setMobileSubTab('governo')" style="all:unset; flex:1; text-align:center; padding:7px 6px; border-radius:8px; font-size:0.75rem; font-weight:700; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; cursor:pointer; white-space:nowrap;">
        🏛️ Governo DF
      </button>
      <button id="btn-mobile-tab-dossie" onclick="setMobileSubTab('dossie')" style="all:unset; flex:1; text-align:center; padding:7px 6px; border-radius:8px; font-size:0.75rem; font-weight:600; background:rgba(255,255,255,0.08); color:#D6D4CF; cursor:pointer; white-space:nowrap;">
        ⭐ Marcela
      </button>
      <button id="btn-mobile-tab-colegios" onclick="setMobileSubTab('colegios')" style="all:unset; flex:1; text-align:center; padding:7px 6px; border-radius:8px; font-size:0.75rem; font-weight:600; background:rgba(255,255,255,0.08); color:#D6D4CF; cursor:pointer; white-space:nowrap;">
        🏫 37 Colégios
      </button>
      <!-- BOTÃO PARA SUBIR / RECOLHER FILTROS E EXPANDIR TELA -->
      <button id="btn-toggle-top-mobile" onclick="toggleTopSection()" title="Subir cabeçalho e ver dados em tela cheia" style="all:unset; cursor:pointer; padding:7px 8px; border-radius:8px; font-size:0.75rem; font-weight:700; background:rgba(2,132,199,0.2); border:1px solid rgba(2,132,199,0.5); color:#38bdf8; display:inline-flex; align-items:center; gap:2px; white-space:nowrap;">
        <span id="btn-toggle-top-icon">🔼</span> <span id="btn-toggle-top-text">Subir</span>
      </button>
      <!-- BOTÃO FECHAR MODAL MOBILE -->
      <button onclick="closeDfModal()" title="Fechar" style="all:unset; cursor:pointer; width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,0.12); color:#fff; font-size:1.1rem; font-weight:bold;">✕</button>
    </div>

    <!-- BLOCO SUPERIOR COLAPSÁVEL (CABEÇALHO, DOSSIÊ/QUADRO, FILTROS RÁPIDOS E DROPDOWNS) -->
    <div id="df-top-collapsible" style="transition: all 0.25s ease;">
      <!-- HEADER -->
      <div id="df-modal-header" style="padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02);">
        <div>
          <div style="display:flex; align-items:center; gap:10px;">
            <h2 style="margin:0; font-size:1.25rem; font-weight:700; display:flex; align-items:center; gap:8px;">
              <span>🏛️</span><span>Distrito Federal — Apuração Oficial por Regiões Administrativas (35 RAs)</span>
            </h2>
            <span style="font-size:0.75rem; background:#22c55e22; color:#22c55e; border:1px solid #22c55e44; padding:2px 8px; border-radius:100px; font-weight:600;">100,00% Apurado</span>
          </div>
          <p style="margin:4px 0 0; font-size:0.8rem; color:#A6A39C;">
            Dados Oficiais do TRE-DF / TSE (${activeTurno === '1' ? 'Eleição Oficial 6259 & 6257 · 1º Turno' : 'Eleição Oficial 6260 & 6258 · 2º Turno'}) · Governador do DF · 35 RAs · 19 Zonas Eleitorais
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <a href="/download/planilha" download="Auditoria_Eleitoral_DF_2026_Oficial_TSE.xlsx" title="Baixar Planilha Oficial do TSE (.xlsx) Completa" style="all:unset; cursor:pointer; padding:6px 14px; border-radius:8px; font-size:0.8rem; font-weight:700; background:linear-gradient(135deg, #10b981, #059669); border:1px solid rgba(255,255,255,0.25); color:#fff; display:inline-flex; align-items:center; gap:6px; box-shadow:0 0 12px rgba(16,185,129,0.4); text-decoration:none;">
            📥 Baixar Planilha TSE (.xlsx)
          </a>
          <button onclick="window.print()" class="desktop-only-btn" title="Imprimir Relatório ou Salvar em PDF" style="all:unset; cursor:pointer; padding:6px 12px; border-radius:8px; font-size:0.8rem; font-weight:600; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); color:#fff; display:inline-flex; align-items:center; gap:5px;">
            🖨️ Imprimir / PDF
          </button>
          <button onclick="closeDfModal()" class="desktop-only-btn" style="all:unset; cursor:pointer; width:38px; height:38px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,0.12); color:#FAFAF9; font-size:1.2rem; font-weight:bold; transition:background .15s;">✕</button>
        </div>
      </div>

      <!-- TABS DE MODO DE VISUALIZAÇÃO -->
      <div id="df-desktop-tabs" style="padding:10px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:10px; align-items:center; flex-wrap:wrap; background:rgba(0,0,0,0.3);">
        <button id="tab-governo" onclick="setDfTab('governo')" style="all:unset; cursor:pointer; padding:7px 18px; border-radius:100px; font-weight:700; font-size:0.85rem; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; display:inline-flex; align-items:center; gap:6px; transition:all .15s; box-shadow:0 0 14px rgba(2,132,199,0.45);">
          🏛️ Governador do DF (Votação nas 35 RAs)
        </button>
        <button id="tab-marcela" onclick="setDfTab('marcela')" style="all:unset; cursor:pointer; padding:7px 16px; border-radius:100px; font-weight:600; font-size:0.85rem; background:transparent; color:#f59e0b; border:1px solid rgba(245,158,11,0.4); display:inline-flex; align-items:center; gap:6px; transition:all .15s;">
          ⭐ Dossiê Marcela Passamani (15555 · MDB)
        </button>
        <button id="tab-geral" onclick="setDfTab('geral')" style="all:unset; cursor:pointer; padding:7px 14px; border-radius:100px; font-weight:600; font-size:0.85rem; background:transparent; color:rgba(255,255,255,0.6); transition:all .15s;">
          📊 Quadro Geral das 35 RAs (Distritais)
        </button>
      </div>

      <!-- BOTÕES DE FILTRO RÁPIDO (DINÂMICO CONFORME A ABA) -->
      <div id="df-modal-quick-filters" style="padding:8px 24px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; gap:8px; align-items:center; flex-wrap:wrap; background:rgba(255,255,255,0.015);">
      </div>

      <!-- CONTROLS & DROPDOWN FILTERS -->
      <div id="df-modal-controls" style="padding:10px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:rgba(0,0,0,0.2);">
        <!-- BUSCA LIVRE COM LUPA CLICÁVEL (MOBILE E DESKTOP) -->
        <div id="df-search-wrapper" style="flex:1; min-width:240px; position:relative;">
          <form id="df-search-form" action="javascript:void(0);" onsubmit="triggerDfSearch(); return false;" style="position:relative; width:100%; display:flex; align-items:center; margin:0;">
            <!-- ÍCONE LUPA FIXO NO INÍCIO DO CAMPO -->
            <span style="position:absolute; left:12px; pointer-events:none; display:flex; align-items:center; opacity:0.65; z-index:2;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A6A39C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>

            <!-- INPUT DE PESQUISA COM SUPORTE TOTAL A TECLADOS MOBILE -->
            <input id="df-search-input" type="search" enterkeyhint="search" inputmode="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
              placeholder="Buscar por Colégio, Seção, RA..."
              oninput="onDfSearchInput(this.value)"
              onkeydown="if(event.key==='Enter'){event.preventDefault(); triggerDfSearch();}"
              style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.16); border-radius:100px; padding:8px 90px 8px 34px; color:#fff; font-size:0.85rem; outline:none; transition:all .15s; -webkit-appearance:none;" />

            <!-- AÇÕES À DIREITA: BOTÃO LIMPAR E BOTÃO LUPA CLICÁVEL -->
            <div style="position:absolute; right:4px; display:flex; align-items:center; gap:4px; z-index:3;">
              <button id="df-search-clear" type="button" onclick="clearDfSearch()" title="Limpar busca"
                style="display:none; all:unset; cursor:pointer; width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.14); color:#D6D4CF; font-size:12px; font-weight:bold; place-items:center; justify-content:center; align-items:center; transition:background .15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.14)'">
                ✕
              </button>

              <button id="df-search-btn" type="submit" onclick="triggerDfSearch()" title="Pesquisar agora"
                style="all:unset; cursor:pointer; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; font-size:0.8rem; font-weight:700; padding:6px 14px; border-radius:100px; display:inline-flex; align-items:center; gap:5px; box-shadow:0 0 12px rgba(2,132,199,0.5); transition:transform .12s, box-shadow .12s; white-space:nowrap;"
                onmousedown="this.style.transform='scale(0.94)'" onmouseup="this.style.transform='scale(1)'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span class="df-search-btn-label">Buscar</span>
              </button>
            </div>
          </form>
        </div>

        <!-- SELECT RA -->
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.75rem; color:#A6A39C;">RA:</span>
          <select id="df-ra-select" onchange="selectDfRa(this.value)" style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 10px; color:#FAFAF9; font-size:0.82rem; outline:none; cursor:pointer; max-width:180px;">
            <option value="all">Todas as 35 RAs (DF Completo)</option>
          </select>
        </div>

        <!-- SELECT ZONA -->
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.75rem; color:#A6A39C;">Zona:</span>
          <select id="df-zona-select" onchange="selectDfZona(this.value)" style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 10px; color:#FAFAF9; font-size:0.82rem; outline:none; cursor:pointer; max-width:160px;">
            <option value="all">Todas as 19 Zonas</option>
            <option value="18" style="font-weight:bold; color:#34d399;">⭐ 18ª ZE (São Sebastião & JB - 841 votos)</option>
          </select>
        </div>

        <!-- SELECT TIPO ÁREA -->
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.75rem; color:#A6A39C;">Área:</span>
          <select id="df-tipo-select" onchange="selectDfTipo(this.value)" style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 10px; color:#FAFAF9; font-size:0.82rem; outline:none; cursor:pointer;">
            <option value="all">Todas</option>
            <option value="Rural">🌾 Rural</option>
            <option value="Urbano">🏙️ Urbana</option>
          </select>
        </div>
      </div>

      <!-- BOTÃO INLINE VISÍVEL NO MOBILE PARA SUBIR PARTE SUPERIOR -->
      <div class="mobile-only-subir-bar" style="display:none; padding:8px 12px; background:rgba(245,158,11,0.12); border-bottom:1px solid rgba(245,158,11,0.3); text-align:center;">
        <button onclick="toggleTopSection()" style="all:unset; cursor:pointer; font-size:0.8rem; font-weight:700; color:#f59e0b; display:inline-flex; align-items:center; gap:6px;">
          <span>🔼</span><span>Subir esta parte e ver informações em tela cheia</span><span>🔼</span>
        </button>
      </div>
    </div>

    <!-- BODY GRID -->
    <div id="df-modal-body-grid" style="flex:1; overflow-y:auto; padding:18px 24px; display:grid; grid-template-columns:390px 1fr; gap:20px; -webkit-overflow-scrolling:touch;">
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
