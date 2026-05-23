// ── estrelas ──
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const stars = Array.from({ length: 200 }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.6 + 0.2,
  speed: Math.random() * 0.0006 + 0.0001,
  phase: Math.random() * Math.PI * 2,
  color: ['#ffffff','#e9d5ff','#c084fc','#a855f7','#ddd6fe'][Math.floor(Math.random()*5)]
}));

const sparkles = Array.from({ length: 16 }, () => ({
  x: Math.random(), y: Math.random(),
  size: Math.random() * 6 + 2,
  phase: Math.random() * Math.PI * 2,
  speed: Math.random() * 0.002 + 0.0008,
}));

function drawStar(cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a  = (i * Math.PI) / 4;
    const rd = i % 2 === 0 ? r : r * 0.38;
    ctx.lineTo(cx + Math.cos(a) * rd, cy + Math.sin(a) * rd);
  }
  ctx.closePath();
}

let raf;
function animate(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;

  stars.forEach(s => {
    const a = 0.2 + 0.8 * Math.abs(Math.sin(t * s.speed * 1000 + s.phase));
    ctx.fillStyle   = s.color;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  sparkles.forEach(s => {
    const a  = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed * 1000 + s.phase));
    const sz = s.size * (0.6 + 0.4 * Math.abs(Math.sin(t * s.speed * 700 + s.phase)));
    ctx.globalAlpha  = a;
    ctx.fillStyle    = '#c084fc';
    ctx.shadowColor  = '#7c3aed';
    ctx.shadowBlur   = 8;
    drawStar(s.x * W, s.y * H, sz);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.globalAlpha = 1;
  raf = requestAnimationFrame(animate);
}
raf = requestAnimationFrame(animate);

// ── Contador ──
const startDate = new Date('2024-06-21T00:00:00');

function updateCounter() {
  const diff     = Date.now() - startDate.getTime();
  const totalSec = Math.floor(diff / 1000);
  document.getElementById('cnt-days').textContent  = Math.floor(totalSec / 86400).toLocaleString('pt-BR');
  document.getElementById('cnt-hours').textContent = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, '0');
  document.getElementById('cnt-min').textContent   = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  document.getElementById('cnt-sec').textContent   = String(totalSec % 60).padStart(2, '0');
}
updateCounter();
setInterval(updateCounter, 1000);

// ── Carrossel ──
const track       = document.getElementById('track');
const total       = track.children.length;
const dotsEl      = document.getElementById('dots');
const slideCounter = document.getElementById('slideCounter');
let current = 0, autoTimer;

for (let i = 0; i < total; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.addEventListener('click', () => goTo(i));
  dotsEl.appendChild(d);
}

function goTo(idx) {
  current = (idx + total) % total;
  track.style.transform = `translateX(-${current * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  slideCounter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  resetAuto();
}

function resetAuto() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goTo(current + 1), 4500);
}

document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));

let touchStartX = 0;
track.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
track.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
});
resetAuto();

// ── Fade in ao rolar ──
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));