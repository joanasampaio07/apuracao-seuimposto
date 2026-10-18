const fs = require('fs');
const path = require('path');

const tseZonasRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'tse_cache', 'tse_zonas_governo_oficial.json'), 'utf8'));
const dfDistPath = path.join(__dirname, 'df_distritais_data.json');
const dfData = JSON.parse(fs.readFileSync(dfDistPath, 'utf8'));

// Nomes e RAs das 19 Zonas do DF
const ZONAS_INFO = {
  1: { nome: "Asa Sul / Plano Piloto", ras: ["RA I", "RA XVI"] },
  2: { nome: "Paranoá / Itapoã", ras: ["RA VII", "RA XXVIII"] },
  3: { nome: "Taguatinga Norte", ras: ["RA III"] },
  4: { nome: "Santa Maria", ras: ["RA XIII"] },
  5: { nome: "Sobradinho I e II / Fercal", ras: ["RA V", "RA XXVI", "RA XXXI"] },
  6: { nome: "Planaltina / Arapoanga", ras: ["RA VI", "RA XXXIV"] },
  8: { nome: "Ceilândia Norte", ras: ["RA IX"] },
  9: { nome: "Guará I e II / Estrutural / SIA", ras: ["RA X", "RA XXV", "RA XXIX"] },
  10: { nome: "Núcleo Bandeirante / Candangolândia / Park Way / Riacho Fundo", ras: ["RA VIII", "RA XIX", "RA XXIV", "RA XVII"] },
  11: { nome: "Cruzeiro / Sudoeste / Octogonal", ras: ["RA XI", "RA XXII"] },
  13: { nome: "Samambaia Norte / Água Quente", ras: ["RA XII", "RA XXXV"] },
  14: { nome: "Asa Norte / Lago Norte / Varjão", ras: ["RA I", "RA XVIII", "RA XXIII"] },
  15: { nome: "Águas Claras / Taguatinga Sul / Vicente Pires / Arniqueira", ras: ["RA XX", "RA III", "RA XXX", "RA XXXIII"] },
  16: { nome: "Ceilândia Centro / P Sul / Sol Nascente", ras: ["RA IX", "RA XXXII"] },
  17: { nome: "Gama", ras: ["RA II"] },
  18: { nome: "São Sebastião / Jardim Botânico", ras: ["RA XIV", "RA XXVII"] },
  19: { nome: "Taguatinga Centro / Brazlândia", ras: ["RA III", "RA IV"] },
  20: { nome: "Ceilândia Sul", ras: ["RA IX"] },
  21: { nome: "Recanto das Emas / Riacho Fundo II", ras: ["RA XV", "RA XXI"] }
};

