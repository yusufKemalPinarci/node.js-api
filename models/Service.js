const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
