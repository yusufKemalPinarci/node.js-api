const express = require('express');
const Service = require('../models/Service');

const router = express.Router();

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
  res.json(services);
});

module.exports = router;
