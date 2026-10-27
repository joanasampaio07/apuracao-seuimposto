const fs = require('fs');
const path = require('path');

global.window = {};
global.document = { createElement: () => ({ getContext: () => null }), visibilityState: 'visible' };
global.navigator = { onLine: true };
global.location = { hash: '#governadores-2t' };
global.Path2D = class Path2D { moveTo(){} lineTo(){} closePath(){} };
require('../assets/mapa.js');
require('../assets/dados.js');

const appCode = fs.readFileSync(path.resolve(__dirname, '../assets/app.js'), 'utf8');
const endFeed = appCode.indexOf('})(),(()=>');
const appSlice = appCode.substring(0, endFeed + 4)
  .replace('const Geo=', 'global.Geo=')
  .replace('Sim=(()', 'global.Sim=(()')
  .replace('Feed=(()', 'global.Feed=(()');
eval(appSlice);

const agora2t = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../feed/agora_2t.json'), 'utf8'));
const testGov = {};
['AC', 'AM', 'DF', 'ES', 'RN', 'TO'].forEach(uf => {
  testGov[uf] = agora2t.governador.uf[uf];
});
const testAgora = Object.assign({}, agora2t, {
  governador: { uf: testGov },
  senado: { uf: {} }
});

const err = Feed.checkAgora(testAgora);
console.log('Feed.checkAgora error:', err);
