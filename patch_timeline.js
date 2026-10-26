const fs = require('fs');

['assets/app.js', 'assets/app.0f00cc4e2b.js'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Cap timeline bounds to 2220 and nominal 37 hours (17:00 to 13:00)
  const target1 = 'k=b!=null?Math.max(n,b):n,E=b!=null?k:t,z=k>nn?Math.ceil((k+1)/60)*60:nn,M=Math.floor(z/60)';
  const repl1 = 'k=b!=null?Math.min(2220,Math.max(n,b)):n,E=b!=null?k:t,z=2220,M=37,[tlPlay,setTlPlay]=L(!1);et(()=>{if(!tlPlay)return;const _tId=setInterval(()=>s(curr=>curr>=2220?1020:curr+2),250);return()=>clearInterval(_tId)},[tlPlay]);const _fmtHM=ft=>{const _h=Math.floor(ft/60)%24,_m=Math.floor(ft%60);return String(_h).padStart(2,"0")+":"+String(_m).padStart(2,"0")}';

  // 2. Play button before time
  const target2 = '<span class="now tn">${b!=null?Ml(b):Zt(t)}</span>';
  const repl2 = '<button type="button" class="tl-play" onClick=${()=>setTlPlay(!tlPlay)} aria-label="Reproduzir" style="all:unset;cursor:pointer;color:#FAFAF9;font-size:12px;margin-right:6px;display:inline-flex;align-items:center;line-height:1;transition:transform .1s;" onmousedown="this.style.transform=\'scale(0.9)\'" onmouseup="this.style.transform=\'scale(1)\'">${tlPlay?"❚❚":"▶"}</button><span class="now tn">${_fmtHM(E)}</span>';

  // 3. Remove 'h' suffix from hour labels
  const target3 = '<span key=${ft} style=${"left:"+_(ft*60)+"%"}>${ft%24}h</span>';
  const repl3 = '<span key=${ft} style=${"left:"+_(ft*60)+"%"}>${ft%24}</span>';

  // 4. Header buttons: DF Governador (35 RAs) + Marcela Passamani + Comparativo + Fogos + 1º/2º Turno selector
  const target4 = '${v||!p||!k?null:o`<${ac} on=${b} onClick=${b?E:k}/>`}';
  const repl4 = '${o`<button type="button" class="btn df-top-btn" onClick=${()=>window.openGovernoDfModal&&window.openGovernoDfModal()} style="all:unset;cursor:pointer;padding:6px 14px;border-radius:100px;background:linear-gradient(135deg, #0284c7, #0369a1);border:1px solid rgba(255,255,255,0.25);color:#fff;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:5px;box-shadow:0 0 14px rgba(2,132,199,0.45);margin-left:6px;transition:all .15s;">🏛️ Gov DF · 35 RAs</button><button type="button" class="btn comp-top-btn" onClick=${()=>window.openComparativoModal&&window.openComparativoModal()} style="all:unset;cursor:pointer;padding:6px 12px;border-radius:100px;background:linear-gradient(135deg, #10b981, #059669);border:1px solid rgba(255,255,255,0.25);color:#fff;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:4px;box-shadow:0 0 12px rgba(16,185,129,0.4);margin-left:4px;transition:all .15s;">📊 Comparativo</button><button type="button" class="btn fogos-top-btn" onClick=${()=>window.launchCelebrationDemo&&window.launchCelebrationDemo()} style="all:unset;cursor:pointer;padding:6px 12px;border-radius:100px;background:linear-gradient(135deg, #f59e0b, #d97706);border:1px solid rgba(255,255,255,0.25);color:#000;font-weight:800;font-size:12px;display:inline-flex;align-items:center;gap:4px;box-shadow:0 0 14px rgba(245,158,11,0.5);margin-left:4px;transition:all .15s;">🎆 Fogos</button><button type="button" class="btn marcela-top-btn" onClick=${()=>window.openMarcelaDossie&&window.openMarcelaDossie()} style="all:unset;cursor:pointer;padding:6px 12px;border-radius:100px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#D6D4CF;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px;margin-left:4px;transition:all .15s;">⭐ Marcela</button><div class="tse-pill-toggle" style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);border-radius:100px;padding:2px;margin-left:6px;"><button type="button" id="btn-tse-top-1t" class="btn-tse-1t" data-turno="1" onClick=${()=>window.switchTseTurno&&window.switchTseTurno("6257")} style=${(window.APURACAO&&window.APURACAO.turno===1)?"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:700;font-size:11px;background:rgba(255,255,255,0.25);color:#fff;box-shadow:0 0 10px rgba(255,255,255,0.2);transition:all .15s;":"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:600;font-size:11px;background:transparent;color:rgba(255,255,255,0.5);transition:all .15s;"}>1º Turno</button><button type="button" id="btn-tse-top-2t" class="btn-tse-2t" data-turno="2" onClick=${()=>window.switchTseTurno&&window.switchTseTurno("6258")} style=${(window.APURACAO&&window.APURACAO.turno===2)?"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:700;font-size:11px;background:rgba(255,255,255,0.25);color:#fff;box-shadow:0 0 10px rgba(255,255,255,0.2);transition:all .15s;":"all:unset;cursor:pointer;padding:4px 10px;border-radius:100px;font-weight:600;font-size:11px;background:transparent;color:rgba(255,255,255,0.5);transition:all .15s;"}>2º Turno</button></div>`}';

  // If already patched with earlier version, update it:
  if (code.includes('k=b!=null?Math.max(n,b):n,E=b!=null?k:t,z=k>nn?Math.ceil((k+1)/60)*60:nn,M=Math.floor(z/60)')) {
    code = code.replace(target1, repl1);
  }
  if (code.includes('<span class="now tn">${b!=null?Ml(b):Zt(t)}</span>')) {
    code = code.replace(target2, repl2);
  }
  if (code.includes('<span key=${ft} style=${"left:"+_(ft*60)+"%"}>${ft%24}h</span>')) {
    code = code.replace(target3, repl3);
  }
  if (code.includes(target4)) {
    code = code.replace(target4, repl4);
  } else if (code.includes('df-top-btn') && !code.includes('btn-tse-1t')) {
    // update earlier repl4
    const earlierRepl4 = '${o`<button type="button" class="btn df-top-btn" onClick=${()=>window.openGovernoDfModal&&window.openGovernoDfModal()} style="all:unset;cursor:pointer;padding:6px 14px;border-radius:100px;background:linear-gradient(135deg, #0284c7, #0369a1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:5px;box-shadow:0 0 12px rgba(2,132,199,0.4);margin-left:6px;transition:all .15s;">🏛️ Gov DF (35 RAs)</button><button type="button" class="btn marcela-top-btn" onClick=${()=>window.openMarcelaDossie&&window.openMarcelaDossie()} style="all:unset;cursor:pointer;padding:6px 12px;border-radius:100px;background:linear-gradient(135deg, #f59e0b, #d97706);border:1px solid rgba(255,255,255,0.2);color:#fff;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:5px;box-shadow:0 0 10px rgba(245,158,11,0.35);margin-left:4px;transition:all .15s;">⭐ Marcela</button>`}';
    code = code.replace(earlierRepl4, repl4);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log('Successfully updated', file);
});
