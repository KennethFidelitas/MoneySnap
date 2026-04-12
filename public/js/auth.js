// ── Login ─────────────────────────────────────────────────────
async function login() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const data = await apiLogin(email, password);

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } else {
    showLoginError(data.error || 'Credenciales incorrectas');
  }
}

// ── Registro ──────────────────────────────────────────────────
async function register() {
  const name     = document.getElementById('name').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !lastName || !email || !password) {
    showRegisterError('Por favor completa todos los campos.');
    return;
  }

  const data = await apiRegister(name, lastName, email, password);

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
    showRegisterSuccess();
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  } else {
    showRegisterError(data.error || 'Error al crear la cuenta.');
  }
}

// ── Logout ────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ── Proteger páginas privadas ─────────────────────────────────
function requireAuth() {
  if (!localStorage.getItem('user')) {
    window.location.href = 'login.html';
  }
}
