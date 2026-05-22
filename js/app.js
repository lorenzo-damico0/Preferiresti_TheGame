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
};

// --- COLLEGAMENTO A SUPABASE ---
// (Ricordati di inserire i tuoi dati qui quando sarai pronto)
const supabaseUrl = 'INCOLLA_QUI_IL_TUO_URL';
const supabaseKey = 'INCOLLA_QUI_LA_TUA_CHIAVE';
let supabase = null; 
if (window.supabase && supabaseUrl !== 'INCOLLA_QUI_IL_TUO_URL') {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
}

async function loadGlobalScores() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('global_scores').select('*');
        if (data) {
            state.globalScores = {};
            state.globalVotes = {};
            data.forEach(row => {
                state.globalScores[row.item_id] = row.score;
                state.globalVotes[row.item_id] = row.votes;
            });
        }
    } catch(e) { console.error("Errore Supabase:", e); }
}

async function saveGlobalScores() {
    if (!supabase) return;
    try {
        const updates = [
            { item_id: state.currentA.id, score: state.globalScores[state.currentA.id], votes: state.globalVotes[state.currentA.id] },
            { item_id: state.currentB.id, score: state.globalScores[state.currentB.id], votes: state.globalVotes[state.currentB.id] }
        ];
        await supabase.from('global_scores').upsert(updates);
    } catch(e) { console.error("Errore salvataggio Supabase:", e); }
}

document.addEventListener('DOMContentLoaded', async () => {
    loadLocalState();
    document.getElementById('user-id').textContent = 'ID: ' + state.userId;
    buildCategoryList();
    buildRankCatTabs();
    await loadGlobalScores();
    updateRank();
    updateProfileStats();

    // Event listeners per il gioco (Overlay)
    document.getElementById('focus-btn-a').addEventListener('click', () => choose('a'));
    document.getElementById('focus-btn-b').addEventListener('click', () => choose('b'));
    document.getElementById('btn-skip-focus').addEventListener('click', () => { state.streak = 0; nextPair(false); });
    document.getElementById('btn-close-game').addEventListener('click', () => {
        document.getElementById('game-overlay').classList.add('hidden');
    });
    
    // Preferiti nell'overlay
    document.getElementById('save-a-focus').addEventListener('click', (e) => { e.stopPropagation(); toggleSave(state.currentA); });
    document.getElementById('save-b-focus').addEventListener('click', (e) => { e.stopPropagation(); toggleSave(state.currentB); });

    // Switch Classifica
    document.getElementById('btn-rank-local').addEventListener('click', () => setRankMode('local'));
    document.getElementById('btn-rank-global').addEventListener('click', async () => {
        await loadGlobalScores();
        setRankMode('global');
    });

    document.getElementById('rank-search').addEventListener('input', e => {
        state.rankSearch = e.target.value.toLowerCase();
        updateRank();
    });

    // Eventi Profilo
    document.getElementById('btn-feedback').addEventListener('click', sendFeedback);
    document.getElementById('btn-reset').addEventListener('click', resetData);
    document.getElementById('btn-saved').addEventListener('click', () => {
        navigateTo('screen-3');
        state.rankCat = 'saved';
        syncTabUI('saved');
        updateRank();
    });
});

// --- UI Home ---
function buildCategoryList() {
    const container = document.getElementById('category-list');
    container.innerHTML = '';
    CATEGORIE.forEach(cat => {
        const count = SPESE.filter(s => s.categoria === cat.id).length;
        const btn = document.createElement('button');
        btn.onclick = () => startGame(cat.id);
        // Stile aggiornato con animazioni hover e badge interattivo
        btn.className = 'cat-card w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all text-left group screen-enter relative overflow-hidden';
        btn.innerHTML = `
            <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-teal-pale to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="flex items-center gap-4 relative z-10">
                <span class="text-3xl w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner">${cat.emoji}</span>
                <div>
                    <h3 class="text-lg font-semibold text-ink group-hover:text-teal transition-colors">${cat.nome}</h3>
                    <p class="text-xs text-gray-400 mt-0.5">${cat.descrizione}</p>
                </div>
            </div>
            <div class="flex items-center gap-2 relative z-10">
                <span class="cat-play-icon text-xs font-bold text-teal tracking-wide uppercase bg-white px-2 py-1 rounded-md shadow-sm">Gioca</span>
                <span class="text-[10px] font-mono text-gray-300 group-hover:hidden">${count} voci</span>
                <svg class="w-5 h-5 text-gray-300 group-hover:text-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>`;
        container.appendChild(btn);
    });
}

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

// --- LOGICA GIOCO ---
function startGame(catId) {
    state.currentCat = catId;
    state.pool = SPESE.filter(s => s.categoria === catId);
    state.usedPairs = new Set();
    state.pool.forEach(s => { if (!(s.id in state.localScores)) state.localScores[s.id] = 1000; });
    
    const cat = CATEGORIE.find(c => c.id === catId);
    document.getElementById('overlay-cat-name').textContent = cat.nome;
    
    // Mostra l'overlay del gioco
    document.getElementById('game-overlay').classList.remove('hidden');
    nextPair(false);
}

