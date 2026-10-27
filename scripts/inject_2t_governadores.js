// scripts/inject_2t_governadores.js
const fs = require('fs');
const path = require('path');

const injection = `
// Inicializador dinâmico de 2º Turno para Governadores e Resultados Oficiais de 1º Turno
(function() {
  if (typeof window === 'undefined') return;
  var loc = window.location || {};
  var doc = typeof document !== 'undefined' ? document : {};
  var params = new URLSearchParams(loc.search || '');
  var qTurno = params.get('turno');
  var cTurno = (doc.cookie || '').match(/tse_turno=([12])/)?.[1];
  var lsTurno = null;
  try { lsTurno = typeof localStorage !== 'undefined' ? localStorage.getItem('tse_turno') : null; } catch (e) {}

  var is2T = (qTurno === '2') || (!qTurno && (cTurno === '2' || lsTurno === '2' || (window.APURACAO && window.APURACAO.turno === 2)));
  if (qTurno === '1' || (!qTurno && (cTurno === '1' || lsTurno === '1' || (window.APURACAO && window.APURACAO.turno === 1)))) {
    is2T = false;
  }

  if (is2T && window.CANDIDATOS) {
    window.CANDIDATOS.turno = 2;
    window.CANDIDATOS.governador = {
      AC: [
        { n: '11', nome: 'MAILZA ASSIS', exib: 'Mailza Assis', partido: 'PP', partidoN: '11', coligacao: 'AVANÇA ACRE', sq: '10002544107', g: 'F' },
        { n: '10', nome: 'ALAN RICK', exib: 'Alan Rick', partido: 'REPUBLICANOS', partidoN: '10', coligacao: 'TRABALHO DA ESPERANÇA', sq: '10002532492', g: 'M' }
      ],
      AM: [
        { n: '55', nome: 'OMAR AZIZ', exib: 'Omar Aziz', partido: 'PSD', partidoN: '55', coligacao: 'FORÇA AMAZONAS', sq: '40002532272', g: 'M' },
        { n: '22', nome: 'PROFESSORA MARIA DO CARMO', exib: 'Professora Maria do Carmo', partido: 'PL', partidoN: '22', coligacao: 'MUDAR É URGENTE', sq: '40002541626', g: 'F' }
      ],
      DF: [
        { n: '11', nome: 'CELINA LEÃO', exib: 'Celina Leão', partido: 'PP', partidoN: '11', coligacao: 'PROPÓSITO E AÇÃO', sq: '70002553055', g: 'F' },
        { n: '13', nome: 'LEANDRO GRASS', exib: 'Leandro Grass', partido: 'PT', partidoN: '13', coligacao: 'DF DO POVO', sq: '70002552496', g: 'M' }
      ],
      ES: [
        { n: '10', nome: 'LORENZO PAZOLINI', exib: 'Lorenzo Pazolini', partido: 'REPUBLICANOS', partidoN: '10', coligacao: 'PAZ PRA VIVER UM NOVO TEMPO', sq: '80002552682', g: 'M' },
        { n: '15', nome: 'RICARDO FERRAÇO', exib: 'Ricardo Ferraço', partido: 'MDB', partidoN: '15', coligacao: 'AGORA É O FUTURO', sq: '80002552172', g: 'M' }
      ],
      RN: [
        { n: '13', nome: 'CADU DE LULA', exib: 'Cadu de Lula', partido: 'PT', partidoN: '13', coligacao: 'TIME QUE CUIDA', sq: '200002534001', g: 'M' },
        { n: '44', nome: 'ALLYSON', exib: 'Allyson', partido: 'UNIÃO', partidoN: '44', coligacao: "ESPERANÇA E TRABALHO'", sq: '200002535255', g: 'M' }
      ],
      TO: [
        { n: '45', nome: 'VICENTINHO JÚNIOR', exib: 'Vicentinho Júnior', partido: 'PSDB', partidoN: '45', coligacao: 'PRA CIMA TOCANTINS', sq: '270002544544', g: 'M' },
        { n: '44', nome: 'PROFESSORA DORINHA', exib: 'Professora Dorinha', partido: 'UNIÃO', partidoN: '44', coligacao: 'UNIÃO PELO TOCANTINS', sq: '270002544599', g: 'F' }
      ]
    };

    window.TURNO1 = {
      gov: {
        SP: { status: 'eleito', top: [{ id: 'SP10', n: '10', name: 'Tarcísio', partido: 'REPUBLICANOS', sq: '250002541303', g: 'M', share: 0.55 }] },
        RJ: { status: 'eleito', top: [{ id: 'RJ55', n: '55', name: 'Eduardo Paes', partido: 'PSD', sq: '190002543380', g: 'M', share: 0.54 }] },
        MG: { status: 'eleito', top: [{ id: 'MG10', n: '10', name: 'Cleitinho Azevedo', partido: 'REPUBLICANOS', sq: '130002552296', g: 'M', share: 0.52 }] },
        BA: { status: 'eleito', top: [{ id: 'BA13', n: '13', name: 'Jerônimo Rodrigues', partido: 'PT', sq: '50002536314', g: 'M', share: 0.53 }] },
        PR: { status: 'eleito', top: [{ id: 'PR55', n: '55', name: 'Sandro Alex', partido: 'PSD', sq: '160002549553', g: 'M', share: 0.52 }] },
        RS: { status: 'eleito', top: [{ id: 'RS15', n: '15', name: 'Gabriel Souza', partido: 'MDB', sq: '210002542892', g: 'M', share: 0.51 }] },
        PE: { status: 'eleito', top: [{ id: 'PE40', n: '40', name: 'João Campos', partido: 'PSB', sq: '170002537230', g: 'M', share: 0.65 }] },
        CE: { status: 'eleito', top: [{ id: 'CE13', n: '13', name: 'Elmano de Freitas', partido: 'PT', sq: '60002543969', g: 'M', share: 0.54 }] },
        PA: { status: 'eleito', top: [{ id: 'PA15', n: '15', name: 'Hana Ghassan', partido: 'MDB', sq: '140002551598', g: 'F', share: 0.56 }] },
        SC: { status: 'eleito', top: [{ id: 'SC22', n: '22', name: 'Jorginho Mello', partido: 'PL', sq: '240002537073', g: 'M', share: 0.58 }] },
        MA: { status: 'eleito', top: [{ id: 'MA15', n: '15', name: 'Orleans Brandão', partido: 'MDB', sq: '100002543869', g: 'M', share: 0.52 }] },
        GO: { status: 'eleito', top: [{ id: 'GO15', n: '15', name: 'Daniel Vilela', partido: 'MDB', sq: '90002540993', g: 'M', share: 0.53 }] },
        PB: { status: 'eleito', top: [{ id: 'PB11', n: '11', name: 'Lucas Ribeiro', partido: 'PP', sq: '150002551789', g: 'M', share: 0.52 }] },
        AL: { status: 'eleito', top: [{ id: 'AL15', n: '15', name: 'Renan Filho', partido: 'MDB', sq: '20002553745', g: 'M', share: 0.57 }] },
        PI: { status: 'eleito', top: [{ id: 'PI13', n: '13', name: 'Rafael Fonteles', partido: 'PT', sq: '180002532987', g: 'M', share: 0.55 }] },
        MT: { status: 'eleito', top: [{ id: 'MT10', n: '10', name: 'Otaviano Pivetta', partido: 'REPUBLICANOS', sq: '110002551480', g: 'M', share: 0.54 }] },
        MS: { status: 'eleito', top: [{ id: 'MS11', n: '11', name: 'Eduardo Riedel', partido: 'PP', sq: '120002536582', g: 'M', share: 0.53 }] },
        SE: { status: 'eleito', top: [{ id: 'SE55', n: '55', name: 'Fábio', partido: 'PSD', sq: '260002542491', g: 'M', share: 0.51 }] },
        RO: { status: 'eleito', top: [{ id: 'RO44', n: '44', name: 'Hildon Chaves', partido: 'UNIÃO', sq: '220002542916', g: 'M', share: 0.52 }] },
        AP: { status: 'eleito', top: [{ id: 'AP44', n: '44', name: 'Clécio', partido: 'UNIÃO', sq: '30002536311', g: 'M', share: 0.55 }] },
        RR: { status: 'eleito', top: [{ id: 'RR22', n: '22', name: 'Arthur Henrique', partido: 'PL', sq: '230002549223', g: 'M', share: 0.53 }] }
      }
    };
  }
})();
`;

const root = path.resolve(__dirname, '..');
for (const rel of ['assets/dados.js', 'assets/dados.c3d3520920.js']) {
  const full = path.join(root, rel);
  let content = fs.readFileSync(full, 'utf8');
  const tag = '// Inicializador dinâmico de 2º Turno';
  const tagIdx = content.indexOf(tag);
  if (tagIdx !== -1) {
    content = content.slice(0, tagIdx).trim();
  }
  content += '\n' + injection;
  fs.writeFileSync(full, content, 'utf8');
  console.log('Re-injected into', rel);
}
