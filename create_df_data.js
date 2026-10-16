const fs = require('fs');
const path = require('path');

const CANDIDATOS_DISTRITAIS = [
  { numero: "13130", nome: "Chico Vigilante", partido: "PT", cor: "#ee2d35", totalVotos: 43854, eleito: true, foto: null },
  { numero: "50500", nome: "Max Maciel", partido: "PSOL", cor: "#fbc02d", totalVotos: 35758, eleito: true, foto: null },
  { numero: "44123", nome: "Daniel Donizet", partido: "MDB", cor: "#ff9800", totalVotos: 33573, eleito: true, foto: null },
  { numero: "10123", nome: "Martins Machado", partido: "REPUBLICANOS", cor: "#2196f3", totalVotos: 31993, eleito: true, foto: null },
  { numero: "55123", nome: "Robério Negreiros", partido: "PSD", cor: "#e91e63", totalVotos: 31341, eleito: true, foto: null },
  { numero: "55000", nome: "Jorge Vianna", partido: "PSD", cor: "#e91e63", totalVotos: 30640, eleito: true, foto: null },
  { numero: "10000", nome: "Jaqueline Silva", partido: "MDB", cor: "#ff9800", totalVotos: 26452, eleito: true, foto: null },
  { numero: "22122", nome: "Thiago Manzoni", partido: "PL", cor: "#4162e2", totalVotos: 25554, eleito: true, foto: null },
  { numero: "44000", nome: "Eduardo Pedrosa", partido: "UNIÃO", cor: "#1565c0", totalVotos: 22489, eleito: true, foto: null },
  { numero: "22000", nome: "Joaquim Roriz Neto", partido: "PL", cor: "#4162e2", totalVotos: 21057, eleito: true, foto: null },
  { numero: "15123", nome: "Wellington Luiz", partido: "MDB", cor: "#ff9800", totalVotos: 20730, eleito: true, foto: null },
  { numero: "15555", nome: "Hermeto", partido: "MDB", cor: "#ff9800", totalVotos: 20332, eleito: true, foto: null },
  { numero: "22222", nome: "Roosevelt Vilela", partido: "PL", cor: "#4162e2", totalVotos: 20223, eleito: true, foto: null },
  { numero: "10777", nome: "Doutora Jane", partido: "REPUBLICANOS", cor: "#2196f3", totalVotos: 19006, eleito: true, foto: null },
  { numero: "35000", nome: "Rogério Morro da Cruz", partido: "PRD", cor: "#795548", totalVotos: 18235, eleito: true, foto: null },
  { numero: "13013", nome: "Gabriel Magno", partido: "PT", cor: "#ee2d35", totalVotos: 18063, eleito: true, foto: null },
  { numero: "70123", nome: "João Cardoso", partido: "AVANTE", cor: "#ff5722", totalVotos: 17579, eleito: true, foto: null },
  { numero: "13123", nome: "Ricardo Vale", partido: "PT", cor: "#ee2d35", totalVotos: 17077, eleito: true, foto: null },
  { numero: "11123", nome: "Pastor Daniel de Castro", partido: "PP", cor: "#0083ca", totalVotos: 16510, eleito: true, foto: null },
  { numero: "11000", nome: "Pepa", partido: "PP", cor: "#0083ca", totalVotos: 15393, eleito: true, foto: null },
  { numero: "15000", nome: "Iolando", partido: "MDB", cor: "#ff9800", totalVotos: 22333, eleito: true, foto: null },
  { numero: "40123", nome: "Dayse Amarilio", partido: "PSB", cor: "#ffc107", totalVotos: 14012, eleito: true, foto: null },
  { numero: "15456", nome: "Telma Rufino", partido: "MDB", cor: "#ff9800", totalVotos: 13540, eleito: true, foto: null },
  { numero: "22345", nome: "Guarda Jânio", partido: "PL", cor: "#4162e2", totalVotos: 12890, eleito: true, foto: null }
];

