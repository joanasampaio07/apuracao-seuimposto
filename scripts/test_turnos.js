const http = require('http');

function request(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing turnos on http://127.0.0.1:5175...');

  // 1. Test index.html with turno=2
  const r2 = await request('http://127.0.0.1:5175/?turno=2');
  console.log('GET /?turno=2 status:', r2.status);
  const has2TActiveInHtml = r2.body.includes('2º Turno (6258)') && r2.body.includes('background:rgba(255,255,255,0.25); color:#fff;');
  console.log('Bottom banner has 2T active in HTML:', has2TActiveInHtml);

  // 2. Test agora.json with turno=2
  const agora2 = await request('http://127.0.0.1:5175/agora.json', { 'Cookie': 'tse_turno=2' });
  const a2Data = JSON.parse(agora2.body);
  console.log('agora.json (turno 2): turno =', a2Data.turno, 'votos =', a2Data.presidente?.br?.votos);

  // 3. Test agora.json with turno=1
  const agora1 = await request('http://127.0.0.1:5175/agora.json', { 'Cookie': 'tse_turno=1' });
  const a1Data = JSON.parse(agora1.body);
  console.log('agora.json (turno 1): turno =', a1Data.turno, 'votos count =', Object.keys(a1Data.presidente?.br?.votos || {}).length);

  // 4. Test /api/df/governo with turno=2
  const gov2 = await request('http://127.0.0.1:5175/api/df/governo', { 'Cookie': 'tse_turno=2' });
  const g2Data = JSON.parse(gov2.body);
  console.log('governo DF (turno 2): turno =', g2Data.turno, 'cands =', g2Data.candidatos?.map(c => c.nome + ' ' + c.votos));

  // 5. Test /api/df/governo with turno=1
  const gov1 = await request('http://127.0.0.1:5175/api/df/governo', { 'Cookie': 'tse_turno=1' });
  const g1Data = JSON.parse(gov1.body);
  console.log('governo DF (turno 1): turno =', g1Data.turno, 'cands count =', g1Data.candidatos?.length, 'top 2 =', g1Data.candidatos?.slice(0, 2).map(c => c.nome + ' ' + c.votos));

  console.log('\nAll tests completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});
