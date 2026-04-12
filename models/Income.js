const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  transactionId: mongoose.Schema.Types.ObjectId,
  name: String,
  currentBalance: mongoose.Schema.Types.Decimal128,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
});

module.exports = mongoose.model('Income', IncomeSchema);