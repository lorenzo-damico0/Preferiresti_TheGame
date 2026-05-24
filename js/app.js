// ── STATE ──────────────────────────────────────────────────────
const state = {
    currentCat: null,
    pool: [],
    usedPairs: new Set(),
    currentA: null,
    currentB: null,
    localScores: {},
    globalScores: {},
    globalVotes: {},
    saved: new Set(),
    rounds: 0,
    streak: 0,
    rankCat: 'all',
    rankSearch: '',
    rankMode: 'local',
    userId: '#' + Math.floor(1000 + Math.random() * 9000),
    prevRankSnapshot: {},
    // auth
    authMode: null,   // 'guest' | 'logged'
    nickname: '',
    age: '',
};

const GLOBAL_KEY = 'budget_focus_global_v1';

// ── GLOBAL SCORES (cloud) ──────────────────────────────────────
async function loadGlobalScores() {
    try {
        const result = await window.storage.get(GLOBAL_KEY, true);
        if (result && result.value) {
            const data = JSON.parse(result.value);
            state.globalScores = data.scores || {};
            state.globalVotes  = data.votes  || {};
        }
    } catch(e) {
        state.globalScores = {};
        state.globalVotes  = {};
    }
}

async function saveGlobalScores() {
    try {
        const data = { scores: state.globalScores, votes: state.globalVotes };
        await window.storage.set(GLOBAL_KEY, JSON.stringify(data), true);
    } catch(e) {}
}

// ── CLOUD PERSONAL SCORES (solo per logged) ───────────────────
function cloudKey() { return `bf_user_${state.userId}`; }

async function loadCloudPersonal() {
    if (state.authMode !== 'logged') return;
    try {
        const r = await window.storage.get(cloudKey(), false);
        if (r && r.value) {
            const d = JSON.parse(r.value);
            state.localScores = d.scores || {};
            state.saved       = new Set(d.saved || []);
            state.rounds      = d.rounds || 0;
            state.streak      = d.streak || 0;
        }
    } catch(e) {}
}

async function saveCloudPersonal() {
    if (state.authMode !== 'logged') return;
    try {
        const d = {
            scores: state.localScores,
            saved: [...state.saved],
            rounds: state.rounds,
            streak: state.streak,
        };
        await window.storage.set(cloudKey(), JSON.stringify(d), false);
    } catch(e) {}
}

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    loadLocalState();

    // Se c'è già una sessione salvata, salta l'onboarding
    if (state.authMode) {
        enterApp();
    }
    // altrimenti rimane su screen-0

    // ── Onboarding buttons
    document.getElementById('btn-guest').addEventListener('click', () => {
        state.authMode = 'guest';
        state.nickname = 'Ospite';
        saveLocalState();
        enterApp();
    });

    document.getElementById('btn-login').addEventListener('click', () => {
        showScreen('screen-0b');
    });

    document.getElementById('btn-back-login').addEventListener('click', () => {
        showScreen('screen-0');
    });

    document.getElementById('btn-login-confirm').addEventListener('click', async () => {
        const nick = document.getElementById('input-nickname').value.trim();
        if (!nick) { showToast('Inserisci un nickname!'); return; }
        state.authMode = 'logged';
        state.nickname = nick;
        state.age = document.getElementById('sel-age').value || '';
        saveLocalState();
        await loadCloudPersonal();
        enterApp();
    });

    // ── Switch account (dal profilo)
    document.getElementById('btn-switch-account').addEventListener('click', () => {
        state.authMode = null;
        state.nickname = '';
        saveLocalState();
        document.getElementById('main-nav').classList.add('hidden');
        showScreenRaw('screen-0');
    });

    // ── Game buttons
    document.getElementById('btn-a').addEventListener('click', (e) => { e.stopPropagation(); choose('a'); });
    document.getElementById('btn-b').addEventListener('click', (e) => { e.stopPropagation(); choose('b'); });
    document.getElementById('btn-skip').addEventListener('click', () => { state.streak = 0; nextPair(false); showToast('Saltato — streak azzerato'); });
    document.getElementById('save-a').addEventListener('click', (e) => { e.stopPropagation(); toggleSave(state.currentA); });
    document.getElementById('save-b').addEventListener('click', (e) => { e.stopPropagation(); toggleSave(state.currentB); });

    document.getElementById('btn-focus-mode').addEventListener('click', toggleFocusMode);
    document.getElementById('focus-close').addEventListener('click', closeFocusMode);
    document.getElementById('focus-btn-a').addEventListener('click', () => { choose('a'); });
    document.getElementById('focus-btn-b').addEventListener('click', () => { choose('b'); });

    // ── Rank
    document.getElementById('btn-rank-local').addEventListener('click', () => setRankMode('local'));
    document.getElementById('btn-rank-global').addEventListener('click', async () => {
        await loadGlobalScores();
        setRankMode('global');
    });
    document.getElementById('rank-search').addEventListener('input', e => {
        state.rankSearch = e.target.value.toLowerCase();
        updateRank();
    });

    // ── Profile
    document.getElementById('btn-feedback').addEventListener('click', sendFeedback);
    document.getElementById('btn-reset').addEventListener('click', resetData);
    document.getElementById('btn-saved').addEventListener('click', () => {
        navigateTo('screen-3');
        state.rankCat = 'saved';
        syncTabUI('saved');
        updateRank();
    });

    // ── Nav play button
    document.getElementById('nav-play-btn').addEventListener('click', () => {
        if (state.currentCat) navigateTo('screen-2');
        else navigateTo('screen-1');
    });
});

