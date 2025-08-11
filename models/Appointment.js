const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // tarih + saat beraber tutulur
  customerName: { type: String, required: true }, // müşteri adı
  customerPhone: { type: String, required: true }, // müşteri telefon
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // randevuyu alan kullanıcı (sisteme giriş yaptıysa)
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // hizmeti verecek çalışan
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }, // hizmet bilgisi
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  }, // randevu durumu
  notes: { type: String } // opsiyonel açıklama
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