const CANDIDATOS_FEDERAIS = [
  { numero: "2222", nome: "Bia Kicis", partido: "PL", cor: "#4162e2", totalVotos: 214733, eleito: true },
  { numero: "1010", nome: "Fred Linhares", partido: "REPUBLICANOS", cor: "#2196f3", totalVotos: 165358, eleito: true },
  { numero: "1313", nome: "Erika Kokay", partido: "PT", cor: "#ee2d35", totalVotos: 148563, eleito: true },
  { numero: "1515", nome: "Rafael Prudente", partido: "MDB", cor: "#ff9800", totalVotos: 121307, eleito: true },
  { numero: "1000", nome: "Julio Cesar Ribeiro", partido: "REPUBLICANOS", cor: "#2196f3", totalVotos: 76274, eleito: true },
  { numero: "4343", nome: "Reginaldo Veras", partido: "PV", cor: "#4caf50", totalVotos: 54557, eleito: true },
  { numero: "2200", nome: "Alberto Fraga", partido: "PL", cor: "#4162e2", totalVotos: 28827, eleito: true },
  { numero: "1011", nome: "Gilvan Maximo", partido: "REPUBLICANOS", cor: "#2196f3", totalVotos: 20923, eleito: true },
  { numero: "2323", nome: "Paula Belmonte", partido: "CIDADANIA", cor: "#0288d1", totalVotos: 48325, eleito: false },
  { numero: "5050", nome: "Fábio Felix", partido: "PSOL", cor: "#fbc02d", totalVotos: 55792, eleito: false }
];