function nextPair(counted) {
    if (state.pool.length < 2) { showToast('Non ci sono abbastanza spese!'); return; }
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
    }
    renderCurrentPair();
}

function renderCurrentPair() {
    const a = state.currentA;
    const b = state.currentB;
    if (!a || !b) return;
    document.getElementById('focus-btn-a').textContent = a.nome;
    document.getElementById('focus-btn-b').textContent = b.nome;
    updateSaveIcon('save-a-focus', a.id);
    updateSaveIcon('save-b-focus', b.id);
    document.getElementById('overlay-round').textContent = `${state.rounds} confronti totali`;
}

async function choose(which) {
    const winner = which === 'a' ? state.currentA : state.currentB;
    const loser  = which === 'a' ? state.currentB : state.currentA;
    if (!winner || !loser) return;

    // Aggiungi vibrazione nativa se supportata dal telefono
    if (navigator.vibrate) navigator.vibrate(40);

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

    const winBtn = document.getElementById(`focus-btn-${which}`);
    winBtn.classList.add('win-flash');
    
    // Piccolo delay per far vedere l'animazione del bottone prima di cambiare carta
    setTimeout(() => {
        winBtn.classList.remove('win-flash');
        if (state.rankMode === 'global' || document.getElementById('screen-3').classList.contains('hidden-screen') === false) {
            updateRank();
        }
        nextPair(true);
    }, 280);
}

function updateRank() {
    const isGlobal = state.rankMode === 'global';
    const scores   = isGlobal ? state.globalScores : state.localScores;
    let items = SPESE.filter(s => {
        if (state.rankCat === 'all') return true;
        if (state.rankCat === 'saved') return state.saved.has(s.id);
        return s.categoria === state.rankCat;
    });

    if (state.rankSearch) items = items.filter(s => s.nome.toLowerCase().includes(state.rankSearch));

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
                <span class="text-base font-display ${medal ? 'text-base' : 'text-gray-200'} w-7 text-center leading-none">
                    ${medal || (idx + 1)}
                </span>
                <button class="save-row-btn ${isSaved ? 'text-teal' : 'text-gray-200'} hover:text-teal transition-colors p-1" data-id="${item.id}">
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

function toggleSave(item) {
    if (!item) return;
    if (state.saved.has(item.id)) {
        state.saved.delete(item.id);
        showToast('Rimosso dai preferiti');
    } else {
        state.saved.add(item.id);
        showToast('⭐ Salvato!');
    }
    updateSaveIcon('save-a-focus', state.currentA?.id);
    updateSaveIcon('save-b-focus', state.currentB?.id);
    updateProfileStats();
    saveLocalState();
}

function updateSaveIcon(btnId, itemId) {
    const btn = document.getElementById(btnId);
    if (!btn || !itemId) return;
    const isSaved = state.saved.has(itemId);
    const svg = btn.querySelector('svg');
    svg.setAttribute('fill', isSaved ? 'currentColor' : 'none');
    btn.style.opacity = isSaved ? '1' : '0.4';
}

function navigateTo(screenId) {
    document.querySelectorAll('section[id^="screen-"]').forEach(s => s.classList.add('hidden-screen'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden-screen');
        target.classList.add('screen-enter');
        setTimeout(() => target.classList.remove('screen-enter'), 350);
    }
    
    // Aggiorna l'icona attiva nella barra in basso
    const targetIndex = screenId.split('-')[1]; // prenderà '1', '3' o '4'
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const isActive = btn.dataset.screen === targetIndex;
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('text-teal', isActive);
        btn.classList.toggle('text-gray-400', !isActive);
    });
    
    if (screenId === 'screen-3') updateRank();
    if (screenId === 'screen-4') updateProfileStats();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}

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
    updateRank();
    updateProfileStats();
    showToast('Dati azzerati.');
}

function saveLocalState() {
    try {
        localStorage.setItem('bf_scores_v2', JSON.stringify(state.localScores));
        localStorage.setItem('bf_saved_v2',  JSON.stringify([...state.saved]));
        localStorage.setItem('bf_rounds_v2', state.rounds);
        localStorage.setItem('bf_streak_v2', state.streak);
        localStorage.setItem('bf_userid_v2', state.userId);
    } catch(e) {}
}

function loadLocalState() {
    try {
        const sc = localStorage.getItem('bf_scores_v2'); if (sc) state.localScores = JSON.parse(sc);
        const sv = localStorage.getItem('bf_saved_v2');  if (sv) state.saved = new Set(JSON.parse(sv));
        const ro = localStorage.getItem('bf_rounds_v2'); if (ro) state.rounds = parseInt(ro) || 0;
        const st = localStorage.getItem('bf_streak_v2'); if (st) state.streak = parseInt(st) || 0;
        const ui = localStorage.getItem('bf_userid_v2'); if (ui) state.userId = ui;
    } catch(e) {}
}
