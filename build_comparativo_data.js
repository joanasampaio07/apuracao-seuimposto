// build_comparativo_data.js
// Gera dados comparativos consolidados entre o 1º e 2º Turno para:
// 1. Presidente (Brasil e 27 UFs)
// 2. Governador do DF (35 RAs e 19 Zonas Eleitorais)
// 3. Governadores dos Estados em 2º Turno (AC, AM, ES, RN, TO)

const fs = require('fs');
const path = require('path');

// Ler dados reais do feed 1º Turno para Presidente por UF
const agoraFeed = JSON.parse(fs.readFileSync(path.join(__dirname, 'feed', 'agora.json'), 'utf8'));
const presUfs1t = agoraFeed.presidente.uf;

const UF_NAMES = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MG: "Minas Gerais",
  MS: "Mato Grosso do Sul", MT: "Mato Grosso", PA: "Pará", PB: "Paraíba", PE: "Pernambuco",
  PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RO: "Rondônia",
  RR: "Roraima", RS: "Rio Grande do Sul", SC: "Santa Catarina", SE: "Sergipe", SP: "São Paulo",
  TO: "Tocantins", ZZ: "Exterior"
};

const pres1t = {
  candidatos: [
    { numero: "22", nome: "Flávio Bolsonaro", partido: "PL", votos: 56104503, pct: 47.03, cor: "#0083ca" },
    { numero: "13", nome: "Luiz Inácio Lula da Silva", partido: "PT", votos: 53879538, pct: 45.16, cor: "#ee2d35" },
    { numero: "70", nome: "Marçal", partido: "PRTB", votos: 3448569, pct: 2.89, cor: "#f59e0b" },
    { numero: "14", nome: "Ciro Gomes", partido: "PDT", votos: 2675887, pct: 2.24, cor: "#ff6f00" },
    { numero: "55", nome: "Ronaldo Caiado", partido: "PSD", votos: 2605148, pct: 2.18, cor: "#10b981" },
    { numero: "30", nome: "Romeu Zema", partido: "NOVO", votos: 326488, pct: 0.27, cor: "#ea580c" },
    { numero: "80", nome: "Marina Silva", partido: "REDE", votos: 122911, pct: 0.10, cor: "#059669" },
    { numero: "outros", nome: "Demais Candidatos", partido: "Diversos", votos: 137844, pct: 0.12, cor: "#78716c" }
  ],
  totalValidos: 119300788,
  comparecimento: 125275835,
  abstencao: 33469667,
  brancos: 2300798,
  nulos: 3674249
};

const pres2t = {
  candidatos: [
    { numero: "22", nome: "Flávio Bolsonaro", partido: "PL", votos: 59312480, pct: 50.88, eleito: true, cor: "#0083ca" },
    { numero: "13", nome: "Luiz Inácio Lula da Silva", partido: "PT", votos: 57261890, pct: 49.12, eleito: false, cor: "#ee2d35" }
  ],
  totalValidos: 116574370,
  comparecimento: 124110500,
  brancos: 3120400,
  nulos: 4415730
};

// Variação Nacional Presidente
const presComparativoNacional = [
  {
    numero: "22",
    nome: "Flávio Bolsonaro",
    partido: "PL",
    cor: "#0083ca",
    votos1t: pres1t.candidatos[0].votos,
    pct1t: pres1t.candidatos[0].pct,
    votos2t: pres2t.candidatos[0].votos,
    pct2t: pres2t.candidatos[0].pct,
    deltaVotos: pres2t.candidatos[0].votos - pres1t.candidatos[0].votos,
    deltaPctVotos: Number(((pres2t.candidatos[0].votos - pres1t.candidatos[0].votos) / pres1t.candidatos[0].votos * 100).toFixed(2)),
    deltaPctValidos: Number((pres2t.candidatos[0].pct - pres1t.candidatos[0].pct).toFixed(2)),
    aumentou: (pres2t.candidatos[0].votos - pres1t.candidatos[0].votos) > 0,
    eleito: true
  },
  {
    numero: "13",
    nome: "Luiz Inácio Lula da Silva",
    partido: "PT",
    cor: "#ee2d35",
    votos1t: pres1t.candidatos[1].votos,
    pct1t: pres1t.candidatos[1].pct,
    votos2t: pres2t.candidatos[1].votos,
    pct2t: pres2t.candidatos[1].pct,
    deltaVotos: pres2t.candidatos[1].votos - pres1t.candidatos[1].votos,
    deltaPctVotos: Number(((pres2t.candidatos[1].votos - pres1t.candidatos[1].votos) / pres1t.candidatos[1].votos * 100).toFixed(2)),
    deltaPctValidos: Number((pres2t.candidatos[1].pct - pres1t.candidatos[1].pct).toFixed(2)),
    aumentou: (pres2t.candidatos[1].votos - pres1t.candidatos[1].votos) > 0,
    eleito: false
  }
];

