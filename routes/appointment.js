const express = require('express');
const Appointment = require('../models/Appointment');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const appointments = await Appointment.find()
    .populate('userId', 'name email')
    .populate('serviceId', 'title price durationMinutes');
  res.json(appointments);
});

module.exports = router;
