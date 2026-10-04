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
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
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
      btnMute.textContent = '🔇 Mudo';
    } else if (bgMusic) {
      bgMusic.play().catch(() => {});
      btnMute.textContent = '🔊 Som';
    }
  });
}

const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    playClick();
    navBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
      targetTab.classList.add('active');
    }
  });
});

function copiarIP(elementId) {
  playClick();
  const ipText = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(ipText).then(() => {
    alert('IP Copiado com sucesso: ' + ipText);
  });
}

// Configuração da API UCP
const URL_BASE_API = 'https://ucp-api-bpa.onrender.com/api';

async function executarLogin() {
  playClick();
  const nick = document.getElementById('userInput').value.trim();
  const pass = document.getElementById('passInput').value.trim();
  const msg = document.getElementById('mensagem-auth');

  if (!nick || !pass) {
    msg.style.color = '#ff3333';
    msg.innerText = 'Preencha todos os campos.';
    return;
  }

  msg.style.color = '#fff';
  msg.innerText = 'A validar dados...';

  try {
    const resposta = await fetch(`${URL_BASE_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick, pass })
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      throw new Error(resultado.mensagem || 'Conta não encontrada.');
    }

    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('painel-box').classList.remove('hidden');

    if (resultado.usuario) {
      document.getElementById('ucp-nick').innerText = resultado.usuario.nick || nick;
      document.getElementById('ucp-id').innerText = resultado.usuario.id || '1';
      document.getElementById('ucp-rg').innerText = resultado.usuario.rg || '0';
      document.getElementById('ucp-dinheiro').innerText = 'R$ ' + (resultado.usuario.dinheiro || 0).toLocaleString();
      document.getElementById('ucp-banco').innerText = 'R$ ' + (resultado.usuario.banco || 0).toLocaleString();
      document.getElementById('ucp-level').innerText = resultado.usuario.level || '1';
      document.getElementById('ucp-org').innerText = resultado.usuario.organizacao || 'Civil';
    }

  } catch (erro) {
    msg.style.color = '#ff3333';
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
