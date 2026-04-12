requireAuth();

const user = getUser();
let transactions = [];
let categories   = [];
let editingId    = null;

// ── Al cargar la página ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('userName').textContent = user.name + ' ' + user.lastName;
  categories   = await apiGetCategories();
  transactions = await apiGetTransactions(user._id);
  renderAll();
  fillCategorySelects();
});

// ── Renderizado principal ──────────────────────────────────────
function renderAll() {
  renderSummary();
  renderTransactions(transactions);
}

function renderSummary() {
  let income = 0, expense = 0, saving = 0;
  transactions.forEach(t => {
    const amt = parseFloat(t.amount?.$numberDecimal || t.amount || 0);
    if (t.type === 'income')  income  += amt;
    if (t.type === 'expense') expense += amt;
    if (t.type === 'saving')  saving  += amt;
  });
  const fmt = n => '₡' + n.toLocaleString('es-CR');
  document.getElementById('totalIncome').textContent  = fmt(income);
  document.getElementById('totalExpense').textContent = fmt(expense);
  document.getElementById('totalSaving').textContent  = fmt(saving);
  document.getElementById('totalBalance').textContent = fmt(income - expense - saving);
}

function renderTransactions(list) {
  const el = document.getElementById('txList');
  if (!list.length) {
    el.innerHTML = '<p class="tx-empty">No hay transacciones aún.</p>';
    return;
  }
  const labels = { income: 'Ingreso', expense: 'Gasto', saving: 'Ahorro' };
  const colors = { income: 'var(--green)', expense: 'var(--rose)', saving: 'var(--amber)' };

  el.innerHTML = list.map(t => {
    const amt   = parseFloat(t.amount?.$numberDecimal || t.amount || 0);
    const date  = new Date(t.createdAt).toLocaleDateString('es-CR');
    const color = colors[t.type] || 'var(--text-muted)';
    return `
    <div class="tx-row">
      <span class="tx-dot" style="background:${color}"></span>
      <div class="tx-info">
        <span class="tx-desc">${t.description || 'Sin descripción'}</span>
        <span class="tx-meta">${labels[t.type] || t.type} · ${date}</span>
      </div>
      <span class="tx-amt" style="color:${color}">₡${amt.toLocaleString('es-CR')}</span>
      <div class="tx-btns">
        <button onclick="openEdit('${t._id}')" class="tx-btn">✎</button>
        <button onclick="deleteTx('${t._id}')"  class="tx-btn del">✕</button>
      </div>
    </div>`;
  }).join('');
}

function fillCategorySelects() {
  const opts = '<option value="">Sin categoría</option>' +
    categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  document.getElementById('txCategory').innerHTML    = opts;
  document.getElementById('editCategory').innerHTML  = opts;
}

// ── Filtro por tipo ────────────────────────────────────────────
async function filterBy(type) {
  transactions = await apiGetTransactions(user._id, type);
  renderAll();
  // marcar botón activo
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

// ── CRUD Transacciones ─────────────────────────────────────────
async function createTransaction() {
  const type        = document.getElementById('txType').value;
  const amount      = document.getElementById('txAmount').value;
  const description = document.getElementById('txDesc').value.trim();
  const categoryId  = document.getElementById('txCategory').value;
  const deadline    = document.getElementById('txDeadline').value;

  if (!amount || !type) return alert('Monto y tipo son requeridos.');

  await apiCreateTransaction({
    userId: user._id,
    type, amount, description,
    name: description || type,
    transactionCategoryId: categoryId || null,
    deadline: deadline || null
  });

  closeModal('createModal');
  document.getElementById('createForm').reset();
  transactions = await apiGetTransactions(user._id);
  renderAll();
}

function openEdit(id) {
  const t = transactions.find(x => x._id === id);
  if (!t) return;
  editingId = id;
  const amt = parseFloat(t.amount?.$numberDecimal || t.amount || 0);
  document.getElementById('editAmount').value      = amt;
  document.getElementById('editDesc').value        = t.description || '';
  document.getElementById('editCategory').value    = t.transactionCategoryId || '';
  openModal('editModal');
}

async function saveEdit() {
  const amount      = document.getElementById('editAmount').value;
  const description = document.getElementById('editDesc').value.trim();
  const categoryId  = document.getElementById('editCategory').value;

  await apiUpdateTransaction(editingId, { amount, description, transactionCategoryId: categoryId || null });

  closeModal('editModal');
  editingId = null;
  transactions = await apiGetTransactions(user._id);
  renderAll();
}

async function deleteTx(id) {
  if (!confirm('¿Eliminar esta transacción?')) return;
  await apiDeleteTransaction(id);
  transactions = await apiGetTransactions(user._id);
  renderAll();
}

// ── CRUD Categorías ────────────────────────────────────────────
async function loadCategoriesPanel() {
  categories = await apiGetCategories();
  const el = document.getElementById('catList');
  if (!categories.length) { el.innerHTML = '<p class="tx-empty">Sin categorías.</p>'; return; }
  el.innerHTML = categories.map(c => `
    <div class="tx-row">
      <span class="tx-desc">${c.name}</span>
      <div class="tx-btns">
        <button onclick="editCategory('${c._id}','${c.name}')" class="tx-btn">✎</button>
        <button onclick="deleteCategory('${c._id}')" class="tx-btn del">✕</button>
      </div>
    </div>`).join('');
}

async function createCategory() {
  const name = document.getElementById('catName').value.trim();
  if (!name) return alert('Ingresa un nombre.');
  await apiCreateCategory(name);
  document.getElementById('catName').value = '';
  await loadCategoriesPanel();
  categories = await apiGetCategories();
  fillCategorySelects();
}

async function editCategory(id, currentName) {
  const name = prompt('Nuevo nombre:', currentName);
  if (!name) return;
  await apiUpdateCategory(id, name);
  await loadCategoriesPanel();
  categories = await apiGetCategories();
  fillCategorySelects();
}

async function deleteCategory(id) {
  if (!confirm('¿Eliminar categoría?')) return;
  await apiDeleteCategory(id);
  await loadCategoriesPanel();
  categories = await apiGetCategories();
  fillCategorySelects();
}

// ── Secciones del dashboard ────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
  document.getElementById('sec-' + name).style.display = 'block';
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-section="${name}"]`).classList.add('active');
  if (name === 'categories') loadCategoriesPanel();
}

// ── Modales ────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Mostrar/ocultar campo deadline solo para ahorros
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('txType').addEventListener('change', function () {
    document.getElementById('deadlineWrap').style.display = this.value === 'saving' ? '' : 'none';
  });
});
