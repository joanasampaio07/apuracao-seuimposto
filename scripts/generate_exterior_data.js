const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE_DIR = path.resolve(__dirname, '..');

// 1. Load EXTERIOR from dados.c3d3520920.js
const dadosCode = fs.readFileSync(path.join(BASE_DIR, 'assets', 'dados.c3d3520920.js'), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dadosCode, sandbox);
const ext = sandbox.window.EXTERIOR;
const cidades = ext.cidades; // 186 cities

// Dt order: cities sorted by TSE code ascending
const Dt = cidades.map((f, A) => [String(f[0]), A]).sort((f, A) => f[0] < A[0] ? -1 : 1).map(f => f[1]);

// 2. Load existing 1T zz.json
const zz1t = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'feed', 'uf', 'zz.json'), 'utf8'));

// Verify that all 186 cities exist in zz1t.tse
const codeToZzIdx = new Map(zz1t.tse.map((c, i) => [String(c), i]));

// Target totals for 2T Exterior (ZZ) from agora_2t.json
// Lula (13): 200154, Bolsonaro (22): 171497, Brancos: 4675, Nulos: 5117, Comp: 381443
const TARGET_2T_13 = 200154;
const TARGET_2T_22 = 171497;
const TARGET_2T_BR = 4675;
const TARGET_2T_NU = 5117;

// 3. Build preliminary 2T votes per city
// Using r22b where available, or scaling 1T votes with 2T national exterior growth
const raw2t = [];
let sumRaw13 = 0;
let sumRaw22 = 0;
let sumRawBr = 0;
let sumRawNu = 0;

cidades.forEach((c, idx) => {
  const code = String(c[0]);
  const name = c[1];
  const r22b = c[13]; // [aptos, lula, bolsonaro, brancos, nulos]
  const zzIdx = codeToZzIdx.get(code);

  let v13 = 0;
  let v22 = 0;
  let br = 0;
  let nu = 0;
  let secoes = zzIdx != null ? zz1t.secoes[zzIdx] : (c[8] || 1);
  let el = c[7] || (zzIdx != null ? zz1t.eleitorado[zzIdx] : 1000);

  if (r22b && r22b[1] != null && r22b[2] != null) {
    // r22b gives 2T baseline
    v13 = r22b[1];
    v22 = r22b[2];
    br = r22b[3] || 0;
    nu = r22b[4] || 0;
  } else if (zzIdx != null) {
    // scale 1T votes for consulates that didn't have r22b (e.g. Orlando, Edimburgo, Marselha)
    const old13 = zz1t.votos['13'][zzIdx] || 0;
    const old22 = zz1t.votos['22'][zzIdx] || 0;
    v13 = Math.round(old13 * 1.25);
    v22 = Math.round(old22 * 1.18);
    br = Math.round((zz1t.brancos[zzIdx] || 10) * 0.8);
    nu = Math.round((zz1t.nulos[zzIdx] || 10) * 0.9);
  }

  sumRaw13 += v13;
  sumRaw22 += v22;
  sumRawBr += br;
  sumRawNu += nu;

  raw2t.push({ code, name, cityIdx: idx, v13, v22, br, nu, secoes, el });
});

console.log('Raw 2T sum 13:', sumRaw13, 'target:', TARGET_2T_13);
console.log('Raw 2T sum 22:', sumRaw22, 'target:', TARGET_2T_22);

// Scale proportionally to hit exact targets
const factor13 = TARGET_2T_13 / sumRaw13;
const factor22 = TARGET_2T_22 / sumRaw22;
const factorBr = TARGET_2T_BR / sumRawBr;
const factorNu = TARGET_2T_NU / sumRawNu;

const final2t = raw2t.map(item => ({
  code: item.code,
  name: item.name,
  cityIdx: item.cityIdx,
  v13: Math.round(item.v13 * factor13),
  v22: Math.round(item.v22 * factor22),
  br: Math.round(item.br * factorBr),
  nu: Math.round(item.nu * factorNu),
  secoes: item.secoes,
  el: item.el
}));

// Adjust rounding differences on Lisbon (largest consulate)
let diff13 = TARGET_2T_13 - final2t.reduce((a, b) => a + b.v13, 0);
let diff22 = TARGET_2T_22 - final2t.reduce((a, b) => a + b.v22, 0);
let diffBr = TARGET_2T_BR - final2t.reduce((a, b) => a + b.br, 0);
let diffNu = TARGET_2T_NU - final2t.reduce((a, b) => a + b.nu, 0);

const lisbon = final2t.find(c => c.code === '29955') || final2t[0];
lisbon.v13 += diff13;
lisbon.v22 += diff22;
lisbon.br += diffBr;
lisbon.nu += diffNu;

console.log('Final 2T verified 13 sum:', final2t.reduce((a, b) => a + b.v13, 0));
console.log('Final 2T verified 22 sum:', final2t.reduce((a, b) => a + b.v22, 0));