// ── ENTER APP dopo onboarding ─────────────────────────────────
async function enterApp() {
    document.getElementById('user-id').textContent = 'ID: ' + state.userId;
    buildCategoryList();
    buildRankCatTabs();
    await loadGlobalScores();
    if (state.authMode === 'logged') await loadCloudPersonal();
    updateRank();
    updateProfileStats();
    updateUserBadge();

    document.getElementById('main-nav').classList.remove('hidden');
    showScreenRaw('screen-1');
    // sincronizza nav
    syncNavActive('screen-1');
}

// ── USER BADGE & PROFILE ──────────────────────────────────────
function updateUserBadge() {
    const isLogged = state.authMode === 'logged';
    const icon = isLogged ? '✨' : '👤';
    const label = isLogged ? (state.nickname || 'Utente') : 'Ospite';
    document.getElementById('user-mode-icon').textContent = icon;
    document.getElementById('user-mode-label').textContent = label;

    // Profilo
    document.getElementById('profile-avatar').textContent = isLogged ? '✨' : '👤';
    document.getElementById('profile-name').textContent   = label;
    document.getElementById('profile-mode-badge').textContent = isLogged ? 'Cloud ☁️' : 'Ospite';
    document.getElementById('profile-mode-badge').className =
        `px-3 py-1 rounded-full text-xs font-semibold ${isLogged ? 'bg-teal-pale text-teal' : 'bg-gray-100 text-gray-500'}`;
}

// ── SCREEN MANAGEMENT ─────────────────────────────────────────
function showScreen(id) {
    // per schermate di onboarding (senza nav)
    ['screen-0','screen-0b'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle('hidden-screen', s !== id);
    });
}

