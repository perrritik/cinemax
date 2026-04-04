import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const router = Router();

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// ─── GET /auth/login ─────────────────────────────────────────────
// Генерируем state, сохраняем в сессии, редиректим на Google
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');

  const state = crypto.randomBytes(20).toString('hex');
  req.session.oauthState = state;

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',  // получаем refresh_token
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
    state,
  });

  res.redirect(url);
});

// ─── GET /auth/callback ──────────────────────────────────────────
// Google редиректит сюда с code и state
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    // Пользователь отказал в доступе
    if (error) {
      console.warn('OAuth error:', error);
      return res.redirect('/?error=access_denied');
    }

    // Проверка state — защита от CSRF
    if (!state || state !== req.session.oauthState) {
      return res.redirect('/?error=invalid_state');
    }
    delete req.session.oauthState;

    // Обмен кода на токены
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Верификация id_token — убеждаемся что токен настоящий от Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Upsert пользователя в БД (создаём или обновляем)
    const user = await req.prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {
        name: payload.name,
        picture: payload.picture,
        email: payload.email,
      },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
    });

    // Сохраняем в сессию только нужные поля (не весь объект из БД)
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Auth callback error:', err);
    res.redirect('/?error=auth_failed');
  }
});

// ─── GET /auth/logout ────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// ─── GET /auth/me ────────────────────────────────────────────────
// JSON endpoint — удобно для fetch() с фронтенда
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

export default router;
