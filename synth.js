const config = {
  volume: 0.45,
  highpassHz: 160,
  lowpassHz: 3200,
  duckingAmount: 0.40
};

class AstraSFXEngine {
  constructor(cfg) {
    this.cfg = cfg;
    this.ctx = null;
    this.masterGain = null;
    this.hpFilter = null;
    this.lpFilter = null;
    this.compressor = null;
    this.analyser = null;
    this.musicGain = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.hpFilter = this.ctx.createBiquadFilter();
    this.hpFilter.type = 'highpass';
    this.hpFilter.frequency.value = this.cfg.highpassHz;

    this.lpFilter = this.ctx.createBiquadFilter();
    this.lpFilter.type = 'lowpass';
    this.lpFilter.frequency.value = this.cfg.lowpassHz;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 14;
    this.compressor.ratio.value = 5;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.18;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.cfg.volume;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;

    this.hpFilter.connect(this.lpFilter);
    this.lpFilter.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  applyConfig() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(this.cfg.volume, t, 0.02);
    this.hpFilter.frequency.setTargetAtTime(this.cfg.highpassHz, t, 0.02);
    this.lpFilter.frequency.setTargetAtTime(this.cfg.lowpassHz, t, 0.02);
  }

  triggerDucking(duration = 0.4) {
    if (!this.musicGain || !this.ctx || this.cfg.duckingAmount <= 0) return;
    const t = this.ctx.currentTime;
    const targetVol = 0.28 * (1 - this.cfg.duckingAmount);
    this.musicGain.gain.cancelScheduledValues(t);
    this.musicGain.gain.setTargetAtTime(targetVol, t, 0.02);
    this.musicGain.gain.setTargetAtTime(0.28, t + duration * 0.4, 0.15);
  }

