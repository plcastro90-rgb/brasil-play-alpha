// Sistema de Partículas Subindo
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particlesArray = [];
const numberOfParticles = 25;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.size = Math.random() * 2 + 1;
    this.speedY = Math.random() * 0.8 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    if (this.y < 0) {
      this.y = canvas.height + 10;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.fillStyle = `rgba(255, 30, 70, ${this.opacity})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff1a40';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

for (let i = 0; i < numberOfParticles; i++) {
  particlesArray.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(particle => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Sistema de Áudio e Interação
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playClick() {
  try {
    initAudioContext();
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {}
}

const bgMusic = document.getElementById('bg-music');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const btnMute = document.getElementById('btn-mute');

if (btnStart) {
  btnStart.addEventListener('click', () => {
    initAudioContext();
    playClick();
    if (bgMusic) {
      bgMusic.volume = 0.3;
      bgMusic.play().catch(() => {});
    }
    if (startOverlay) {
      startOverlay.style.display = 'none';
    }
  });
}

if (btnMute) {
  btnMute.addEventListener('click', () => {
    playClick();
    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
      btnMute.textContent = '🔇';
    } else if (bgMusic) {
      bgMusic.play().catch(() => {});
      btnMute.textContent = '🎵';
    }
  });
}

// Navegação Inferior
const bottomBtns = document.querySelectorAll('.bottom-btn');
const tabContents = document.querySelectorAll('.tab-content');

function mudarParaAba(tabId) {
  playClick();
  bottomBtns.forEach(b => {
    if (b.getAttribute('data-tab') === tabId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  tabContents.forEach(c => c.classList.remove('active'));
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }
}

bottomBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    mudarParaAba(tabId);
  });
});

function copiarIP(elementId) {
  playClick();
  const ipText = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(ipText).then(() => {
    alert('IP Copiado com sucesso: ' + ipText);
  });
}

// UCP API Login
const URL_BASE_API = 'https://ucp-api-bpa.onrender.com/api';

async function executarLogin() {
  playClick();
  const nick = document.getElementById('userInput').value.trim();
  const pass = document.getElementById('passInput').value.trim();
  const servidor = document.getElementById('serverSelect').value;
  const msg = document.getElementById('mensagem-auth');

  if (!nick || !pass) {
    msg.style.color = '#ff3355';
    msg.innerText = 'Preencha todos os campos.';
    return;
  }

  msg.style.color = '#fff';
  msg.innerText = 'A validar dados...';

  try {
    const resposta = await fetch(`${URL_BASE_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick, pass, servidor })
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      throw new Error(resultado.mensagem || 'Conta não encontrada.');
    }

    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('painel-box').classList.remove('hidden');

    if (resultado.usuario) {
      document.getElementById('ucp-nick').innerText = resultado.usuario.nick || nick;
      document.getElementById('ucp-id').innerText = resultado.usuario.id || '3492';
      document.getElementById('ucp-rg').innerText = resultado.usuario.rg || '89120';
      document.getElementById('ucp-dinheiro').innerText = 'R$ ' + (resultado.usuario.dinheiro || 1500000).toLocaleString();
      document.getElementById('ucp-banco').innerText = 'R$ ' + (resultado.usuario.banco || 15420000).toLocaleString();
      document.getElementById('ucp-level').innerText = resultado.usuario.level || '65';
      document.getElementById('ucp-org').innerText = resultado.usuario.organizacao || 'Civil / Nenhum';
    }

  } catch (erro) {
    msg.style.color = '#ff3355';
    msg.innerText = erro.message;
  }
}

function fazerLogout() {
  playClick();
  document.getElementById('painel-box').classList.add('hidden');
  document.getElementById('login-box').classList.remove('hidden');
  document.getElementById('userInput').value = '';
  document.getElementById('passInput').value = '';
  document.getElementById('mensagem-auth').innerText = '';
}
