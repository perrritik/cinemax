/* ============================================================
   router.js — SPA-like page navigation & URL params
   ============================================================ */

const Router = (() => {

  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Get URL query param ── */
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ── Mark active nav link ── */
  function markActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    qsa('.site-nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href.includes(path));
    });
  }

  /* ── Smooth page transition ── */
  function navigate(url) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity .25s';
    setTimeout(() => { window.location.href = url; }, 220);
  }

  /* ── Movie card click → movie page ── */
  function bindCardClicks() {
    qsa('.movie-card, .movie-card-wide').forEach(card => {
      card.addEventListener('click', e => {
        // Don't navigate if clicking inner button
        if (e.target.closest('button, a')) return;
        const id = card.dataset.movieId;
        if (id) navigate(`movie.html?id=${id}`);
      });
    });
  }

  /* ── "Watch" button → watch page ── */
  function bindWatchButtons() {
    qsa('[data-watch]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.watch;
        navigate(`watch.html?id=${id}`);
      });
    });
  }

  /* ── Back button ── */
  function bindBackButtons() {
    qsa('[data-back]').forEach(btn => {
      btn.addEventListener('click', () => history.back());
    });
  }

  /* ── Tab switching ── */
  function initTabs() {
    qsa('.tab-bar').forEach(bar => {
      const tabs    = qsa('.tab-btn',  bar);
      const targets = qsa('.tab-pane', bar.parentElement);

      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
          tabs.forEach(t   => t.classList.remove('active'));
          targets.forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          if (targets[i]) targets[i].classList.add('active');
        });
      });

      // Activate first by default
      if (tabs[0])    tabs[0].classList.add('active');
      if (targets[0]) targets[0].classList.add('active');
    });
  }

  /* ── Filter genre tags ── */
  function initGenreFilter() {
    qsa('.genre-filter-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const bar = tag.closest('.genre-filter-row');
        qsa('.genre-filter-tag', bar).forEach(t => t.classList.remove('active'));
        tag.classList.add('active');

        const genre = tag.dataset.genre || 'all';
        const grid  = qs('.cards-grid, .cards-grid-wide');
        if (!grid) return;

        qsa('.movie-card, .movie-card-wide', grid).forEach(card => {
          const genres = (card.dataset.genres || '').split(',');
          card.style.display =
            (genre === 'all' || genres.includes(genre)) ? '' : 'none';
        });
      });
    });
  }

  /* ── Search input filter ── */
  function initSearchFilter() {
    const input = qs('.catalog-search-input');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      qsa('.movie-card, .movie-card-wide').forEach(card => {
        const title = (card.dataset.title || card.querySelector('.card-title, .wide-title')?.textContent || '').toLowerCase();
        card.style.display = (!q || title.includes(q)) ? '' : 'none';
      });
    });
  }

  /* ── Hero slider autoplay ── */
  function initHeroSlider() {
    const dots  = qsa('.hero-dot');
    const slides = typeof CINEMAX_DATA !== 'undefined' ? CINEMAX_DATA.featured : [];
    if (!dots.length || !slides.length) return;

    let current = 0;

    function goTo(i) {
      dots.forEach(d => d.classList.remove('active'));
      dots[i]?.classList.add('active');
      current = i;

      const slide = slides[i];
      if (!slide) return;

      const bg = qs('.hero-bg');
      if (bg) bg.style.backgroundImage = `url('${slide.bg}')`;

      const title = qs('.hero-title');
      if (title) { title.style.opacity = '0'; title.textContent = slide.title; setTimeout(() => (title.style.opacity = '1'), 50); }

      const rating = qs('.hero-rating');
      if (rating) rating.textContent = '★ ' + slide.rating;

      const year   = qs('.hero-year');
      if (year) year.textContent = slide.year;

      const dur    = qs('.hero-dur');
      if (dur) dur.textContent = slide.duration;

      const desc   = qs('.hero-desc');
      if (desc) desc.textContent = slide.desc;

      const watchBtn = qs('[data-watch-hero]');
      if (watchBtn) watchBtn.dataset.watch = slide.id;

      const movieBtn = qs('[data-movie-hero]');
      if (movieBtn) movieBtn.href = `movie.html?id=${slide.id}`;
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    goTo(0);
    setInterval(() => goTo((current + 1) % slides.length), 7000);
  }

  /* ── Init ── */
  function init() {
    markActiveNav();
    bindCardClicks();
    bindWatchButtons();
    bindBackButtons();
    initTabs();
    initGenreFilter();
    initSearchFilter();
    initHeroSlider();

    // Fade in on page load
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity .35s';
      document.body.style.opacity    = '1';
    });
  }

  return { init, getParam, navigate };

})();

document.addEventListener('DOMContentLoaded', () => Router.init());
