import { loginWithGoogle, logout, onAuthChange } from './auth.js';

// Функция инициализации интерфейса
function initAuthUI() {
    // Находим элементы (используем опциональную цепочку ?., чтобы код не падал, если элемента нет на странице)
    const loginBtn      = document.getElementById('headerLoginBtn');
    const avatarBtn     = document.getElementById('headerAvatarBtn');
    const dropdown      = document.getElementById('avatarDropdown');
    const dropdownName  = document.getElementById('dropdownName');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const logoutBtn     = document.getElementById('dropdownLogout');

    // Если на странице нет даже кнопки логина, значит интерфейс авторизации тут не нужен
    if (!loginBtn && !avatarBtn) return;

    // ── Отрисовка состояния ─────────────────────────────────────────
    onAuthChange((user) => {
        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (avatarBtn) {
                avatarBtn.style.display = 'block';
                // Обновляем фото
                if (user.photoURL) {
                    avatarBtn.innerHTML = `<img src="${user.photoURL}" alt="Аватар" referrerpolicy="no-referrer" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
                } else {
                    const letter = (user.displayName || user.email || '?')[0].toUpperCase();
                    avatarBtn.textContent = letter;
                }
            }

            if (dropdownName) dropdownName.textContent = user.displayName || 'Пользователь';
            if (dropdownEmail) dropdownEmail.textContent = user.email || '';
            
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (avatarBtn) avatarBtn.style.display = 'none';
            if (dropdown) dropdown.classList.remove('open');
        }
    });

    // ── События ───────────────────────────────────────────────────────
    
    // Вход
    loginBtn?.addEventListener('click', async () => {
        try { 
            await loginWithGoogle(); 
        } catch (e) { 
            console.error(e);
            alert('Ошибка входа. Проверь настройки Firebase и консоль (F12).'); 
        }
    });

    // Дропдаун (открыть/закрыть)
    avatarBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown?.classList.toggle('open');
    });

    // Закрыть при клике мимо
    document.addEventListener('click', () => dropdown?.classList.remove('open'));

    // Выход
    logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
        window.location.href = 'index.html'; // Редирект на главную после выхода
    });
}

// Запускаем
initAuthUI();