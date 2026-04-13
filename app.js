require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// ── Conexión a MongoDB ──────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

// ── Modelos ─────────────────────────────────────────────────────
const User        = require('./models/User');
const Transaction = require('./models/Transaction');
const Category    = require('./models/Category');
const Income      = require('./models/Income');
const Expense     = require('./models/Expense');
const Saving      = require('./models/Saving');

// ══════════════════════════════════════════════════════════════════
//  USUARIOS
// ══════════════════════════════════════════════════════════════════

// Registrar
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, lastName, email, password } = req.body;
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: 'El correo ya está registrado' });
    const user = await User.create({ name, lastName, email, password, createdAt: new Date(), updatedAt: new Date() });
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password, deletedAt: null });
    if (!user) return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    res.json({ message: 'Login exitoso', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar usuarios
app.get('/api/users', async (req, res) => {
  const users = await User.find({ deletedAt: null }).select('-password');
  res.json(users);
});

// Obtener un usuario
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'No encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar usuario
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario (soft delete)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
//  CATEGORÍAS
// ══════════════════════════════════════════════════════════════════

app.get('/api/categories', async (req, res) => {
  const cats = await Category.find({ deletedAt: null });
  res.json(cats);
});

app.post('/api/categories', async (req, res) => {
  try {
    const cat = await Category.create({ name: req.body.name, createdAt: new Date(), updatedAt: new Date() });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name, updatedAt: new Date() }, { new: true });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Verificar si la categoría está ligada a alguna transacción
    const linkedTx = await Transaction.findOne({ transactionCategoryId: categoryId });
    if (linkedTx) {
      return res.status(400).json({ error: 'La categoría está siendo utilizada en transacciones y no puede eliminarse.' });
    }

    // Eliminar realmente de la colección
    const deletedCat = await Category.findByIdAndDelete(categoryId);
    if (!deletedCat) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ══════════════════════════════════════════════════════════════════
//  TRANSACCIONES
// ══════════════════════════════════════════════════════════════════

app.get('/api/transactions', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.type)   filter.type   = req.query.type;
    const txs = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { type, name, amount, description, userId, transactionCategoryId, deadline } = req.body;
    const tx = await Transaction.create({
      userId, transactionCategoryId: transactionCategoryId || null,
      amount, description, type,
      createdAt: new Date(), updatedAt: new Date()
    });
    const sub = { transactionId: tx._id, name: name || description || type, currentBalance: amount, createdAt: new Date(), updatedAt: new Date() };
    if (type === 'income')  await Income.create(sub);
    if (type === 'expense') await Expense.create(sub);
    if (type === 'saving')  await Saving.create({ ...sub, deadline: deadline || null });
    res.status(201).json({ message: 'Transacción creada', tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!tx) return res.status(404).json({ error: 'Transacción no encontrada' });

    // Sincronizar con la colección secundaria
    if (tx.type === 'income') {
      await Income.findOneAndUpdate(
        { transactionId: tx._id },
        { name: req.body.name || tx.description, currentBalance: req.body.amount, updatedAt: new Date() }
      );
    }
    if (tx.type === 'expense') {
      await Expense.findOneAndUpdate(
        { transactionId: tx._id },
        { name: req.body.name || tx.description, currentBalance: req.body.amount, updatedAt: new Date() }
      );
    }
    if (tx.type === 'saving') {
      await Saving.findOneAndUpdate(
        { transactionId: tx._id },
        { name: req.body.name || tx.description, currentBalance: req.body.amount, deadline: req.body.deadline, updatedAt: new Date() }
      );
    }

    res.json({ message: 'Transacción actualizada', tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (tx) {
      if (tx.type === 'income')  await Income.findOneAndDelete({ transactionId: tx._id });
      if (tx.type === 'expense') await Expense.findOneAndDelete({ transactionId: tx._id });
      if (tx.type === 'saving')  await Saving.findOneAndDelete({ transactionId: tx._id });
    }
    res.json({ message: 'Transacción eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
//  AHORROS
// ══════════════════════════════════════════════════════════════════

app.get('/api/savings', async (req, res) => {
  try {
    const filter = { deletedAt: null };
    if (req.query.userId) {
      const txs = await Transaction.find({ userId: req.query.userId, type: 'saving' });
      filter.transactionId = { $in: txs.map(t => t._id) };
    }
    const savings = await Saving.find(filter);
    res.json(savings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/savings/:id', async (req, res) => {
  try {
    const s = await Saving.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/savings/:id', async (req, res) => {
  try {
    await Saving.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Ahorro eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/transactions/bydate', async (req, res) => {
  try {
    const { userId, start, end } = req.query;
    const filter = {};

    // Convertir userId a ObjectId si viene en la query
    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    // Filtrar por fechas
    if (start && end) {
      filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    } else if (start) {
      filter.createdAt = { $gte: new Date(start) };
    } else if (end) {
      filter.createdAt = { $lte: new Date(end) };
    }

    const txs = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ── Frontend estático ────────────────────────────────────────────

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
