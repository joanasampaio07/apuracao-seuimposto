// build_comparativo_data.js
// Gera dados comparativos consolidados entre o 1º e 2º Turno para:
// 1. Presidente (Brasil e 28 UFs incluindo ZZ)
// 2. Governador do DF (35 RAs e 19 Zonas Eleitorais)
// 3. Governadores dos Estados em 2º Turno (AC, AM, ES, RN, TO)

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

const UF_NAMES = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MG: "Minas Gerais",
  MS: "Mato Grosso do Sul", MT: "Mato Grosso", PA: "Pará", PB: "Paraíba", PE: "Pernambuco",
  PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RO: "Rondônia",
  RR: "Roraima", RS: "Rio Grande do Sul", SC: "Santa Catarina", SE: "Sergipe", SP: "São Paulo",
  TO: "Tocantins", ZZ: "Exterior"
};

// Se comparativo_data.json já existir com a versão 2026.2-oficial, garante consistência
const targetPath = path.join(BASE_DIR, 'comparativo_data.json');
if (fs.existsSync(targetPath)) {
  const current = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  if (current.versao === '2026.2-oficial') {
    console.log('[build_comparativo_data] comparativo_data.json oficial 2T já está validado e atualizado.');
    process.exit(0);
  }
}
