/* ============================================================
   app.js — Bootstrapper: runs the right init per page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const page = window.location.pathname.split('/').pop() || 'index.html';

  /* ── Always: mini-player, header ── */
  PlayerManager.buildMiniPlayer();
  initHeader();

  /* ── Per-page logic ── */
  if (page === 'index.html' || page === '') {
    initHomePage();
  } else if (page === 'catalog.html') {
    initCatalogPage();
  } else if (page === 'movie.html') {
    initMoviePageLogic();
  } else if (page === 'watch.html') {
    initWatchPageLogic();
  } else if (page === 'profile.html') {
    initProfilePage();
  }

  /* ── If something was left playing, restore mini-player ── */
  const lastMovie = sessionStorage.getItem('cm_lastMovie');
  if (lastMovie && page !== 'watch.html') {
    try {
      PlayerManager.showMiniPlayer(JSON.parse(lastMovie));
    } catch (e) { /* ignore */ }
  }
});


/* ════════════════════════════════════════
   HEADER
   ════════════════════════════════════════ */
function initHeader() {
  // Mobile burger
  const burger = document.querySelector('.burger');
  const nav    = document.querySelector('.site-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => nav.classList.toggle('open'));
  }
}


/* ════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════ */
function initHomePage() {
  Render.initHero();

  // Trending
  Render.renderGrid('#trending-grid',  CINEMAX_DATA.movies.slice(0, 8));
  Render.renderGrid('#new-grid',       CINEMAX_DATA.movies.filter(m => m.badge === 'new' || m.badge === 'hot').concat(CINEMAX_DATA.movies.slice(0,4)).slice(0,6));
  Render.renderGrid('#series-grid',    CINEMAX_DATA.series.slice(0, 6));
  Render.renderGrid('#toprated-grid',  [...CINEMAX_DATA.movies,...CINEMAX_DATA.featured].sort((a,b)=>b.rating-a.rating).slice(0,8));

  // Show the mini-player with last-watched stub
  PlayerManager.showMiniPlayer(CINEMAX_DATA.nowWatching);
}


/* ════════════════════════════════════════
   CATALOG PAGE
   ════════════════════════════════════════ */
function initCatalogPage() {
  const all = [...CINEMAX_DATA.featured, ...CINEMAX_DATA.movies, ...CINEMAX_DATA.series];
  Render.renderGrid('#catalog-grid', all);

  // Count
  const cnt = document.querySelector('.results-count');
  if (cnt) cnt.textContent = all.length + ' результатов';

  PlayerManager.showMiniPlayer(CINEMAX_DATA.nowWatching);
}


/* ════════════════════════════════════════
   MOVIE PAGE
   ════════════════════════════════════════ */
function initMoviePageLogic() {
  Render.initMoviePage();

  const id  = Router.getParam('id');
  const all = [...CINEMAX_DATA.featured, ...CINEMAX_DATA.movies, ...CINEMAX_DATA.series];
  const similar = all.filter(m => m.id !== id).slice(0, 8);
  Render.renderGrid('#similar-grid', similar);

  PlayerManager.showMiniPlayer(CINEMAX_DATA.nowWatching);
}


/* ════════════════════════════════════════
   WATCH PAGE
   ════════════════════════════════════════ */
function initWatchPageLogic() {
  Render.initWatchPage();

  // Init Plyr
  PlayerManager.initMainPlayer();
  PlayerManager.initSourceSwitcher();

  // Related
  const id  = Router.getParam('id');
  const all = [...CINEMAX_DATA.featured, ...CINEMAX_DATA.movies];
  Render.renderGrid('#related-grid', all.filter(m => m.id !== id).slice(0, 6));

  // Save to session for mini-player on other pages
  const m = all.find(x => x.id === id);
  if (m) {
    sessionStorage.setItem('cm_lastMovie', JSON.stringify({
      id: m.id, title: m.title, episode: 'Фильм',
      progress: 0, poster: m.poster, video: m.video,
    }));
  }
}


/* ════════════════════════════════════════
   PROFILE PAGE
   ════════════════════════════════════════ */
function initProfilePage() {
  Render.renderGrid('#watchlist-grid',  CINEMAX_DATA.movies.slice(0, 4));
  Render.renderGrid('#history-grid',    CINEMAX_DATA.movies.slice(4, 8));
  PlayerManager.showMiniPlayer(CINEMAX_DATA.nowWatching);
}
