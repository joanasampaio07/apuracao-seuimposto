# Apuração Eleições 2026 · DF & Brasil

Sistema completo de apuração eleitoral ao vivo com integração oficial dos dados abertos do TSE (Tribunal Superior Eleitoral) e foco estratégico no Distrito Federal.

## 🚀 Destaques do Projeto

* **Painel Presidencial Consolidado (1º Turno 2026):**
  * **1º Lugar:** Flávio Bolsonaro (22 · PL) — 56.104.503 votos (47,03%)
  * **2º Lugar:** Lula (13 · PT) — 53.879.538 votos (45,16%)
  * Total de seções totalizadas: 100,00% apuradas (499.207 seções).
* **Dossiê Eleitoral Marcela Passamani (15555 · MDB):**
  * **Total no DF:** 16.622 votos (29º Lugar Geral no DF, 1ª Suplente MDB).
  * Votação detalhada em todas as 35 Regiões Administrativas (RAs).
  * Votação consolidada nas 19 Zonas Eleitorais.
* **18ª Zona Eleitoral (São Sebastião, Jardim Botânico & Lago Sul):**
  * Abrangência territorial oficial completa do TRE-DF mapeada.
  * **841 votos** distribuídos em todas as 431 seções eleitorais.
  * Mapeamento de todos os **37 colégios eleitorais** com classificação de Zona Rural (9 colégios · 160 votos) vs Zona Urbana (28 colégios · 681 votos).
* **Auditoria Direta TSE:**
  * Dados 100% auditáveis extraídos do repositório oficial de dados abertos do TSE (`votacao_secao_2026_DF.csv`).

## 🛠️ Como Executar

```bash
# Iniciar o servidor Node.js
node server.js
```

Acesse no navegador:
* Painel Geral: `http://localhost:5175/`
* Painel Presidencial: `http://localhost:5175/#presidente`
* API Zonas DF: `http://localhost:5175/api/df/zonas`
* API Distritais e Marcela Passamani: `http://localhost:5175/api/df/distritais`
