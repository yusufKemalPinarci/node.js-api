const express = require('express');
const Appointment = require('../models/Appointment');

const router = express.Router();

// ✅ Yeni randevu oluştur
router.post('/', async (req, res) => {
  try {
    const { date, userId, customerPhone, serviceId } = req.body;

    // Zorunlu alan kontrolü
    if (!date || !serviceId || (!userId && !customerPhone)) {
      return res.status(400).json({
        error: "Date, serviceId and either userId or customerPhone are required."
      });
    }

    const appointment = new Appointment({
      date,
      userId: userId || undefined,
      customerPhone,
      serviceId
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Tüm randevuları getir
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'name email')
      .populate('serviceId', 'title price durationMinutes');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ID ile tek bir randevuyu getir
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('serviceId', 'title price durationMinutes');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Randevuyu güncelle
router.put('/:id', async (req, res) => {
  try {
    const { date, userId, customerPhone, serviceId } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        date,
        userId: userId || undefined,
        customerPhone,
        serviceId
      },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(updatedAppointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Randevuyu sil
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