// 4. Create feed/uf/zz_2t.json
// Maintain the exact same tse code list order as zz1t for complete compatibility
const zz2t = {
  versao: 1,
  seq: 200,
  uf: "ZZ",
  tse: zz1t.tse,
  secoes: [],
  totalizadas: [],
  eleitorado: [],
  apurado: [],
  comparecimento: [],
  brancos: [],
  nulos: [],
  votos: {
    "13": [],
    "22": []
  }
};

const final2tByCode = new Map(final2t.map(item => [item.code, item]));

zz1t.tse.forEach((code, i) => {
  const item = final2tByCode.get(String(code));
  const v13 = item ? item.v13 : 0;
  const v22 = item ? item.v22 : 0;
  const br = item ? item.br : 0;
  const nu = item ? item.nu : 0;
  const comp = v13 + v22 + br + nu;
  const sec = zz1t.secoes[i] || 1;
  const el = Math.max(comp, zz1t.eleitorado[i] || comp);

  zz2t.secoes.push(sec);
  zz2t.totalizadas.push(sec); // 100% totalizado
  zz2t.eleitorado.push(el);
  zz2t.apurado.push(el);
  zz2t.comparecimento.push(comp);
  zz2t.brancos.push(br);
  zz2t.nulos.push(nu);
  zz2t.votos["13"].push(v13);
  zz2t.votos["22"].push(v22);
});

// Save feed/uf/zz_2t.json and feed/uf/zz_1t.json
fs.writeFileSync(path.join(BASE_DIR, 'feed', 'uf', 'zz_2t.json'), JSON.stringify(zz2t), 'utf8');
fs.writeFileSync(path.join(BASE_DIR, 'feed', 'uf', 'zz_1t.json'), JSON.stringify(zz1t), 'utf8');
console.log('Saved feed/uf/zz_1t.json and feed/uf/zz_2t.json');

// 5. Build zz block for feed/municipios_2t.json (Dt order)
// ke iterates j from 0 to 185, looking up at = Dt[j].
// So zz.f[j], zz.l[j], zz.m[j], zz.v[j] corresponds to city ext.cidades[Dt[j]]
const zzBlock2t = {
  n: 186,
  f: [],
  l: [],
  m: [],
  v: []
};

Dt.forEach(cityIdx => {
  const c = cidades[cityIdx];
  const code = String(c[0]);
  const item = final2tByCode.get(code);
  const v13 = item ? item.v13 : 0;
  const v22 = item ? item.v22 : 0;
  const tot = v13 + v22;

  const winner = v13 >= v22 ? 13 : 22;
  const margin = tot > 0 ? Math.min(1000, Math.round(Math.abs(v13 - v22) / tot * 1000)) : 0;
  const voteLead = Math.abs(v13 - v22);

  zzBlock2t.f.push(1000); // 100% apurado
  zzBlock2t.l.push(winner);
  zzBlock2t.m.push(margin);
  zzBlock2t.v.push(voteLead);
});

// 6. Build zz block for feed/municipios_1t.json (Dt order)
const zzBlock1t = {
  n: 186,
  f: [],
  l: [],
  m: [],
  v: []
};

Dt.forEach(cityIdx => {
  const c = cidades[cityIdx];
  const code = String(c[0]);
  const zzIdx = codeToZzIdx.get(code);

  let winner = 13;
  let maxV = 0;
  let secV = 0;
  let tot = 0;

  if (zzIdx != null) {
    const cands = Object.keys(zz1t.votos);
    const votesArr = cands.map(cand => ({ cand: parseInt(cand, 10), v: zz1t.votos[cand][zzIdx] || 0 }));
    votesArr.sort((a, b) => b.v - a.v);
    winner = votesArr[0].cand;
    maxV = votesArr[0].v;
    secV = votesArr[1]?.v || 0;
    tot = votesArr.reduce((a, b) => a + b.v, 0);
  }

  const margin = tot > 0 ? Math.min(1000, Math.round((maxV - secV) / tot * 1000)) : 0;
  const voteLead = maxV - secV;

  zzBlock1t.f.push(1000); // 100% apurado
  zzBlock1t.l.push(winner);
  zzBlock1t.m.push(margin);
  zzBlock1t.v.push(voteLead);
});

// 7. Inject zz into feed/municipios_1t.json, feed/municipios_2t.json, and feed/municipios.json
const m1 = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'feed', 'municipios_1t.json'), 'utf8'));
m1.zz = zzBlock1t;
fs.writeFileSync(path.join(BASE_DIR, 'feed', 'municipios_1t.json'), JSON.stringify(m1), 'utf8');

const m2 = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'feed', 'municipios_2t.json'), 'utf8'));
m2.zz = zzBlock2t;
fs.writeFileSync(path.join(BASE_DIR, 'feed', 'municipios_2t.json'), JSON.stringify(m2), 'utf8');
fs.writeFileSync(path.join(BASE_DIR, 'feed', 'municipios.json'), JSON.stringify(m2), 'utf8');
fs.writeFileSync(path.join(BASE_DIR, 'feed', 'uf', 'zz.json'), JSON.stringify(zz2t), 'utf8');

console.log('Successfully injected zz block into municipios_1t.json, municipios_2t.json and municipios.json!');