const RAS_CONFIG = [
  { id: 1, codigo: "RA I", nome: "Plano Piloto", zonas: [1, 14], secoes: 615, eleitorado: 191995, bias: ["22122", "13013", "44000", "55123"] },
  { id: 2, codigo: "RA II", nome: "Gama", zonas: [17], secoes: 396, eleitorado: 128410, bias: ["44123", "13123", "55000", "10123"] },
  { id: 3, codigo: "RA III", nome: "Taguatinga", zonas: [3, 15, 19], secoes: 692, eleitorado: 215440, bias: ["55000", "55123", "10123", "15456"] },
  { id: 4, codigo: "RA IV", nome: "Brazlândia", zonas: [19], secoes: 138, eleitorado: 44510, bias: ["15000", "70123", "13130"] },
  { id: 5, codigo: "RA V", nome: "Sobradinho", zonas: [5], secoes: 236, eleitorado: 75800, bias: ["70123", "13013", "44000", "22122"] },
  { id: 6, codigo: "RA VI", nome: "Planaltina", zonas: [6], secoes: 345, eleitorado: 112400, bias: ["11000", "10777", "13130", "10123"] },
  { id: 7, codigo: "RA VII", nome: "Paranoá", zonas: [2], secoes: 195, eleitorado: 68500, bias: ["35000", "13130", "10123", "50500"] },
  { id: 8, codigo: "RA VIII", nome: "Núcleo Bandeirante", zonas: [10], secoes: 86, eleitorado: 28400, bias: ["15555", "22222", "44123"] },
  { id: 9, codigo: "RA IX", nome: "Ceilândia", zonas: [8, 16, 20], secoes: 1164, eleitorado: 369402, bias: ["13130", "50500", "10123", "10000", "15000"] },
  { id: 10, codigo: "RA X", nome: "Guará", zonas: [9], secoes: 382, eleitorado: 122600, bias: ["40123", "50123", "22222", "55123"] },
  { id: 11, codigo: "RA XI", nome: "Cruzeiro", zonas: [11], secoes: 92, eleitorado: 30100, bias: ["22122", "23456", "50123", "44000"] },
  { id: 12, codigo: "RA XII", nome: "Samambaia", zonas: [13], secoes: 417, eleitorado: 141236, bias: ["22000", "50500", "11123", "13130"] },
  { id: 13, codigo: "RA XIII", nome: "Santa Maria", zonas: [4], secoes: 294, eleitorado: 101858, bias: ["10000", "44123", "13123", "10123"] },
  { id: 14, codigo: "RA XIV", nome: "São Sebastião", zonas: [18], secoes: 285, eleitorado: 89400, bias: ["35000", "50123", "13130", "55123"] },
  { id: 15, codigo: "RA XV", nome: "Recanto das Emas", zonas: [21], secoes: 242, eleitorado: 82500, bias: ["10123", "50500", "44000", "13130"] },
  { id: 16, codigo: "RA XVI",池: "RA XVI", nome: "Lago Sul", zonas: [1], secoes: 78, eleitorado: 26500, bias: ["22122", "23456", "44000", "55123"] },
  { id: 17, codigo: "RA XVII", nome: "Riacho Fundo", zonas: [21], secoes: 92, eleitorado: 31800, bias: ["15555", "10123", "13130"] },
  { id: 18, codigo: "RA XVIII", nome: "Lago Norte", zonas: [14], secoes: 85, eleitorado: 29400, bias: ["22122", "23456", "50123", "44000"] },
  { id: 19, codigo: "RA XIX", nome: "Candangolândia", zonas: [10], secoes: 48, eleitorado: 15900, bias: ["15555", "22222", "10123"] },
  { id: 20, codigo: "RA XX", nome: "Águas Claras", zonas: [15], secoes: 312, eleitorado: 105600, bias: ["22122", "50123", "55123", "23456"] },
  { id: 21, codigo: "RA XXI", nome: "Riacho Fundo II", zonas: [21], secoes: 125, eleitorado: 41200, bias: ["10123", "50500", "13130", "44123"] },
  { id: 22, codigo: "RA XXII", nome: "Sudoeste / Octogonal", zonas: [11], secoes: 157, eleitorado: 46597, bias: ["22122", "23456", "50123", "44000"] },
  { id: 23, codigo: "RA XXIII", nome: "Varjão", zonas: [2], secoes: 24, eleitorado: 7800, bias: ["13130", "50123", "10123"] },
  { id: 24, codigo: "RA XXIV", nome: "Park Way", zonas: [10], secoes: 45, eleitorado: 16200, bias: ["22122", "44000", "23456", "55123"] },
  { id: 25, codigo: "RA XXV", nome: "SCIA / Estrutural", zonas: [9], secoes: 61, eleitorado: 21500, bias: ["13130", "50500", "10123", "40123"] },
  { id: 26, codigo: "RA XXVI", nome: "Sobradinho II", zonas: [5], secoes: 142, eleitorado: 46200, bias: ["70123", "13013", "44000", "10123"] },
  { id: 27, codigo: "RA XXVII", nome: "Jardim Botânico", zonas: [18], secoes: 146, eleitorado: 45726, bias: ["22122", "23456", "55123", "50123"] },
  { id: 28, codigo: "RA XXVIII", nome: "Itapoã", zonas: [2], secoes: 118, eleitorado: 43497, bias: ["35000", "13130", "10123", "50500"] },
  { id: 29, codigo: "RA XXIX", nome: "SIA", zonas: [9], secoes: 12, eleitorado: 3800, bias: ["40123", "55123", "22122"] },
  { id: 30, codigo: "RA XXX", nome: "Vicente Pires", zonas: [15], secoes: 182, eleitorado: 58900, bias: ["22122", "55123", "44000", "50123"] },
  { id: 31, codigo: "RA XXXI", nome: "Fercal", zonas: [5], secoes: 41, eleitorado: 11497, bias: ["70123", "10777", "13130"] },
  { id: 32, codigo: "RA XXXII", nome: "Sol Nascente / Pôr do Sol", zonas: [16], secoes: 154, eleitorado: 51200, bias: ["13130", "50500", "10000", "10123"] },
  { id: 33, codigo: "RA XXXIII", nome: "Arniqueira", zonas: [15], secoes: 96, eleitorado: 31500, bias: ["22122", "55123", "44123", "23456"] },
  { id: 34, codigo: "RA XXXIV", nome: "Arapoanga", zonas: [6], secoes: 80, eleitorado: 24798, bias: ["11000", "10777", "13130"] },
  { id: 35, codigo: "RA XXXV", nome: "Água Quente", zonas: [21], secoes: 48, eleitorado: 14800, bias: ["10123", "44123", "13130"] }
];

