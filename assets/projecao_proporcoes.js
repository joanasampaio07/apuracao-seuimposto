// assets/projecao_proporcoes.js
// Componente Oficial de Projeção Estatística e Curva de Proporções (Eleições 2026)
// Exibição estrita: APENAS no 2º Turno (turno=2). No 1º Turno, é removido imediatamente.

(function () {
  const LULA_IMG = 'retratos/280002542548.cbf4ef28.webp';
  const FLAVIO_IMG = 'retratos/280002551544.d8a60933.webp';

  const PROJ_DATA = {
    lula: 51.82,
    flavio: 48.18,
    urnasChamada: "4,26%",
    horarioChamada: "19:26",
    resultadoFinal: "51,79%",
    diffFinal: "0,03 p.p.",
    abstencao: [
      { reg: "Brasil", val: "-1,9" },
      { reg: "N", val: "+1,8" },
      { reg: "NE", val: "-1,9" },
      { reg: "SE", val: "-2,4" },
      { reg: "S", val: "-2,3" },
      { reg: "CO", val: "-1,7" }
    ],
    crescimento: [
      { uf: "RJ", pontos: "+4,5", w: "82%" },
      { uf: "SP", pontos: "+3,9", w: "72%" }
    ]
  };

  // Verificação estrita se o 2º Turno está ativo
  function isTurno2() {
    const params = new URLSearchParams(window.location.search);
    const qTurno = params.get('turno');
    if (qTurno === '1') return false;
    if (qTurno === '2') return true;

    if (window.APURACAO && window.APURACAO.turno != null) {
      return Number(window.APURACAO.turno) === 2;
    }

    const cMatch = (document.cookie || '').match(/tse_turno=([12])/);
    if (cMatch) return cMatch[1] === '2';

    try {
      const ls = localStorage.getItem('tse_turno');
      if (ls === '1') return false;
      if (ls === '2') return true;
    } catch (e) {}

    return true; // Padrão se nada especificado
  }

  function removeProjecaoCard() {
    const card = document.getElementById('executive-projecao-card');
    if (card) {
      card.style.display = 'none';
      card.remove();
    }
  }

  function createFanChartSvg(width = 310, height = 150) {
    const padL = 34;
    const padR = 20;
    const padT = 16;
    const padB = 26;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    const minY = 46.0;
    const maxY = 54.0;
    const getY = (val) => padT + chartH - ((val - minY) / (maxY - minY)) * chartH;
    const getX = (pct) => padL + (pct / 100) * chartW;

    const y50 = getY(50.0);
    const y54 = getY(54.0);
    const y46 = getY(46.0);

    const pointsLula = [];
    const pointsFlavio = [];
    const numSteps = 30;
    const maxPct = 74; // Curva encerra em ~74% da apuração conforme referência exata

    for (let i = 0; i <= numSteps; i++) {
      const p = (i / numSteps) * (maxPct / 100);
      const x = getX(p * 100);
      const valL = 51.82 + 0.45 * Math.exp(-p * 4) * Math.sin(p * 12);
      const valF = 100 - valL;
      pointsLula.push({ x, y: getY(valL), val: valL });
      pointsFlavio.push({ x, y: getY(valF), val: valF });
    }

    const pathLula = pointsLula.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    const pathFlavio = pointsFlavio.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

    const fanLula = pointsLula.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${getY(pt.val + (2.2 * Math.exp(-(i/numSteps) * 3.2) + 0.15)).toFixed(1)}`)
      .concat(pointsLula.slice().reverse().map(pt => `L ${pt.x.toFixed(1)} ${getY(pt.val - (2.2 * Math.exp(-(pointsLula.indexOf(pt)/numSteps) * 3.2) + 0.15)).toFixed(1)}`))
      .join(' ') + ' Z';

    const fanFlavio = pointsFlavio.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${getY(pt.val + (2.2 * Math.exp(-(i/numSteps) * 3.2) + 0.15)).toFixed(1)}`)
      .concat(pointsFlavio.slice().reverse().map(pt => `L ${pt.x.toFixed(1)} ${getY(pt.val - (2.2 * Math.exp(-(pointsFlavio.indexOf(pt)/numSteps) * 3.2) + 0.15)).toFixed(1)}`))
      .join(' ') + ' Z';

    const lastL = pointsLula[pointsLula.length - 1];
    const lastF = pointsFlavio[pointsFlavio.length - 1];

    return `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible; display:block;">
        <defs>
          <linearGradient id="fanLulaGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.3"/>
            <stop offset="60%" stop-color="#ef4444" stop-opacity="0.14"/>
            <stop offset="100%" stop-color="#ef4444" stop-opacity="0.05"/>
          </linearGradient>
          <linearGradient id="fanFlavioGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
            <stop offset="60%" stop-color="#3b82f6" stop-opacity="0.14"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05"/>
          </linearGradient>
        </defs>

        <!-- LINHAS GUIA HORIZONTAIS -->
        <line x1="${padL}" y1="${y54}" x2="${width - padR}" y2="${y54}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="${padL - 6}" y="${y54 + 3}" fill="rgba(255,255,255,0.4)" font-size="10" font-weight="600" text-anchor="end" font-family="system-ui">54%</text>

        <line x1="${padL}" y1="${y50}" x2="${width - padR}" y2="${y50}" stroke="rgba(255,255,255,0.22)" stroke-dasharray="3,3" stroke-width="1.2"/>
        <text x="${padL - 6}" y="${y50 + 3}" fill="#FAFAF9" font-size="10" font-weight="700" text-anchor="end" font-family="system-ui">50%</text>

        <line x1="${padL}" y1="${y46}" x2="${width - padR}" y2="${y46}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="${padL - 6}" y="${y46 + 3}" fill="rgba(255,255,255,0.4)" font-size="10" font-weight="600" text-anchor="end" font-family="system-ui">46%</text>

        <!-- FAIXAS DE INCERTEZA (FAN SHADING) -->
        <path d="${fanLula}" fill="url(#fanLulaGrad)"/>
        <path d="${fanFlavio}" fill="url(#fanFlavioGrad)"/>

        <!-- LINHAS CENTRAIS DAS PROPORÇÕES -->
        <path d="${pathLula}" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${pathFlavio}" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- PONTOS FINAIS COM BORDA DE DESTAQUE -->
        <circle cx="${lastL.x}" cy="${lastL.y}" r="4" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
        <circle cx="${lastF.x}" cy="${lastF.y}" r="4" fill="#3b82f6" stroke="#fff" stroke-width="1.5"/>

        <!-- EIXO INFERIOR -->
        <text x="${padL}" y="${height - 5}" fill="rgba(255,255,255,0.45)" font-size="9.5" font-weight="500" text-anchor="start" font-family="system-ui">0%</text>
        <text x="${padL + chartW / 2}" y="${height - 5}" fill="rgba(255,255,255,0.6)" font-size="9.5" font-weight="600" text-anchor="middle" font-family="system-ui">urnas apuradas</text>
        <text x="${width - padR}" y="${height - 5}" fill="rgba(255,255,255,0.45)" font-size="9.5" font-weight="500" text-anchor="end" font-family="system-ui">100%</text>
      </svg>
    `;
  }

  function renderProjecaoCard() {
    const card = document.createElement('section');
    card.id = 'executive-projecao-card';
    card.className = 'card chart fc enter';
    card.style.cssText = `
      background: #181715 !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      border-radius: 16px !important;
      padding: 16px 18px !important;
      color: #FAFAF9 !important;
      font-family: var(--sans, system-ui) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6) !important;
      margin-top: 10px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 14px !important;
      box-sizing: border-box !important;
      width: 100% !important;
    `;

    card.innerHTML = `
      <!-- CABEÇALHO DA PROJEÇÃO (DESIGN FIEL: TÍTULO + SUBTÍTULO, SEM BADGES) -->
      <div>
        <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.01em;">Projeção</h3>
        <div style="font-size:0.82rem; color:#A6A39C; margin-top:3px; font-weight:500;">
          Como a apuração deve terminar
        </div>
      </div>

      <!-- PLACAR DE CANDIDATOS PROJETADO (LULA VS FLÁVIO DIRETO NO CARD) -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:2px 0;">
        <!-- LULA -->
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="position:relative; width:44px; height:44px; border-radius:50%; background:#ef4444; padding:2px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(239,68,68,0.35); flex-shrink:0;">
            <img src="${LULA_IMG}" alt="Lula" style="width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;" />
          </div>
          <div>
            <div style="font-size:0.9rem; font-weight:600; color:#fff;">Lula</div>
            <div style="font-size:1.6rem; font-weight:900; color:#ef4444; line-height:1.05;">51,82%</div>
          </div>
        </div>

        <!-- FLÁVIO -->
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px; text-align:right;">
          <div>
            <div style="font-size:0.9rem; font-weight:600; color:#fff;">Flávio</div>
            <div style="font-size:1.6rem; font-weight:900; color:#3b82f6; line-height:1.05;">48,18%</div>
          </div>
          <div style="position:relative; width:44px; height:44px; border-radius:50%; background:#3b82f6; padding:2px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(59,130,246,0.35); flex-shrink:0;">
            <img src="${FLAVIO_IMG}" alt="Flávio" style="width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;" />
          </div>
        </div>
      </div>

      <!-- STATUS DA CHAMADA DA VITÓRIA (TEXTO LIMPO E DIRETO) -->
      <div style="margin-top:2px;">
        <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:700; color:#fff;">
          <span style="width:7px; height:7px; border-radius:50%; background:#ef4444; display:inline-block; box-shadow:0 0 6px #ef4444;"></span>
          Apuração encerrada
        </div>
        <div style="margin-top:8px; line-height:1.35;">
          <div style="display:flex; align-items:baseline; gap:6px; flex-wrap:wrap;">
            <span style="font-size:1.65rem; font-weight:900; color:#ef4444; line-height:1;">4,26%</span>
            <span style="font-size:0.98rem; font-weight:700; color:#fff;">das urnas apuradas</span>
          </div>
          <div style="font-size:0.84rem; color:#D6D4CF; margin-top:4px;">
            bastaram para a projeção
          </div>
          <div style="font-size:0.84rem; color:#D6D4CF;">
            indicar <strong style="color:#fff; font-weight:800;">51,82%</strong> para Lula às 19:26.
          </div>
          <div style="font-size:0.84rem; color:#D6D4CF; margin-top:4px;">
            O resultado final foi <strong style="color:#fff; font-weight:800;">51,79%</strong>.
          </div>
        </div>
      </div>

      <!-- GRÁFICO DA CURVA DE PROPORÇÕES (FAN-CHART) -->
      <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:10px 6px 6px 6px;">
        ${createFanChartSvg(310, 150)}
      </div>

      <!-- SEÇÃO INFERIOR: O QUE MUDOU DESDE O 1º TURNO -->
      <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; margin-top:2px;">
        <h4 style="margin:0; font-size:0.95rem; font-weight:800; color:#fff;">O que mudou desde o 1º turno</h4>
        <div style="font-size:0.75rem; color:#A6A39C; margin:3px 0 10px 0;">Nas urnas já apuradas, em pontos</div>

        <!-- Bloco Abstenção (Valores em negrito branco conforme referência) -->
        <div style="margin-bottom:12px;">
          <div style="font-size:0.75rem; color:#E5E4E2; font-weight:600; margin-bottom:6px;">Abstenção, nas mesmas cidades</div>
          <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:4px; text-align:left;">
            ${PROJ_DATA.abstencao.map(a => `
              <div style="display:flex; flex-direction:column; gap:2px;">
                <span style="font-size:0.72rem; color:#A6A39C;">${a.reg}</span>
                <span style="font-size:0.92rem; font-weight:800; color:#fff;">${a.val}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Bloco Onde Lula cresceu -->
        <div>
          <div style="display:flex; align-items:center; gap:6px; font-size:0.78rem; color:#E5E4E2; font-weight:600; margin-bottom:8px;">
            <img src="${LULA_IMG}" alt="Lula" style="width:18px; height:18px; border-radius:50%; object-fit:cover;" />
            <span>Onde Lula cresceu</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${PROJ_DATA.crescimento.map(c => `
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="background:rgba(255,255,255,0.1); border-radius:4px; padding:2px 8px; font-size:0.78rem; font-weight:800; color:#fff; min-width:28px; text-align:center;">${c.uf}</span>
                <div style="flex:1; height:8px; background:rgba(255,255,255,0.08); border-radius:100px; overflow:hidden;">
                  <div style="width:${c.w}; height:100%; background:#ef4444; border-radius:100px;"></div>
                </div>
                <span style="font-size:0.85rem; font-weight:800; color:#ef4444; min-width:32px; text-align:right;">${c.pontos}</span>
              </div>
            `).join('')}
          </div>
          <div style="text-align:center; font-size:0.72rem; color:#A6A39C; margin-top:8px;">
            + 25 estados com mudança menor
          </div>
        </div>
      </div>
    `;

    return card;
  }

  // Remove balões ou cards duplicados ("Projeção TSE 2026")
  function cleanDuplicateBalloons(colL) {
    if (!colL) colL = document.querySelector('.col.l');
    if (!colL) return;

    colL.querySelectorAll('.card').forEach(card => {
      if (card.id === 'executive-projecao-card' || card.classList.contains('hero') || card.classList.contains('evcard')) {
        return;
      }
      const txt = (card.innerText || card.textContent || '').trim();
      if (txt.includes('Projeção TSE 2026') || card.classList.contains('fc') || txt.includes('Ao longo da apuração')) {
        card.style.display = 'none';
        card.remove();
      }
    });
  }

  // Montar na página APENAS se estiver no 2º Turno
  function mountProjecaoCard() {
    if (!isTurno2()) {
      removeProjecaoCard();
      return;
    }

    const leftHero = document.querySelector('.hud .card.hero');
    if (!leftHero) {
      setTimeout(mountProjecaoCard, 200);
      return;
    }

    const colL = leftHero.parentNode;
    if (colL) {
      colL.style.overflowY = 'auto';
      colL.style.overflowX = 'hidden';
      colL.style.maxHeight = 'calc(100vh - 90px)';
      colL.style.overscrollBehaviorY = 'contain';
      colL.style.webkitOverflowScrolling = 'touch';
      colL.style.pointerEvents = 'auto';

      cleanDuplicateBalloons(colL);
    }

    if (!document.getElementById('executive-projecao-card')) {
      const card = renderProjecaoCard();
      leftHero.parentNode.insertBefore(card, leftHero.nextSibling);
    }

    cleanDuplicateBalloons(colL);
  }

  // Monitoramento contínuo para garantir que nunca apareça no 1º turno
  setInterval(() => {
    if (!isTurno2()) {
      removeProjecaoCard();
    } else {
      if (!document.getElementById('executive-projecao-card')) {
        mountProjecaoCard();
      }
    }
    cleanDuplicateBalloons();
  }, 400);

  // Listener para capturar cliques nos botões de turno imediatamente
  document.addEventListener('click', function (ev) {
    const btn = ev.target && ev.target.closest && ev.target.closest('.btn-tse-1t, #btn-tse-1t, #btn-tse-top-1t, #btn-tse-bottom-1t, [data-turno="1"]');
    if (btn) {
      removeProjecaoCard();
    }
  }, true);

  // Hook no switchTseTurno
  const origSwitch = window.switchTseTurno;
  window.switchTseTurno = function (id) {
    const t = (id === '6258' || id === 2 || id === '2') ? 2 : 1;
    if (t === 1) {
      removeProjecaoCard();
    }
    if (typeof origSwitch === 'function') {
      return origSwitch.apply(this, arguments);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountProjecaoCard);
  } else {
    mountProjecaoCard();
  }
})();
