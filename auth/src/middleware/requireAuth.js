/**
 * Middleware — проверяет сессию.
 * Если пользователь не авторизован:
 *   - API запросы (Accept: application/json) → 401 JSON
 *   - Обычные запросы → редирект на главную
 */
export function requireAuth(req, res, next) {
  if (req.session?.user) return next();

  const wantsJson = req.headers.accept?.includes('application/json');
  if (wantsJson) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.redirect('/');
}
