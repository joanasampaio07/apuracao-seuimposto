const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');

// Raw data provided by user
const projecaoData = {
  versao: 1,
  seq: 1792972227,
  t: 1250,
  gerado: 1792972226728,
  n: ["13", "22"],
  lula: 51.818,
  flavio: 48.182,
  simulacoes: 20000,
  metodo: "Modelo bayesiano de apuração com swing ponderado por município (20.000 simulações Monte Carlo)",
  intervalo80: {
    lula: [51.4, 52.2],
    flavio: [47.8, 48.6]
  },
  distribuicao: {
    de: 46.5,
    passo: 0.1,
    contagens: [
      2, 5, 12, 35, 98, 245, 520, 980, 1620, 2350,
      2890, 3120, 2780, 2150, 1420, 810, 420, 180, 65, 20, 8, 3
    ]
  },
  pais: {
    p: 0.7638,
    parte: 0.51818,
    faixa98: 0.00096,
    sd: 0.00041,
    chamada: "13",
    chamadaEm: 1232,
    cs: 0.975,
    urnasChamada: 0.0426, // 4,26% das urnas bastaram para a projeção indicar 51,82%
    horarioChamada: "19:26",
    resultadoFinal: 51.79
  },
  mudancas1T: {
    abstencao: {
      brasil: -1.9,
      norte: 1.8,
      nordeste: -1.9,
      sudeste: -2.4,
      sul: -2.3,
      centroOeste: -1.7
    },
    crescimentoLula: [
      { uf: "RJ", pontos: 4.5 },
      { uf: "SP", pontos: 3.9 },
      { uf: "MG", pontos: 2.8 },
      { uf: "BA", pontos: 2.1 },
      { uf: "DF", pontos: 1.9 }
    ]
  },
  estados: {
    AC: { p: 0.98922, parte: 0.33432, faixa98: 0.00042, sd: 0.00018, parte2: 0.33477, sd2: 0.00069, agora: 0.33539, chamada: "22", chamadaEm: 1191, cs: 1, maior: 0.98364, resto: 0.98667, t1: 0.30912, validos: 425647 },
    AL: { p: 0.95033, parte: 0.60764, faixa98: 0.001, sd: 0.00043, parte2: 0.6072, sd2: 0.00095, chamada: "13" },
    AM: { p: 0.93038, parte: 0.54018, faixa98: 0.00114, sd: 0.00049, parte2: 0.54054, sd2: 0.00147 },
    AP: { p: 0.9929, parte: 0.52871, faixa98: 0.00033, sd: 0.00014, parte2: 0.52839, sd2: 0.00093 },
    BA: { p: 0.64603, parte: 0.71242, faixa98: 0.00588, sd: 0.00253, parte2: 0.71504, sd2: 0.005, chamada: "13" },
    CE: { p: 0.83094, parte: 0.68948, faixa98: 0.00293, sd: 0.00126, parte2: 0.68826, sd2: 0.00259 },
    DF: { p: 0.97704, parte: 0.45723, faixa98: 0.00044, sd: 0.00019, parte2: 0.45671, sd2: 0.00059 },
    ES: { p: 0.96608, parte: 0.4364, faixa98: 0.00091, sd: 0.00039, parte2: 0.43658, sd2: 0.00082 },
    GO: { p: 0.89146, parte: 0.40326, faixa98: 0.00186, sd: 0.0008, parte2: 0.40285, sd2: 0.00161 },
    MA: { p: 0.95196, parte: 0.69542, faixa98: 0.00086, sd: 0.00037, parte2: 0.69423, sd2: 0.00092 },
    MG: { p: 0.7315, parte: 0.50412, faixa98: 0.00421, sd: 0.00181, parte2: 0.5037, sd2: 0.00356, chamada: null },
    MS: { p: 0.98768, parte: 0.40398, faixa98: 0.00063, sd: 0.00027, parte2: 0.4047, sd2: 0.00087 },
    MT: { p: 0.9159, parte: 0.33927, faixa98: 0.00154, sd: 0.00066, parte2: 0.34035, sd2: 0.00161 },
    PA: { p: 0.91863, parte: 0.55003, faixa98: 0.00137, sd: 0.00059, parte2: 0.54925, sd2: 0.00139 },
    PB: { p: 0.95079, parte: 0.67479, faixa98: 0.00088, sd: 0.00038, parte2: 0.67561, sd2: 0.00096 },
    PE: { p: 0.81781, parte: 0.69243, faixa98: 0.00293, sd: 0.00126, parte2: 0.6947, sd2: 0.00251 },
    PI: { p: 0.77776, parte: 0.75881, faixa98: 0.00472, sd: 0.00203, parte2: 0.75783, sd2: 0.00404, agora: 0.76094, chamada: "13", chamadaEm: 1240, cs: 0.96395, maior: 0.70659, resto: 0.78495, t1: 0.74894, validos: 1668522 },
    PR: { p: 0.98745, parte: 0.37427, faixa98: 0.00023, sd: 0.0001, parte2: 0.37415, sd2: 0.00025 },
    RJ: { p: 0.26477, parte: 0.47117, faixa98: 0.01205, sd: 0.00518, parte2: 0.47697, sd2: 0.00969 },
    RN: { p: 0.92656, parte: 0.65727, faixa98: 0.00142, sd: 0.00061, parte2: 0.65791, sd2: 0.00141 },
    RO: { p: 0.94799, parte: 0.30394, faixa98: 0.00121, sd: 0.00052, parte2: 0.30437, sd2: 0.00161 },
    RR: { p: 0.92175, parte: 0.27533, faixa98: 0.00193, sd: 0.00083, parte2: 0.27464, sd2: 0.00253 },
    RS: { p: 0.88321, parte: 0.42162, faixa98: 0.002, sd: 0.00086, parte2: 0.42147, sd2: 0.00175, chamada: "22" },
    SC: { p: 0.9457, parte: 0.30579, faixa98: 0.001, sd: 0.00043, parte2: 0.30571, sd2: 0.0009, chamada: "22" },
    SE: { p: 0.31421, parte: 0.69728, faixa98: 0.01261, sd: 0.00542, parte2: 0.70168, sd2: 0.0103 },
    SP: { p: 0.64281, parte: 0.4623, faixa98: 0.00549, sd: 0.00236, parte2: 0.46244, sd2: 0.00452 },
    TO: { p: 0.96973, parte: 0.48634, faixa98: 0.00065, sd: 0.00028, parte2: 0.48552, sd2: 0.00133 },
    ZZ: { p: 0.65314, parte: 0.53792, faixa98: 0.00805, sd: 0.00346, parte2: 0.53785, sd2: 0.00661 }
  },
  historico: []
};

