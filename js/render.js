/* ============================================================
   render.js — DOM builders from CINEMAX_DATA
   ============================================================ */

const Render = (() => {

  /* ── Movie card (portrait) ── */
  function movieCard(m) {
    const badgeHtml = m.badge
      ? `<span class="card-badge badge-${m.badge}">${{new:'NEW',hot:'HOT',top:'TOP',hd:'HD'}[m.badge]||''}</span>`
      : '';
    const seasons = m.seasons ? `${m.seasons} сезон.` : (m.duration || '');
    return `
      <div class="movie-card" data-movie-id="${m.id}" data-title="${m.title}" data-genres="${(m.genres||[]).join(',')}">
        ${badgeHtml}
        <img class="thumb" src="${m.poster}" alt="${m.title}" loading="lazy" />
        <div class="card-overlay">
          <div class="play-circle">
            <svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
          </div>
        </div>
        <div class="card-body">
          <div class="card-title">${m.title}</div>
          <div class="card-meta">
            <span class="card-rating">★ ${m.rating}</span>
            <span>${m.year}</span>
            <span>${seasons}</span>
          </div>
        </div>
      </div>`;
  }

  /* ── Wide card (landscape) ── */
  function movieCardWide(m) {
    return `
      <div class="movie-card-wide" data-movie-id="${m.id}" data-title="${m.title}" data-genres="${(m.genres||[]).join(',')}">
        <img class="thumb-wide" src="${m.poster}" alt="${m.title}" loading="lazy" />
        <div class="wide-body">
          <div class="wide-title">${m.title}</div>
          <div class="wide-meta">
            <span class="card-rating">★ ${m.rating}</span>
            <span>${m.year}</span>
            ${m.seasons ? `<span>${m.seasons} сез.</span>` : ''}
            <span class="quality-tag">${m.quality||'HD'}</span>
          </div>
          <div class="wide-desc">${m.desc || (m.genres||[]).join(' · ')}</div>
        </div>
      </div>`;
  }

  /* ── Render grid by selector ── */
  function renderGrid(selector, items, wide = false) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = items.map(m => wide ? movieCardWide(m) : movieCard(m)).join('');
  }

  /* ── Render section (title + grid) ── */
  function renderSection(container, { title, items, link, wide }) {
    const el = document.querySelector(container);
    if (!el) return;
    const gridClass = wide ? 'cards-grid-wide' : 'cards-grid';
    el.innerHTML = `
      <div class="section-block">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <div class="section-line"></div>
          ${link ? `<a href="${link.href}" class="section-link">${link.text} →</a>` : ''}
        </div>
        <div class="${gridClass}">
          ${items.map(m => wide ? movieCardWide(m) : movieCard(m)).join('')}
        </div>
      </div>`;
  }

  /* ── Populate hero from featured data ── */
  function initHero() {
    if (typeof CINEMAX_DATA === 'undefined') return;
    const first = CINEMAX_DATA.featured[0];
    if (!first) return;

    const bg = document.querySelector('.hero-bg');
    if (bg) bg.style.backgroundImage = `url('${first.bg}')`;

    const t = document.querySelector('.hero-title');
    if (t) t.textContent = first.title;

    const d = document.querySelector('.hero-desc');
    if (d) d.textContent = first.desc;

    const r = document.querySelector('.hero-rating');
    if (r) r.textContent = '★ ' + first.rating;

    const yr = document.querySelector('.hero-year');
    if (yr) yr.textContent = first.year;

    const dur = document.querySelector('.hero-dur');
    if (dur) dur.textContent = first.duration;

    const wb = document.querySelector('[data-watch-hero]');
    if (wb) wb.dataset.watch = first.id;

    const mb = document.querySelector('[data-movie-hero]');
    if (mb) mb.href = `movie.html?id=${first.id}`;
  }

  /* ── Populate movie page from data ── */
  function initMoviePage() {
    if (typeof CINEMAX_DATA === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('id');
    const m  = [...CINEMAX_DATA.featured, ...CINEMAX_DATA.movies, ...(CINEMAX_DATA.series||[])].find(x => x.id === id);
    if (!m) return;

    const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    const setSrc = (sel, val) => { const el = document.querySelector(sel); if (el) el.src = val; };
    const setHtml = (sel, val) => { const el = document.querySelector(sel); if (el) el.innerHTML = val; };

    set('.movie-title-big', m.title);
    set('.movie-title-orig', m.titleOrig || '');
    setSrc('.movie-poster-img', m.poster);
    set('.mv-rating', '★ ' + m.rating);
    set('.mv-year', m.year);
    set('.mv-dur', m.duration || (m.seasons ? m.seasons + ' сез.' : ''));
    set('.mv-age', m.age || '');
    set('.mv-quality', m.quality || '');
    set('.movie-desc', m.desc || '');
    set('.mv-director', m.director || '—');
    set('.mv-country', m.country || '—');
    set('.mv-lang', m.lang || '—');

    setHtml('.mv-cast', (m.cast || []).map(c => `<span>${c}</span>`).join(', '));
    setHtml('.genre-tags-row', (m.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join(''));

    // Watch button
    const wb = document.querySelector('[data-watch-movie]');
    if (wb) wb.dataset.watch = m.id;

    // Document title
    document.title = `${m.title} — Cinemax`;
  }

  /* ── Populate watch page ── */
  function initWatchPage() {
    if (typeof CINEMAX_DATA === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('id');
    const m  = [...CINEMAX_DATA.featured, ...CINEMAX_DATA.movies, ...(CINEMAX_DATA.series||[])].find(x => x.id === id);
    if (!m) return;

    const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    set('.wp-title',   m.title);
    set('.wp-year',    m.year);
    set('.wp-dur',     m.duration || '');
    set('.wp-rating',  '★ ' + m.rating);
    set('.wp-quality', m.quality || '');
    set('.wp-desc',    m.desc || '');
    set('.wp-director',m.director || '—');
    set('.wp-country', m.country || '—');
    set('.wp-lang',    m.lang || '—');

    const genres = document.querySelector('.wp-genres');
    if (genres) genres.innerHTML = (m.genres || []).map(g => `<span class="genre-tag">${g}</span>`).join('');

    // Video source
    const video = document.querySelector('#main-player source');
    if (video && m.video) video.src = m.video;

    const poster = document.querySelector('#main-player');
    if (poster && m.bg) poster.dataset.poster = m.bg;

    document.title = `${m.title} — Смотреть · Cinemax`;

    // Show mini-player on other pages
    PlayerManager.buildMiniPlayer();
    PlayerManager.showMiniPlayer({
      id:       m.id,
      title:    m.title,
      episode:  'Фильм',
      progress: 0,
      poster:   m.poster,
      video:    m.video,
    });
  }

  return { movieCard, movieCardWide, renderGrid, renderSection, initHero, initMoviePage, initWatchPage };

})();