  noiseBuffer(dur = 1.0) {
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // --- ОРУЖИЕ ---
  bulletSoft() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.11);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain); gain.connect(this.hpFilter);
    osc.start(t); osc.stop(t + 0.13);
  }

  bulletPlasma() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.16);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.value = 5;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
    osc.connect(filter); filter.connect(gain); gain.connect(this.hpFilter);
    osc.start(t); osc.stop(t + 0.18);
  }

  laserBeam() {
    this.init();
    const t = this.ctx.currentTime;
    const car = this.ctx.createOscillator(), mod = this.ctx.createOscillator(), modGain = this.ctx.createGain(), gain = this.ctx.createGain();
    car.type = 'sawtooth';
    car.frequency.setValueAtTime(1050, t);
    car.frequency.exponentialRampToValueAtTime(180, t + 0.24);
    mod.type = 'sine';
    mod.frequency.setValueAtTime(55, t);
    modGain.gain.setValueAtTime(160, t);
    modGain.gain.exponentialRampToValueAtTime(10, t + 0.22);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    mod.connect(modGain); modGain.connect(car.frequency); car.connect(gain); gain.connect(this.hpFilter);
    car.start(t); mod.start(t); car.stop(t + 0.26); mod.stop(t + 0.26);
  }
      laserCrystal() {
    this.init();
    const t = this.ctx.currentTime;
    const freqs = new Array(1400, 2100, 2800);
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.35, t + 0.18);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.3 : 0.18, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
      osc.connect(gain); gain.connect(this.hpFilter);
      osc.start(t); osc.stop(t + 0.2);
    });
  }

  rocketLaunch() {
    this.init();
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.5);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.exponentialRampToValueAtTime(1350, t + 0.16);
    filter.frequency.exponentialRampToValueAtTime(260, t + 0.48);
    filter.Q.value = 3;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.49);
    noise.connect(filter); filter.connect(gain); gain.connect(this.hpFilter);
    noise.start(t);
  }

  rocketSwarm() {
    this.init();
    for (let i = 0; i < 3; i++) setTimeout(() => this.rocketLaunch(), i * 85);
  }
  // --- ВЗРЫВЫ ---
  expTiny() {
    this.init();
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.18);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 0.17);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    noise.connect(filter); filter.connect(gain); gain.connect(this.hpFilter);
    noise.start(t);
  }

  expMedium() {
    this.init();
    this.triggerDucking(0.35);
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), oGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.32);
    oGain.gain.setValueAtTime(0.55, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
    osc.connect(oGain); oGain.connect(this.hpFilter);
    osc.start(t); osc.stop(t + 0.35);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(0.4);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1800, t);
    lp.frequency.exponentialRampToValueAtTime(180, t + 0.38);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.45, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.39);
    noise.connect(lp); lp.connect(nGain); nGain.connect(this.hpFilter);
    noise.start(t);
  }

  expDeepBass() {
    this.init();
    this.triggerDucking(0.6);
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.55);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
    osc.connect(gain); gain.connect(this.lpFilter);
    osc.start(t); osc.stop(t + 0.6);
  }

  expBoss() {
    this.init();
    this.triggerDucking(1.1);
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), oGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(22, t + 1.1);
    oGain.gain.setValueAtTime(0.6, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);
    osc.connect(oGain); oGain.connect(this.lpFilter);
    osc.start(t); osc.stop(t + 1.2);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(1.3);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(110, t + 1.25);
    filter.Q.value = 6;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.65, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 1.28);
    noise.connect(filter); filter.connect(nGain); nGain.connect(this.hpFilter);
    noise.start(t);
  }

  // --- АСМР И ПСИХОДЕЛИКА ---
  asmrBubble() {
    this.init();
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const start = t + i * 0.06, f = 340 + Math.random() * 280;
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);
      osc.frequency.exponentialRampToValueAtTime(f * 2.2, start + 0.065);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.32, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
      osc.connect(gain); gain.connect(this.hpFilter);
      osc.start(start); osc.stop(start + 0.075);
    }
  }

  asmrClick() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1650, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.022);
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 3.5;
    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.026);
    osc.connect(filter); filter.connect(gain); gain.connect(this.hpFilter);
    osc.start(t); osc.stop(t + 0.03);
  }

  asmrCrystal() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, t);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain); gain.connect(this.hpFilter);
    osc.start(t); osc.stop(t + 0.36);
  }

  psyWarp() {
    this.init();
    const t = this.ctx.currentTime;
    [1, 1.25, 1.5, 1.875].forEach((ratio, idx) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), s = t + idx * 0.045;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240 * ratio, s);
      osc.frequency.exponentialRampToValueAtTime(540 * ratio, s + 0.25);
      osc.frequency.exponentialRampToValueAtTime(210 * ratio, s + 0.6);
      gain.gain.setValueAtTime(0.001, s);
      gain.gain.linearRampToValueAtTime(0.16, s + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, s + 0.65);
      osc.connect(gain); gain.connect(this.hpFilter);
      osc.start(s); osc.stop(s + 0.66);
    });
  }

  asmrTingles() {
    this.init();
    const t = this.ctx.currentTime;
    for (let i = 0; i < 8; i++) {
      const s = t + i * 0.035, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 1800, s);
      gain.gain.setValueAtTime(0.001, s);
      gain.gain.linearRampToValueAtTime(0.14, s + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, s + 0.025);
      osc.connect(gain); gain.connect(this.hpFilter);
      osc.start(s); osc.stop(s + 0.03);
    }
  }

  powerUp() {
    this.init();
    const t = this.ctx.currentTime;
    [330, 440, 554.37, 659.25, 880].forEach((n, i) => {
      const s = t + i * 0.065, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n, s);
      gain.gain.setValueAtTime(0.001, s);
      gain.gain.linearRampToValueAtTime(0.24, s + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, s + 0.22);
      osc.connect(gain); gain.connect(this.hpFilter);
      osc.start(s); osc.stop(s + 0.24);
    });
  }
}
const sfx = new AstraSFXEngine(config);

