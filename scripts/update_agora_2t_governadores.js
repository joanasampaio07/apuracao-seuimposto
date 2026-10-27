const fs = require('fs');
const path = require('path');

const agora2tPath = path.resolve(__dirname, '../feed/agora_2t.json');
const agora2t = JSON.parse(fs.readFileSync(agora2tPath, 'utf8'));

// Exact 6 states from the user's reference image
const gov2t = {
  RN: {
    secoes: 8115,
    totalizadas: 8115,
    eleitorado: 2659825,
    apurado: 2659825,
    comparecimento: 2210000,
    brancos: 38000,
    nulos: 59172,
    votos: { '13': 1073024, '44': 1039804 },
    nomes: { '13': ['Cadu de Lula', 'PT'], '44': ['Allyson', 'UNIÃO'] },
    situacao: 'eleito'
  },
  ES: {
    secoes: 9844,
    totalizadas: 9844,
    eleitorado: 2991650,
    apurado: 2991650,
    comparecimento: 2410000,
    brancos: 75000,
    nulos: 128509,
    votos: { '10': 1151818, '15': 1054673 },
    nomes: { '10': ['Lorenzo Pazolini', 'REPUBLICANOS'], '15': ['Ricardo Ferraço', 'MDB'] },
    situacao: 'eleito'
  },
  DF: {
    secoes: 6969,
    totalizadas: 6969,
    eleitorado: 2244176,
    apurado: 2244176,
    comparecimento: 1854323,
    brancos: 55771,
    nulos: 72850,
    votos: { '11': 987142, '13': 738560 },
    nomes: { '11': ['Celina Leão', 'PP'], '13': ['Leandro Grass', 'PT'] },
    situacao: 'eleito'
  },
  AM: {
    secoes: 8157,
    totalizadas: 8157,
    eleitorado: 2798611,
    apurado: 2798611,
    comparecimento: 2240000,
    brancos: 54000,
    nulos: 110952,
    votos: { '55': 1273975, '22': 801073 },
    nomes: { '55': ['Omar Aziz', 'PSD'], '22': ['Professora Maria do Carmo', 'PL'] },
    situacao: 'eleito'
  },
  TO: {
    secoes: 4384,
    totalizadas: 4384,
    eleitorado: 1182023,
    apurado: 1182023,
    comparecimento: 950000,
    brancos: 26000,
    nulos: 52486,
    votos: { '45': 562083, '44': 309431 },
    nomes: { '45': ['Vicentinho Júnior', 'PSDB'], '44': ['Professora Dorinha', 'UNIÃO'] },
    situacao: 'eleito'
  },
  AC: {
    secoes: 2270,
    totalizadas: 2270,
    eleitorado: 613742,
    apurado: 613742,
    comparecimento: 460000,
    brancos: 12000,
    nulos: 36167,
    votos: { '11': 272635, '10': 139198 },
    nomes: { '11': ['Mailza Assis', 'PP'], '10': ['Alan Rick', 'REPUBLICANOS'] },
    situacao: 'eleito'
  }
};

agora2t.governador = { uf: gov2t };
agora2t.senado = { uf: {} };

fs.writeFileSync(agora2tPath, JSON.stringify(agora2t, null, 2));
console.log('✅ agora_2t.json updated with exact 6 runoff states!');
