const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  transactionId: mongoose.Schema.Types.ObjectId,
  name: String,
  currentBalance: mongoose.Schema.Types.Decimal128,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
});

module.exports = mongoose.model('Expense', ExpenseSchema);