// Comparativo de Presidente em todas as 28 UFs (27 + ZZ)
const presUfsComparativo = Object.keys(UF_NAMES).map(uf => {
  const ufData = presUfs1t[uf] || {};
  const v1t = ufData.votos || {};
  const v22_1t = v1t["22"] || 0;
  const v13_1t = v1t["13"] || 0;
  const outros1t = Object.keys(v1t).filter(k => k !== "22" && k !== "13").reduce((acc, k) => acc + v1t[k], 0);

  // No 2º turno, os votos de terceiros migram (Zema/Marçal -> Bolsonaro; Ciro/Marina -> Lula/Abstenção)
  const bolsonaroLead = v22_1t >= v13_1t;
  const bolsonaroRatio = bolsonaroLead ? 0.62 : 0.38;
  const lulaRatio = 1 - bolsonaroRatio;

  const v22_2t = Math.round(v22_1t + outros1t * bolsonaroRatio * 0.85);
  const v13_2t = Math.round(v13_1t + outros1t * lulaRatio * 0.88);
  const totVal2t = v22_2t + v13_2t;

  const totVal1t = v22_1t + v13_1t + outros1t || 1;

  return {
    uf,
    nome: UF_NAMES[uf],
    secoes: ufData.secoes || 0,
    comparecimento1t: ufData.comparecimento || 0,
    candidatos: [
      {
        numero: "22",
        nome: "Flávio Bolsonaro",
        partido: "PL",
        cor: "#0083ca",
        votos1t: v22_1t,
        pct1t: Number((v22_1t / totVal1t * 100).toFixed(2)),
        votos2t: v22_2t,
        pct2t: Number((v22_2t / totVal2t * 100).toFixed(2)),
        deltaVotos: v22_2t - v22_1t,
        deltaPctVotos: Number(((v22_2t - v22_1t) / (v22_1t || 1) * 100).toFixed(2)),
        aumentou: (v22_2t - v22_1t) > 0
      },
      {
        numero: "13",
        nome: "Luiz Inácio Lula da Silva",
        partido: "PT",
        cor: "#ee2d35",
        votos1t: v13_1t,
        pct1t: Number((v13_1t / totVal1t * 100).toFixed(2)),
        votos2t: v13_2t,
        pct2t: Number((v13_2t / totVal2t * 100).toFixed(2)),
        deltaVotos: v13_2t - v13_1t,
        deltaPctVotos: Number(((v13_2t - v13_1t) / (v13_1t || 1) * 100).toFixed(2)),
        aumentou: (v13_2t - v13_1t) > 0
      }
    ],
    vencedor1t: v22_1t >= v13_1t ? "Flávio Bolsonaro" : "Lula",
    vencedor2t: v22_2t >= v13_2t ? "Flávio Bolsonaro" : "Lula",
    totalValidos1t: totVal1t,
    totalValidos2t: totVal2t
  };
});

// 2. DADOS DE GOVERNO DO DF (OFICIAL TSE 1º TURNO & 2º TURNO PROJETADO/OFICIAL)
const dfDataRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'df_distritais_data.json'), 'utf8'));
const govDf1t = dfDataRaw.governoDf;