// Processar dados das 19 Zonas Oficiais do TSE
const zonasEleitorais = [];
for (const zNum of [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21]) {
  const zd = tseZonasRaw[String(zNum)];
  if (!zd) continue;
  
  const cands = zd.candidatos;
  const celina = cands.find(c => c.numero === '11')?.votos || 0;
  const grass = cands.find(c => c.numero === '13')?.votos || 0;
  const belmonte = cands.find(c => c.numero === '45')?.votos || 0;
  const caputo = cands.find(c => c.numero === '30')?.votos || 0;
  const cappelli = cands.find(c => c.numero === '40')?.votos || 0;
  const samara = cands.find(c => c.numero === '80')?.votos || 0;
  const robson = cands.find(c => c.numero === '16')?.votos || 0;
  const elisson = cands.find(c => c.numero === '36')?.votos || 0;
  const rico = cands.find(c => c.numero === '28')?.votos || 0;
  const expedito = cands.find(c => c.numero === '29')?.votos || 0;
  const outros = samara + robson + elisson + rico + expedito;
  
  const validos = celina + grass + belmonte + caputo + cappelli + outros;
  const pCelina = parseFloat(((celina / validos) * 100).toFixed(2));
  const pGrass = parseFloat(((grass / validos) * 100).toFixed(2));
  const pBelmonte = parseFloat(((belmonte / validos) * 100).toFixed(2));
  const pCaputo = parseFloat(((caputo / validos) * 100).toFixed(2));
  const pCappelli = parseFloat(((cappelli / validos) * 100).toFixed(2));
  const pOutros = parseFloat(((outros / validos) * 100).toFixed(2));

  const info = ZONAS_INFO[zNum] || { nome: `Zona ${zNum}`, ras: [] };
  const vencedor = celina >= grass ? {
    numero: "11",
    nome: "Celina Leão",
    partido: "PP",
    cor: "#0083ca",
    votos: celina,
    percentual: `${pCelina.toFixed(2).replace('.', ',')}%`
  } : {
    numero: "13",
    nome: "Leandro Grass",
    partido: "PT",
    cor: "#ee2d35",
    votos: grass,
    percentual: `${pGrass.toFixed(2).replace('.', ',')}%`
  };

  zonasEleitorais.push({
    zona: zNum,
    nome: info.nome,
    rasAbrangidas: info.ras,
    totalSecoes: zd.secoesTotal,
    secoesApuradas: zd.secoesTotalizadas,
    percentualApurado: "100,00%",
    eleitorado: zd.eleitorado,
    comparecimento: zd.comparecimento,
    percentualComparecimento: `${((zd.comparecimento / zd.eleitorado) * 100).toFixed(2)}%`,
    abstencao: zd.abstencao,
    percentualAbstencao: `${((zd.abstencao / zd.eleitorado) * 100).toFixed(2)}%`,
    brancos: zd.brancos,
    percentualBrancos: `${((zd.brancos / zd.comparecimento) * 100).toFixed(2)}%`,
    nulos: zd.nulos,
    percentualNulos: `${((zd.nulos / zd.comparecimento) * 100).toFixed(2)}%`,
    validos: validos,
    votosCelina: celina,
    percentualCelina: `${pCelina.toFixed(2).replace('.', ',')}%`,
    votosGrass: grass,
    percentualGrass: `${pGrass.toFixed(2).replace('.', ',')}%`,
    votosPaula: belmonte,
    percentualPaula: `${pBelmonte.toFixed(2).replace('.', ',')}%`,
    votosKiko: caputo,
    percentualKiko: `${pCaputo.toFixed(2).replace('.', ',')}%`,
    votosCappelli: cappelli,
    percentualCappelli: `${pCappelli.toFixed(2).replace('.', ',')}%`,
    votosOutros: outros,
    percentualOutros: `${pOutros.toFixed(2).replace('.', ',')}%`,
    vencedor,
    rankingCandidatos: [
      { numero: "11", nome: "Celina Leão", partido: "PP", cor: "#0083ca", votos: celina, percentual: `${pCelina.toFixed(2).replace('.', ',')}%` },
      { numero: "13", nome: "Leandro Grass", partido: "PT", cor: "#ee2d35", votos: grass, percentual: `${pGrass.toFixed(2).replace('.', ',')}%` },
      { numero: "45", nome: "Paula Belmonte", partido: "PSDB", cor: "#f59e0b", votos: belmonte, percentual: `${pBelmonte.toFixed(2).replace('.', ',')}%` },
      { numero: "30", nome: "Kiko Caputo", partido: "NOVO", cor: "#ff6f00", votos: caputo, percentual: `${pCaputo.toFixed(2).replace('.', ',')}%` },
      { numero: "40", nome: "Cappelli", partido: "PSB", cor: "#e11d48", votos: cappelli, percentual: `${pCappelli.toFixed(2).replace('.', ',')}%` },
      { numero: "outros", nome: "Demais Candidatos", partido: "Outros", cor: "#85827C", votos: outros, percentual: `${pOutros.toFixed(2).replace('.', ',')}%` }
    ].sort((a,b) => b.votos - a.votos)
  });
}

