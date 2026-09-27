// Configuração da Web Audio API para gerar som de clique via código
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Função que sintetiza o som de clique instantâneo
function playClick() {
  try {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Tipo de onda sonora (sine = tom limpo e curto)
    osc.type = 'sine';
    
    // Frequência inicial do clique (1200Hz caindo rapidamente para 400Hz)
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);

    // Volume do clique (começa alto e desce a zero em 40ms)
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    console.log("Erro ao sintetizar clique:", e);
  }
}

// Elementos da Página
const bgMusic = document.getElementById('bg-music');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const btnMute = document.getElementById('btn-mute');

// Iniciar ao clicar no Overlay inicial
btnStart.addEventListener('click', () => {
  initAudioContext();
  playClick();
  
  if (bgMusic && bgMusic.src && !bgMusic.src.endsWith('undefined')) {
    bgMusic.volume = 0.3;
    bgMusic.play().catch(e => console.log("Música aguardando arquivo mp3:", e));
  }
  
  startOverlay.style.display = 'none';
});

// Botão de Mute/Unmute da música
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

// Navegação entre Abas
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    playClick();
    
    navBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Função para Copiar IP
function copiarIP(elementId) {
  playClick();
  const ipText = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(ipText).then(() => {
    alert('IP Copiado com sucesso: ' + ipText);
  });
}
