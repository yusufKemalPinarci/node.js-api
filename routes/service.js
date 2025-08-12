const express = require('express');
const Service = require('../models/Service');

const router = express.Router();



//yeni servis oluşturmak için berberler kullanır.
router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const services = await Service.find();

;
  res.json(services);
});



// ilgili servisi güncellemek için berberler kullanır
router.put('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { title, price, durationMinutes } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { title, price, durationMinutes },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(updatedService);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