function generateDfZonesAndSections() {
  const result = {
    totalEleitoradoDf: 2206110,
    totalSecoesDf: 6748,
    secoesApuradasDf: 6748,
    percentualApurado: "100,00%",
    candidatosDistritais: CANDIDATOS_DISTRITAIS,
    candidatosFederais: CANDIDATOS_FEDERAIS,
    regioesAdministrativas: []
  };

  for (const ra of RAS_CONFIG) {
    const secoesList = [];
    const numSecoes = Math.min(ra.secoes, 12); // gera 12 seções amostrais detalhadas por RA para navegação instantânea
    const mediaEleitoresPorSecao = Math.round(ra.eleitorado / ra.secoes);

    for (let s = 1; s <= numSecoes; s++) {
      const secaoNum = (ra.id * 100 + s);
      const zona = ra.zonas[(s - 1) % ra.zonas.length];
      const aptos = mediaEleitoresPorSecao + ((s * 7) % 35) - 15;
      const comparecimento = Math.round(aptos * 0.81);
      const brancos = Math.round(comparecimento * 0.024);
      const nulos = Math.round(comparecimento * 0.038);
      const validos = comparecimento - brancos - nulos;

      // Distribuição de votos por candidato na seção
      const votosCandidatos = {};
      let votosRestantes = validos;

      // Candidatos favorecidos na RA
      ra.bias.forEach((num, idx) => {
        const c = CANDIDATOS_DISTRITAIS.find(x => x.numero === num);
        if (c) {
          const fatia = (0.28 / (idx + 1)) + ((s % 3) * 0.02);
          const v = Math.min(votosRestantes, Math.round(validos * fatia));
          votosCandidatos[num] = v;
          votosRestantes -= v;
        }
      });

      // Distribui o restante entre os outros candidatos distritais
      const outros = CANDIDATOS_DISTRITAIS.filter(c => !ra.bias.includes(c.numero));
      outros.forEach((c) => {
        const v = Math.max(1, Math.min(votosRestantes, Math.round(votosRestantes / (outros.length + 1))));
        votosCandidatos[c.numero] = v;
        votosRestantes -= v;
      });

      // Se sobrou algum voto, adiciona ao 1º colocado do bias
      if (votosRestantes > 0) {
        votosCandidatos[ra.bias[0]] = (votosCandidatos[ra.bias[0]] || 0) + votosRestantes;
      }

      const listaVotos = CANDIDATOS_DISTRITAIS.map(c => ({
        numero: c.numero,
        nome: c.nome,
        partido: c.partido,
        cor: c.cor,
        votos: votosCandidatos[c.numero] || 0,
        porcentagem: validos ? (((votosCandidatos[c.numero] || 0) / validos) * 100).toFixed(2) + "%" : "0%"
      })).sort((a, b) => b.votos - a.votos);

      secoesList.push({
        numero: secaoNum,
        zona: `${zona}ª Zona Eleitoral`,
        local: `Local de Votação ${s} - ${ra.nome}`,
        aptos,
        comparecimento,
        validos,
        brancos,
        nulos,
        liderSecao: listaVotos[0],
        votosCandidatos: listaVotos
      });
    }

    // Totais da RA calculados
    const rankingRa = CANDIDATOS_DISTRITAIS.map(c => {
      const somaVotos = secoesList.reduce((acc, sec) => {
        const cand = sec.votosCandidatos.find(v => v.numero === c.numero);
        return acc + (cand ? cand.votos : 0);
      }, 0);
      return {
        numero: c.numero,
        nome: c.nome,
        partido: c.partido,
        cor: c.cor,
        votosEstimadosRa: Math.round(somaVotos * (ra.secoes / secoesList.length)),
        eleito: c.eleito
      };
    }).sort((a, b) => b.votosEstimadosRa - a.votosEstimadosRa);

    result.regioesAdministrativas.push({
      id: ra.id,
      codigo: ra.codigo,
      nome: ra.nome,
      zonas: ra.zonas.map(z => `${z}ª Zona`).join(', '),
      totalSecoes: ra.secoes,
      secoesApuradas: ra.secoes,
      percentualApurado: "100,00%",
      eleitorado: ra.eleitorado,
      rankingCandidatos: rankingRa,
      secoesExemplos: secoesList
    });
  }

  return result;
}

const dfData = generateDfZonesAndSections();

fs.writeFileSync(path.join(__dirname, 'df_distritais_data.json'), JSON.stringify(dfData, null, 2), 'utf8');
console.log('df_distritais_data.json gerado com sucesso! Total RAs:', dfData.regioesAdministrativas.length);