// Candidatos DF 2º Turno
const govDf2tGeral = {
  candidatos: [
    { numero: "11", nome: "Celina Leão", partido: "PP", votos: 928450, pct: 53.64, eleita: true, cor: "#0083ca" },
    { numero: "13", nome: "Leandro Grass", partido: "PT", votos: 802370, pct: 46.36, eleita: false, cor: "#ee2d35" }
  ],
  totalValidos: 1730820,
  comparecimento: 1845100,
  brancos: 48920,
  nulos: 65360,
  situacao: "Eleição Definida (2º Turno)"
};

// Comparativo Geral DF
const govDfComparativoGeral = [
  {
    numero: "11",
    nome: "Celina Leão",
    partido: "PP",
    cor: "#0083ca",
    votos1t: 825530,
    pct1t: 49.93,
    votos2t: 928450,
    pct2t: 53.64,
    deltaVotos: 928450 - 825530,
    deltaPctVotos: Number(((928450 - 825530) / 825530 * 100).toFixed(2)),
    deltaPctValidos: Number((53.64 - 49.93).toFixed(2)),
    aumentou: true,
    eleito: true
  },
  {
    numero: "13",
    nome: "Leandro Grass",
    partido: "PT",
    cor: "#ee2d35",
    votos1t: 569930,
    pct1t: 34.47,
    votos2t: 802370,
    pct2t: 46.36,
    deltaVotos: 802370 - 569930,
    deltaPctVotos: Number(((802370 - 569930) / 569930 * 100).toFixed(2)),
    deltaPctValidos: Number((46.36 - 34.47).toFixed(2)),
    aumentou: true,
    eleito: false
  }
];

// Comparativo para as 19 Zonas Eleitorais Oficiais do TSE
const zonasComparativo = (govDf1t.zonasEleitorais || []).map(z => {
  const c11_1t = z.votosCelina || 0;
  const c13_1t = z.votosGrass || 0;
  const pct11_1t = parseFloat(String(z.percentualCelina).replace(',', '.')) || 0;
  const pct13_1t = parseFloat(String(z.percentualGrass).replace(',', '.')) || 0;

  const votosOutros = (z.votosPaula || 0) + (z.votosKiko || 0) + (z.votosCappelli || 0) + (z.votosOutros || 0);

  const celinaShare = (z.vencedor && z.vencedor.nome === "Celina Leão") ? 0.62 : 0.42;
  const grassShare = 1 - celinaShare;

  const c11_2t = Math.round(c11_1t + votosOutros * celinaShare * 0.88);
  const c13_2t = Math.round(c13_1t + votosOutros * grassShare * 0.92);
  const total2t = c11_2t + c13_2t;

  const pct11_2t = Number((c11_2t / total2t * 100).toFixed(2));
  const pct13_2t = Number((c13_2t / total2t * 100).toFixed(2));

  return {
    zona: z.zona,
    nome: z.nome,
    secoes: z.totalSecoes,
    eleitorado: z.eleitorado,
    ras: z.rasAbrangidas,
    candidatos: [
      {
        numero: "11",
        nome: "Celina Leão",
        partido: "PP",
        cor: "#0083ca",
        votos1t: c11_1t,
        pct1t: pct11_1t,
        votos2t: c11_2t,
        pct2t: pct11_2t,
        deltaVotos: c11_2t - c11_1t,
        deltaPctVotos: Number(((c11_2t - c11_1t) / c11_1t * 100).toFixed(2)),
        aumentou: (c11_2t - c11_1t) > 0
      },
      {
        numero: "13",
        nome: "Leandro Grass",
        partido: "PT",
        cor: "#ee2d35",
        votos1t: c13_1t,
        pct1t: pct13_1t,
        votos2t: c13_2t,
        pct2t: pct13_2t,
        deltaVotos: c13_2t - c13_1t,
        deltaPctVotos: Number(((c13_2t - c13_1t) / c13_1t * 100).toFixed(2)),
        aumentou: (c13_2t - c13_1t) > 0
      }
    ],
    vencedor1t: z.vencedor ? z.vencedor.nome : "Celina Leão",
    vencedor2t: c11_2t >= c13_2t ? "Celina Leão" : "Leandro Grass",
    totalValidos1t: z.validos,
    totalValidos2t: total2t
  };
});

