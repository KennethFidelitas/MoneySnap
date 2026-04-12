const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: String,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
});

module.exports = mongoose.model('Category', CategorySchema, "transactionCategories");