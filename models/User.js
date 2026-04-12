const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
});

module.exports = mongoose.model('User', UserSchema);