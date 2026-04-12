const mongoose = require('mongoose');

const SavingSchema = new mongoose.Schema({
  transactionId: mongoose.Schema.Types.ObjectId,
  name: String,
  currentBalance: mongoose.Schema.Types.Decimal128,
  deadline: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
});

module.exports = mongoose.model('Saving', SavingSchema);