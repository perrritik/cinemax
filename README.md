# Cinemax — Полный проект

Кинострим-сайт с тёмным кино-стилем. 5 страниц + настраиваемый плеер на каждой.

## Структура файлов

```
cinemax/
│
├── index.html          ← Главная страница (герой, слайдер, подборки)
├── catalog.html        ← Каталог фильмов и сериалов с фильтрами
├── movie.html          ← Страница фильма (постер, описание, похожие)
├── watch.html          ← Страница просмотра с плеером Plyr
├── profile.html        ← Профиль пользователя (список, история, настройки)
│
├── css/
│   ├── variables.css   ← CSS-токены, reset, звёздный фон, анимации
│   ├── header.css      ← Шапка, навигация, поиск
│   ├── player.css      ← Плеер Plyr + плавающий мини-плеер внизу
│   ├── components.css  ← Карточки, бейджи, кнопки, табы, сетки
│   ├── hero.css        ← Героический баннер с слайдером
│   └── pages.css       ← Лэйауты страниц, каталог, профиль, футер
│
├── js/
│   ├── data.js         ← Каталог фильмов (моковые данные)
│   ├── player.js       ← PlayerManager: Plyr + мини-плеер
│   ├── render.js       ← Render: генерация карточек из data.js
│   ├── router.js       ← Router: навигация, табы, фильтры, слайдер
│   └── app.js          ← App: главный загрузчик, per-page init
│
└── components/
    ├── head.html       ← <head> шаблон (вставить на каждую страницу)
    ├── header.html     ← Шапка (компонент)
    └── footer.html     ← Подвал (компонент)
```

## Быстрый старт

1. Распакуй архив
2. Открой `index.html` в браузере — всё работает без сервера
3. Чтобы добавить реальное видео, замени ссылки в `watch.html`:
   ```html
   <source src="https://cdn.example.com/movie.mp4" type="video/mp4" />
   ```
   И в кнопках серверов:
   ```html
   <button class="source-btn" data-src="https://cdn.example.com/movie-1080.mp4">
   ```

## Мини-плеер (нижний)

Плавающий плеер появляется на **всех страницах** автоматически.
- На `watch.html` — связан с основным Plyr-плеером
- На остальных страницах — показывает последний просмотренный фильм из `sessionStorage`
- Кнопка ✕ скрывает плеер

## Настройки плеера на watch.html

В правой колонке:
- Автоматическое качество
- Выбор субтитров
- Выбор дорожки озвучки
- Автопродолжение

## Добавление своих фильмов

Редактируй `js/data.js` — добавляй объекты в массивы `movies` или `series`:

```js
{
  id: 'my-movie',
  title: 'Мой фильм',
  titleOrig: 'My Movie',
  year: 2024,
  duration: '120 мин.',
  rating: 8.2,
  quality: '4K UHD',
  age: '16+',
  genres: ['Драма', 'Триллер'],
  director: 'Режиссёр',
  cast: ['Актёр 1', 'Актёр 2'],
  country: 'Россия',
  lang: 'Русский',
  desc: 'Описание фильма...',
  poster: 'https://ссылка-на-постер.jpg',
  bg:     'https://ссылка-на-фон.jpg',
  video:  'https://cdn.example.com/my-movie.mp4',
  badge: 'new', // null | 'new' | 'hot' | 'top' | 'hd'
}
```

## Цвета (css/variables.css)

```css
--accent: #4a9eff;   /* синий акцент */
--gold:   #c9a84c;   /* золото (рейтинг) */
--bg:     #05080f;   /* фон страницы */
```

## Зависимости

| Ресурс     | CDN |
|------------|-----|
| Plyr CSS   | https://cdn.plyr.io/3.7.8/plyr.css |
| Plyr JS    | https://cdn.plyr.io/3.7.8/plyr.js  |
| Google Fonts | Bebas Neue · Crimson Pro · Space Mono |
