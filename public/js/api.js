//solo para uso local, se comento para usar en render
//const API = 'http://localhost:3000/api';
const API = 'https://moneysnap-83ix.onrender.com/api';

// Guarda y lee el usuario en localStorage
function getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}

// ── USUARIOS ──────────────────────────────────────────────────
async function apiLogin(email, password) {
  const r = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return r.json();
}

async function apiRegister(name, lastName, email, password) {
  const r = await fetch(`${API}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, lastName, email, password })
  });
  return r.json();
}

async function apiUpdateUser(id, data) {
  const r = await fetch(`${API}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function apiDeleteUser(id) {
  const r = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
  return r.json();
}

// ── TRANSACCIONES ─────────────────────────────────────────────
async function apiGetTransactions(userId, type = '') {
  const params = `userId=${userId}${type ? '&type=' + type : ''}`;
  const r = await fetch(`${API}/transactions?${params}`);
  return r.json();
}

async function apiCreateTransaction(data) {
  const r = await fetch(`${API}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function apiUpdateTransaction(id, data) {
  const r = await fetch(`${API}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function apiDeleteTransaction(id) {
  const r = await fetch(`${API}/transactions/${id}`, { method: 'DELETE' });
  return r.json();
}

// ── CATEGORÍAS ────────────────────────────────────────────────
async function apiGetCategories() {
  const r = await fetch(`${API}/categories`);
  return r.json();
}

async function apiCreateCategory(name) {
  const r = await fetch(`${API}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return r.json();
}

async function apiUpdateCategory(id, name) {
  const r = await fetch(`${API}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return r.json();
}

async function apiDeleteCategory(id) {
  const r = await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
  return r.json();
}

// ── AHORROS ───────────────────────────────────────────────────
async function apiGetSavings(userId) {
  const r = await fetch(`${API}/savings?userId=${userId}`);
  return r.json();
}

async function apiUpdateSaving(id, data) {
  const r = await fetch(`${API}/savings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function apiDeleteSaving(id) {
  const r = await fetch(`${API}/savings/${id}`, { method: 'DELETE' });
  return r.json();
}
