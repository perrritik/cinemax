# 🔐 Google OAuth App

Полноценная система авторизации через Google OAuth 2.0.  
**Стек:** Node.js · Express · Prisma · PostgreSQL · HTML/CSS

---

## 📁 Структура проекта

```
google-auth-app/
├── src/
│   ├── server.js              # Точка входа, express + сессии
│   ├── routes/
│   │   ├── auth.js            # /auth/login  /auth/callback  /auth/logout  /auth/me
│   │   └── dashboard.js       # /dashboard  /dashboard/api/profile
│   └── middleware/
│       └── requireAuth.js     # Защита маршрутов
├── public/
│   ├── index.html             # Страница входа
│   ├── dashboard.html         # Дашборд (после входа)
│   └── 404.html
├── prisma/
│   └── schema.prisma          # Модели User + Session
├── .env.example               # Переменные окружения (шаблон)
├── package.json
└── README.md
```

---

## 🚀 Быстрый старт

### 1. Настройка Google Cloud Console

1. Открой [console.cloud.google.com](https://console.cloud.google.com)
2. Создай проект (или выбери существующий)
3. Перейди в **APIs & Services → Credentials**
4. Нажми **Create Credentials → OAuth 2.0 Client ID**
5. Тип приложения: **Web application**
6. В **Authorized redirect URIs** добавь:
   ```
   http://localhost:3000/auth/callback
   ```
   (для продакшена добавь и `https://yourdomain.com/auth/callback`)
7. Скопируй **Client ID** и **Client Secret**

---

### 2. Настройка проекта

```bash
# Скопируй .env.example в .env
cp .env.example .env
```

Отредактируй `.env`:

```env
GOOGLE_CLIENT_ID=вставь_client_id
GOOGLE_CLIENT_SECRET=вставь_client_secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/google_auth_db

# Сгенерируй секрет командой:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=сюда_длинный_случайный_секрет
```

---

### 3. База данных

```bash
# Создай БД в PostgreSQL
createdb google_auth_db

# Установи зависимости
npm install

# Создай таблицы через Prisma
npm run db:migrate
```

---

### 4. Запуск

```bash
# Режим разработки (с hot reload)
npm run dev

# Продакшен
npm start
```

Открой → [http://localhost:3000](http://localhost:3000)

---

## 🔑 Маршруты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/` | Главная (страница входа) |
| GET | `/auth/login` | Начало OAuth — редирект на Google |
| GET | `/auth/callback` | Callback после авторизации Google |
| GET | `/auth/logout` | Выход (уничтожение сессии) |
| GET | `/auth/me` | JSON с текущим пользователем |
| GET | `/dashboard` | Дашборд (требует авторизации) |
| GET | `/dashboard/api/profile` | JSON с профилем из БД |

---

## 🛡️ Безопасность

- **CSRF protection** — state-параметр проверяется при каждом callback
- **httpOnly cookies** — сессия недоступна из JavaScript
- **Верификация JWT** — id_token проверяется через google-auth-library
- **PostgreSQL sessions** — сессии хранятся в БД, а не в памяти
- **Upsert пользователей** — безопасное создание/обновление записи

---

## 🌐 Деплой (продакшен)

1. Установи `NODE_ENV=production` и `secure: true` для cookie (HTTPS)
2. Добавь продакшен URL в Google Console → Authorized redirect URIs
3. Используй переменные окружения (не файл `.env`)

---

## 📦 Зависимости

| Пакет | Зачем |
|-------|-------|
| `express` | HTTP сервер |
| `express-session` | Управление сессиями |
| `connect-pg-simple` | Хранение сессий в PostgreSQL |
| `google-auth-library` | Верификация Google токенов |
| `@prisma/client` | ORM для PostgreSQL |