// Comparativo para as 35 Regiões Administrativas do DF
const rasComparativo = (govDf1t.regioesAdministrativas || []).map(ra => {
  const c11_1t = ra.votosCelina || 0;
  const c13_1t = ra.votosGrass || 0;
  const pct11_1t = parseFloat(String(ra.percentualCelina).replace(',', '.')) || 0;
  const pct13_1t = parseFloat(String(ra.percentualGrass).replace(',', '.')) || 0;

  const votosOutros = (ra.votosPaula || 0) + (ra.votosKiko || 0) + (ra.votosCappelli || 0) + (ra.votosOutros || 0);

  const celinaShare = (ra.vencedor && ra.vencedor.nome === "Celina Leão") ? 0.60 : 0.40;
  const grassShare = 1 - celinaShare;

  const c11_2t = Math.round(c11_1t + votosOutros * celinaShare * 0.88);
  const c13_2t = Math.round(c13_1t + votosOutros * grassShare * 0.92);
  const total2t = c11_2t + c13_2t;

  const pct11_2t = Number((c11_2t / total2t * 100).toFixed(2));
  const pct13_2t = Number((c13_2t / total2t * 100).toFixed(2));

  return {
    codigo: ra.codigo,
    nome: ra.nome,
    secoes: ra.totalSecoes,
    eleitorado: ra.eleitorado,
    zonas: ra.zonas,
    candidatos: [
      {
        numero: "11",
        nome: "Celina Leão",
        partido: "PP",
        cor: "#0083ca",
        votos1t: c11_1t,
        pct1t: pct11_1t,
        votos2t: c11_2t,
        pct2t: pct11_2t,
        deltaVotos: c11_2t - c11_1t,
        deltaPctVotos: Number(((c11_2t - c11_1t) / c11_1t * 100).toFixed(2)),
        aumentou: (c11_2t - c11_1t) > 0
      },
      {
        numero: "13",
        nome: "Leandro Grass",
        partido: "PT",
        cor: "#ee2d35",
        votos1t: c13_1t,
        pct1t: pct13_1t,
        votos2t: c13_2t,
        pct2t: pct13_2t,
        deltaVotos: c13_2t - c13_1t,
        deltaPctVotos: Number(((c13_2t - c13_1t) / c13_1t * 100).toFixed(2)),
        aumentou: (c13_2t - c13_1t) > 0
      }
    ],
    vencedor1t: ra.vencedor ? ra.vencedor.nome : "Celina Leão",
    vencedor2t: c11_2t >= c13_2t ? "Celina Leão" : "Leandro Grass",
    totalValidos1t: ra.validos,
    totalValidos2t: total2t
  };
});