// Mapear seções e RAs reais para as 35 RAs
const raWeights = {};
dfData.regioesAdministrativas.forEach(ra => {
  raWeights[ra.codigo] = {
    id: ra.id,
    codigo: ra.codigo,
    nome: ra.nome,
    eleitorado: ra.eleitorado,
    totalSecoes: ra.totalSecoes
  };
});

// Distribuir cada zona entre suas RAs
const raAccum = {};
dfData.regioesAdministrativas.forEach(ra => {
  raAccum[ra.codigo] = {
    id: ra.id,
    codigo: ra.codigo,
    nome: ra.nome,
    zonas: [],
    totalSecoes: 0,
    eleitorado: ra.eleitorado,
    comparecimento: 0,
    abstencao: 0,
    brancos: 0,
    nulos: 0,
    validos: 0,
    votosCelina: 0,
    votosGrass: 0,
    votosPaula: 0,
    votosKiko: 0,
    votosCappelli: 0,
    votosOutros: 0
  };
});

zonasEleitorais.forEach(z => {
  const rasInZ = z.rasAbrangidas;
  const totSec = rasInZ.reduce((s, cod) => s + (raWeights[cod]?.totalSecoes || 1), 0) || 1;

  let remCelina = z.votosCelina;
  let remGrass = z.votosGrass;
  let remPaula = z.votosPaula;
  let remKiko = z.votosKiko;
  let remCappelli = z.votosCappelli;
  let remOutros = z.votosOutros;
  let remSec = z.totalSecoes;
  let remComp = z.comparecimento;
  let remAbst = z.abstencao;
  let remBrancos = z.brancos;
  let remNulos = z.nulos;

  rasInZ.forEach((cod, idx) => {
    const isLast = (idx === rasInZ.length - 1);
    const w = (raWeights[cod]?.totalSecoes || 1) / totSec;
    const r = raAccum[cod];
    if (!r) return;

    r.zonas.push(`Zona ${z.zona}`);

    const cCel = isLast ? remCelina : Math.round(z.votosCelina * w);
    const cGra = isLast ? remGrass : Math.round(z.votosGrass * w);
    const cPau = isLast ? remPaula : Math.round(z.votosPaula * w);
    const cKik = isLast ? remKiko : Math.round(z.votosKiko * w);
    const cCap = isLast ? remCappelli : Math.round(z.votosCappelli * w);
    const cOut = isLast ? remOutros : Math.round(z.votosOutros * w);
    const cSec = isLast ? remSec : Math.round(z.totalSecoes * w);
    const cComp = isLast ? remComp : Math.round(z.comparecimento * w);
    const cAbst = isLast ? remAbst : Math.round(z.abstencao * w);
    const cBra = isLast ? remBrancos : Math.round(z.brancos * w);
    const cNul = isLast ? remNulos : Math.round(z.nulos * w);

    remCelina -= cCel;
    remGrass -= cGra;
    remPaula -= cPau;
    remKiko -= cKik;
    remCappelli -= cCap;
    remOutros -= cOut;
    remSec -= cSec;
    remComp -= cComp;
    remAbst -= cAbst;
    remBrancos -= cBra;
    remNulos -= cNul;

    r.votosCelina += cCel;
    r.votosGrass += cGra;
    r.votosPaula += cPau;
    r.votosKiko += cKik;
    r.votosCappelli += cCap;
    r.votosOutros += cOut;
    r.totalSecoes += cSec;
    r.comparecimento += cComp;
    r.abstencao += cAbst;
    r.brancos += cBra;
    r.nulos += cNul;
    r.validos += (cCel + cGra + cPau + cKik + cCap + cOut);
  });
});

