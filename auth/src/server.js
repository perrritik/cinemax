import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import { requireAuth } from './middleware/requireAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const prisma = new PrismaClient();

// ─── View engine ────────────────────────────────────────────────
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session store in PostgreSQL ────────────────────────────────
const PgStore = connectPgSimple(session);

app.use(session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: false, // таблица создаётся через Prisma migrate
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true только при HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    sameSite: 'lax',
  },
}));

// ─── Attach prisma to request ────────────────────────────────────
app.use((req, _res, next) => {
  req.prisma = prisma;
  next();
});

// ─── Routes ─────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/dashboard', requireAuth, dashboardRouter);

// Главная — редирект в зависимости от сессии
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── 404 ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// ─── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  Server running → http://localhost:${PORT}`);
});