function showScreenRaw(id) {
    document.querySelectorAll('section[id^="screen-"]').forEach(s => s.classList.add('hidden-screen'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.remove('hidden-screen');
        target.classList.add('screen-enter');
        setTimeout(() => target.classList.remove('screen-enter'), 350);
    }
}


// ── CATEGORY LIST ─────────────────────────────────────────────
function buildCategoryList() {
    const container = document.getElementById('category-list');
    container.innerHTML = '';
    CATEGORIE.forEach(cat => {
        const count = SPESE.filter(s => s.categoria === cat.id).length;

        const btn = document.createElement('button');
        btn.onclick = () => startGame(cat.id);
        btn.className = 'w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-teal/30 active:scale-95 transition-all text-left group screen-enter';
        btn.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <span class="text-2xl w-11 h-11 bg-teal-pale rounded-xl flex items-center justify-center shadow-sm">${cat.emoji}</span>
                    <div>
                        <h3 class="text-base font-semibold text-ink group-hover:text-teal transition-colors">${cat.nome}</h3>
                        <p class="text-xs text-gray-400 mt-0.5">${cat.descrizione}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono text-gray-300">${count} voci</span>
                    <svg class="w-4 h-4 text-gray-300 group-hover:text-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </div>`;
        container.appendChild(btn);
    });
}


// ── RANK CAT TABS ─────────────────────────────────────────────
function buildRankCatTabs() {
    const container = document.getElementById('rank-cat-tabs');
    const tabs = [{ id: 'all', nome: 'Tutte', emoji: '' }, { id: 'saved', nome: 'Salvate', emoji: '⭐' }, ...CATEGORIE];
    container.innerHTML = '';
    tabs.forEach(cat => {
        const btn = document.createElement('button');
        btn.dataset.cat = cat.id;
        btn.className = `rank-tab ${cat.id === 'all' ? 'seg-active' : 'seg-inactive'} text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all`;
        btn.textContent = cat.emoji ? `${cat.emoji} ${cat.nome}` : cat.nome;
        btn.addEventListener('click', () => {
            state.rankCat = cat.id;
            syncTabUI(cat.id);
            updateRank();
        });
        container.appendChild(btn);
    });
}

function syncTabUI(activeCatId) {
    document.querySelectorAll('.rank-tab').forEach(t => {
        t.className = `rank-tab ${t.dataset.cat === activeCatId ? 'seg-active' : 'seg-inactive'} text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all`;
    });
}

// ── RANK MODE ─────────────────────────────────────────────────
function setRankMode(mode) {
    state.rankMode = mode;
    const isGlobal = mode === 'global';
    document.getElementById('btn-rank-local').className  = `text-[11px] font-semibold px-3 py-1.5 rounded-lg ${isGlobal ? 'seg-inactive' : 'seg-active'} transition-all`;
    document.getElementById('btn-rank-global').className = `text-[11px] font-semibold px-3 py-1.5 rounded-lg ${isGlobal ? 'seg-active' : 'seg-inactive'} transition-all`;
    const banner = document.getElementById('global-banner');
    if (isGlobal) {
        banner.classList.remove('hidden');
        const totalVotes = Object.values(state.globalVotes).reduce((a, b) => a + b, 0);
        const uniqueItems = Object.keys(state.globalScores).length;
        document.getElementById('global-votes-info').textContent = `${totalVotes} voti totali su ${uniqueItems} voci`;
    } else {
        banner.classList.add('hidden');
    }
    updateRank();
}

// ── GAME ──────────────────────────────────────────────────────
function startGame(catId) {
    state.currentCat = catId;
    state.pool = SPESE.filter(s => s.categoria === catId);
    state.usedPairs = new Set();
    state.pool.forEach(s => { if (!(s.id in state.localScores)) state.localScores[s.id] = 1000; });
    const cat = CATEGORIE.find(c => c.id === catId);
    document.getElementById('cat-label').textContent = `${cat.emoji} ${cat.nome}`;
    // Mostra il tasto Gioca nel nav
    const playBtn = document.getElementById('nav-play-btn');
    playBtn.classList.remove('hidden');
    playBtn.classList.add('flex');
    navigateTo('screen-2');
    nextPair(false);
}

function nextPair(counted) {
    if (state.pool.length < 2) { showToast('Non ci sono abbastanza spese in questa fascia!'); return; }
    let a, b, key, tries = 0;
    do {
        const shuffled = [...state.pool].sort(() => Math.random() - 0.5);
        a = shuffled[0];
        b = shuffled[1];
        key = [Math.min(a.id, b.id), Math.max(a.id, b.id)].join('-');
        tries++;
    } while (state.usedPairs.has(key) && tries < 40);

    if (tries >= 40) state.usedPairs = new Set();
    state.usedPairs.add(key);
    state.currentA = a;
    state.currentB = b;

    if (counted) {
        state.rounds++;
        state.streak++;
        updateProfileStats();
        saveLocalState();
        saveCloudPersonal();
        // aggiorna progress bar home
        buildCategoryList();
    }
    renderCurrentPair();
    updateRoundDots();
}

function renderCurrentPair() {
    const a = state.currentA, b = state.currentB;
    if (!a || !b) return;
    document.getElementById('name-a').textContent = a.nome;
    document.getElementById('name-b').textContent = b.nome;
    updateSaveIcon('save-a', a.id);
    updateSaveIcon('save-b', b.id);
    document.getElementById('focus-btn-a').textContent = a.nome;
    document.getElementById('focus-btn-b').textContent = b.nome;
    document.getElementById('round-counter').textContent = `${state.rounds} confronti totali`;
}

async function choose(which) {
    const winner = which === 'a' ? state.currentA : state.currentB;
    const loser  = which === 'a' ? state.currentB : state.currentA;
    if (!winner || !loser) return;

    const K = 32;
    const RaL = state.localScores[winner.id] || 1000;
    const RbL = state.localScores[loser.id]  || 1000;
    const EaL = 1 / (1 + Math.pow(10, (RbL - RaL) / 400));
    state.localScores[winner.id] = Math.round(RaL + K * (1 - EaL));
    state.localScores[loser.id]  = Math.round(RbL + K * (0 - (1 - EaL)));

    const RaG = state.globalScores[winner.id] || 1000;
    const RbG = state.globalScores[loser.id]  || 1000;
    const EaG = 1 / (1 + Math.pow(10, (RbG - RaG) / 400));
    state.globalScores[winner.id] = Math.round(RaG + K * (1 - EaG));
    state.globalScores[loser.id]  = Math.round(RbG + K * (0 - (1 - EaG)));
    state.globalVotes[winner.id]  = (state.globalVotes[winner.id] || 0) + 1;
    state.globalVotes[loser.id]   = (state.globalVotes[loser.id]  || 0) + 1;

    saveGlobalScores();

    const winBtn = document.getElementById(`btn-${which}`);
    winBtn.classList.add('win-flash');
    setTimeout(() => winBtn.classList.remove('win-flash'), 300);

    if (state.rankMode === 'global' || !document.getElementById('screen-3').classList.contains('hidden-screen')) {
        updateRank();
    }
    nextPair(true);
}

function updateRoundDots() {
    const max = 8;
    const container = document.getElementById('round-dots');
    container.innerHTML = '';
    for (let i = 0; i < max; i++) {
        const filled = i < (state.rounds % max);
        const dot = document.createElement('div');
        dot.className = `w-1.5 h-1.5 rounded-full transition-all duration-300 ${filled ? 'bg-teal' : 'bg-gray-200'}`;
        container.appendChild(dot);
    }
}

// ── RANK LIST ─────────────────────────────────────────────────
function updateRank() {
    const isGlobal = state.rankMode === 'global';
    const scores   = isGlobal ? state.globalScores : state.localScores;
    let items = SPESE.filter(s => {
        if (state.rankCat === 'all') return true;
        if (state.rankCat === 'saved') return state.saved.has(s.id);
        return s.categoria === state.rankCat;
    });
    if (state.rankSearch) {
        items = items.filter(s => s.nome.toLowerCase().includes(state.rankSearch));
    }
    items.sort((a, b) => (scores[b.id] || 1000) - (scores[a.id] || 1000));
    const container = document.getElementById('rank-list');
    if (items.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-300 text-sm mt-12">Nessuna voce trovata.</div>`;
        return;
    }
    const votedItems = items.filter(i => (scores[i.id] || 0) !== 1000 || (isGlobal ? state.globalVotes[i.id] : true));
    const maxScore = votedItems.length > 0 ? Math.max(...votedItems.map(i => scores[i.id] || 1000)) : 1000;
    const minScore = 850;
    container.innerHTML = '';
    items.forEach((item, idx) => {
        const score   = scores[item.id] || 1000;
        const pct     = Math.max(4, Math.round(((score - minScore) / Math.max(maxScore - minScore, 1)) * 100));
        const isSaved = state.saved.has(item.id);
        const cat     = CATEGORIE.find(c => c.id === item.categoria);
        const votes   = isGlobal ? (state.globalVotes[item.id] || 0) : null;
        const prevPos = state.prevRankSnapshot[item.id];
        let deltaHTML = '';
        if (prevPos !== undefined && prevPos !== idx) {
            const diff = prevPos - idx;
            if (diff > 0) deltaHTML = `<span class="delta-up text-[10px] font-mono">▲${diff}</span>`;
            else deltaHTML = `<span class="delta-down text-[10px] font-mono">▼${Math.abs(diff)}</span>`;
        } else if (prevPos === undefined && score !== 1000) {
            deltaHTML = `<span class="delta-new text-[10px] font-mono">new</span>`;
        }
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
        const row = document.createElement('div');
        row.className = 'flex flex-col p-3.5 bg-white rounded-2xl border border-gray-50 shadow-sm';
        row.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <span class="text-base font-display ${medal ? 'text-base' : 'text-gray-200'} w-7 text-center leading-none">${medal || (idx + 1)}</span>
                <button class="save-row-btn ${isSaved ? 'text-teal' : 'text-gray-200'} hover:text-teal transition-colors p-1" data-id="${item.id}" aria-label="Salva preferito">
                    <svg class="w-4 h-4 ${isSaved ? 'fill-current' : ''}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                </button>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-ink leading-tight truncate">${item.nome}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                        <p class="text-[10px] text-gray-400">${cat ? cat.emoji + ' ' + cat.nome : ''}</p>
                        ${isGlobal && votes > 0 ? `<span class="text-[9px] text-gray-300">• ${votes} voti</span>` : ''}
                    </div>
                </div>
                <div class="flex flex-col items-end gap-0.5 ml-2 min-w-[40px]">
                    <span class="font-mono text-xs font-bold text-teal">${score}</span>
                    ${deltaHTML}
                </div>
            </div>
            <div class="ml-9 bg-gray-100 rounded-full h-1 overflow-hidden">
                <div class="rank-bar bg-teal h-full rounded-full" style="width:${pct}%"></div>
            </div>`;
        row.querySelector('.save-row-btn').addEventListener('click', () => { toggleSave(item); updateRank(); });
        container.appendChild(row);
    });
    items.forEach((item, idx) => { state.prevRankSnapshot[item.id] = idx; });
}

// ── SAVE / FOCUS ──────────────────────────────────────────────
function toggleSave(item) {
    if (!item) return;
    if (state.saved.has(item.id)) {
        state.saved.delete(item.id);
        showToast('Rimosso dai preferiti');
    } else {
        state.saved.add(item.id);
        showToast('⭐ Salvato!');
    }
    updateSaveIcon('save-a', state.currentA?.id);
    updateSaveIcon('save-b', state.currentB?.id);
    updateProfileStats();
    saveLocalState();
    saveCloudPersonal();
}

function updateSaveIcon(btnId, itemId) {
    const btn = document.getElementById(btnId);
    if (!btn || !itemId) return;
    const isSaved = state.saved.has(itemId);
    const svg = btn.querySelector('svg');
    svg.setAttribute('fill', isSaved ? 'currentColor' : 'none');
    btn.style.opacity = isSaved ? '1' : '0.4';
}


function toggleFocusMode() {
    if (!state.currentA || !state.currentB) { showToast('Scegli prima una categoria!'); return; }
    document.getElementById('focus-overlay').classList.toggle('hidden');
}

function closeFocusMode() {
    document.getElementById('focus-overlay').classList.add('hidden');
}


// ── NAVIGATION ────────────────────────────────────────────────
function navigateTo(screenId) {
    closeFocusMode(); // Chiude la focus mode se cambi schermata dal menu
    document.querySelectorAll('section[id^="screen-"]').forEach(s => s.classList.add('hidden-screen'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden-screen');
        target.classList.add('screen-enter');
        setTimeout(() => target.classList.remove('screen-enter'), 350);
    }
    syncNavActive(screenId);
    if (screenId === 'screen-3') updateRank();
    if (screenId === 'screen-4') { updateProfileStats(); updateUserBadge(); }
}

function syncNavActive(screenId) {
    const idx = parseInt(screenId.split('-')[1]) - 1;
    // nav buttons: 0=screen-1, 1=screen-2(play), 2=screen-3, 3=screen-4
    // ma play potrebbe essere hidden, gestisci con data-screen
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        const btnScreen = parseInt(btn.dataset.screen || '0');
        const active = btnScreen === parseInt(screenId.split('-')[1]);
        btn.classList.toggle('active', active);
        btn.classList.toggle('text-teal', active);
        btn.classList.toggle('text-gray-400', !active);
    });
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}

// ── PROFILE STATS ─────────────────────────────────────────────
function updateProfileStats() {
    document.getElementById('stat-rounds').textContent = state.rounds;
    document.getElementById('stat-saved').textContent  = state.saved.size;
    document.getElementById('stat-streak').textContent = state.streak;
    document.getElementById('saved-count').textContent = `${state.saved.size} voci nei preferiti`;
}

function sendFeedback() {
    const text = document.getElementById('feedback-text').value.trim();
    if (!text) { showToast('Scrivi un messaggio prima!'); return; }
    showToast('✓ Feedback inviato — grazie!');
    document.getElementById('feedback-text').value = '';
}

function resetData() {
    if (!confirm('Sei sicuro? Perderai tutti i tuoi punteggi locali.')) return;
    state.localScores = {};
    state.saved  = new Set();
    state.rounds = 0;
    state.streak = 0;
    state.prevRankSnapshot = {};
    saveLocalState();
    saveCloudPersonal();
    buildCategoryList();
    updateRank();
    updateProfileStats();
    showToast('Dati azzerati.');
}

// ── LOCAL STORAGE ─────────────────────────────────────────────
function saveLocalState() {
    try {
        localStorage.setItem('bf_scores_v2',  JSON.stringify(state.localScores));
        localStorage.setItem('bf_saved_v2',   JSON.stringify([...state.saved]));
        localStorage.setItem('bf_rounds_v2',  state.rounds);
        localStorage.setItem('bf_streak_v2',  state.streak);
        localStorage.setItem('bf_userid_v2',  state.userId);
        localStorage.setItem('bf_authmode_v2',state.authMode || '');
        localStorage.setItem('bf_nickname_v2',state.nickname || '');
        localStorage.setItem('bf_age_v2',     state.age || '');
    } catch(e) {}
}

function loadLocalState() {
    try {
        const sc = localStorage.getItem('bf_scores_v2');  if (sc) state.localScores = JSON.parse(sc);
        const sv = localStorage.getItem('bf_saved_v2');   if (sv) state.saved = new Set(JSON.parse(sv));
        const ro = localStorage.getItem('bf_rounds_v2');  if (ro) state.rounds = parseInt(ro) || 0;
        const st = localStorage.getItem('bf_streak_v2');  if (st) state.streak = parseInt(st) || 0;
        const ui = localStorage.getItem('bf_userid_v2');  if (ui) state.userId = ui;
        const am = localStorage.getItem('bf_authmode_v2');if (am) state.authMode = am || null;
        const nk = localStorage.getItem('bf_nickname_v2');if (nk) state.nickname = nk;
        const ag = localStorage.getItem('bf_age_v2');     if (ag) state.age = ag;
    } catch(e) {}
}