// --- ТЕСТОВАЯ ФОНОВАЯ МУЗЫКА ---
let bgMusicNodes = null;
function toggleBgMusic() {
  sfx.init();
  const btn = document.getElementById('btnMusic');
  if (bgMusicNodes) {
    bgMusicNodes.forEach(n => { try { n.stop(); n.disconnect(); } catch (e) {} });
    bgMusicNodes = null;
    sfx.musicGain = null;
    btn.classList.remove('active');
    btn.textContent = '🎵 Тест-музыка (Бас + Пэд): ВЫКЛ';
    return;
  }
  const t = sfx.ctx.currentTime;
  const mGain = sfx.ctx.createGain();
  mGain.gain.setValueAtTime(0.28, t);
  mGain.connect(sfx.ctx.destination);
  sfx.musicGain = mGain;

  bgMusicNodes = [65.41, 130.81, 196.00, 246.94].map((f, idx) => {
    const osc = sfx.ctx.createOscillator();
    const filter = sfx.ctx.createBiquadFilter();
    osc.type = idx === 0 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(f, t);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(idx === 0 ? 180 : 600, t);
    osc.connect(filter); filter.connect(mGain);
    osc.start(t);
    return osc;
  });

  btn.classList.add('active');
  btn.textContent = '🎵 Тест-музыка (Бас + Пэд): ВКЛ';
}

// --- ПОЛЗУНКИ И ОСЦИЛЛОГРАФ ---
function updateConfig() {
  config.volume = document.getElementById('rngVol').value / 100;
  config.highpassHz = Number(document.getElementById('rngHp').value);
  config.lowpassHz = Number(document.getElementById('rngLp').value);
  config.duckingAmount = document.getElementById('rngDuck').value / 100;

  document.getElementById('valVol').textContent = Math.round(config.volume * 100) + '%';
  document.getElementById('valHp').textContent = config.highpassHz + ' Гц';
  document.getElementById('valLp').textContent = config.lowpassHz + ' Гц';
  document.getElementById('valDuck').textContent = Math.round(config.duckingAmount * 100) + '%';
  sfx.applyConfig();
}

const canvas = document.getElementById('scope');
const cCtx = canvas.getContext('2d');
function drawScope() {
  requestAnimationFrame(drawScope);
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  cCtx.fillStyle = '#080a12';
  cCtx.fillRect(0, 0, canvas.width, canvas.height);
  if (!sfx.analyser) return;

  const bufLen = sfx.analyser.frequencyBinCount;
  const data = new Uint8Array(bufLen);
  sfx.analyser.getByteTimeDomainData(data);

  cCtx.lineWidth = 2;
  cCtx.strokeStyle = '#00e5ff';
  cCtx.beginPath();
  const slice = canvas.width / bufLen;
  let x = 0;
  for (let i = 0; i < bufLen; i++) {
    const y = ((data[i] / 128.0) * canvas.height) / 2;
    if (i === 0) cCtx.moveTo(x, y);
    else cCtx.lineTo(x, y);
    x += slice;
  }
  cCtx.lineTo(canvas.width, canvas.height / 2);
  cCtx.stroke();
}
drawScope();

// --- ЭКСПОРТ ЧИСТОГО МОДУЛЯ ДЛЯ ДРУГОЙ ИИ ---
function copyExportCode() {
  const cleanClassCode = AstraSFXEngine.toString();
  const exportText = `// Модуль процедурных ASMR и психоделических SFX для игры ASTRACAT
// Подключение: const sfx = new AstraSFXEngine(${JSON.stringify(config)});
// Привязка к тегу <audio> фоновой музыки для сайдчейна: sfx.bindMusic(document.getElementById('bgMusic'));
// Доступные звуки:
// Оружие: sfx.bulletSoft(), sfx.bulletPlasma(), sfx.laserBeam(), sfx.laserCrystal(), sfx.rocketLaunch(), sfx.rocketSwarm()
// Взрывы: sfx.expTiny(), sfx.expMedium(), sfx.expDeepBass(), sfx.expBoss()
// АСМР/Бонусы: sfx.asmrBubble(), sfx.asmrClick(), sfx.asmrCrystal(), sfx.psyWarp(), sfx.asmrTingles(), sfx.powerUp()

${cleanClassCode}

AstraSFXEngine.prototype.bindMusic = function(audioEl) {
  if (!audioEl) return;
  this.init();
  const src = this.ctx.createMediaElementSource(audioEl);
  this.musicGain = this.ctx.createGain();
  this.musicGain.gain.value = 0.28;
  src.connect(this.musicGain);
  this.musicGain.connect(this.ctx.destination);
};

window.astraSFX = new AstraSFXEngine(${JSON.stringify(config)});`;

  navigator.clipboard.writeText(exportText).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  });
}

