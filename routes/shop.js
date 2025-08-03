const express = require('express');
const Shop = require('../models/Shop');

const router = express.Router();

// Create Shop
router.post('/', async (req, res) => {
  try {
    const {
      name,
      fullAddress,
      neighborhood,
      city,
      phone,
      adress,
      openingHour,
      closingHour,
      workingDays,
      ownerId,        // yeni alan
      staffEmails     // yeni alan
    } = req.body;

    const shop = new Shop({
      name,
      fullAddress,
      neighborhood,
      city,
      phone,
      adress,
      openingHour,
      closingHour,
      workingDays,
      ownerId,
      staffEmails
    });

    await shop.save();
    res.status(201).json(shop);
  } catch (err) {
    console.error('Shop create error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Dükkanları listele
// GET /api/shop/by-staff-email?email=test@example.com
router.get('/by-staff-email', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const shops = await Shop.find({ staffEmails: email });

    res.json(shops);
  } catch (err) {
    console.error('Error fetching shops by staff email:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


module.exports = router;