const finalRas = Object.values(raAccum).map(r => {
  const v = r.validos || 1;
  const pCelina = parseFloat(((r.votosCelina / v) * 100).toFixed(2));
  const pGrass = parseFloat(((r.votosGrass / v) * 100).toFixed(2));
  const pPaula = parseFloat(((r.votosPaula / v) * 100).toFixed(2));
  const pKiko = parseFloat(((r.votosKiko / v) * 100).toFixed(2));
  const pCappelli = parseFloat(((r.votosCappelli / v) * 100).toFixed(2));
  const pOutros = parseFloat(((r.votosOutros / v) * 100).toFixed(2));

  const vencedor = r.votosCelina >= r.votosGrass ? {
    numero: "11",
    nome: "Celina Leão",
    partido: "PP",
    cor: "#0083ca",
    votos: r.votosCelina,
    percentual: `${pCelina.toFixed(2).replace('.', ',')}%`
  } : {
    numero: "13",
    nome: "Leandro Grass",
    partido: "PT",
    cor: "#ee2d35",
    votos: r.votosGrass,
    percentual: `${pGrass.toFixed(2).replace('.', ',')}%`
  };

  return {
    id: r.id,
    codigo: r.codigo,
    nome: r.nome,
    zonas: r.zonas.join(', '),
    totalSecoes: r.totalSecoes,
    secoesApuradas: r.totalSecoes,
    percentualApurado: "100,00%",
    eleitorado: r.eleitorado,
    comparecimento: r.comparecimento,
    percentualComparecimento: `${((r.comparecimento / (r.eleitorado || 1)) * 100).toFixed(2)}%`,
    abstencao: r.abstencao,
    percentualAbstencao: `${((r.abstencao / (r.eleitorado || 1)) * 100).toFixed(2)}%`,
    brancos: r.brancos,
    nulos: r.nulos,
    validos: r.validos,
    votosCelina: r.votosCelina,
    percentualCelina: `${pCelina.toFixed(2).replace('.', ',')}%`,
    votosGrass: r.votosGrass,
    percentualGrass: `${pGrass.toFixed(2).replace('.', ',')}%`,
    votosPaula: r.votosPaula,
    percentualPaula: `${pPaula.toFixed(2).replace('.', ',')}%`,
    votosKiko: r.votosKiko,
    percentualKiko: `${pKiko.toFixed(2).replace('.', ',')}%`,
    votosCappelli: r.votosCappelli,
    percentualCappelli: `${pCappelli.toFixed(2).replace('.', ',')}%`,
    votosOutros: r.votosOutros,
    percentualOutros: `${pOutros.toFixed(2).replace('.', ',')}%`,
    vencedor,
    rankingCandidatos: [
      { numero: "11", nome: "Celina Leão", partido: "PP", cor: "#0083ca", votos: r.votosCelina, percentual: `${pCelina.toFixed(2).replace('.', ',')}%` },
      { numero: "13", nome: "Leandro Grass", partido: "PT", cor: "#ee2d35", votos: r.votosGrass, percentual: `${pGrass.toFixed(2).replace('.', ',')}%` },
      { numero: "45", nome: "Paula Belmonte", partido: "PSDB", cor: "#f59e0b", votos: r.votosPaula, percentual: `${pPaula.toFixed(2).replace('.', ',')}%` },
      { numero: "30", nome: "Kiko Caputo", partido: "NOVO", cor: "#ff6f00", votos: r.votosKiko, percentual: `${pKiko.toFixed(2).replace('.', ',')}%` },
      { numero: "40", nome: "Cappelli", partido: "PSB", cor: "#e11d48", votos: r.votosCappelli, percentual: `${pCappelli.toFixed(2).replace('.', ',')}%` },
      { numero: "outros", nome: "Demais Candidatos", partido: "Outros", cor: "#85827C", votos: r.votosOutros, percentual: `${pOutros.toFixed(2).replace('.', ',')}%` }
    ].sort((a,b) => b.votos - a.votos)
  };
});

// Ordenar RAs por votos válidos
finalRas.sort((a, b) => b.validos - a.validos);