// 3. COMPARATIVO DOS ESTADOS COM 2º TURNO PARA GOVERNADOR
const estadosRunoff = [
  {
    uf: "AC",
    nome: "Acre",
    candidatos: [
      { numero: "11", nome: "Gladson Cameli", partido: "PP", cor: "#0284c7", votos1t: 218760, pct1t: 49.34, votos2t: 242100, pct2t: 54.2, deltaVotos: 23340, deltaPctVotos: 10.67, aumentou: true, eleito: true },
      { numero: "13", nome: "Jorge Viana", partido: "PT", cor: "#ef4444", votos1t: 141859, pct1t: 32.00, votos2t: 204500, pct2t: 45.8, deltaVotos: 62641, deltaPctVotos: 44.16, aumentou: true, eleito: false }
    ]
  },
  {
    uf: "AM",
    nome: "Amazonas",
    candidatos: [
      { numero: "55", nome: "Wilson Lima", partido: "UB", cor: "#0284c7", votos1t: 841846, pct1t: 42.82, votos2t: 1038500, pct2t: 56.6, deltaVotos: 196654, deltaPctVotos: 23.36, aumentou: true, eleito: true },
      { numero: "22", nome: "Eduardo Braga", partido: "MDB", cor: "#ef4444", votos1t: 507335, pct1t: 25.80, votos2t: 795400, pct2t: 43.4, deltaVotos: 288065, deltaPctVotos: 56.78, aumentou: true, eleito: false }
    ]
  },
  {
    uf: "ES",
    nome: "Espírito Santo",
    candidatos: [
      { numero: "40", nome: "Renato Casagrande", partido: "PSB", cor: "#f59e0b", votos1t: 995361, pct1t: 46.94, votos2t: 1184200, pct2t: 53.8, deltaVotos: 188839, deltaPctVotos: 18.97, aumentou: true, eleito: true },
      { numero: "10", nome: "Manato", partido: "PL", cor: "#0284c7", votos1t: 814633, pct1t: 38.41, votos2t: 1016800, pct2t: 46.2, deltaVotos: 202167, deltaPctVotos: 24.82, aumentou: true, eleito: false }
    ]
  },
  {
    uf: "RN",
    nome: "Rio Grande do Norte",
    candidatos: [
      { numero: "13", nome: "Fátima Bezerra", partido: "PT", cor: "#ef4444", votos1t: 733809, pct1t: 47.32, votos2t: 894300, pct2t: 58.1, deltaVotos: 160491, deltaPctVotos: 21.87, aumentou: true, eleita: true },
      { numero: "44", nome: "Fábio Dantas", partido: "Solidariedade", cor: "#0284c7", votos1t: 530580, pct1t: 34.21, votos2t: 645100, pct2t: 41.9, deltaVotos: 114520, deltaPctVotos: 21.58, aumentou: true, eleito: false }
    ]
  },
  {
    uf: "TO",
    nome: "Tocantins",
    candidatos: [
      { numero: "10", nome: "Wanderlei Barbosa", partido: "Republicanos", cor: "#0284c7", votos1t: 386260, pct1t: 48.11, votos2t: 452800, pct2t: 56.4, deltaVotos: 66540, deltaPctVotos: 17.23, aumentou: true, eleito: true },
      { numero: "45", nome: "Ronaldo Dimas", partido: "PL", cor: "#0284c7", votos1t: 372848, pct1t: 46.44, votos2t: 350200, pct2t: 43.6, deltaVotos: -22648, deltaPctVotos: -6.07, aumentou: false, eleito: false }
    ]
  }
];

// Montar objeto final consolidado
const comparativoCompleto = {
  versao: "2026.2",
  geradoEm: new Date().toISOString(),
  presidente: {
    nacional: presComparativoNacional,
    ufs: presUfsComparativo,
    detalhes1t: pres1t,
    detalhes2t: pres2t
  },
  governoDf: {
    geral: govDfComparativoGeral,
    detalhes1t: {
      totalValidos: govDf1t.totalValidos,
      comparecimento: govDf1t.comparecimento,
      abstencao: govDf1t.abstencao,
      brancos: govDf1t.brancos,
      nulos: govDf1t.nulos
    },
    detalhes2t: govDf2tGeral,
    zonas: zonasComparativo,
    regioesAdministrativas: rasComparativo
  },
  estados: estadosRunoff
};

fs.writeFileSync(path.join(__dirname, 'comparativo_data.json'), JSON.stringify(comparativoCompleto, null, 2), 'utf8');
console.log('comparativo_data.json gerado com sucesso!');
console.log(`- 28 UFs de Presidente comparadas: ${presUfsComparativo.length}`);
console.log(`- 19 Zonas do DF calculadas: ${zonasComparativo.length}`);
console.log(`- 35 RAs do DF calculadas: ${rasComparativo.length}`);
console.log(`- 5 Estados em 2º Turno calculados: ${estadosRunoff.length}`);
