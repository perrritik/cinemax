/* ============================================================
   player.js — Plyr init, mini-player, source switching
   ============================================================ */

const PlayerManager = (() => {

  let mainPlayer   = null;   // Plyr on watch page
  let isMiniVisible = false;
  let currentProgress = 0;

  /* ── Helpers ── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ════════════════════════════════════════
     MAIN WATCH-PAGE PLAYER
     ════════════════════════════════════════ */
  function initMainPlayer() {
    const el = qs('#main-player');
    if (!el) return;

    mainPlayer = new Plyr(el, {
      controls: [
        'play-large','play','rewind','fast-forward',
        'progress','current-time','duration',
        'mute','volume','captions','settings',
        'pip','airplay','fullscreen',
      ],
      settings: ['quality', 'speed', 'loop'],
      tooltips: { controls: true, seek: true },
      keyboard: { focused: true, global: true },
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    });

    window.cinemaPlayer = mainPlayer;

    // Keep mini-player in sync
    mainPlayer.on('timeupdate', () => {
      if (!mainPlayer.duration) return;
      const pct = (mainPlayer.currentTime / mainPlayer.duration) * 100;
      updateMiniProgress(pct);
    });

    return mainPlayer;
  }

  /* ════════════════════════════════════════
     SOURCE / SERVER SWITCHER
     ════════════════════════════════════════ */
  function initSourceSwitcher() {
    qsa('.source-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.source-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const src = btn.dataset.src;
        if (src && mainPlayer) {
          const wasPaused = mainPlayer.paused;
          const wasTime   = mainPlayer.currentTime;
          mainPlayer.source = {
            type: 'video',
            sources: [{ src, type: 'video/mp4' }],
          };
          mainPlayer.once('ready', () => {
            mainPlayer.currentTime = wasTime;
            if (!wasPaused) mainPlayer.play();
          });
        }
      });
    });
  }

  /* ════════════════════════════════════════
     FLOATING MINI-PLAYER
     ════════════════════════════════════════ */
  function buildMiniPlayer() {
    if (qs('#mini-player')) return;

    const mp = document.createElement('div');
    mp.id = 'mini-player';
    mp.innerHTML = `
      <div class="mp-progress-bar"><div class="mp-progress-fill" id="mp-prog"></div></div>
      <div class="mini-player-inner">
        <div class="mp-thumb" id="mp-thumb-btn">
          <img id="mp-poster" src="" alt="Now playing" />
          <div class="mp-thumb-overlay">
            <svg width="16" fill="white" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
          </div>
        </div>
        <div class="mp-info">
          <div class="mp-title" id="mp-title">—</div>
          <div class="mp-meta">
            <span id="mp-episode">—</span>
            <span class="dot">·</span>
            <span id="mp-time">0:00</span>
          </div>
        </div>
        <div class="mp-controls">
          <button class="mp-btn" id="mp-prev" title="Предыдущий">
            <svg width="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="mp-btn play-btn" id="mp-play-btn" title="Воспроизвести">
            <svg width="14" viewBox="0 0 24 24" fill="currentColor" id="mp-play-icon"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="mp-btn" id="mp-next" title="Следующий">
            <svg width="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM14 6h2v12h-2z"/></svg>
          </button>
          <div class="mp-volume">
            <svg width="14" viewBox="0 0 24 24" fill="var(--muted)"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            <input type="range" id="mp-vol" min="0" max="1" step="0.05" value="1" />
          </div>
        </div>
        <button class="mp-close" id="mp-close" title="Закрыть">✕</button>
      </div>`;

    document.body.appendChild(mp);
    bindMiniPlayerEvents(mp);
  }

  function bindMiniPlayerEvents(mp) {
    // Close
    qs('#mp-close', mp).addEventListener('click', () => hideMiniPlayer());

    // Go to watch page on thumb click
    qs('#mp-thumb-btn', mp).addEventListener('click', () => {
      const id = mp.dataset.movieId;
      if (id) navigateTo(`watch.html?id=${id}`);
    });

    // Play/Pause toggle
    qs('#mp-play-btn', mp).addEventListener('click', toggleMiniPlayback);

    // Volume
    qs('#mp-vol', mp).addEventListener('input', e => {
      if (mainPlayer) mainPlayer.volume = parseFloat(e.target.value);
    });

    // Prev/Next (stub)
    qs('#mp-prev', mp).addEventListener('click', () => console.log('prev'));
    qs('#mp-next', mp).addEventListener('click', () => console.log('next'));
  }

  function showMiniPlayer(movie) {
    buildMiniPlayer();
    const mp = qs('#mini-player');
    qs('#mp-title',   mp).textContent   = movie.title   || '—';
    qs('#mp-episode', mp).textContent   = movie.episode || 'Фильм';
    qs('#mp-poster',  mp).src           = movie.poster  || '';
    mp.dataset.movieId = movie.id || '';
    updateMiniProgress(movie.progress || 0);
    mp.classList.add('visible');
    document.body.style.paddingBottom = '72px';
    isMiniVisible = true;
  }

  function hideMiniPlayer() {
    const mp = qs('#mini-player');
    if (!mp) return;
    mp.classList.remove('visible');
    document.body.style.paddingBottom = '';
    isMiniVisible = false;
    if (mainPlayer && !mainPlayer.paused) mainPlayer.pause();
  }

  function updateMiniProgress(pct) {
    currentProgress = pct;
    const fill = qs('#mp-prog');
    if (fill) fill.style.width = pct + '%';
    // Update time label
    if (mainPlayer) {
      const t = mainPlayer.currentTime || 0;
      const el = qs('#mp-time');
      if (el) el.textContent = formatTime(t);
    }
  }

  function toggleMiniPlayback() {
    if (!mainPlayer) return;
    const icon = qs('#mp-play-icon');
    if (mainPlayer.paused) {
      mainPlayer.play();
      if (icon) icon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'); // pause icon
    } else {
      mainPlayer.pause();
      if (icon) icon.setAttribute('d', 'M8 5v14l11-7z'); // play icon
    }
  }

  /* ════════════════════════════════════════
     UTILITIES
     ════════════════════════════════════════ */
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function navigateTo(url) {
    window.location.href = url;
  }

  /* ── Public API ── */
  return {
    initMainPlayer,
    initSourceSwitcher,
    showMiniPlayer,
    hideMiniPlayer,
    buildMiniPlayer,
    get mainPlayer() { return mainPlayer; },
  };

})();
