const fs = require('fs');
const path = require('path');

const files = ['assets/app.js', 'assets/app.0f00cc4e2b.js'];

const oldPattern = /<div style="display:inline-flex;align-items:center;background:rgba\(255,255,255,0\.08\);border:1px solid rgba\(255,255,255,0\.14\);border-radius:100px;padding:2px;margin-left:6px;"><button id="btn-tse-1t" onclick="switchTseTurno\('6257'\)"[^>]*>1º Turno<\/button><button id="btn-tse-2t" onclick="switchTseTurno\('6258'\)"[^>]*>2º Turno<\/button><\/div>/;

const newToggle = `<div class="tse-pill-toggle" style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);border-radius:100px;padding:2px;margin-left:6px;"><button type="button" id="btn-tse-top-1t" class="btn-tse-1t" data-turno="1" onClick=\${()=>window.switchTseTurno&&window.switchTseTurno("6257")} style=\${(window.APURACAO&&window.APURACAO.turno===1)?"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:700;font-size:11px;background:rgba(255,255,255,0.25);color:#fff;box-shadow:0 0 10px rgba(255,255,255,0.2);transition:all .15s;":"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:600;font-size:11px;background:transparent;color:rgba(255,255,255,0.5);transition:all .15s;"}>1º Turno</button><button type="button" id="btn-tse-top-2t" class="btn-tse-2t" data-turno="2" onClick=\${()=>window.switchTseTurno&&window.switchTseTurno("6258")} style=\${(window.APURACAO&&window.APURACAO.turno===2)?"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:700;font-size:11px;background:rgba(255,255,255,0.25);color:#fff;box-shadow:0 0 10px rgba(255,255,255,0.2);transition:all .15s;":"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:600;font-size:11px;background:transparent;color:rgba(255,255,255,0.5);transition:all .15s;"}>2º Turno</button></div>`;

files.forEach(f => {
  const filePath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newToggle);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated toggle in', f);
  } else {
    console.log('Pattern not found in', f);
  }
});