// Generate realistic fan-chart curve points from t=1020 (17:00) to t=1440 (24:00)
// matching the curve in Image 3
for (let min = 1020; min <= 1400; min += 5) {
  const progress = Math.min(1, Math.max(0, (min - 1020) / 380));
  const urnasPpm = Math.round(Math.pow(progress, 1.8) * 10000);
  
  // Confidence band narrows from 3.5% at start to 0.04% at end
  const uncertainty = Math.max(40, Math.round(3500 * Math.exp(-progress * 4.2)));
  
  // Projected Lula share starts at 51.95%, stabilizes smoothly to 51.818%
  const lulaPpm = Math.round(51818 + 180 * Math.exp(-progress * 3.5) * Math.sin(progress * 15));
  
  projecaoData.historico.push([
    min,
    urnasPpm,
    lulaPpm,
    uncertainty,
    urnasPpm >= 426 ? 1 : 0
  ]);
}

fs.writeFileSync(path.join(BASE_DIR, 'feed', 'projecao.json'), JSON.stringify(projecaoData, null, 2), 'utf8');
fs.writeFileSync(path.join(BASE_DIR, 'feed', 'projecao_2t.json'), JSON.stringify(projecaoData, null, 2), 'utf8');
fs.writeFileSync(path.join(BASE_DIR, 'projecao.json'), JSON.stringify(projecaoData, null, 2), 'utf8');

console.log('✅ feed/projecao.json gravado com sucesso! Total histórico:', projecaoData.historico.length, 'pontos.');
