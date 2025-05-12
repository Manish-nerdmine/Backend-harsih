const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  name: { type: String },
  photo: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
