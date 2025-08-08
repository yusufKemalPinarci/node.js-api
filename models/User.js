const mongoose = require('mongoose');

const UserRole = {
  CUSTOMER: 'Customer',
  BARBER: 'Barber',
  ADMIN: 'Admin',
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
  phone: { type: String, trim: true, default: '' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  UserRole,
};
