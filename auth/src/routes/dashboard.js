import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// ─── GET /dashboard ──────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

// ─── GET /dashboard/api/profile ─────────────────────────────────
// JSON с данными текущего пользователя (из БД, актуальные)
router.get('/api/profile', async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        createdAt: true,
      },
    });

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
