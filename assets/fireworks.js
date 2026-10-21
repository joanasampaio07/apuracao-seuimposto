// assets/fireworks.js
// Sistema profissional de animação de fogos de artifício e comemoração de vitória no 2º Turno
// Para Presidente da República e Governadores (DF e Estados)

(function () {
  let canvas = null;
  let ctx = null;
  let animationFrameId = null;
  let particles = [];
  let rockets = [];
  let confettis = [];
  let isRunning = false;
  let audioCtx = null;
  let soundEnabled = true;

  // Paleta festiva e vibrante de cores de celebração
  const VIBRANT_COLORS = [
    '#f59e0b', // Dourado
    '#fbbf24', // Amarelo ouro
    '#0284c7', // Azul real
    '#38bdf8', // Azul celeste
    '#10b981', // Verde esmeralda
    '#34d399', // Verde menta
    '#ef4444', // Vermelho rubi
    '#f87171', // Coral
    '#ec4899', // Magenta
    '#a855f7', // Roxo elétrico
    '#ffffff', // Branco estelar
    '#facc15'  // Ouro brilhante
  ];

  // Sons sintéticos comemorativos via Web Audio API (sem dependência de arquivos externos)
  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      } catch (e) {
        console.warn('Web Audio indisponível:', e);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playFireworkBoom() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      // Ruído estalado de fogos
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  function playFanfareChime() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // Acorde triunfal C-E-G-C
      const now = audioCtx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch (e) {}
  }

  // Criação do canvas sobreposto
  function ensureCanvas() {
    if (!canvas) {
      canvas = document.getElementById('fireworks-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'fireworks-canvas';
        canvas.style.position = 'fixed';
        canvas.style.inset = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999999';
        document.body.appendChild(canvas);
      }
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Classe de Foguete Ascendente
  class Rocket {
    constructor(startX, targetX, targetY, color) {
      this.x = startX;
      this.y = window.innerHeight;
      this.targetX = targetX;
      this.targetY = targetY;
      this.color = color || VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
      this.speed = 10 + Math.random() * 5;
      const angle = Math.atan2(targetY - this.y, targetX - this.x);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.trail = [];
      this.exploded = false;
    }

    update() {
      this.trail.push({ x: this.x, y: this.y, alpha: 0.8 });
      if (this.trail.length > 5) this.trail.shift();

      this.x += this.vx;
      this.y += this.vy;

      // Explodir ao aproximar-se do alvo
      if (this.vy < 0 && this.y <= this.targetY) {
        this.explode();
        this.exploded = true;
      }
    }

    draw() {
      ctx.save();
      for (let i = 0; i < this.trail.length; i++) {
        const pt = this.trail[i];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = (i / this.trail.length) * 0.6;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }

    explode() {
      playFireworkBoom();
      const sparkCount = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < sparkCount; i++) {
        particles.push(new Particle(this.x, this.y, this.color));
      }
    }
  }

  // Classe de Partícula de Faísca / Explosão
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.12;
      this.friction = 0.96;
      this.alpha = 1;
      this.decay = 0.012 + Math.random() * 0.018;
      this.size = 2 + Math.random() * 2.5;
      this.twinkle = Math.random() > 0.4;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.twinkle ? (Math.random() * 0.4 + 0.6) * this.alpha : this.alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

  // Classe de Confete Caindo
  class Confetti {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = -20 - Math.random() * 100;
      this.w = 6 + Math.random() * 6;
      this.h = 10 + Math.random() * 8;
      this.color = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = 2 + Math.random() * 3.5;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 10;
      this.alpha = 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }

  // Loop de Animação
  function loop() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lançar foguetes aleatórios
    if (Math.random() < 0.12) {
      launchRandomRocket();
    }

    // Gerar confetes
    if (confettis.length < 80 && Math.random() < 0.3) {
      confettis.push(new Confetti());
    }

    // Atualizar e desenhar foguetes
    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].update();
      rockets[i].draw();
      if (rockets[i].exploded) {
        rockets.splice(i, 1);
      }
    }

    // Atualizar e desenhar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // Atualizar e desenhar confetes
    for (let i = confettis.length - 1; i >= 0; i--) {
      confettis[i].update();
      confettis[i].draw();
      if (confettis[i].y > window.innerHeight + 20) {
        confettis.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  function launchRandomRocket() {
    const startX = window.innerWidth * 0.15 + Math.random() * (window.innerWidth * 0.7);
    const targetX = startX + (Math.random() - 0.5) * 180;
    const targetY = window.innerHeight * 0.12 + Math.random() * (window.innerHeight * 0.45);
    rockets.push(new Rocket(startX, targetX, targetY));
  }

  function launchMassiveSalvo() {
    initAudio();
    playFanfareChime();
    for (let i = 0; i < 14; i++) {
      setTimeout(() => {
        launchRandomRocket();
      }, i * 160);
    }
  }

  function startFireworks(durationMs = 12000) {
    ensureCanvas();
    initAudio();
    isRunning = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    loop();
    launchMassiveSalvo();

    if (durationMs > 0) {
      setTimeout(() => {
        // Reduz gradualmente
      }, durationMs);
    }
  }

  function stopFireworks() {
    isRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    rockets = [];
    particles = [];
    confettis = [];
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Card Modal de Comemoração de Vitória
  function ensureCelebrationModal() {
    let modal = document.getElementById('victory-celebration-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'victory-celebration-modal';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.zIndex = '1000000';
      modal.style.display = 'none';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.background = 'rgba(0, 0, 0, 0.75)';
      modal.style.backdropFilter = 'blur(16px)';
      modal.style.webkitBackdropFilter = 'blur(16px)';
      modal.style.padding = '16px';
      modal.style.fontFamily = 'var(--sans, system-ui)';
      modal.style.animation = 'fade 0.3s ease both';

      modal.innerHTML = `
        <div id="victory-modal-card" style="background:#151412; border:2px solid rgba(245, 158, 11, 0.7); border-radius:24px; width:100%; max-width:540px; padding:32px 28px; box-shadow:0 0 60px rgba(245,158,11,0.4), 0 30px 80px rgba(0,0,0,0.95); text-align:center; position:relative; overflow:hidden;">
          
          <!-- EFEITO DE LUZ DE FUNDO -->
          <div style="position:absolute; top:-120px; left:50%; transform:translateX(-50%); width:300px; height:240px; background:radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%); pointer-events:none;"></div>
          
          <!-- BOTÃO FECHAR -->
          <button onclick="closeVictoryCelebration()" style="all:unset; cursor:pointer; position:absolute; top:16px; right:16px; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); display:grid; place-items:center; color:#FAFAF9; font-size:16px; transition:background .15s;">✕</button>

          <!-- BADGE DE 2º TURNO DEFINIDO -->
          <div style="display:inline-flex; align-items:center; gap:8px; padding:6px 16px; border-radius:100px; background:rgba(245,158,11,0.18); border:1px solid rgba(245,158,11,0.5); color:#fbbf24; font-weight:800; font-size:0.82rem; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:14px; box-shadow:0 0 15px rgba(245,158,11,0.3);">
            <span>🏆</span> 2º Turno · Eleição em 25/10/2026
          </div>

          <!-- FOTO / AVATAR DO ELEITO COM COROA DE LOUROS -->
          <div style="position:relative; width:110px; height:110px; margin:0 auto 16px;">
            <div id="vic-avatar-glow" style="position:absolute; inset:-4px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #ef4444); filter:blur(8px); opacity:0.8;"></div>
            <img id="vic-photo" src="/assets/celina_leao.jpg" alt="Celina Leão" style="position:relative; width:100%; height:100%; object-fit:cover; border-radius:50%; border:3px solid #f59e0b; background:#22201d;" onerror="this.src='/retratos/celina_leao.jpg'" />
            <div style="position:absolute; bottom:-6px; right:-6px; background:#f59e0b; color:#000; font-size:1.1rem; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-weight:900; box-shadow:0 0 10px #f59e0b;">✓</div>
          </div>

          <!-- NOME E CARGO -->
          <h2 id="vic-name" style="margin:0 0 4px; font-size:1.85rem; font-weight:900; color:#fff; letter-spacing:-0.02em; font-family:var(--serif, Georgia);">CELINA LEÃO</h2>
          <div id="vic-subtitle" style="font-size:1rem; font-weight:700; color:#38bdf8; margin-bottom:14px;">
            Disputa o 2º Turno para o Governo do DF
          </div>

          <!-- CAIXA DE NÚMEROS E VOTAÇÃO -->
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:16px; margin-bottom:20px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="text-align:center; border-right:1px solid rgba(255,255,255,0.08); padding-right:10px;">
              <div style="font-size:0.75rem; color:#A6A39C; font-weight:600; text-transform:uppercase;">Votação Válida</div>
              <div id="vic-pct" style="font-size:2rem; font-weight:900; color:#22c55e; font-family:var(--sans, system-ui);">53,64%</div>
            </div>
            <div style="text-align:center; padding-left:10px;">
              <div style="font-size:0.75rem; color:#A6A39C; font-weight:600; text-transform:uppercase;">Total de Votos</div>
              <div id="vic-votes" style="font-size:1.45rem; font-weight:800; color:#FAFAF9; margin-top:4px;">928.450</div>
            </div>
          </div>

          <div id="vic-desc" style="font-size:0.85rem; color:#D6D4CF; line-height:1.45; margin-bottom:22px;">
            Estrutura de comemoração e fogos pronta para a apuração oficial do 2º Turno em 25 de Outubro de 2026.
          </div>

          <!-- AÇÕES COMEMORATIVAS -->
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; gap:10px; justify-content:center;">
              <button onclick="launchMoreFireworks()" style="all:unset; cursor:pointer; flex:1; padding:12px 18px; border-radius:100px; font-weight:800; font-size:0.9rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; box-shadow:0 0 20px rgba(245,158,11,0.5); display:inline-flex; align-items:center; justify-content:center; gap:8px;">
                🎆 Soltar Mais Fogos!
              </button>
              <button onclick="openComparativoFromVictory()" style="all:unset; cursor:pointer; flex:1; padding:12px 18px; border-radius:100px; font-weight:700; font-size:0.9rem; background:rgba(2,132,199,0.25); border:1px solid rgba(2,132,199,0.5); color:#38bdf8; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
                📊 Comparar 1º vs 2ºT
              </button>
            </div>
            <button onclick="closeVictoryCelebration()" style="all:unset; cursor:pointer; padding:8px; font-size:0.8rem; color:#A6A39C; font-weight:600;">
              Fechar comemoração
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    return modal;
  }

  // Disparo de Comemoração de Vitória
  function triggerVictoryCelebration(winnerData = {}) {
    const modal = ensureCelebrationModal();
    const defaults = {
      name: "Celina Leão",
      cargo: "Governadora Eleita do Distrito Federal",
      partido: "PP",
      numero: "11",
      pct: "53,64%",
      votos: "928.450",
      photo: "/assets/celina_leao.jpg",
      cor: "#0083ca",
      desc: "Vitória consolidada no 2º Turno das Eleições 2026. Celebração oficial de vitória no Distrito Federal!"
    };

    const data = Object.assign({}, defaults, winnerData);

    const elName = document.getElementById('vic-name');
    const elSub = document.getElementById('vic-subtitle');
    const elPct = document.getElementById('vic-pct');
    const elVotes = document.getElementById('vic-votes');
    const elDesc = document.getElementById('vic-desc');
    const elPhoto = document.getElementById('vic-photo');
    const elGlow = document.getElementById('vic-avatar-glow');

    if (elName) elName.textContent = data.name;
    if (elSub) elSub.textContent = data.cargo;
    if (elPct) elPct.textContent = data.pct;
    if (elVotes) elVotes.textContent = typeof data.votos === 'number' ? data.votos.toLocaleString('pt-BR') : data.votos;
    if (elDesc) elDesc.textContent = data.desc;
    if (elPhoto) {
      elPhoto.src = (data.photo && data.photo.trim() !== '') ? data.photo : '/assets/celina_leao.jpg';
      elPhoto.alt = data.name || 'Celina Leão';
    }
    if (elGlow && data.cor) {
      elGlow.style.background = `linear-gradient(135deg, ${data.cor}, #f59e0b)`;
    }

    modal.style.display = 'flex';
    startFireworks(15000);
  }

  function closeVictoryCelebration() {
    const modal = document.getElementById('victory-celebration-modal');
    if (modal) modal.style.display = 'none';
  }

  function launchMoreFireworks() {
    launchMassiveSalvo();
  }

  function openComparativoFromVictory() {
    closeVictoryCelebration();
    if (window.openComparativoModal) {
      window.openComparativoModal();
    }
  }

  // Demonstração interativa
  function launchCelebrationDemo(type = 'gov_df') {
    if (type === 'presidente') {
      triggerVictoryCelebration({
        name: "Flávio Bolsonaro",
        cargo: "Presidente da República Eleito",
        partido: "PL",
        numero: "22",
        pct: "50,88%",
        votos: 59312480,
        cor: "#0083ca",
        desc: "Totalização de 100% das seções apuradas no Brasil e Exterior. Presidente eleito no 2º Turno!",
        photo: ""
      });
    } else {
      triggerVictoryCelebration({
        name: "Celina Leão",
        cargo: "Governadora Eleita do Distrito Federal",
        partido: "PP",
        numero: "11",
        pct: "53,64%",
        votos: 928450,
        cor: "#0083ca",
        desc: "Totalização concluída nas 19 Zonas Eleitorais e 35 Regiões Administrativas do DF. Vitória no 2º Turno!",
        photo: "/assets/celina_leao.jpg"
      });
    }
  }

  // Exportar funções globais
  window.triggerVictoryCelebration = triggerVictoryCelebration;
  window.closeVictoryCelebration = closeVictoryCelebration;
  window.launchMoreFireworks = launchMoreFireworks;
  window.startFireworks = startFireworks;
  window.stopFireworks = stopFireworks;
  window.launchCelebrationDemo = launchCelebrationDemo;
  window.openComparativoFromVictory = openComparativoFromVictory;

  console.log('[Fireworks 2026 Engine Loaded]: Sistema de comemoração de vitória do 2º Turno pronto!');
})();
