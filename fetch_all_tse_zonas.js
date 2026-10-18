const https = require('https');
const fs = require('fs');
const path = require('path');

const DF_ZONAS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21];

function decodeBase64Url(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

function fetchZona(z) {
  return new Promise((resolve, reject) => {
    const zPad = String(z).padStart(4, '0');
    const url = `https://resultados.tse.jus.br/oficial/ele2026/6259/dados/df/df97012-z${zPad}-c0003-e006259-u.jws`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (data.includes('.')) {
            const payload = decodeBase64Url(data.split('.')[1]);
            const json = JSON.parse(payload);
            resolve({ zona: z, json });
          } else {
            reject(new Error(`Formato inesperado zona ${z}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Baixando dados oficiais do TSE para as 19 Zonas Eleitorais do DF...');
  const results = {};
  
  for (const z of DF_ZONAS) {
    try {
      const { zona, json } = await fetchZona(z);
      
      const cands = [];
      if (json.carg && json.carg[0] && json.carg[0].agr) {
        json.carg[0].agr.forEach(agr => {
          if (agr.par) {
            agr.par.forEach(par => {
              if (par.cand) {
                par.cand.forEach(cand => {
                  cands.push({
                    numero: cand.n,
                    nome: cand.nmu,
                    partido: par.sg,
                    votos: parseInt(cand.vap, 10) || 0,
                    percentual: parseFloat((cand.pvap || '0').replace(',', '.'))
                  });
                });
              }
            });
          }
        });
      }
      cands.sort((a, b) => b.votos - a.votos);
      
      results[zona] = {
        zona,
        secoesTotal: parseInt(json.s.ts, 10),
        secoesTotalizadas: parseInt(json.s.st, 10),
        eleitorado: parseInt(json.e.te, 10),
        comparecimento: parseInt(json.e.c, 10),
        abstencao: parseInt(json.e.a, 10),
        validos: parseInt(json.v.tvn || json.v.vnom || json.v.vv || json.v.vvc, 10),
        brancos: parseInt(json.v.vb, 10),
        nulos: parseInt(json.v.tvn || json.v.vn, 10),
        candidatos: cands
      };
      
      console.log(`Zona ${zona}: Seções=${results[zona].secoesTotal}, Celina=${cands.find(c => c.numero === '11')?.votos}, Grass=${cands.find(c => c.numero === '13')?.votos}`);
    } catch (err) {
      console.error(`Erro na Zona ${z}:`, err.message);
    }
  }

  const outPath = path.join(__dirname, 'tse_cache', 'tse_zonas_governo_oficial.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Dados salvos com sucesso em:', outPath);
}

run();
