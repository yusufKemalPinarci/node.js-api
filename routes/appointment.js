const express = require('express');
const Appointment = require('../models/Appointment');
const { User, UserRole } = require('../models/User');
const Service = require('../models/Service'); // Service şemanın yolu
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ Yeni randevu oluştur
// POST /api/appointments
router.post('/', authMiddleware, async (req, res) => { //authMiddleware,
  try {
    const { barberId, date, startTime, serviceId } = req.body;

    const barber = await User.findById(barberId);
    if (!barber || barber.role !== UserRole.BARBER) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    // Daha önce bu saatte randevu var mı kontrol et
    const existing = await Appointment.findOne({ barberId, date, startTime });
    if (existing) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const appointment = new Appointment({
      barberId,
      customerId: req.user._id,
      date,
      startTime,
      serviceId
    });

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
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




// GET /api/appointment/:id/availability?date=2025-08-15
router.get('/:id/availability', async (req, res) => {
  try {
    const barber = await User.findById(req.params.id);
    if (!barber || barber.role !== UserRole.BARBER) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    const date = new Date(req.query.date);
    const dayOfWeek = date.getDay();

    // Berberin o günkü müsait saatlerini al
    const availableSlots = barber.availability.filter(a => a.dayOfWeek === dayOfWeek);

    // Burada mevcut randevuları çekip dolu saatleri çıkarabiliriz
    // Appointment.find({ barberId: barber._id, date: sameDay })

    res.json({ date: req.query.date, slots: availableSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});







// müşteri uygun saate randevu alacak.
router.post('/randevu_al', async (req, res) => {
  try {
    const { barberId, customerId, customerName, customerPhone, date, startTime, serviceId } = req.body;

    // 1. Berber kontrolü
    const barber = await User.findById(barberId);
    if (!barber || barber.role !== 'Barber') {
      return res.status(404).json({ error: 'Berber bulunamadı veya geçersiz rol' });
    }

    // 2. Servis doğrulaması
    const service = await Service.findById(serviceId);
    if (!service || service.barberId.toString() !== barberId) {
      return res.status(404).json({ error: 'Servis bulunamadı veya bu berbere ait değil' });
    }

    // 3. Berberin o gün müsaitlik kontrolü
    const dayOfWeek = new Date(date).getDay();
    const availabilityForDay = (barber.availability || []).find(a => a.dayOfWeek === dayOfWeek);
    if (!availabilityForDay) {
      return res.status(400).json({ error: 'Berber o gün müsait değil' });
    }

    const isAvailable = availabilityForDay.timeRanges.some(range => {
      return startTime >= range.startTime && startTime < range.endTime;
    });
    if (!isAvailable) {
      return res.status(400).json({ error: 'Berber bu saatte müsait değil' });
    }

    // 4. Çakışan randevu kontrolü
    const existingAppointment = await Appointment.findOne({ barberId, date, startTime });
    if (existingAppointment) {
      return res.status(400).json({ error: 'Bu saat zaten dolu' });
    }

    // 5. Randevuyu oluştur
    const appointment = new Appointment({
      barberId,
      customerId,
      customerName,
      customerPhone,
      date,
      startTime,
      serviceId
    });

    await appointment.save();

    res.status(201).json(appointment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
