const fs = require('fs');
const path = require('path');

global.window = {};
global.document = { createElement: () => ({ getContext: () => null }), visibilityState: 'visible' };
global.navigator = { onLine: true };
global.location = { hash: '#governadores-2t', search: '?turno=2' };
global.Path2D = class Path2D { moveTo(){} lineTo(){} closePath(){} };
require(path.resolve(__dirname, '../assets/mapa.js'));
require(path.resolve(__dirname, '../assets/dados.js'));

// Apply 2T config:
window.CANDIDATOS.turno = 2;
const govOriginal = window.CANDIDATOS.governador || {};
window.CANDIDATOS.governador = {
  RN: [
    govOriginal.RN.find(c => c.n === '13'),
    govOriginal.RN.find(c => c.n === '44')
  ],
  ES: [
    govOriginal.ES.find(c => c.n === '10'),
    govOriginal.ES.find(c => c.n === '15')
  ],
  DF: [
    govOriginal.DF.find(c => c.n === '11'),
    govOriginal.DF.find(c => c.n === '13')
  ],
  AM: [
    govOriginal.AM.find(c => c.n === '55'),
    govOriginal.AM.find(c => c.n === '22')
  ],
  TO: [
    govOriginal.TO.find(c => c.n === '45'),
    govOriginal.TO.find(c => c.n === '44')
  ],
  AC: [
    govOriginal.AC.find(c => c.n === '11'),
    govOriginal.AC.find(c => c.n === '10')
  ]
};

const appCode = fs.readFileSync(path.resolve(__dirname, '../assets/app.js'), 'utf8');
const endSim = appCode.indexOf('})(),Feed=');
const appSlice = appCode.substring(0, endSim + 4)
  .replace('const Geo=', 'global.Geo=')
  .replace('Sim=(()', 'global.Sim=(()');
eval(appSlice);

console.log('Sim.RUNOFF length:', Sim.RUNOFF.length);
console.log('Sim.RUNOFF states:', Sim.RUNOFF);
for (const uf of Sim.RUNOFF) {
  console.log(uf, Sim.RACES[uf].gov.map(c => c.n + ': ' + c.name + ' (' + c.partido + ')'));
}