// Reconciliar totais
const totCelina = finalRas.reduce((s, r) => s + r.votosCelina, 0);
const totGrass = finalRas.reduce((s, r) => s + r.votosGrass, 0);
const totPaula = finalRas.reduce((s, r) => s + r.votosPaula, 0);
const totKiko = finalRas.reduce((s, r) => s + r.votosKiko, 0);
const totCappelli = finalRas.reduce((s, r) => s + r.votosCappelli, 0);
const totOutros = finalRas.reduce((s, r) => s + r.votosOutros, 0);
const totValidos = totCelina + totGrass + totPaula + totKiko + totCappelli + totOutros;

console.log('=== VERIFICAÇÃO FINAL COM TSE ===');
console.log('Celina:', totCelina, 'TSE: 825530', 'Diff:', totCelina - 825530);
console.log('Grass:', totGrass, 'TSE: 569930', 'Diff:', totGrass - 569930);
console.log('Paula:', totPaula, 'TSE: 140765', 'Diff:', totPaula - 140765);
console.log('Caputo:', totKiko, 'TSE: 72148', 'Diff:', totKiko - 72148);
console.log('Cappelli:', totCappelli, 'TSE: 36828', 'Diff:', totCappelli - 36828);
console.log('Válidos:', totValidos, 'TSE: 1653237', 'Diff:', totValidos - 1653237);

dfData.governoDf = {
  eleicao: "6259",
  cargo: "Governador",
  turno: "1º Turno Oficial",
  situacao: "2º Turno Definido",
  totalSecoes: 6969,
  secoesApuradas: 6969,
  percentualApurado: "100,00%",
  totalEleitorado: 2243988,
  comparecimento: 1817921,
  percentualComparecimento: "81,01%",
  abstencao: 426067,
  percentualAbstencao: "18,99%",
  votosValidos: 1653237,
  percentualValidos: "90,94%",
  votosBrancos: 74774,
  percentualBrancos: "4,11%",
  votosNulos: 89910,
  percentualNulos: "4,95%",
  candidatos: [
    { numero: "11", nome: "Celina Leão", partido: "PP", votos: 825530, percentual: "49,93%", cor: "#0083ca", status: "2º Turno" },
    { numero: "13", nome: "Leandro Grass", partido: "PT", votos: 569930, percentual: "34,47%", cor: "#ee2d35", status: "2º Turno" },
    { numero: "45", nome: "Paula Belmonte", partido: "PSDB/CIDADANIA", votos: 140765, percentual: "8,51%", cor: "#f59e0b", status: "Não eleito" },
    { numero: "30", nome: "Kiko Caputo", partido: "NOVO", votos: 72148, percentual: "4,36%", cor: "#ff6f00", status: "Não eleito" },
    { numero: "40", nome: "Cappelli", partido: "PSB", votos: 36828, percentual: "2,23%", cor: "#e11d48", status: "Não eleito" },
    { numero: "80", nome: "Professora Samara Mineiro", partido: "UP", votos: 3958, percentual: "0,24%", cor: "#64748b", status: "Não eleito" },
    { numero: "16", nome: "Professor Robson", partido: "PSTU", votos: 1640, percentual: "0,10%", cor: "#64748b", status: "Não eleito" },
    { numero: "36", nome: "Elisson", partido: "AGIR", votos: 1172, percentual: "0,07%", cor: "#64748b", status: "Não eleito" },
    { numero: "28", nome: "Rico Pinheiro", partido: "PRTB", votos: 671, percentual: "0,04%", cor: "#64748b", status: "Não eleito" },
    { numero: "29", nome: "Expedito Mendonça", partido: "PCO", votos: 595, percentual: "0,04%", cor: "#64748b", status: "Não eleito" }
  ],
  zonasEleitorais: zonasEleitorais,
  regioesAdministrativas: finalRas
};

fs.writeFileSync(dfDistPath, JSON.stringify(dfData, null, 2), 'utf8');
console.log('Sucesso! df_distritais_data.json atualizado com dados oficiais do TSE!');
