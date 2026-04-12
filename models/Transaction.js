const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  transactionCategoryId: mongoose.Schema.Types.ObjectId,
  amount: mongoose.Schema.Types.Decimal128,
  description: String,
  type: String, // income, expense, saving
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('Transaction', TransactionSchema);