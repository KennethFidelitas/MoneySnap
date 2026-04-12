// ── Login ─────────────────────────────────────────────────────
//Prueba para render
/*async function login() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const data = await apiLogin(email, password);

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } else {
    showLoginError(data.error || 'Credenciales incorrectas');
  }
}*/
//funcion de login para prueba en render
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Intentando login...");

  try {
    const res = await fetch(`${API}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log("Response status:", res.status);

    const data = await res.json();
    console.log("Response data:", data);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error || "Error en login");
    }

  } catch (err) {
    console.error("ERROR:", err);
    alert("No conecta con el servidor");
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
