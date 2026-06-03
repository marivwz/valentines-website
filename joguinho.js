 // ── BG STARS ──
  const bgStars = document.getElementById('bgStars');
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'bg-star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random()*100}%; left:${Math.random()*100}%;
      animation-duration:${2+Math.random()*4}s;
      animation-delay:${Math.random()*4}s;
    `;
    bgStars.appendChild(s);
  }

  // ── ESTADO ──
  const CATS = [
    { name: 'Krets', el: 'cat0', mood: 'mood0', zzz: 'zzz0' },
    { name: 'Mari', el: 'cat1', mood: 'mood1', zzz: 'zzz1' },
  ];

  const state = CATS.map(() => ({
    food:   80,
    love:   75,
    clean:  90,
    energy: 85,
    fun:    70,
    sleeping: false,
  }));

  let selectedCat = -1; // -1 = ambos

  const MOODS = [
    { min: 80, emoji: '😻', label: 'Feliz demais!' },
    { min: 60, emoji: '😸', label: 'Contente~' },
    { min: 40, emoji: '😺', label: 'Tá bem' },
    { min: 20, emoji: '🙀', label: 'Precisando de atenção!' },
    { min: 0,  emoji: '😿', label: 'Triste...' },
  ];

  function getMood(s) {
    const avg = (s.food + s.love + s.clean + s.energy + s.fun) / 5;
    if (s.sleeping) return { emoji: '😴', label: 'Dormindo...' };
    return MOODS.find(m => avg >= m.min) || MOODS[MOODS.length-1];
  }

  // ── RENDER STATS ──
  const statsGrid = document.getElementById('statsGrid');

  function renderStats() {
    statsGrid.innerHTML = '';
    CATS.forEach((cat, i) => {
      const s = state[i];
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div class="stat-card-title">${cat.name}</div>
        ${statRow('🍣', 'Fome',    s.food,   'bar-food')}
        ${statRow('💜', 'Amor',    s.love,   'bar-love')}
        ${statRow('🛁', 'Limpeza', s.clean,  'bar-clean')}
        ${statRow('⚡', 'Energia', s.energy, 'bar-energy')}
        ${statRow('🎾', 'Diversão',s.fun,    'bar-fun')}
      `;
      statsGrid.appendChild(card);
    });
  }

  function statRow(icon, label, val, cls) {
    const v = Math.max(0, Math.min(100, Math.round(val)));
    return `
      <div class="stat-row">
        <span class="stat-icon">${icon}</span>
        <div class="stat-bar-wrap">
          <div class="stat-bar ${cls}" style="width:${v}%"></div>
        </div>
        <span class="stat-val">${v}</span>
      </div>`;
  }

  // ── UPDATE MOODS ──
  function updateMoods() {
    CATS.forEach((cat, i) => {
      const m = getMood(state[i]);
      document.getElementById(cat.mood).textContent = m.emoji;
      const zzzEl = document.getElementById(cat.zzz);
      if (zzzEl) zzzEl.style.display = state[i].sleeping ? 'block' : 'none';
      const catEl = document.getElementById(cat.el);
      if (state[i].sleeping) catEl.classList.add('sleeping');
      else catEl.classList.remove('sleeping');
    });
  }

  // ── AÇÕES ──
  const ACTION_MAP = {
    food: { stat: 'food',   anim: 'eating',  particles: ['🍣','😋','✨'], msg: (n) => `${n} comeu e ficou feliz!` },
    love: { stat: 'love',   anim: 'petting', particles: ['💜','💕','✨'], msg: (n) => `${n} recebeu carinho e ronronou 😻` },
    bath: { stat: 'clean',  anim: 'bathing', particles: ['💧','🫧','✨'], msg: (n) => `${n} tomou banho e está cheiroso!` },
    play: { stat: 'fun',    anim: 'playing', particles: ['🎾','⭐','✨'], msg: (n) => `${n} brincou e ficou animado!` },
  };

  function getTargets() {
    if (selectedCat === -1) return [0, 1];
    return [selectedCat];
  }

  function doAction(type) {
    const act = ACTION_MAP[type];
    const targets = getTargets();

    targets.forEach(i => {
      const s = state[i];
      if (s.sleeping && type !== 'love') {
        showToast(`${CATS[i].name} está dormindo... 😴`);
        return;
      }

      // atualiza stat
      s[act.stat] = Math.min(100, s[act.stat] + 18);
      // efeitos colaterais
      if (type === 'food')  { s.energy = Math.min(100, s.energy + 5); }
      if (type === 'play')  { s.energy = Math.max(0, s.energy - 12); s.clean = Math.max(0, s.clean - 5); }
      if (type === 'bath')  { s.fun   = Math.max(0, s.fun - 5); }
      if (type === 'love')  { s.sleeping = false; }

      // animação
      const catEl = document.getElementById(CATS[i].el);
      catEl.classList.remove('eating','petting','bathing','playing');
      void catEl.offsetWidth;
      catEl.classList.add(act.anim);
      setTimeout(() => catEl.classList.remove(act.anim), 600);

      // partícula
      spawnParticle(catEl, act.particles[Math.floor(Math.random()*act.particles.length)]);
    });

    addLog(act.msg(targets.length === 2 ? 'Os dois' : CATS[targets[0]].name));
    renderStats();
    updateMoods();
  }

  function petCat(i) {
    doAction('love');
  }

  // ── PARTÍCULA ──
  function spawnParticle(parent, emoji) {
    const stage = document.getElementById('stage');
    const rect  = parent.getBoundingClientRect();
    const srect = stage.getBoundingClientRect();
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji;
    p.style.left = (rect.left - srect.left + rect.width/2 - 12) + 'px';
    p.style.top  = (rect.top  - srect.top  + 20) + 'px';
    stage.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }

  // ── LOG ──
  function addLog(msg) {
    const log = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span>${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</span> — ${msg}`;
    log.prepend(entry);
    if (log.children.length > 8) log.lastChild.remove();
  }

  // ── TOAST ──
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  // ── SELETOR DE GATO ──
  function selectCat(idx) {
    selectedCat = idx;
    document.querySelectorAll('.cat-sel-btn').forEach((b, i) => {
      b.classList.toggle('active', i === (idx === -1 ? 2 : idx));
    });

    // destaque visual
    CATS.forEach((cat, i) => {
      const el = document.getElementById(cat.el);
      if (idx === -1 || idx === i) {
        el.style.opacity = '1';
        el.style.filter  = '';
      } else {
        el.style.opacity = '0.35';
        el.style.filter  = 'grayscale(0.6)';
      }
    });

    if (idx >= 0) addLog(`Você escolheu cuidar de ${CATS[idx].name} agora `);
    else addLog('Cuidando dos dois gatinhos ao mesmo tempo 🐱🐱');
  }

  // ── DECAY (stats diminuem devagar) ──
  setInterval(() => {
    state.forEach((s, i) => {
      if (!s.sleeping) {
        s.food   = Math.max(0, s.food   - 0.8);
        s.love   = Math.max(0, s.love   - 0.5);
        s.clean  = Math.max(0, s.clean  - 0.4);
        s.energy = Math.max(0, s.energy - 0.6);
        s.fun    = Math.max(0, s.fun    - 0.7);
      } else {
        s.energy = Math.min(100, s.energy + 2);
      }

      // alerta se muito baixo
      const avg = (s.food + s.love + s.clean + s.energy + s.fun) / 5;
      if (avg < 30 && Math.random() < 0.3) {
        showToast(`${CATS[i].name} precisa de atenção! 🙀`);
      }

      // dorme sozinho se energia muito baixa
      if (s.energy < 15 && !s.sleeping) {
        s.sleeping = true;
        addLog(`${CATS[i].name} ficou cansado e foi dormir 😴`);
      }
      // acorda quando descansado
      if (s.sleeping && s.energy > 70) {
        s.sleeping = false;
        addLog(`${CATS[i].name} acordou cheio de energia! 😸`);
      }
    });
    renderStats();
    updateMoods();
  }, 3000);

  // ── INIT ──
  renderStats();
  updateMoods();
  selectCat(-1);
  document.querySelectorAll('.zzz').forEach(z => z.style.display = 'none');