// ╔══════════════════════════════════════════════════════════════╗
// ║  CINEMAX — Google Auth (Firebase)                            ║
// ║  Инструкция по настройке — читай README внутри архива        ║
// ╚══════════════════════════════════════════════════════════════╝

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ─── 🔧 ВСТАВЬ СЮДА СВОИ ДАННЫЕ ИЗ FIREBASE CONSOLE ────────────
// Инструкция: README.md → Шаг 2
const firebaseConfig = {
  apiKey: "AIzaSyAQyFdl6dRWC74z-tEs84yj-SpCSv6jJmY",
  authDomain: "cinemax-50bc5.firebaseapp.com",
  projectId: "cinemax-50bc5",
  storageBucket: "cinemax-50bc5.firebasestorage.app",
  messagingSenderId: "677869520200",
  appId: "1:677869520200:web:91e07571e650253a99df7d",
  measurementId: "G-YCG8KHN7G2"
};
// ────────────────────────────────────────────────────────────────

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

// ── Helpers: localStorage ────────────────────────────────────────
const STORAGE_KEY = 'cinemax_user';

export function getSavedUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

function saveUser(u) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Войти через Google ───────────────────────────────────────────
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const u = result.user;

    // Подгружаем кастомные данные (никнейм, любимые фильмы)
    const custom = getCustomData();

    const user = {
      uid:         u.uid,
      email:       u.email,
      // Никнейм: если пользователь уже менял — берём его, иначе из Google
      displayName: custom.displayName || u.displayName || u.email.split('@')[0],
      // Фото: если пользователь загрузил своё — берём его, иначе из Google
      photoURL:    custom.photoURL    || u.photoURL    || null,
      googleName:  u.displayName,
      googlePhoto: u.photoURL,
    };

    saveUser(user);
    return user;
  } catch (e) {
    console.error('Login error:', e);
    throw e;
  }
}

// ── Выйти ────────────────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
  clearUser();
  window.location.href = 'index.html';
}

// ── Следим за состоянием авторизации ────────────────────────────
export function onAuthChange(callback) {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // Синхронизируем с localStorage
      const saved    = getSavedUser() || {};
      const custom   = getCustomData();
      const merged   = {
        uid:         firebaseUser.uid,
        email:       firebaseUser.email,
        displayName: custom.displayName || saved.displayName || firebaseUser.displayName,
        photoURL:    custom.photoURL    || saved.photoURL    || firebaseUser.photoURL,
        googleName:  firebaseUser.displayName,
        googlePhoto: firebaseUser.photoURL,
      };
      saveUser(merged);
      callback(merged);
    } else {
      clearUser();
      callback(null);
    }
  });
}

// ── Кастомные данные профиля (никнейм, фото, любимые фильмы) ────
const CUSTOM_KEY = 'cinemax_profile_custom';

export function getCustomData() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || {}; }
  catch { return {}; }
}

export function saveCustomData(data) {
  const current = getCustomData();
  const merged  = { ...current, ...data };
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(merged));

  // Обновляем и основной объект пользователя
  const user = getSavedUser();
  if (user) {
    if (data.displayName) user.displayName = data.displayName;
    if (data.photoURL)    user.photoURL    = data.photoURL;
    saveUser(user);
  }
  return merged;
}

// ── Любимые фильмы ───────────────────────────────────────────────
const FAV_KEY = 'cinemax_favorites';

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}

export function addFavorite(movie) {
  const favs = getFavorites();
  if (!favs.find(f => f.id === movie.id)) {
    favs.unshift(movie); // новые — первыми
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }
}

export function removeFavorite(movieId) {
  const favs = getFavorites().filter(f => f.id !== movieId);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

export function isFavorite(movieId) {
  return getFavorites().some(f => f.id === movieId);
}
