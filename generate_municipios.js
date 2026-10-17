const fs = require('fs');

global.window = global;
global.document = {
  createElement: () => ({ getContext: () => null }),
  visibilityState: 'visible'
};
global.navigator = { onLine: true };
global.location = { hash: '' };
global.Path2D = class Path2D {
  moveTo() {}
  lineTo() {}
  closePath() {}
};

const mapaCode = fs.readFileSync('assets/mapa.js', 'utf8');
const dadosCode = fs.readFileSync('assets/dados.js', 'utf8');
const appCode = fs.readFileSync('assets/app.js', 'utf8');

eval(mapaCode);
eval(dadosCode);

const endSim = appCode.indexOf('})(),Feed=');
const appSlice = appCode.substring(0, endSim + 4)
  .replace('const Geo=', 'global.Geo=')
  .replace('Sim=(()', 'global.Sim=(()');
eval(appSlice);

console.log('Sim available?', typeof Sim !== 'undefined', 'Geo munis:', Geo.munis.length);

const snap = Sim.at(1410);
console.log('Snapshot generated at t=1410 (23:30)');
console.log('Muni array length:', snap.muni.length, 'expected:', Geo.munis.length * 4);

const rn = Geo.munis.map((f, A) => [String(f.id), A]).sort((f, A) => f[0] < A[0] ? -1 : 1).map(f => f[1]);
const L = Geo.munis.length;
const candNumbers = Sim.PRES.map(c => +c.n);

const fArr = new Array(L);
const lArr = new Array(L);
const mArr = new Array(L);
const vArr = new Array(L);

for (let j = 0; j < L; j++) {
  const at = rn[j];
  const qIdx = at * 4;
  const ut = snap.muni[qIdx];        // fraction 0..1
  const candIdx = snap.muni[qIdx+1]; // candidate index
  const margin = snap.muni[qIdx+2];  // margin 0..1
  const votes = snap.muni[qIdx+3];   // margin votes

  fArr[j] = Math.round(Math.min(1000, Math.max(0, ut * 1000)));
  lArr[j] = candNumbers[candIdx] || 22;
  mArr[j] = Math.round(Math.min(1000, Math.max(0, margin * 1000)));
  vArr[j] = Math.round(Math.max(0, votes));
}

const municipiosObj = {
  versao: 1,
  seq: 100,
  br: {
    n: L,
    f: fArr,
    l: lArr,
    m: mArr,
    v: vArr
  }
};

function checkGe(f, A, G) {
  if (!f || f.n !== A) return G + ': quantidade ' + f?.n + ' vs ' + A;
  for (const dt of ['f', 'l', 'm', 'v']) {
    const j = f[dt];
    if (!Array.isArray(j) || j.length !== A) return G + '.' + dt + ': tamanho';
    for (let at = 0; at < A; at++) if (typeof j[at] !== 'number' || j[at] < 0) return G + '.' + dt + '[' + at + ']: ' + j[at];
  }
  for (let dt = 0; dt < A; dt++) if (f.f[dt] > 1000 || f.m[dt] > 1000) return G + ': fora de escala em ' + dt;
  return null;
}

const valErr = checkGe(municipiosObj.br, L, 'municipios');
console.log('Resultado da validação do feed/municipios.json:', valErr || '✅ PERFEITO! Válido segundo app.js');

fs.writeFileSync('feed/municipios.json', JSON.stringify(municipiosObj));
console.log('feed/municipios.json salvo com sucesso! Tamanho:', fs.statSync('feed/municipios.json').size, 'bytes');
